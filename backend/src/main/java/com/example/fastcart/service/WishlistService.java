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

    // FIX: Was JwtUtil.extractUserId() — correct method is JwtUtil.getUserIdFromToken()
    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing token");
        }
        return JwtUtil.getUserIdFromToken(authHeader.substring(7));
    }

    // ADD TO WISHLIST
    public Wishlist addWishlist(Wishlist wishlist, String authHeader) {
        Long userId = extractUserId(authHeader);
        wishlist.setUserId(userId);

        // Validate product exists before saving
        productRepository.findById(wishlist.getProductId())
                .orElseThrow(() -> new RuntimeException("Product Not Found"));

        // Prevent duplicate entries
        List<Wishlist> existingItems = wishlistRepository
                .findAllByUserIdAndProductId(userId, wishlist.getProductId());

        if (!existingItems.isEmpty()) {
            return existingItems.get(0);
        }

        return wishlistRepository.save(wishlist);
    }

    // GET MY WISHLIST
    public List<Wishlist> getWishlist(String authHeader) {
        Long userId = extractUserId(authHeader);
        return wishlistRepository.findByUserId(userId);
    }

    // REMOVE FROM WISHLIST
    public void removeWishlist(Long productId, String authHeader) {
        Long userId = extractUserId(authHeader);

        Wishlist wishlist = wishlistRepository
                .findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException(
                        "Wishlist item not found for productId: " + productId));

        wishlistRepository.delete(wishlist);
    }
}
