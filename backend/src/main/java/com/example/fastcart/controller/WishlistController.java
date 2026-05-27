package com.example.fastcart.controller;

import com.example.fastcart.model.Wishlist;
import com.example.fastcart.service.WishlistService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    // ADD WISHLIST

    @PostMapping("/add")
    public ResponseEntity<?> addWishlist(

            @RequestBody Wishlist wishlist,

            @RequestHeader("Authorization")
            String authHeader

    ) {

        try {

            Wishlist savedWishlist =
                    wishlistService.addWishlist(
                            wishlist,
                            authHeader
                    );

            return ResponseEntity.ok(
                    savedWishlist
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // GET MY WISHLIST

    @GetMapping("/my-wishlist")
    public ResponseEntity<?> getWishlist(

            @RequestHeader("Authorization")
            String authHeader

    ) {

        try {

            List<Wishlist> wishlist =
                    wishlistService.getWishlist(
                            authHeader
                    );

            return ResponseEntity.ok(
                    wishlist
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(401)
                    .body(e.getMessage());
        }
    }

    // REMOVE WISHLIST

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeWishlist(

            @PathVariable Long productId,

            @RequestHeader("Authorization")
            String authHeader

    ) {

        try {

            wishlistService.removeWishlist(
                    productId,
                    authHeader
            );

            return ResponseEntity.ok(
                    "Removed Successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}