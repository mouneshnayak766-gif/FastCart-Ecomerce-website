package com.example.fastcart.dto;

import com.example.fastcart.model.User;
import com.example.fastcart.model.Order;
import java.util.List;

public class UserHistoryProfile {
    private User user;
    private List<Order> orderHistory;

    public UserHistoryProfile(User user, List<Order> orderHistory) {
        this.user = user;
        this.orderHistory = orderHistory;
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<Order> getOrderHistory() { return orderHistory; }
    public void setOrderHistory(List<Order> orderHistory) { this.orderHistory = orderHistory; }
}