package com.example.fastcart.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class AiDtos {
    private AiDtos() {}

    public record ChatRequest(
            @NotBlank @Pattern(regexp = "^[A-Za-z0-9-]{8,64}$", message = "invalid conversationId") String conversationId,
            @NotBlank @Size(max = 1000) String message,
            @Pattern(regexp = "^(en|hi|kn)$", message = "unsupported language") String language) {}

    public record ProductCard(Long id, String name, String brand, String category, double price,
                              Double originalPrice, Integer discountPercent,
                              Double rating, Integer reviewCount,
                              String imageUrl, boolean inStock, String description) {}

    public record OrderSummary(Long id, String status, double total, String placedAt) {}

    public record PendingActionView(String id, String type, String summary) {}

    public record ChatResponse(String reply, List<ProductCard> products, PendingActionView pendingAction) {}

    public record ActionResult(String message) {}
}
