package com.example.fastcart.dto;

/**
 * DTO for POST /api/payment/verify
 *
 * The three razorpay_* fields are returned by Razorpay's checkout.js
 * in the handler() callback on payment success.
 */
public class PaymentVerifyRequest {

    /** Our internal DB order ID returned by /api/payment/initiate */
    private Long orderId;

    /** e.g. "pay_AbcXyz123" — returned by Razorpay handler callback */
    private String razorpayPaymentId;

    /** e.g. "order_AbcXyz123" — same value sent during checkout open */
    private String razorpayOrderId;

    /** HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, keySecret) */
    private String razorpaySignature;

    /**
     * "CART_FLOW" → backend will clear purchased items from user's cart.
     * Any other value or null → skip cart cleanup (direct buy / wishlist buy).
     */
    private String checkoutType;

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public String getCheckoutType() { return checkoutType; }
    public void setCheckoutType(String checkoutType) { this.checkoutType = checkoutType; }
}
