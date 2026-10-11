package com.example.fastcart.ai;

import com.example.fastcart.ai.AiDtos.PendingActionView;
import com.example.fastcart.ai.AiDtos.ProductCard;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Holds actions the model PROPOSED. Only an authenticated user's explicit Confirm call executes them. */
@Component
public class PendingActionStore {

    public record Pending(String id, Long userId, Long productId, String productName, int quantity, Instant expiresAt) {}

    private final Map<String, Pending> store = new ConcurrentHashMap<>();
    private final long ttlSeconds;

    public PendingActionStore(@Value("${fastcart.ai.pending-ttl-seconds:300}") long ttlSeconds) {
        this.ttlSeconds = ttlSeconds;
    }

    public PendingActionView createAddToCart(Long userId, ProductCard product, int quantity) {
        Instant now = Instant.now();
        store.values().removeIf(p -> p.expiresAt().isBefore(now));
        String id = UUID.randomUUID().toString();
        store.put(id, new Pending(id, userId, product.id(), product.name(), quantity, now.plusSeconds(ttlSeconds)));
        return new PendingActionView(id, "ADD_TO_CART",
                "Add " + quantity + " × " + product.name() + " to your cart?");
    }

    /** Atomically claims the action; a second confirm or a different user fails. */
    public Pending take(String id, Long userId) {
        Pending p = store.get(id);
        if (p == null || !p.userId().equals(userId) || p.expiresAt().isBefore(Instant.now())) {
            throw new AiExceptions.InvalidActionException("This action expired or is no longer valid.");
        }
        if (!store.remove(id, p)) {
            throw new AiExceptions.InvalidActionException("This action was already handled.");
        }
        return p;
    }

    public void cancel(String id, Long userId) {
        Pending p = store.get(id);
        if (p != null && p.userId().equals(userId)) store.remove(id, p);
    }
}
