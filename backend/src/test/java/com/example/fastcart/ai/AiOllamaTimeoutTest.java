package com.example.fastcart.ai;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.time.Duration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AiOllamaTimeoutTest {

    @Test
    void restClientCustomizerAppliesReadTimeout() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        ExecutorService executor = Executors.newSingleThreadExecutor();
        server.setExecutor(executor);
        server.createContext("/api/chat", exchange -> {
            try {
                Thread.sleep(750);
                exchange.sendResponseHeaders(200, -1);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (IOException ignored) {
                // The expected read timeout closes the client connection first.
            } finally {
                exchange.close();
            }
        });
        server.start();

        try {
            RestClient.Builder builder = RestClient.builder();
            new AiConfig().ollamaRestClientCustomizer(Duration.ofSeconds(1), Duration.ofMillis(100))
                    .customize(builder);
            RestClient client = builder
                    .baseUrl("http://127.0.0.1:" + server.getAddress().getPort())
                    .build();

            ResourceAccessException error = assertThrows(ResourceAccessException.class,
                    () -> client.post().uri("/api/chat").retrieve().toBodilessEntity());
            assertTrue(hasTimeoutCause(error), () -> "Expected a timeout in the exception cause chain: "
                    + describeCauses(error));
        } finally {
            server.stop(0);
            executor.shutdownNow();
        }
    }

    private static boolean hasTimeoutCause(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof java.net.http.HttpTimeoutException
                    || cause instanceof java.net.SocketTimeoutException
                    || cause instanceof TimeoutException) {
                return true;
            }
        }
        return false;
    }

    private static String describeCauses(Throwable error) {
        StringBuilder description = new StringBuilder();
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (!description.isEmpty()) {
                description.append(" -> ");
            }
            description.append(cause.getClass().getName()).append(": ").append(cause.getMessage());
        }
        return description.toString();
    }
}
