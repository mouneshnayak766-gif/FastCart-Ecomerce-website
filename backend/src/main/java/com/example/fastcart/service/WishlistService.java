package com.example.fastcart.service;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Wishlist;
import com.example.fastcart.repository.ProductRepository;
import com.example.fastcart.repository.WishlistRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    // =========================
    // EXTRACT USER ID
    // =========================
    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing token");
        }
        return JwtUtil.extractUserId(authHeader.substring(7));
    }

    // =========================
    // ADD WISHLIST
    // =========================
    public Wishlist addWishlist(Wishlist wishlist, String authHeader) {

        Long userId = extractUserId(authHeader);
        wishlist.setUserId(userId);

        // Validate product exists before saving
        productRepository.findById(wishlist.getProductId())
                .orElseThrow(() -> new RuntimeException("Product Not Found"));

        return wishlistRepository.save(wishlist);
    }

    // =========================
    // GET MY WISHLIST
    // =========================
    public List<Wishlist> getWishlist(String authHeader) {
        Long userId = extractUserId(authHeader);
        return wishlistRepository.findByUserId(userId);
    }

    // =========================
    // REMOVE WISHLIST
    // =========================
    public void removeWishlist(Long productId, String authHeader) {

        Long userId = extractUserId(authHeader);

        // BUG FIX: WishlistRepository.findByUserIdAndProductId returns Optional<Wishlist>
        // but the old code assigned it directly to Wishlist (not Optional) and then
        // null-checked it — this ALWAYS threw a compile error or ClassCastException.
        // Fixed to properly use .orElseThrow() on the Optional.
        Wishlist wishlist = wishlistRepository
                .findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException(
                        "Wishlist item not found for productId: " + productId
                ));

        wishlistRepository.delete(wishlist);
    }
}
