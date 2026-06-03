package com.example.fastcart.controller;

import com.example.fastcart.dto.AdminLoginRequest;
import com.example.fastcart.dto.DashboardStats;
import com.example.fastcart.dto.UserHistoryProfile;
import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Order;
import com.example.fastcart.model.Product;
import com.example.fastcart.service.AdminService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ---------------------------------------------------------------------------
    // Auth helper — validates Bearer token and checks for ADMIN_SYSTEM_ID
    // ---------------------------------------------------------------------------
    private boolean isNotAuthorized(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return true;
        }
        try {
            String token = authHeader.substring(7);
            Long userId = JwtUtil.getUserIdFromToken(token);
            return !AdminService.ADMIN_SYSTEM_ID.equals(userId);
        } catch (Exception e) {
            return true;
        }
    }

    // ---------------------------------------------------------------------------
    // AUTH
    // ---------------------------------------------------------------------------

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest loginRequest) {
        String token = adminService.loginAdmin(loginRequest.getEmail(), loginRequest.getPassword());
        if (token != null) {
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "role", "ADMIN"
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid Admin Credentials"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("http://localhost:8082/api/users/login"));
        return new ResponseEntity<>(Map.of("message", "Logout completed. Redirecting..."), headers, HttpStatus.SEE_OTHER);
    }

    // ---------------------------------------------------------------------------
    // DASHBOARD
    // ---------------------------------------------------------------------------

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getStats(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ---------------------------------------------------------------------------
    // PRODUCT MANAGEMENT
    // ---------------------------------------------------------------------------

    /** Multipart upload endpoint — accepts product JSON + optional image file */
    @PostMapping(value = "/products", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createProduct(
            @RequestHeader("Authorization") String authHeader,
            @RequestPart("product") String productJson,
            @RequestPart(value = "image", required = false) MultipartFile file) {

        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Product product = objectMapper.readValue(productJson, Product.class);

            if (file != null && !file.isEmpty()) {
                String localAssetUrl = adminService.saveUploadedImage(file);
                product.setImageUrl(localAssetUrl);
            }
            return new ResponseEntity<>(adminService.addProduct(product), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("JSON or Binary Parsing Error: " + e.getMessage());
        }
    }

    @GetMapping("/products/search")
    public ResponseEntity<?> searchProducts(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("query") String query) {

        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return ResponseEntity.ok(adminService.searchProducts(query));
    }

    @GetMapping("/products/categories")
    public ResponseEntity<?> getCategories(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return ResponseEntity.ok(adminService.getCategoriesList());
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

    // ---------------------------------------------------------------------------
    // ORDER MANAGEMENT
    // ---------------------------------------------------------------------------

    @GetMapping("/orders")
    public ResponseEntity<?> manageOrders(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetails(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return adminService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
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

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return adminService.cancelOrder(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/orders/{id}/refund")
    public ResponseEntity<?> refundOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return adminService.refundOrder(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ---------------------------------------------------------------------------
    // USER AUDIT
    // ---------------------------------------------------------------------------

    @GetMapping("/users/history")
    public ResponseEntity<?> getUsersSystemHistory(@RequestHeader("Authorization") String authHeader) {
        if (isNotAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        List<UserHistoryProfile> usersProfiles = adminService.getAllUsersWithHistory();
        return ResponseEntity.ok(usersProfiles);
    }
}
