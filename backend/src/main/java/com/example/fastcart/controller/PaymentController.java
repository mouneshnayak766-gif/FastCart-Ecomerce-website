package com.example.fastcart.controller;

import com.example.fastcart.dto.PaymentVerifyRequest;
import com.example.fastcart.model.Order;
import com.example.fastcart.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Payment endpoints:
 *
 *   POST /api/payment/initiate  — creates PAYMENT_PENDING order + Razorpay order
 *   POST /api/payment/verify    — verifies HMAC signature, deducts stock, marks PAID
 *
 * Authorization: Bearer <accessToken>  (user JWT — not admin)
 * Both endpoints are protected by JWT extraction inside PaymentService.
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Step 1 — User clicks "Confirm & Pay"
     *
     * Request body: same shape as /orders/place  { shippingAddress, orderItems }
     * Response:     { orderId, razorpayOrderId, amount (paise), currency, keyId }
     *
     * Frontend uses razorpayOrderId + amount + keyId to open Razorpay checkout modal.
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(
            @RequestBody Order orderRequest,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Map<String, Object> result = paymentService.initiatePayment(orderRequest, authHeader);
            return ResponseEntity.ok(result);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to initiate payment: " + e.getMessage()));
        }
    }

    /**
     * Step 2 — Called by frontend after Razorpay handler() callback
     *
     * Request body: {
     *   orderId,            — our DB order ID from step 1
     *   razorpayPaymentId,  — "pay_..." returned by Razorpay
     *   razorpayOrderId,    — "order_..." (same as step 1)
     *   razorpaySignature,  — HMAC from Razorpay handler response
     *   checkoutType        — "CART_FLOW" or null
     * }
     *
     * Response on success: { success: true, message, orderId }
     * Response on failure: 400 with message (signature mismatch = possible fraud)
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerifyRequest verifyRequest,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Map<String, Object> result = paymentService.verifyPayment(verifyRequest, authHeader);
            return ResponseEntity.ok(result);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Payment verification failed: " + e.getMessage()));
        }
    }
}
