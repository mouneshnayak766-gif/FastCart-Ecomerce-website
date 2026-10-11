package com.example.fastcart.ai;

import com.example.fastcart.ai.AiDtos.PendingActionView;
import com.example.fastcart.ai.AiDtos.ProductCard;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Per-request data shared between model tools and the chat response. */
public final class AiRequestContext {
    private final Long userId;
    private final Map<Long, ProductCard> products = new LinkedHashMap<>();
    private PendingActionView pending;

    public AiRequestContext(Long userId) {
        this.userId = userId;
    }

    public Long userId() {
        return userId;
    }

    public void addProducts(List<ProductCard> cards) {
        for (ProductCard card : cards) {
            products.put(card.id(), card);
        }
    }

    public List<ProductCard> products() {
        return new ArrayList<>(products.values());
    }

    public PendingActionView pending() {
        return pending;
    }

    public void setPending(PendingActionView pending) {
        this.pending = pending;
    }
}
