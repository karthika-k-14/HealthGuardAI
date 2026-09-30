package com.healthguard.admin.medicine.controller;

import com.healthguard.admin.medicine.dto.*;
import com.healthguard.admin.medicine.service.OrderService;
import com.healthguard.admin.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping({"/api/pharmacist/orders", "/pharmacist/orders"})
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Principal principal,
            @RequestHeader(value = "X-User-Name", required = false) String headerUser
    ) {
        String username = principal != null ? principal.getName() : (headerUser != null ? headerUser : "PHARMACIST");
        OrderResponse response = orderService.createOrder(request, username);
        return new ResponseEntity<>(ApiResponse.success("Order created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate orderDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search
    ) {
        List<OrderResponse> orders = orderService.getAllOrders(status, orderDate, startDate, endDate, search);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping({"/statistics", "/stats"})
    public ResponseEntity<ApiResponse<OrderDashboardStatsDTO>> getOrderStatistics() {
        OrderDashboardStatsDTO stats = orderService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Order dashboard statistics retrieved successfully", stats));
    }

    @GetMapping({"/forecast-recommendations", "/recommendations"})
    public ResponseEntity<ApiResponse<List<ForecastRecommendationDTO>>> getForecastRecommendations() {
        List<ForecastRecommendationDTO> recommendations = orderService.getForecastRecommendations();
        return ResponseEntity.ok(ApiResponse.success("AI Demand forecast recommendations retrieved successfully", recommendations));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @RequestMapping(value = "/{id:[0-9]+}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Principal principal,
            @RequestHeader(value = "X-User-Name", required = false) String headerUser
    ) {
        String username = principal != null ? principal.getName() : (headerUser != null ? headerUser : "PHARMACIST");
        OrderResponse response = orderService.updateOrderStatus(id, request, username);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(
            @PathVariable Long id,
            Principal principal,
            @RequestHeader(value = "X-User-Name", required = false) String headerUser
    ) {
        String username = principal != null ? principal.getName() : (headerUser != null ? headerUser : "PHARMACIST");
        orderService.deleteOrder(id, username);
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully"));
    }
}
