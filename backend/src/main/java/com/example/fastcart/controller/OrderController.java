package com.example.fastcart.controller;

import com.example.fastcart.model.Order;
import com.example.fastcart.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(
            @RequestBody Order orderRequest,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Order savedOrder = orderService.placeOrder(orderRequest, authHeader);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            List<Order> orders = orderService.getMyOrders(authHeader);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Order cancelled = orderService.cancelOrder(orderId, authHeader);
            return ResponseEntity.ok(cancelled);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}