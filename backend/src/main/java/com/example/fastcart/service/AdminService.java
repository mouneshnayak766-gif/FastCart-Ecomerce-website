package com.example.fastcart.service;

import com.example.fastcart.dto.DashboardStats;
import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Order;
import com.example.fastcart.model.Product;
import com.example.fastcart.repository.OrderRepository;
import com.example.fastcart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    private final String ADMIN_EMAIL = "admin123@gmail.com";
    private final String ADMIN_PASSWORD = "7022005";
    
    // We use 0L as a placeholder ID representing the Admin system user
    public static final Long ADMIN_SYSTEM_ID = 0L; 

    public String loginAdmin(String email, String password) {
        if (ADMIN_EMAIL.equalsIgnoreCase(email) && ADMIN_PASSWORD.equals(password)) {
            // Uses your exact existing utility method
            return JwtUtil.generateToken(ADMIN_SYSTEM_ID); 
        }
        return null;
    }

    public DashboardStats getDashboardStats() {
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        
        List<Order> allOrders = orderRepository.findAll();
        
        double totalRevenue = allOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        long distinctUsersCount = allOrders.stream()
                .map(Order::getUserId)
                .distinct()
                .count();

        return new DashboardStats(distinctUsersCount, totalProducts, totalOrders, totalRevenue);
    }

    // --- PRODUCT MANAGEMENT ---
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(existingProduct -> {
            existingProduct.setName(updatedProduct.getName());
            existingProduct.setPrice(updatedProduct.getPrice());
            existingProduct.setCategory(updatedProduct.getCategory());
            existingProduct.setImageUrl(updatedProduct.getImageUrl());
            existingProduct.setDescription(updatedProduct.getDescription());
            existingProduct.setRating(updatedProduct.getRating());
            existingProduct.setStock(updatedProduct.getStock());
            return productRepository.save(existingProduct);
        });
    }

    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // --- ORDER MANAGEMENT ---
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> updateOrderStatus(Long orderId, String status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setOrderStatus(status.toUpperCase());
            return orderRepository.save(order);
        });
    }
}