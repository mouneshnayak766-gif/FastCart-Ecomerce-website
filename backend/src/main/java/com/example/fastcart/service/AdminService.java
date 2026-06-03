package com.example.fastcart.service;

import com.example.fastcart.dto.DashboardStats;
import com.example.fastcart.dto.UserHistoryProfile;
import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Order;
import com.example.fastcart.model.OrderItem;
import com.example.fastcart.model.Product;
import com.example.fastcart.model.User;
import com.example.fastcart.repository.OrderRepository;
import com.example.fastcart.repository.ProductRepository;
import com.example.fastcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    // ---------------------------------------------------------------------------
    // Credentials externalized to application.properties — never hardcode secrets
    // Add these to your application.properties:
    //   admin.email=admin123@gmail.com
    //   admin.password=7022005
    // ---------------------------------------------------------------------------
    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    public static final Long ADMIN_SYSTEM_ID = 0L;

    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    // ---------------------------------------------------------------------------
    // AUTH
    // ---------------------------------------------------------------------------

    public String loginAdmin(String email, String password) {
        if (adminEmail.equalsIgnoreCase(email) && adminPassword.equals(password)) {
            return JwtUtil.generateToken(ADMIN_SYSTEM_ID);
        }
        return null;
    }

    // ---------------------------------------------------------------------------
    // DASHBOARD STATS
    // ---------------------------------------------------------------------------

    public DashboardStats getDashboardStats() {
        long totalProducts = productRepository.count();
        long totalOrders   = orderRepository.count();
        long totalUsers    = userRepository.count();

        List<Order> allOrders = orderRepository.findAll();

        double totalRevenue = allOrders.stream()
                .filter(o -> !"CANCELLED".equals(o.getOrderStatus()) && !"REFUNDED".equals(o.getOrderStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        // Top 10 recent orders
        List<Order> recentOrders = orderRepository.findTop10ByOrderByOrderDateDesc();

        // Monthly revenue breakdown  (key format: YYYY-MM)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Double> monthlyRevenue = allOrders.stream()
                .filter(o -> !"CANCELLED".equals(o.getOrderStatus()) && !"REFUNDED".equals(o.getOrderStatus()))
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().format(formatter),
                        Collectors.summingDouble(Order::getTotalAmount)
                ));

        // Top 5 selling products
        Map<Long, Integer> productQuantities = allOrders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .collect(Collectors.groupingBy(
                        OrderItem::getProductId,
                        Collectors.summingInt(OrderItem::getQuantity)
                ));

        List<Map<String, Object>> topSellingProducts = productQuantities.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    Optional<Product> prod = productRepository.findById(entry.getKey());
                    map.put("productId", entry.getKey());
                    map.put("name", prod.map(Product::getName).orElse("Unknown Product"));
                    map.put("unitsSold", entry.getValue());
                    return map;
                })
                // FIX: Collectors.filterNotNull() does not exist — use filter(Objects::nonNull)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new DashboardStats(
                totalUsers, totalProducts, totalOrders, totalRevenue,
                recentOrders, monthlyRevenue, topSellingProducts
        );
    }

    // ---------------------------------------------------------------------------
    // FILE UPLOAD
    // ---------------------------------------------------------------------------

    public String saveUploadedImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot save an empty file.");
        }
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        String uniqueFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR + uniqueFilename);
        Files.write(path, file.getBytes());
        return "/uploads/" + uniqueFilename;
    }

    // ---------------------------------------------------------------------------
    // PRODUCT MANAGEMENT
    // ---------------------------------------------------------------------------

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query);
    }

    public List<String> getCategoriesList() {
        return productRepository.findDistinctCategory();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public Optional<Product> updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updatedProduct.getName());
            existing.setPrice(updatedProduct.getPrice());
            existing.setCategory(updatedProduct.getCategory());
            existing.setImageUrl(updatedProduct.getImageUrl());
            existing.setDescription(updatedProduct.getDescription());
            existing.setRating(updatedProduct.getRating());
            existing.setStock(updatedProduct.getStock());
            return productRepository.save(existing);
        });
    }

    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ---------------------------------------------------------------------------
    // ORDER MANAGEMENT
    // ---------------------------------------------------------------------------

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> updateOrderStatus(Long orderId, String status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setOrderStatus(status.toUpperCase());
            return orderRepository.save(order);
        });
    }

    public Optional<Order> cancelOrder(Long orderId) {
        return orderRepository.findById(orderId).map(order -> {
            order.setOrderStatus("CANCELLED");
            return orderRepository.save(order);
        });
    }

    public Optional<Order> refundOrder(Long orderId) {
        return orderRepository.findById(orderId).map(order -> {
            order.setOrderStatus("REFUNDED");
            return orderRepository.save(order);
        });
    }

    // ---------------------------------------------------------------------------
    // USER AUDIT
    // ---------------------------------------------------------------------------

    public List<UserHistoryProfile> getAllUsersWithHistory() {
        return userRepository.findAll().stream()
                .map(user -> {
                    List<Order> userOrders = orderRepository.findByUserId(user.getId());
                    return new UserHistoryProfile(user, userOrders);
                })
                .collect(Collectors.toList());
    }
}
