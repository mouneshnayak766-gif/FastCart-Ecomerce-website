package com.example.fastcart.controller;
// aditya birajdar
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
    public Cart addCart(@RequestBody Cart cart) {
        return cartRepository.save(cart);
    }

    @GetMapping("/user/{userId}")
    public List<Cart> getUserCart(@PathVariable Long userId) {
        return cartRepository.findByUserId(userId);
    }

    @DeleteMapping("/{id}")
    public void deleteCart(@PathVariable Long id) {
        cartRepository.deleteById(id);
    }
}