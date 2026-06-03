package com.example.fastcart.dto;

import com.example.fastcart.model.Order;
import java.util.List;
import java.util.Map;

public class DashboardStats {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private double totalRevenue;
    private List<Order> recentOrders;
    private Map<String, Double> monthlyRevenueChart;
    private List<Map<String, Object>> topSellingProducts;

    public DashboardStats(long totalUsers, long totalProducts, long totalOrders, double totalRevenue,
                          List<Order> recentOrders, Map<String, Double> monthlyRevenueChart, 
                          List<Map<String, Object>> topSellingProducts) {
        this.totalUsers = totalUsers;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.recentOrders = recentOrders;
        this.monthlyRevenueChart = monthlyRevenueChart;
        this.topSellingProducts = topSellingProducts;
    }

    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
    public List<Order> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<Order> recentOrders) { this.recentOrders = recentOrders; }
    public Map<String, Double> getMonthlyRevenueChart() { return monthlyRevenueChart; }
    public void setMonthlyRevenueChart(Map<String, Double> monthlyRevenueChart) { this.monthlyRevenueChart = monthlyRevenueChart; }
    public List<Map<String, Object>> getTopSellingProducts() { return topSellingProducts; }
    public void setTopSellingProducts(List<Map<String, Object>> topSellingProducts) { this.topSellingProducts = topSellingProducts; }
}