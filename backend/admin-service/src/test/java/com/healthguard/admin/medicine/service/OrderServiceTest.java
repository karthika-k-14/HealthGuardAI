package com.healthguard.admin.medicine.service;

import com.healthguard.admin.exception.DuplicateResourceException;
import com.healthguard.admin.exception.ResourceNotFoundException;
import com.healthguard.admin.medicine.dto.*;
import com.healthguard.admin.medicine.entity.Medicine;
import com.healthguard.admin.medicine.entity.MedicineDemandForecast;
import com.healthguard.admin.medicine.entity.MedicineOrder;
import com.healthguard.admin.medicine.entity.MedicineOrderItem;
import com.healthguard.admin.medicine.repository.MedicineDemandForecastRepository;
import com.healthguard.admin.medicine.repository.MedicineOrderItemRepository;
import com.healthguard.admin.medicine.repository.MedicineOrderRepository;
import com.healthguard.admin.medicine.repository.MedicineRepository;
import com.healthguard.admin.medicine.repository.OrderStatusHistoryRepository;
import com.healthguard.admin.medicine.service.impl.OrderServiceImpl;
import com.healthguard.admin.service.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private MedicineOrderRepository orderRepository;

    @Mock
    private MedicineOrderItemRepository itemRepository;

    @Mock
    private OrderStatusHistoryRepository historyRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineDemandForecastRepository forecastRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private ForecastRefreshService forecastRefreshService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Medicine testMedicine;

    @BeforeEach
    void setUp() {
        testMedicine = Medicine.builder()
                .id(1L)
                .medicineCode("MED-1001")
                .name("Paracetamol 500mg")
                .medicineName("Paracetamol 500mg")
                .quantity(40)
                .minStockThreshold(15)
                .build();
    }

    @Test
    @DisplayName("Create Order: Successfully embeds supplier details directly into order")
    void testCreateOrder_Success() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .supplierName("Apollo Med Supplies")
                .supplierContact("+91 9876543210")
                .supplierEmail("supply@apollomed.com")
                .supplierAddress("Plot 12, Janpath, Bhubaneswar")
                .expectedDeliveryDate(LocalDate.now().plusDays(5))
                .status("PLACED")
                .remarks("Urgent fever stock replenishment")
                .items(List.of(
                        OrderItemRequest.builder()
                                .medicineId(1L)
                                .quantity(110)
                                .build()
                ))
                .build();

        when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(testMedicine));
        when(forecastRepository.findFirstByMedicineIdOrderByGeneratedAtDesc(1L)).thenReturn(
                Optional.of(MedicineDemandForecast.builder()
                        .medicineId(1L)
                        .predictedDemand(150)
                        .currentStock(40)
                        .recommendedOrder(110)
                        .build())
        );
        when(orderRepository.save(any(MedicineOrder.class))).thenAnswer(invocation -> {
            MedicineOrder o = invocation.getArgument(0);
            o.setId(10L);
            return o;
        });

        OrderResponse response = orderService.createOrder(request, "PHARMACIST_TEST");

        assertNotNull(response);
        assertEquals("Apollo Med Supplies", response.getSupplierName());
        assertEquals("+91 9876543210", response.getSupplierContact());
        assertEquals("supply@apollomed.com", response.getSupplierEmail());
        assertEquals("Plot 12, Janpath, Bhubaneswar", response.getSupplierAddress());
        assertEquals("PLACED", response.getStatus());
        assertEquals(1, response.getTotalItems());
        assertEquals(110, response.getTotalQuantity());

        verify(auditLogService).logAction(eq("MEDICINE_ORDER_CREATED"), eq("PHARMACIST"), anyString());
    }

    @Test
    @DisplayName("Create Order: Throws exception on duplicate custom order number")
    void testCreateOrder_DuplicateNumber() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .orderNumber("ORD-DUP-001")
                .supplierName("MedCare")
                .items(List.of(OrderItemRequest.builder().medicineId(1L).quantity(50).build()))
                .build();

        when(orderRepository.existsByOrderNumber("ORD-DUP-001")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> orderService.createOrder(request, "PHARMACIST"));
    }

    @Test
    @DisplayName("Update Status: Allows valid progression PLACED -> APPROVED")
    void testUpdateStatus_ValidTransition() {
        MedicineOrder order = MedicineOrder.builder()
                .id(1L)
                .orderNumber("ORD-101")
                .supplierName("MedCare")
                .status("PLACED")
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(MedicineOrder.class))).thenAnswer(i -> i.getArgument(0));

        UpdateOrderStatusRequest req = UpdateOrderStatusRequest.builder()
                .status("APPROVED")
                .remarks("Manager approved")
                .build();

        OrderResponse res = orderService.updateOrderStatus(1L, req, "PHARMACIST");

        assertEquals("APPROVED", res.getStatus());
        verify(auditLogService).logAction(eq("MEDICINE_ORDER_STATUS_CHANGED"), eq("PHARMACIST"), anyString());
    }

    @Test
    @DisplayName("Update Status: Blocks invalid transition PLACED -> DELIVERED directly")
    void testUpdateStatus_InvalidTransition() {
        MedicineOrder order = MedicineOrder.builder()
                .id(1L)
                .orderNumber("ORD-101")
                .supplierName("MedCare")
                .status("PLACED")
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        UpdateOrderStatusRequest req = UpdateOrderStatusRequest.builder()
                .status("DELIVERED")
                .build();

        assertThrows(IllegalArgumentException.class, () -> orderService.updateOrderStatus(1L, req, "PHARMACIST"));
    }

    @Test
    @DisplayName("Update Status: Blocks modifying already DELIVERED orders")
    void testUpdateStatus_DeliveredCannotBeModified() {
        MedicineOrder order = MedicineOrder.builder()
                .id(1L)
                .orderNumber("ORD-101")
                .supplierName("MedCare")
                .status("DELIVERED")
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        UpdateOrderStatusRequest req = UpdateOrderStatusRequest.builder()
                .status("CANCELLED")
                .build();

        assertThrows(IllegalStateException.class, () -> orderService.updateOrderStatus(1L, req, "PHARMACIST"));
    }

    @Test
    @DisplayName("Inventory Integration: Status DELIVERED automatically increases stock")
    void testUpdateStatus_Delivered_IncreasesInventory() {
        MedicineOrder order = MedicineOrder.builder()
                .id(5L)
                .orderNumber("ORD-DELIV-1")
                .supplierName("Apex Pharma")
                .status("SHIPPED")
                .build();

        MedicineOrderItem item = MedicineOrderItem.builder()
                .id(101L)
                .order(order)
                .medicine(testMedicine)
                .medicineName(testMedicine.getName())
                .quantity(110)
                .currentStock(40)
                .receivedQuantity(0)
                .build();

        order.addItem(item);

        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(MedicineOrder.class))).thenAnswer(i -> i.getArgument(0));

        UpdateOrderStatusRequest req = UpdateOrderStatusRequest.builder()
                .status("DELIVERED")
                .remarks("Received in good condition")
                .build();

        assertEquals(40, testMedicine.getQuantity());

        OrderResponse res = orderService.updateOrderStatus(5L, req, "PHARMACIST");

        assertEquals("DELIVERED", res.getStatus());
        // Verify stock increased from 40 to 150 (40 + 110)
        assertEquals(150, testMedicine.getQuantity());
        verify(medicineRepository).save(testMedicine);
        verify(auditLogService).logAction(eq("INVENTORY_INCREASED_ORDER_DELIVERED"), eq("PHARMACIST"), anyString());
        verify(forecastRefreshService).refreshMedicinesBatch(List.of(1L));
    }

    @Test
    @DisplayName("Forecast Recommendations: Strictly uses ML table without threshold fallbacks")
    void testGetForecastRecommendations_UsesMLTableOnly() {
        MedicineDemandForecast f1 = MedicineDemandForecast.builder()
                .medicineId(1L)
                .medicineName("Paracetamol 500mg")
                .currentStock(40)
                .predictedDemand(150)
                .recommendedOrder(110)
                .estimatedDaysOfStockRemaining(8)
                .confidence(0.95)
                .riskLevel("CRITICAL")
                .insights("High fever surge detected in cluster")
                .build();

        when(forecastRepository.findByRecommendedOrderGreaterThanOrderByRecommendedOrderDesc(0))
                .thenReturn(List.of(f1));

        List<ForecastRecommendationDTO> recs = orderService.getForecastRecommendations();

        assertNotNull(recs);
        assertEquals(1, recs.size());
        assertEquals("Paracetamol 500mg", recs.get(0).getMedicineName());
        assertEquals(110, recs.get(0).getRecommendedOrder());
        assertEquals(8, recs.get(0).getEstimatedDaysOfStockRemaining());
        assertEquals("CRITICAL", recs.get(0).getRiskLevel());
        assertTrue(recs.get(0).getReason().contains("Current Stock: 40"));
        assertTrue(recs.get(0).getReason().contains("Predicted Demand: 150"));
        assertTrue(recs.get(0).getReason().contains("Recommended Order: 110"));
        verify(forecastRepository).findByRecommendedOrderGreaterThanOrderByRecommendedOrderDesc(0);
        verifyNoInteractions(medicineRepository);
    }

    @Test
    @DisplayName("Delete Order: Allows deletion of DRAFT order")
    void testDeleteOrder_Draft_Success() {
        MedicineOrder order = MedicineOrder.builder()
                .id(3L)
                .orderNumber("ORD-DRAFT-3")
                .supplierName("Test Supply")
                .status("DRAFT")
                .build();

        when(orderRepository.findById(3L)).thenReturn(Optional.of(order));

        assertDoesNotThrow(() -> orderService.deleteOrder(3L, "PHARMACIST"));
        verify(orderRepository).delete(order);
        verify(auditLogService).logAction(eq("MEDICINE_ORDER_DELETED"), eq("PHARMACIST"), anyString());
    }

    @Test
    @DisplayName("Delete Order: Rejects deletion of non-DRAFT order (e.g. PLACED or DELIVERED)")
    void testDeleteOrder_NonDraft_ThrowsException() {
        MedicineOrder order = MedicineOrder.builder()
                .id(4L)
                .orderNumber("ORD-PLACED-4")
                .supplierName("Test Supply")
                .status("PLACED")
                .build();

        when(orderRepository.findById(4L)).thenReturn(Optional.of(order));

        assertThrows(IllegalStateException.class, () -> orderService.deleteOrder(4L, "PHARMACIST"));
        verify(orderRepository, never()).delete(any(MedicineOrder.class));
    }

    @Test
    @DisplayName("Get All Orders: Queries using Specification and returns mapped responses")
    void testGetAllOrders() {
        MedicineOrder order = MedicineOrder.builder()
                .id(1L)
                .orderNumber("ORD-20260918-1001")
                .supplierName("Apex Pharma")
                .status("PLACED")
                .orderDate(LocalDate.now())
                .totalItems(1)
                .totalQuantity(100)
                .build();

        when(orderRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Sort.class)))
                .thenReturn(Collections.singletonList(order));

        List<OrderResponse> result = orderService.getAllOrders("PLACED", null, null, null, "Apex");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("ORD-20260918-1001", result.get(0).getOrderNumber());
        assertEquals("Apex Pharma", result.get(0).getSupplierName());
    }

    @Test
    @DisplayName("Dashboard Statistics: Computes all order buckets accurately")
    void testGetDashboardStats() {
        when(orderRepository.count()).thenReturn(20L);
        when(orderRepository.countByStatus("DRAFT")).thenReturn(2L);
        when(orderRepository.countByStatus("PLACED")).thenReturn(5L);
        when(orderRepository.countByStatus("APPROVED")).thenReturn(3L);
        when(orderRepository.countByStatus("SHIPPED")).thenReturn(4L);
        when(orderRepository.countByStatus("DELIVERED")).thenReturn(5L);
        when(orderRepository.countByStatus("CANCELLED")).thenReturn(1L);

        OrderDashboardStatsDTO stats = orderService.getDashboardStats();

        assertEquals(20L, stats.getTotalOrders());
        assertEquals(8L, stats.getPendingOrders()); // PLACED (5) + APPROVED (3)
        assertEquals(4L, stats.getInTransitOrders()); // SHIPPED (4)
        assertEquals(5L, stats.getDeliveredOrders());
        assertEquals(1L, stats.getCancelledOrders());
        assertEquals(2L, stats.getDraftOrders());
    }
}
