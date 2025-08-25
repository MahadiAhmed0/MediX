package com.Backend.MediXBackend.DTO;

public class RevenueResponse {
    private Double todayRevenue;
    private Double weeklyRevenue;
    private Double monthlyRevenue;

    public RevenueResponse(Double todayRevenue, Double weeklyRevenue, Double monthlyRevenue) {
        this.todayRevenue = todayRevenue;
        this.weeklyRevenue = weeklyRevenue;
        this.monthlyRevenue = monthlyRevenue;
    }

    // Getters and setters
    public Double getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(Double todayRevenue) { this.todayRevenue = todayRevenue; }

    public Double getWeeklyRevenue() { return weeklyRevenue; }
    public void setWeeklyRevenue(Double weeklyRevenue) { this.weeklyRevenue = weeklyRevenue; }

    public Double getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(Double monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
}