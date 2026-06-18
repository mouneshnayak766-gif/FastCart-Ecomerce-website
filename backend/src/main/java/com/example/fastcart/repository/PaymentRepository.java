package com.example.fastcart.repository;

import com.example.fastcart.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    List<Payment> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    /** Use this to detect duplicate verify attempts — idempotency guard */
    boolean existsByRazorpayPaymentIdAndStatus(String razorpayPaymentId, String status);
}
