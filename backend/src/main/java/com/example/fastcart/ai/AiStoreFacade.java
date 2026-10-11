package com.example.fastcart.ai;

import com.example.fastcart.ai.AiDtos.OrderSummary;
import com.example.fastcart.ai.AiDtos.ProductCard;
import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Cart;
import com.example.fastcart.model.Order;
import com.example.fastcart.model.Product;
import com.example.fastcart.repository.OrderRepository;
import com.example.fastcart.repository.ProductRepository;
import com.example.fastcart.service.CartService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

/**
 * The ONLY class that touches your existing entities/services.
 */
@Component
public class AiStoreFacade {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final JwtUtil jwtUtil;

    public AiStoreFacade(ProductRepository productRepository, OrderRepository orderRepository,
                         CartService cartService, JwtUtil jwtUtil) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.jwtUtil = jwtUtil;
    }

    public Long resolveUserId(String authorization) {
        if (authorization == null || authorization.isBlank()) return null;
        if (!authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Authorization token");
        }
        String token = authorization.substring(7).trim();
        if (token.isEmpty() || jwtUtil.validateToken(token) != JwtUtil.TokenValidationResult.VALID) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired Authorization token");
        }
        try {
            return jwtUtil.extractUserId(token);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Authorization token");
        }
    }

    public List<ProductCard> search(String keywords, String category,
                                    Double minPrice, Double maxPrice, int limit) {
        return productRepository
                .aiSearch(blankToNull(keywords), blankToNull(category),
                        minPrice, maxPrice, PageRequest.of(0, Math.min(Math.max(limit, 1), 6)))
                .stream().map(this::toCard).toList();
    }

    public Optional<ProductCard> findProduct(Long id) {
        return productRepository.findById(id).map(this::toCard);
    }

    public boolean hasAvailableStock(Long productId, int quantity) {
        return productRepository.findById(productId)
                .map(product -> product.getStock() != null && product.getStock() >= quantity)
                .orElse(false);
    }

    /** ADAPT: your CartService signature. Re-validates the product at confirm time. */
    public void addToCart(Long userId, Long productId, int quantity) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new AiExceptions.InvalidActionException("Product no longer exists."));
        if (p.getStock() == null || p.getStock() < quantity) {
            throw new AiExceptions.InvalidActionException("Insufficient stock for " + p.getName() + ".");
        }
        Cart item = new Cart();
        item.setProductId(productId);
        item.setProductName(p.getName());
        item.setImageUrl(p.getImageUrl());
        item.setPrice(p.getPrice());
        String accessToken = "Bearer " + jwtUtil.generateAccessToken(userId);
        for (int i = 0; i < quantity; i++) {
            cartService.addCart(item, accessToken);
        }
    }

    /** ADAPT: orders for THIS user only. Ownership is enforced by only ever querying by userId. */
    public List<OrderSummary> ordersFor(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        return orders.stream().limit(10).map(this::toSummary).toList();
    }

    public Optional<OrderSummary> orderFor(Long userId, Long orderId) {
        return ordersFor(userId).stream().filter(o -> o.id().equals(orderId)).findFirst();
    }

    // ---- mapping (ADAPT getters) ----
    private ProductCard toCard(Product p) {
        Number price = p.getPrice();
        Number rating = p.getRating();                // may be null
        Number stock = p.getStock();                  // may be null
        double now = price == null ? 0 : price.doubleValue();
        String desc = p.getDescription();
        if (desc != null && desc.length() > 240) desc = desc.substring(0, 240) + "…";
        return new ProductCard(p.getId(), p.getName(), null, String.valueOf(p.getCategory()),
                now, null, null,
                rating == null ? null : rating.doubleValue(),
                null,
                p.getImageUrl(),
                stock == null || stock.intValue() > 0,
                desc);
    }

    private OrderSummary toSummary(Order o) {
        Number total = o.getTotalAmount();
        return new OrderSummary(o.getId(), String.valueOf(o.getOrderStatus()),
                total == null ? 0 : total.doubleValue(), String.valueOf(o.getOrderDate()));
    }

    private static String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
}
