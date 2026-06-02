package com.example.fastcart.service;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Order;
import com.example.fastcart.model.OrderItem;
import com.example.fastcart.model.Product;
import com.example.fastcart.repository.CartRepository;
import com.example.fastcart.repository.OrderRepository;
import com.example.fastcart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    private Long extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return JwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Invalid Authorization token format");
    }

    public Order placeOrder(Order orderRequest, String authHeader) {
        Long userId = extractUserId(authHeader);

        if (orderRequest.getOrderItems() == null || orderRequest.getOrderItems().isEmpty()) {
            throw new RuntimeException("Order must include at least one item.");
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setPaymentMethod("Cash On Delivery");
        order.setOrderStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        double total = 0;
        for (OrderItem item : orderRequest.getOrderItems()) {
            if (item.getProductId() == null) {
                throw new RuntimeException("Order item must include a productId.");
            }

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Invalid quantity for product: " + product.getName());
            }

            if (product.getStock() == null || product.getStock() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);

            item.setProductName(product.getName());
            item.setImageUrl(product.getImageUrl());
            item.setPrice(product.getPrice());

            total += item.getPrice() * item.getQuantity();
        }

        order.setTotalAmount(total);
        order.setOrderItems(orderRequest.getOrderItems());

        Order savedOrder = orderRepository.save(order);

        List<Long> orderedProductIds = orderRequest.getOrderItems().stream()
                .map(OrderItem::getProductId)
                .distinct()
                .collect(Collectors.toList());

        if (!orderedProductIds.isEmpty()) {
            cartRepository.deleteAllByUserIdAndProductIdIn(userId, orderedProductIds);
        }

        return savedOrder;
    }

    public Order cancelOrder(Long orderId, String authHeader) {
        Long userId = extractUserId(authHeader);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized order cancel request.");
        }

        if (!"PENDING".equals(order.getOrderStatus())) {
            throw new RuntimeException("Only pending orders can be cancelled.");
        }

        order.setOrderStatus("CANCELLED");
        return orderRepository.save(order);
    }

    public List<Order> getMyOrders(String authHeader) {
        Long userId = extractUserId(authHeader);
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }
}