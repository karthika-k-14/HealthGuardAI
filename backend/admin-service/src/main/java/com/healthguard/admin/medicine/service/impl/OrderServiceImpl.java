package com.healthguard.admin.medicine.service.impl;

import com.healthguard.admin.exception.DuplicateResourceException;
import com.healthguard.admin.exception.ResourceNotFoundException;
import com.healthguard.admin.medicine.dto.*;
import com.healthguard.admin.medicine.entity.Medicine;
import com.healthguard.admin.medicine.entity.MedicineDemandForecast;
import com.healthguard.admin.medicine.entity.MedicineOrder;
import com.healthguard.admin.medicine.entity.MedicineOrderItem;
import com.healthguard.admin.medicine.entity.OrderStatusHistory;
import com.healthguard.admin.medicine.repository.MedicineDemandForecastRepository;
import com.healthguard.admin.medicine.repository.MedicineOrderItemRepository;
import com.healthguard.admin.medicine.repository.MedicineOrderRepository;
import com.healthguard.admin.medicine.repository.MedicineRepository;
import com.healthguard.admin.medicine.repository.OrderStatusHistoryRepository;
import com.healthguard.admin.medicine.service.ForecastRefreshService;
import com.healthguard.admin.medicine.service.OrderService;
import com.healthguard.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final MedicineOrderRepository orderRepository;
    private final MedicineOrderItemRepository itemRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineDemandForecastRepository forecastRepository;
    private final AuditLogService auditLogService;
    private final ForecastRefreshService forecastRefreshService;

    private static final Map<String, Set<String>> VALID_TRANSITIONS = Map.of(
            "DRAFT", Set.of("PLACED", "CANCELLED"),
            "PLACED", Set.of("APPROVED", "CANCELLED"),
            "APPROVED", Set.of("SHIPPED", "CANCELLED"),
            "SHIPPED", Set.of("DELIVERED", "CANCELLED"),
            "DELIVERED", Collections.emptySet(),
            "CANCELLED", Collections.emptySet()
    );

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String username) {
        log.info("Creating medicine order for supplier: {}", request.getSupplierName());

        String orderNumber = request.getOrderNumber();
        if (orderNumber != null && !orderNumber.trim().isEmpty()) {
            if (orderRepository.existsByOrderNumber(orderNumber.trim())) {
                throw new DuplicateResourceException("Order number already exists: " + orderNumber.trim());
            }
            orderNumber = orderNumber.trim();
        } else {
            orderNumber = generateUniqueOrderNumber();
        }

        String initialStatus = (request.getStatus() != null && !request.getStatus().trim().isEmpty())
                ? request.getStatus().trim().toUpperCase()
                : "PLACED";

        if (!Arrays.asList("DRAFT", "PLACED").contains(initialStatus)) {
            initialStatus = "PLACED";
        }

        int totalItems = request.getItems() != null ? request.getItems().size() : 0;
        int totalQuantity = request.getItems() != null
                ? request.getItems().stream().mapToInt(OrderItemRequest::getQuantity).sum()
                : 0;

        String operator = (username != null && !username.trim().isEmpty()) ? username : "PHARMACIST";

        MedicineOrder order = MedicineOrder.builder()
                .orderNumber(orderNumber)
                .supplierName(request.getSupplierName().trim())
                .supplierContact(request.getSupplierContact())
                .supplierEmail(request.getSupplierEmail())
                .supplierAddress(request.getSupplierAddress())
                .orderDate(LocalDate.now())
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .status(initialStatus)
                .totalItems(totalItems)
                .totalQuantity(totalQuantity)
                .remarks(request.getRemarks())
                .createdBy(operator)
                .build();

        if (request.getItems() != null) {
            for (OrderItemRequest itemReq : request.getItems()) {
                Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + itemReq.getMedicineId()));

                int currentStock = medicine.getQuantity() != null ? medicine.getQuantity() : 0;

                int predictedDemand = itemReq.getPredictedDemand() != null ? itemReq.getPredictedDemand() : 0;
                int recommendedOrder = itemReq.getRecommendedOrder() != null ? itemReq.getRecommendedOrder() : 0;

                if (predictedDemand <= 0) {
                    Optional<MedicineDemandForecast> forecastOpt = forecastRepository
                            .findFirstByMedicineIdOrderByGeneratedAtDesc(medicine.getId());
                    if (forecastOpt.isEmpty() && medicine.getName() != null) {
                        forecastOpt = forecastRepository
                                .findFirstByMedicineNameOrderByGeneratedAtDesc(medicine.getName());
                    }
                    if (forecastOpt.isPresent()) {
                        MedicineDemandForecast f = forecastOpt.get();
                        predictedDemand = f.getPredictedDemand();
                        recommendedOrder = Math.max(0, predictedDemand - currentStock);
                    }
                }

                MedicineOrderItem orderItem = MedicineOrderItem.builder()
                        .medicine(medicine)
                        .medicineName(medicine.getName() != null ? medicine.getName() : medicine.getMedicineName())
                        .quantity(itemReq.getQuantity())
                        .currentStock(currentStock)
                        .predictedDemand(predictedDemand)
                        .recommendedOrder(recommendedOrder)
                        .receivedQuantity(0)
                        .build();

                order.addItem(orderItem);
            }
        }

        OrderStatusHistory history = OrderStatusHistory.builder()
                .previousStatus(null)
                .newStatus(initialStatus)
                .changedBy(operator)
                .remarks(initialStatus.equals("DRAFT") ? "Draft order created" : "Order placed with supplier")
                .build();
        order.addStatusHistory(history);

        MedicineOrder saved = orderRepository.save(order);
        auditLogService.logAction(
                "MEDICINE_ORDER_CREATED",
                "PHARMACIST",
                String.format("Created medicine order %s for supplier '%s' with %d items (Status: %s)",
                        saved.getOrderNumber(), saved.getSupplierName(), saved.getTotalItems(), saved.getStatus())
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(String status, LocalDate orderDate, LocalDate startDate, LocalDate endDate, String search) {
        String cleanStatus = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL"))
                ? status.trim().toUpperCase()
                : null;
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim().toLowerCase() : null;

        Specification<MedicineOrder> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (cleanStatus != null) {
                predicates.add(cb.equal(cb.upper(root.get("status")), cleanStatus));
            }

            if (orderDate != null) {
                predicates.add(cb.equal(root.get("orderDate"), orderDate));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("orderDate"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("orderDate"), endDate));
            }

            if (cleanSearch != null) {
                String pattern = "%" + cleanSearch + "%";
                Predicate pOrderNumber = cb.like(cb.lower(root.get("orderNumber")), pattern);
                Predicate pSupplier = cb.like(cb.lower(root.get("supplierName")), pattern);
                Predicate pRemarks = cb.like(cb.lower(root.get("remarks")), pattern);
                predicates.add(cb.or(pOrderNumber, pSupplier, pRemarks));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Order.desc("orderDate"), Sort.Order.desc("id"));
        List<MedicineOrder> orders = orderRepository.findAll(spec, sort);

        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        MedicineOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request, String username) {
        MedicineOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        String currentStatus = order.getStatus() != null ? order.getStatus().toUpperCase() : "DRAFT";
        String targetStatus = request.getStatus().trim().toUpperCase();
        String operator = (username != null && !username.trim().isEmpty()) ? username : "PHARMACIST";

        if ("DELIVERED".equals(currentStatus)) {
            throw new IllegalStateException("DELIVERED orders cannot be modified.");
        }

        if ("CANCELLED".equals(currentStatus)) {
            throw new IllegalStateException("CANCELLED orders cannot be modified or delivered.");
        }

        if (currentStatus.equals(targetStatus)) {
            return mapToResponse(order);
        }

        Set<String> allowedTransitions = VALID_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
        if (!allowedTransitions.contains(targetStatus)) {
            throw new IllegalArgumentException(String.format("Invalid status transition from %s to %s.", currentStatus, targetStatus));
        }

        if ("DELIVERED".equals(targetStatus)) {
            log.info("Processing delivery for order {}. Updating inventory stock automatically.", order.getOrderNumber());
            List<Long> affectedMedicineIds = new ArrayList<>();

            for (MedicineOrderItem item : order.getItems()) {
                Medicine medicine = item.getMedicine();
                if (medicine != null) {
                    int receivedQty = (item.getReceivedQuantity() != null && item.getReceivedQuantity() > 0)
                            ? item.getReceivedQuantity()
                            : item.getQuantity();

                    item.setReceivedQuantity(receivedQty);

                    int oldStock = medicine.getQuantity() != null ? medicine.getQuantity() : 0;
                    int newStock = oldStock + receivedQty;
                    medicine.setQuantity(newStock);
                    medicineRepository.save(medicine);
                    if (medicine.getId() != null) {
                        affectedMedicineIds.add(medicine.getId());
                    }

                    auditLogService.logAction(
                            "INVENTORY_INCREASED_ORDER_DELIVERED",
                            "PHARMACIST",
                            String.format("Stock automatically increased for %s (+%d units, from %d to %d) upon delivery of order %s",
                                    medicine.getName() != null ? medicine.getName() : medicine.getMedicineName(),
                                    receivedQty, oldStock, newStock, order.getOrderNumber())
                    );
                }
            }

            order.setActualDeliveryDate(request.getActualDeliveryDate() != null ? request.getActualDeliveryDate() : LocalDate.now());

            // Requirement 10: Refresh only affected medicines batch (DO NOT run full catalog refresh)
            if (!affectedMedicineIds.isEmpty()) {
                forecastRefreshService.refreshMedicinesBatch(affectedMedicineIds);
            }
        }

        order.setStatus(targetStatus);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .previousStatus(currentStatus)
                .newStatus(targetStatus)
                .changedBy(operator)
                .remarks(request.getRemarks() != null && !request.getRemarks().trim().isEmpty()
                        ? request.getRemarks().trim()
                        : "Status updated to " + targetStatus)
                .build();
        order.addStatusHistory(history);

        MedicineOrder updated = orderRepository.save(order);
        auditLogService.logAction(
                "MEDICINE_ORDER_STATUS_CHANGED",
                "PHARMACIST",
                String.format("Updated order %s status from %s to %s by %s",
                        updated.getOrderNumber(), currentStatus, targetStatus, operator)
        );

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id, String username) {
        MedicineOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        String status = order.getStatus() != null ? order.getStatus().toUpperCase() : "";
        if (!"DRAFT".equals(status)) {
            throw new IllegalStateException("Only DRAFT orders can be deleted. Current status is " + status + ".");
        }

        String orderNum = order.getOrderNumber();
        orderRepository.delete(order);

        String operator = (username != null && !username.trim().isEmpty()) ? username : "PHARMACIST";
        auditLogService.logAction(
                "MEDICINE_ORDER_DELETED",
                "PHARMACIST",
                String.format("Deleted DRAFT order %s by %s", orderNum, operator)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDashboardStatsDTO getDashboardStats() {
        long totalOrders = orderRepository.count();
        long draftOrders = orderRepository.countByStatus("DRAFT");
        long placedOrders = orderRepository.countByStatus("PLACED");
        long approvedOrders = orderRepository.countByStatus("APPROVED");
        long inTransitOrders = orderRepository.countByStatus("SHIPPED");
        long deliveredOrders = orderRepository.countByStatus("DELIVERED");
        long cancelledOrders = orderRepository.countByStatus("CANCELLED");

        long pendingOrders = placedOrders + approvedOrders;

        return OrderDashboardStatsDTO.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .inTransitOrders(inTransitOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .draftOrders(draftOrders)
                .build();
    }

    @Override
    @Transactional
    public List<ForecastRecommendationDTO> getForecastRecommendations() {
        // Requirement 12 & 13: Query strictly from medicine_demand_forecasts. No old buffer/threshold-based fallbacks.
        List<MedicineDemandForecast> forecasts = forecastRepository.findByRecommendedOrderGreaterThanOrderByRecommendedOrderDesc(0);
        if (forecasts.isEmpty()) {
            forecasts = forecastRepository.findAllByOrderByPredictedDemandDesc();
        }
        if (forecasts.isEmpty()) {
            // Auto-bootstrap fresh forecasts from ML if table has not yet run
            forecasts = forecastRefreshService.refreshAllForecasts();
        }

        return forecasts.stream()
                .map(f -> {
                    int current = f.getCurrentStock();
                    int predicted = f.getPredictedDemand();
                    int recOrder = f.getRecommendedOrder() != null ? f.getRecommendedOrder() : Math.max(0, predicted - current);
                    int daysRemaining = f.getEstimatedDaysOfStockRemaining() != null ? f.getEstimatedDaysOfStockRemaining() : 0;
                    String risk = f.getRiskLevel() != null ? f.getRiskLevel() : "MEDIUM";
                    String reason = "Current Stock: " + current
                            + " | Predicted Demand: " + predicted
                            + " | Recommended Order: " + recOrder
                            + " | Days Remaining: " + daysRemaining
                            + " | Risk: " + risk;
                    return ForecastRecommendationDTO.builder()
                            .medicineId(f.getMedicineId())
                            .medicineName(f.getMedicineName())
                            .currentStock(current)
                            .predictedDemand(predicted)
                            .recommendedOrder(recOrder)
                            .estimatedDaysOfStockRemaining(daysRemaining)
                            .confidence(f.getConfidence() != null ? f.getConfidence() : 0.88)
                            .riskLevel(risk)
                            .reason(reason)
                            .insights(f.getInsights() != null ? f.getInsights() : reason)
                            .build();
                })
                .sorted(Comparator.comparingInt(ForecastRecommendationDTO::getRecommendedOrder).reversed())
                .limit(15)
                .collect(Collectors.toList());
    }

    private String generateUniqueOrderNumber() {
        String prefix = "ORD-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        for (int i = 0; i < 10; i++) {
            String candidate = prefix + ThreadLocalRandom.current().nextInt(1000, 9999);
            if (!orderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        return prefix + System.currentTimeMillis() % 10000;
    }

    private OrderResponse mapToResponse(MedicineOrder order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(this::mapItemToResponse).collect(Collectors.toList())
                : Collections.emptyList();

        List<OrderStatusHistoryResponse> historyResponses = order.getStatusHistory() != null
                ? order.getStatusHistory().stream().map(this::mapHistoryToResponse).collect(Collectors.toList())
                : Collections.emptyList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .supplierName(order.getSupplierName())
                .supplierContact(order.getSupplierContact())
                .supplierEmail(order.getSupplierEmail())
                .supplierAddress(order.getSupplierAddress())
                .orderDate(order.getOrderDate())
                .expectedDeliveryDate(order.getExpectedDeliveryDate())
                .actualDeliveryDate(order.getActualDeliveryDate())
                .status(order.getStatus())
                .totalItems(order.getTotalItems())
                .totalQuantity(order.getTotalQuantity())
                .remarks(order.getRemarks())
                .createdBy(order.getCreatedBy())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .statusHistory(historyResponses)
                .build();
    }

    private OrderItemResponse mapItemToResponse(MedicineOrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .medicineId(item.getMedicine() != null ? item.getMedicine().getId() : null)
                .medicineName(item.getMedicineName())
                .quantity(item.getQuantity())
                .currentStock(item.getCurrentStock())
                .predictedDemand(item.getPredictedDemand())
                .recommendedOrder(item.getRecommendedOrder())
                .receivedQuantity(item.getReceivedQuantity())
                .createdAt(item.getCreatedAt())
                .build();
    }

    private OrderStatusHistoryResponse mapHistoryToResponse(OrderStatusHistory history) {
        return OrderStatusHistoryResponse.builder()
                .id(history.getId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .changedBy(history.getChangedBy())
                .remarks(history.getRemarks())
                .changedAt(history.getChangedAt())
                .build();
    }
}
