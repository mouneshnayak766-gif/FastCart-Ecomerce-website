package com.example.fastcart.controller;

import com.example.fastcart.dto.DashboardStats;
import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Order;
import com.example.fastcart.model.Product;
import com.example.fastcart.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // FIX 1: Added the missing authorization validation helper method
    private boolean isNotAuthorized(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return true;
        }
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            Long userId = JwtUtil.getUserIdFromToken(token);
            
            // Checks if the token belongs to our system admin ID (0L)
            return !AdminService.ADMIN_SYSTEM_ID.equals(userId);
        } catch (Exception e) {
            return true; // Any token parsing exception means unauthorized
        }
    }

    // FIX 2: Using a Map<String, String> inline to avoid needing a separate DTO class
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        String token = adminService.loginAdmin(email, password);

        if (token != null) {
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "role", "ADMIN"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Admin Credentials"));
        }
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getStats(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Product product) {

        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return new ResponseEntity<>(adminService.addProduct(product), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> editProduct(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Product product) {

        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return adminService.updateProduct(id, product)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> removeProduct(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        if (adminService.deleteProduct(id)) {
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<?> manageOrders(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> statusRequest) {

        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        
        String status = statusRequest.get("status");
        return adminService.updateOrderStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}