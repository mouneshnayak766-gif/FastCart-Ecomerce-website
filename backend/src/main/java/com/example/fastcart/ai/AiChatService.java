package com.example.fastcart.ai;

import com.example.fastcart.ai.AiDtos.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.net.http.HttpConnectTimeoutException;
import java.net.http.HttpTimeoutException;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
public class AiChatService {
    private static final Logger log = LoggerFactory.getLogger(AiChatService.class);

    private final ChatClient chatClient;
    private final AiTools tools;
    private final AiStoreFacade store;
    private final PendingActionStore pending;
    private final AiRateLimiter rateLimiter;

    public AiChatService(ChatClient chatClient, AiTools tools, AiStoreFacade store,
                         PendingActionStore pending, AiRateLimiter rateLimiter) {
        this.chatClient = chatClient;
        this.tools = tools;
        this.store = store;
        this.pending = pending;
        this.rateLimiter = rateLimiter;
    }

    public ChatResponse chat(Long userId, String rateKey, ChatRequest req) {
        rateLimiter.check(rateKey);
        AiRequestContext ctx = new AiRequestContext(userId);
        // Memory key includes the verified user id so conversation ids cannot cross accounts.
        String memoryKey = (userId == null ? "guest" : "u" + userId) + ":" + req.conversationId();
        String reply;
        try {
            reply = chatClient.prompt()
                    .system(systemFor(req.language()))
                    .user(req.message())
                    .tools(tools)
                    .toolContext(Map.of("ctx", ctx))
                    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, memoryKey))
                    .call()
                    .content();
        } catch (RuntimeException e) {
            logOllamaFailure(e);
            throw new AiExceptions.AiUnavailableException("Model call failed", e);
        }
        if (reply == null || reply.isBlank()) reply = "Sorry, I couldn't come up with an answer. Could you rephrase?";
        return new ChatResponse(reply.trim(), ctx.products(), ctx.pending());
    }

    private static String systemFor(String code) {
        String lang = switch (code == null ? "en" : code) {
            case "hi" -> "Hindi";
            case "kn" -> "Kannada";
            default -> "English";
        };
        return AiConfig.SYSTEM_PROMPT + "\nThe app UI language is " + lang
                + ". Reply in " + lang + " unless the user writes in another language. Keep product names as they are.";
    }

    public ActionResult confirm(Long userId, String actionId) {
        PendingActionStore.Pending p = pending.take(actionId, userId);
        store.addToCart(userId, p.productId(), p.quantity());
        log.info("AI add-to-cart confirmed user={} product={} qty={}", userId, p.productId(), p.quantity());
        return new ActionResult("Done! Added " + p.quantity() + " × " + p.productName() + " to your cart.");
    }

    public void cancel(Long userId, String actionId) {
        pending.cancel(actionId, userId);
    }

    private static void logOllamaFailure(RuntimeException error) {
        String category = classifyOllamaFailure(error);
        log.error("Ollama chat request failed: {}", category, error);
    }

    private static String classifyOllamaFailure(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof HttpConnectTimeoutException) {
                return "connection timeout while connecting to Ollama";
            }
            if (cause instanceof SocketTimeoutException) {
                return "Ollama response read timed out";
            }
            if (cause instanceof HttpTimeoutException || cause instanceof TimeoutException) {
                return "Ollama HTTP request timed out";
            }
            if (cause instanceof RestClientResponseException response) {
                String body = response.getResponseBodyAsString().toLowerCase();
                if (body.contains("model") && (body.contains("not found") || body.contains("pull"))) {
                    return "model unavailable or not pulled in Ollama";
                }
            }
            if (cause instanceof ConnectException || cause instanceof UnknownHostException) {
                return "cannot connect to Ollama; check that the server is running and reachable";
            }
        }
        return "Ollama request failed; inspect the exception for the server response";
    }
}
