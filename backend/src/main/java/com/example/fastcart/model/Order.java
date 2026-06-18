package com.example.fastcart.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Double totalAmount;
    private String shippingAddress;

    /**
     * "RAZORPAY" | "COD"
     * Existing COD orders are unaffected — they retain "Cash On Delivery" or can be
     * migrated to "COD" in a one-time DB update if needed.
     */
    private String paymentMethod;

    /**
     * Order lifecycle statuses:
     *
     *   PAYMENT_PENDING  — order created, Razorpay modal opened, payment not yet confirmed
     *   PAYMENT_FAILED   — signature verification failed (possible fraud or network issue)
     *   PAID             — Razorpay payment verified, stock deducted
     *   PENDING          — Legacy COD status / admin processing state after PAID
     *   PROCESSING       — Admin acknowledged, preparing shipment
     *   SHIPPED          — Dispatched
     *   DELIVERED        — Delivered to customer
     *   CANCELLED        — Cancelled (by user or admin)
     *   REFUNDED         — Payment refunded via Razorpay
     */
    private String orderStatus;

    private LocalDateTime orderDate;

    /**
     * ADDED: Razorpay's order ID (prefix "order_").
     * Stored here for audit and cross-referencing with the payments table.
     * NULL for COD orders.
     */
    @Column(length = 100)
    private String razorpayOrderId;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> orderItems;

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }
}
