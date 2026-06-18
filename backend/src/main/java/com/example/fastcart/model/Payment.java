package com.example.fastcart.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Audit record for every payment attempt — both SUCCESS and FAILED.
 * Never delete rows from this table; it's your payment audit trail.
 */
@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payments_order_id",   columnList = "orderId"),
    @Index(name = "idx_payments_user_id",    columnList = "userId"),
    @Index(name = "idx_payments_rzp_pay_id", columnList = "razorpayPaymentId")
})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK to orders.id — we store it as a plain Long (consistent with existing codebase) */
    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Long userId;

    /** Razorpay's order ID (prefix: order_) returned by /api/payment/initiate */
    @Column(nullable = false, length = 100)
    private String razorpayOrderId;

    /** Razorpay's payment ID (prefix: pay_) returned after successful payment in frontend */
    @Column(length = 100)
    private String razorpayPaymentId;

    /**
     * HMAC-SHA256 signature returned by Razorpay on payment success.
     * Stored for post-hoc audit even after verification.
     */
    @Column(length = 512)
    private String razorpaySignature;

    /**
     * SUCCESS | FAILED
     * FAILED rows are written when signature verification fails — critical for fraud detection.
     */
    @Column(nullable = false, length = 20)
    private String status;

    /** Amount in INR (not paise) */
    @Column(nullable = false)
    private Double amount;

    /** ISO currency code — always "INR" for now */
    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Instant getCreatedAt() { return createdAt; }
}
