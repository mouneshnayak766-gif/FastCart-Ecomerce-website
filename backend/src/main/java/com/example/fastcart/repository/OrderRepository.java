package com.example.fastcart.repository;

import com.example.fastcart.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Used by AdminService — returns all orders for a user (unsorted)
    List<Order> findByUserId(Long userId);

    // FIX: OrderService calls findByUserIdOrderByOrderDateDesc() but the original
    //      OrderRepository only had findByUserId(). Added the sorted variant here.
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Used by AdminService dashboard — top 10 most recent orders across all users
    List<Order> findTop10ByOrderByOrderDateDesc();
}
