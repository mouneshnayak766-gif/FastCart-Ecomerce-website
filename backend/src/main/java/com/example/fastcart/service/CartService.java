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

    // =========================
    // ADD TO CART
    // =========================

    public Cart addCart(
            Cart cart,
            String authHeader
    ) {

        // VALIDATE PRODUCT ID

        if (cart.getProductId() == null) {

            throw new RuntimeException(
                    "Product ID cannot be null"
            );
        }

        // REMOVE "Bearer "

        String token =
                authHeader.replace(
                        "Bearer ",
                        ""
                );

        // EXTRACT USER ID FROM JWT

        Long userId =
                JwtUtil.extractUserId(token);

        // SET USER ID

        cart.setUserId(userId);

        // GET USER CART ITEMS

        List<Cart> userCart =
                cartRepository.findByUserId(userId);

        // CHECK PRODUCT ALREADY EXISTS

        for (Cart item : userCart) {

            if (Objects.equals(
                    item.getProductId(),
                    cart.getProductId()
            )) {

                // PRODUCT EXISTS
                // INCREASE QUANTITY

                item.setQuantity(
                        item.getQuantity() + 1
                );

                // UPDATE TOTAL PRICE

                item.setTotalPrice(
                        item.getPrice()
                                * item.getQuantity()
                );

                return cartRepository.save(item);
            }
        }

        // NEW PRODUCT

        cart.setQuantity(1);

        cart.setTotalPrice(
                cart.getPrice()
                        * cart.getQuantity()
        );

        return cartRepository.save(cart);
    }

    // =========================
    // GET MY CART
    // =========================

    public List<Cart> getMyCart(
            String authHeader
    ) {

        // REMOVE "Bearer "

        String token =
                authHeader.replace(
                        "Bearer ",
                        ""
                );

        // EXTRACT USER ID

        Long userId =
                JwtUtil.extractUserId(token);

        // RETURN ONLY USER CART

        return cartRepository.findByUserId(userId);
    }

    // =========================
    // DELETE CART ITEM
    // =========================

    public void deleteCart(

            Long id,

            String authHeader

    ) {

        String token =
                authHeader.replace(
                        "Bearer ",
                        ""
                );

        Long userId =
                JwtUtil.extractUserId(token);

        Cart cart =
                cartRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart Item Not Found"
                                )
                        );

        if (!cart.getUserId().equals(userId)) {

            throw new RuntimeException(
                    "Unauthorized Access"
            );
        }

        cartRepository.delete(cart);
    }

    // =========================
    // CLEAR ALL CART ITEMS
    // =========================

    public void clearCart(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long userId = JwtUtil.extractUserId(token);
        cartRepository.deleteAllByUserId(userId);
    }

    // =========================
    // INCREASE QUANTITY
    // =========================

    public Cart increaseQuantity(Long id) {

        Cart cart = cartRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart Item Not Found"
                        )
                );

        // MAX LIMIT = 10

        if (cart.getQuantity() >= 10) {

            throw new RuntimeException(
                    "Maximum quantity is 10"
            );
        }

        cart.setQuantity(
                cart.getQuantity() + 1
        );

        Double price =
                cart.getPrice() != null
                        ? cart.getPrice()
                        : 0.0;

        cart.setTotalPrice(
                price * cart.getQuantity()
        );

        return cartRepository.save(cart);
    }

    // =========================
    // DECREASE QUANTITY
    // =========================

    public Cart decreaseQuantity(Long id) {

        Cart cart = cartRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart Item Not Found"
                        )
                );

        // IF QUANTITY = 1
        // REMOVE ITEM

        if (cart.getQuantity() <= 1) {

            cartRepository.delete(cart);

            return null;
        }

        cart.setQuantity(
                cart.getQuantity() - 1
        );

        Double price =
                cart.getPrice() != null
                        ? cart.getPrice()
                        : 0.0;

        cart.setTotalPrice(
                price * cart.getQuantity()
        );

        return cartRepository.save(cart);
    }
}