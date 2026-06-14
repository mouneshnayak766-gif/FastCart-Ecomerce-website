package com.example.fastcart.service;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Cart;
import com.example.fastcart.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    // FIX: All four methods were calling JwtUtil.extractUserId() which doesn't exist.
    //      Correct method name throughout this codebase is JwtUtil.getUserIdFromToken().
    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing Authorization token");
        }
        return JwtUtil.getUserIdFromToken(authHeader.substring(7));
    }

    // ADD TO CART
    public Cart addCart(Cart cart, String authHeader) {
        if (cart.getProductId() == null) {
            throw new RuntimeException("Product ID cannot be null");
        }

        Long userId = extractUserId(authHeader);
        cart.setUserId(userId);

        List<Cart> userCart = cartRepository.findByUserId(userId);

        for (Cart item : userCart) {
            if (Objects.equals(item.getProductId(), cart.getProductId())) {
                // Product already in cart — increment quantity
                item.setQuantity(item.getQuantity() + 1);
                item.setTotalPrice(item.getPrice() * item.getQuantity());
                return cartRepository.save(item);
            }
        }

        // New product — add with quantity 1
        cart.setQuantity(1);
        cart.setTotalPrice(cart.getPrice() * cart.getQuantity());
        return cartRepository.save(cart);
    }

    // GET MY CART
    public List<Cart> getMyCart(String authHeader) {
        Long userId = extractUserId(authHeader);
        return cartRepository.findByUserId(userId);
    }

    // DELETE CART ITEM
    public void deleteCart(Long id, String authHeader) {
        Long userId = extractUserId(authHeader);

        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart Item Not Found"));

        if (!cart.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized Access");
        }

        cartRepository.delete(cart);
    }

    // CLEAR ALL CART ITEMS
    public void clearCart(String authHeader) {
        Long userId = extractUserId(authHeader);
        cartRepository.deleteAllByUserId(userId);
    }

    // INCREASE QUANTITY
    public Cart increaseQuantity(Long id) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart Item Not Found"));

        if (cart.getQuantity() >= 10) {
            throw new RuntimeException("Maximum quantity is 10");
        }

        cart.setQuantity(cart.getQuantity() + 1);
        double price = cart.getPrice() != null ? cart.getPrice() : 0.0;
        cart.setTotalPrice(price * cart.getQuantity());
        return cartRepository.save(cart);
    }

    // DECREASE QUANTITY — removes item if quantity reaches 0
    public Cart decreaseQuantity(Long id) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart Item Not Found"));

        if (cart.getQuantity() <= 1) {
            cartRepository.delete(cart);
            return null;
        }

        cart.setQuantity(cart.getQuantity() - 1);
        double price = cart.getPrice() != null ? cart.getPrice() : 0.0;
        cart.setTotalPrice(price * cart.getQuantity());
        return cartRepository.save(cart);
    }
}
