package com.healthguard.admin.medicine.service;

import com.healthguard.admin.medicine.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request, String username);

    List<OrderResponse> getAllOrders(String status, LocalDate orderDate, LocalDate startDate, LocalDate endDate, String search);

    OrderResponse getOrderById(Long id);

    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request, String username);

    void deleteOrder(Long id, String username);

    OrderDashboardStatsDTO getDashboardStats();

    List<ForecastRecommendationDTO> getForecastRecommendations();
}
