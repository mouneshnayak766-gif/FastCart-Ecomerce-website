package com.example.fastcart.controller;


import com.example.fastcart.model.Cart;
import com.example.fastcart.service.CartService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")

public class CartController {

   
        @Autowired
        private CartService cartService;

   @PostMapping("/add")
public ResponseEntity<?> addCart(

        @RequestBody Cart cart,

        @RequestHeader("Authorization")
        String authHeader

) {

    try {

        Cart savedCart =
                cartService.addCart(
                        cart,
                        authHeader
                );

        return ResponseEntity.ok(
                savedCart
        );

    } catch (Exception e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}

   @GetMapping("/my-cart")
public ResponseEntity<?> getMyCart(

        @RequestHeader("Authorization")
        String authHeader

) {

    try {

        List<Cart> cart =
                cartService.getMyCart(
                        authHeader
                );

        return ResponseEntity.ok(cart);

    } catch (Exception e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteCart(

        @PathVariable Long id,

        @RequestHeader("Authorization")
        String authHeader

) {

    try {

        cartService.deleteCart(
                id,
                authHeader
        );

        return ResponseEntity.ok(
                "Deleted Successfully"
        );

    } catch (Exception e) {

        return ResponseEntity
                .status(400)
                .body(e.getMessage());
    }
}

    @PutMapping("/increase/{id}")
public ResponseEntity<?> increaseQuantity(

        @PathVariable Long id

) {

    try {

        Cart updatedCart =
                cartService.increaseQuantity(id);

        return ResponseEntity.ok(updatedCart);

    } catch (Exception e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}
@PutMapping("/decrease/{id}")
public ResponseEntity<?> decreaseQuantity(

        @PathVariable Long id

) {

    try {

        Cart updatedCart =
                cartService.decreaseQuantity(id);

        // ITEM REMOVED

        if (updatedCart == null) {

            return ResponseEntity
                    .ok("Item Removed");
        }

        return ResponseEntity.ok(updatedCart);

    } catch (Exception e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}
}