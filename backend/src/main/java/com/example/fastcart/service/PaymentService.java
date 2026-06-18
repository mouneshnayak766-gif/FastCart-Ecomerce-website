package com.example.fastcart.service;

import com.example.fastcart.dto.PaymentVerifyRequest;
import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.Order;
import com.example.fastcart.model.OrderItem;
import com.example.fastcart.model.Payment;
import com.example.fastcart.model.Product;
import com.example.fastcart.repository.CartRepository;
import com.example.fastcart.repository.OrderRepository;
import com.example.fastcart.repository.PaymentRepository;
import com.example.fastcart.repository.ProductRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired private JwtUtil jwtUtil;
    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private PaymentRepository paymentRepository;

    // ── JWT helper (mirrors OrderService pattern) ─────────────────────────────

    private Long extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.extractUserId(authHeader.substring(7));
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing Authorization token");
    }

    // ── PHASE 1: Initiate ─────────────────────────────────────────────────────

    /**
     * Called when user clicks "Confirm & Pay":
     *   1. Validate order items and stock availability (no deduction yet)
     *   2. Save Order with status=PAYMENT_PENDING
     *   3. Call Razorpay API → get razorpayOrderId
     *   4. Return razorpayOrderId + keyId to frontend so it can open the modal
     *
     * Stock is NOT deducted here. If the user abandons payment, nothing is changed.
     * Stock deduction happens atomically with payment confirmation in verifyPayment().
     */
    @Transactional
    public Map<String, Object> initiatePayment(Order orderRequest, String authHeader) {
        Long userId = extractUserId(authHeader);

        if (orderRequest.getOrderItems() == null || orderRequest.getOrderItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must include at least one item.");
        }

        // ── Validate items and calculate total ───────────────────────────────
        double total = 0;
        List<OrderItem> validatedItems = new ArrayList<>();

        for (OrderItem item : orderRequest.getOrderItems()) {
            if (item.getProductId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each item must include a productId.");
            }

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Product not found: " + item.getProductId()));

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid quantity for product: " + product.getName());
            }

            // Pre-flight stock check (no lock — final check happens in verifyPayment)
            if (product.getStock() == null || product.getStock() < item.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Insufficient stock for: " + product.getName());
            }

            // Snapshot current product details into the order item
            item.setProductName(product.getName());
            item.setImageUrl(product.getImageUrl());
            item.setPrice(product.getPrice());
            total += product.getPrice() * item.getQuantity();
            validatedItems.add(item);
        }

        // ── Persist order as PAYMENT_PENDING ─────────────────────────────────
        Order order = new Order();
        order.setUserId(userId);
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setPaymentMethod("RAZORPAY");
        order.setOrderStatus("PAYMENT_PENDING");
        order.setOrderDate(LocalDateTime.now());
        order.setTotalAmount(total);
        order.setOrderItems(validatedItems);
        Order savedOrder = orderRepository.save(order);

        // ── Create Razorpay order ─────────────────────────────────────────────
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject razorpayRequest = new JSONObject();
            // Razorpay requires amount in paise (smallest INR unit)
            razorpayRequest.put("amount", (long)(total * 100));
            razorpayRequest.put("currency", "INR");
            // receipt is your internal reference — max 40 chars
            razorpayRequest.put("receipt", "fc_" + savedOrder.getId());

            com.razorpay.Order razorpayOrder = client.orders.create(razorpayRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            // Store razorpayOrderId on the order for cross-referencing in verify step
            savedOrder.setRazorpayOrderId(razorpayOrderId);
            orderRepository.save(savedOrder);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("orderId",         savedOrder.getId());
            response.put("razorpayOrderId", razorpayOrderId);
            response.put("amount",          (long)(total * 100));   // paise — Razorpay modal expects paise
            response.put("currency",        "INR");
            response.put("keyId",           razorpayKeyId);         // public key — safe to send to frontend
            return response;

        } catch (RazorpayException e) {
            // Razorpay API failed — roll back the pending order so the user can retry cleanly
            orderRepository.delete(savedOrder);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Payment gateway error. Please try again. Detail: " + e.getMessage());
        }
    }

    // ── PHASE 2: Verify ───────────────────────────────────────────────────────

    /**
     * Called after Razorpay handler() callback in frontend:
     *   1. Idempotency check — prevent double-processing the same paymentId
     *   2. Locate and validate the pending order
     *   3. Verify HMAC-SHA256 signature → proves Razorpay actually collected money
     *   4. Deduct stock (with re-check for race conditions)
     *   5. Update order → PAID
     *   6. Save Payment audit record
     *   7. Optionally clear cart items
     *
     * ALL database mutations are in a single transaction — if stock deduction fails
     * mid-loop, nothing is committed (no partial stock corruption).
     */
    @Transactional
    public Map<String, Object> verifyPayment(PaymentVerifyRequest req, String authHeader) {
        Long userId = extractUserId(authHeader);

        // ── Idempotency: reject duplicate verify calls for same payment ───────
        if (paymentRepository.existsByRazorpayPaymentIdAndStatus(req.getRazorpayPaymentId(), "SUCCESS")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This payment has already been verified and processed.");
        }

        // ── Load and validate the order ───────────────────────────────────────
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to verify this order.");
        }

        if (!"PAYMENT_PENDING".equals(order.getOrderStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Order is not in PAYMENT_PENDING state. Current: " + order.getOrderStatus());
        }

        // ── Signature verification ─────────────────────────────────────────────
        // Razorpay's spec: HMAC_SHA256( razorpay_order_id + "|" + razorpay_payment_id, key_secret )
        boolean signatureValid = verifyHmacSignature(
                req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId(),
                req.getRazorpaySignature()
        );

        if (!signatureValid) {
            // Persist a FAILED payment audit record before throwing
            savePaymentRecord(order, req, userId, "FAILED");
            order.setOrderStatus("PAYMENT_FAILED");
            orderRepository.save(order);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Payment signature verification failed. Possible tampering detected.");
        }

        // ── Stock deduction (with race-condition re-check) ────────────────────
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                if (item == null || item.getProductId() == null) continue;

                // Re-fetch with pessimistic read — another concurrent verify could race here
                Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Product missing: " + item.getProductId()));

                int currentStock = (product.getStock() == null) ? 0 : product.getStock();
                if (currentStock < item.getQuantity()) {
                    // Stock ran out after initiate — a real edge case. Fail gracefully.
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Stock depleted for '" + product.getName() + "' after payment was initiated. " +
                            "Please contact support with order ID: " + order.getId());
                }
                product.setStock(currentStock - item.getQuantity());
                productRepository.save(product);
            }
        }

        // ── Update order status ───────────────────────────────────────────────
        order.setOrderStatus("PAID");
        orderRepository.save(order);

        // ── Save SUCCESS payment audit record ─────────────────────────────────
        savePaymentRecord(order, req, userId, "SUCCESS");

        // ── Cart cleanup (only for cart checkout flow) ────────────────────────
        if ("CART_FLOW".equals(req.getCheckoutType()) && order.getOrderItems() != null) {
            List<Long> orderedProductIds = order.getOrderItems().stream()
                    .map(OrderItem::getProductId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            if (!orderedProductIds.isEmpty()) {
                cartRepository.deleteAllByUserIdAndProductIdIn(userId, orderedProductIds);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Payment verified. Your order is confirmed.");
        response.put("orderId", order.getId());
        return response;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * HMAC-SHA256 signature verification.
     *
     * DO NOT use String.equals() for comparing MACs — it's vulnerable to
     * timing attacks. MessageDigest.isEqual() is constant-time.
     *
     * Reference: https://razorpay.com/docs/payments/server-integration/java/payment-gateway/build-integration/
     */
    private boolean verifyHmacSignature(String payload, String expectedSignature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] computedHash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computedHex = bytesToHex(computedHash);

            // Constant-time comparison to prevent timing oracle attacks
            return java.security.MessageDigest.isEqual(
                    computedHex.getBytes(StandardCharsets.UTF_8),
                    expectedSignature.getBytes(StandardCharsets.UTF_8));

        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Signature computation failed: " + e.getMessage());
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private void savePaymentRecord(Order order, PaymentVerifyRequest req, Long userId, String status) {
        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setUserId(userId);
        payment.setRazorpayOrderId(req.getRazorpayOrderId());
        payment.setRazorpayPaymentId(req.getRazorpayPaymentId());
        payment.setRazorpaySignature(req.getRazorpaySignature());
        payment.setStatus(status);
        payment.setAmount(order.getTotalAmount());
        paymentRepository.save(payment);
    }
}
