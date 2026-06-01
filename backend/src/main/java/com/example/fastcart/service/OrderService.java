package com.example.fastcart.service;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Order;
import com.example.fastcart.model.OrderItem;
import com.example.fastcart.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    private Long extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
           return JwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Invalid Authorization token format");
    }

    public Order placeOrder(Order orderRequest, String authHeader) {
        Long userId = extractUserId(authHeader);
        
        Order order = new Order();
        order.setUserId(userId);
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setPaymentMethod("Cash On Delivery");
        order.setOrderStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        double total = 0;
        for (OrderItem item : orderRequest.getOrderItems()) {
            total += item.getPrice() * item.getQuantity();
        }
        order.setTotalAmount(total);
        order.setOrderItems(orderRequest.getOrderItems());

        return orderRepository.save(order);
    }

    public List<Order> getMyOrders(String authHeader) {
        Long userId = extractUserId(authHeader);
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }
}