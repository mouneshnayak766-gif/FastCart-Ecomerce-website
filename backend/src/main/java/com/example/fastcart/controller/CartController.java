package com.example.fastcart.controller;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Cart;
import com.example.fastcart.repository.CartRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin("http://localhost:5173")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @PostMapping("/add")
    public Cart addCart(
            @RequestBody Cart cart,
            @RequestHeader("Authorization")
            String authHeader
    ) {

        String token =
                authHeader.replace("Bearer ", "");

        Long userId =
                JwtUtil.extractUserId(token);

        cart.setUserId(userId);

        cart.setTotalPrice(
                cart.getPrice() * cart.getQuantity()
        );

        return cartRepository.save(cart);
    }

    @GetMapping("/my-cart")
    public List<Cart> getMyCart(
            @RequestHeader("Authorization")
            String authHeader
    ) {

        String token =
                authHeader.replace("Bearer ", "");

        Long userId =
                JwtUtil.extractUserId(token);

        return cartRepository.findByUserId(userId);
    }

    @DeleteMapping("/{id}")
    public void deleteCart(
            @PathVariable Long id
    ) {

        cartRepository.deleteById(id);
    }
}