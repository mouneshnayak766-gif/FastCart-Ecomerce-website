package com.example.fastcart.controller;

import com.example.fastcart.dto.AdminLoginRequest;
import com.example.fastcart.dto.UserHistoryProfile;
import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Product;
import com.example.fastcart.model.RefreshToken;
import com.example.fastcart.service.AdminService;
import com.example.fastcart.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AuthService authService;

    // ── AUTH HELPER ───────────────────────────────────────────────────────────

    private boolean isNotAuthorized(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return true;
        try {
            String token = authHeader.substring(7);
            Long userId = JwtUtil.getUserIdFromToken(token);
            return !AdminService.ADMIN_SYSTEM_ID.equals(userId);
        } catch (Exception e) {
            return true;
        }
    }

    // ── AUTH ENDPOINTS ────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password required"));
        }
        if (adminService.isValidAdmin(loginRequest.getEmail(), loginRequest.getPassword())) {
            String accessToken = JwtUtil.generateAccessToken(AdminService.ADMIN_SYSTEM_ID);
            RefreshToken refreshToken = authService.createRefreshToken(AdminService.ADMIN_SYSTEM_ID);
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "accessToken", accessToken,
                    "refreshToken", refreshToken.getToken(),
                    "role", "ADMIN"
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid Admin Credentials"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.refreshAccessToken(body.get("refreshToken")));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        authService.revokeRefreshToken(body.get("refreshToken"));
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getStats(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ── PRODUCTS ──────────────────────────────────────────────────────────────

    @PostMapping(value = "/products", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createProduct(
            @RequestHeader("Authorization") String authHeader,
            @RequestPart("product") String productJson,
            @RequestPart(value = "image", required = false) MultipartFile file) {

        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        try {
            Product product = new ObjectMapper().readValue(productJson, Product.class);
            if (file != null && !file.isEmpty()) {
                product.setImageUrl(adminService.saveUploadedImage(file));
            }
            return new ResponseEntity<>(adminService.addProduct(product), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/products/search")
    public ResponseEntity<?> searchProducts(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("query") String query) {

        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return ResponseEntity.ok(adminService.searchProducts(query));
    }

    @GetMapping("/products/categories")
    public ResponseEntity<?> getCategories(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return ResponseEntity.ok(adminService.getCategoriesList());
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> editProduct(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Product product) {

        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return adminService.updateProduct(id, product)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> removeProduct(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        if (adminService.deleteProduct(id)) {
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    // ── ORDERS ────────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<?> manageOrders(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetails(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return adminService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> statusRequest) {

        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return adminService.updateOrderStatus(id, statusRequest.get("status"))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return adminService.cancelOrder(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/orders/{id}/refund")
    public ResponseEntity<?> refundOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return adminService.refundOrder(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── USER AUDIT ────────────────────────────────────────────────────────────

    @GetMapping("/users/history")
    public ResponseEntity<?> getUsersSystemHistory(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        List<UserHistoryProfile> usersProfiles = adminService.getAllUsersWithHistory();
        return ResponseEntity.ok(usersProfiles);
    }
}