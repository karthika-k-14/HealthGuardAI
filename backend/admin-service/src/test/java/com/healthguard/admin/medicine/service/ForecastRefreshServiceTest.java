package com.healthguard.admin.medicine.service;

import com.healthguard.admin.medicine.client.MLForecastClient;
import com.healthguard.admin.medicine.entity.DemandAnomalyAlert;
import com.healthguard.admin.medicine.entity.ExpiryRiskAlert;
import com.healthguard.admin.medicine.entity.Medicine;
import com.healthguard.admin.medicine.entity.MedicineDemandForecast;
import com.healthguard.admin.medicine.repository.DemandAnomalyAlertRepository;
import com.healthguard.admin.medicine.repository.ExpiryRiskAlertRepository;
import com.healthguard.admin.medicine.repository.MedicineDemandForecastRepository;
import com.healthguard.admin.medicine.repository.MedicineRepository;
import com.healthguard.admin.medicine.service.impl.ForecastRefreshServiceImpl;
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
class ForecastRefreshServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineDemandForecastRepository forecastRepository;

    @Mock
    private ExpiryRiskAlertRepository expiryAlertRepository;

    @Mock
    private DemandAnomalyAlertRepository demandAnomalyAlertRepository;

    @Mock
    private MLForecastClient mlForecastClient;

    @Mock
    private ExpiryRiskService expiryRiskService;

    @InjectMocks
    private ForecastRefreshServiceImpl forecastRefreshService;

    private Medicine testMedicine;

    @BeforeEach
    void setUp() {
        testMedicine = Medicine.builder()
                .id(100L)
                .medicineCode("MED-100")
                .name("Amoxicillin 500mg")
                .medicineName("Amoxicillin 500mg")
                .quantity(20)
                .minStockThreshold(10)
                .expiryDate(LocalDate.now().plusDays(40))
                .build();
    }

    @Test
    @DisplayName("Single Refresh: Successfully calculates recommended order and upserts forecast row")
    void testRefreshMedicineForecast_Success() {
        when(medicineRepository.findById(100L)).thenReturn(Optional.of(testMedicine));
        when(forecastRepository.findByMedicineId(100L)).thenReturn(Optional.empty());

        Map<String, Object> mlOutput = new HashMap<>();
        mlOutput.put("predictedDemand", 85);
        mlOutput.put("confidence", 0.94);
        mlOutput.put("riskLevel", "HIGH");
        mlOutput.put("estimatedDaysOfStockRemaining", 7);
        mlOutput.put("explanation", Map.of("weather", 0.3));

        when(mlForecastClient.predictDemand(eq(100L), eq("Amoxicillin 500mg"), anyString(), anyInt(), eq(20)))
                .thenReturn(mlOutput);
        when(forecastRepository.save(any(MedicineDemandForecast.class))).thenAnswer(i -> i.getArgument(0));

        MedicineDemandForecast result = forecastRefreshService.refreshMedicineForecast(100L);

        assertNotNull(result);
        assertEquals(100L, result.getMedicineId());
        assertEquals("Amoxicillin 500mg", result.getMedicineName());
        assertEquals(20, result.getCurrentStock());
        assertEquals(85, result.getPredictedDemand());
        // recommendedOrder = Math.max(0, 85 - 20) = 65
        assertEquals(65, result.getRecommendedOrder());
        assertEquals("HIGH", result.getRiskLevel());
        assertEquals(7, result.getEstimatedDaysOfStockRemaining());

        verify(forecastRepository).save(any(MedicineDemandForecast.class));
        verify(expiryAlertRepository).save(any(ExpiryRiskAlert.class));
    }

    @Test
    @DisplayName("Single Refresh: Updates existing record without creating duplicate row")
    void testRefreshMedicineForecast_UpdatesExistingRecord() {
        when(medicineRepository.findById(100L)).thenReturn(Optional.of(testMedicine));

        MedicineDemandForecast existing = MedicineDemandForecast.builder()
                .id(55L)
                .medicineId(100L)
                .medicineName("Amoxicillin 500mg")
                .currentStock(10)
                .predictedDemand(50)
                .recommendedOrder(40)
                .build();

        when(forecastRepository.findByMedicineId(100L)).thenReturn(Optional.of(existing));

        Map<String, Object> mlOutput = new HashMap<>();
        mlOutput.put("predictedDemand", 100);
        mlOutput.put("confidence", 0.91);
        mlOutput.put("riskLevel", "HIGH");
        mlOutput.put("estimatedDaysOfStockRemaining", 6);

        when(mlForecastClient.predictDemand(eq(100L), anyString(), anyString(), anyInt(), eq(20)))
                .thenReturn(mlOutput);
        when(forecastRepository.save(any(MedicineDemandForecast.class))).thenAnswer(i -> i.getArgument(0));

        MedicineDemandForecast updated = forecastRefreshService.refreshMedicineForecast(100L);

        assertNotNull(updated);
        assertEquals(55L, updated.getId()); // Keeps existing primary key!
        assertEquals(20, updated.getCurrentStock());
        assertEquals(100, updated.getPredictedDemand());
        assertEquals(80, updated.getRecommendedOrder()); // 100 - 20 = 80
        verify(forecastRepository).save(existing);
    }

    @Test
    @DisplayName("Single Refresh: Resilient to ML service failure, does not throw exception")
    void testRefreshMedicineForecast_MLFailureFallback() {
        when(medicineRepository.findById(100L)).thenReturn(Optional.of(testMedicine));
        when(forecastRepository.findByMedicineId(100L)).thenReturn(Optional.empty());
        when(mlForecastClient.predictDemand(any(), any(), any(), anyInt(), anyInt()))
                .thenThrow(new RuntimeException("ML service offline"));
        when(forecastRepository.save(any(MedicineDemandForecast.class))).thenAnswer(i -> i.getArgument(0));

        assertDoesNotThrow(() -> {
            MedicineDemandForecast result = forecastRefreshService.refreshMedicineForecast(100L);
            assertNotNull(result);
            assertEquals(100L, result.getMedicineId());
            // Should still compute baseline prediction and save record
            assertTrue(result.getPredictedDemand() > 0);
        });

        verify(forecastRepository).save(any(MedicineDemandForecast.class));
    }

    @Test
    @DisplayName("Batch Refresh: Iterates and refreshes distinct medicines only")
    void testRefreshMedicinesBatch() {
        when(medicineRepository.findById(100L)).thenReturn(Optional.of(testMedicine));
        when(forecastRepository.findByMedicineId(100L)).thenReturn(Optional.empty());
        when(mlForecastClient.predictDemand(any(), any(), any(), anyInt(), anyInt())).thenReturn(Collections.emptyMap());
        when(forecastRepository.save(any(MedicineDemandForecast.class))).thenAnswer(i -> i.getArgument(0));

        // Pass duplicates in list: [100L, 100L, null]
        forecastRefreshService.refreshMedicinesBatch(Arrays.asList(100L, 100L, null));

        // Verify it was only refreshed once for ID 100L
        verify(medicineRepository, times(1)).findById(100L);
    }

    @Test
    @DisplayName("Remove Forecast: Purges forecast, expiry alerts, and anomaly alerts")
    void testRemoveMedicineForecast() {
        forecastRefreshService.removeMedicineForecast(100L);

        verify(forecastRepository).deleteByMedicineId(100L);
        verify(expiryAlertRepository).deleteByMedicineId(100L);
        verify(demandAnomalyAlertRepository).deleteByMedicineId(100L);
    }

    @Test
    @DisplayName("Full Catalog Refresh: Clears previous cycles in batch to ensure 1-to-1 row count")
    void testRefreshAllForecasts() {
        Medicine med2 = Medicine.builder()
                .id(101L)
                .name("Cetirizine 10mg")
                .quantity(50)
                .build();

        when(medicineRepository.findAll()).thenReturn(List.of(testMedicine, med2));
        when(mlForecastClient.predictDemand(any(), any(), any(), anyInt(), anyInt())).thenReturn(Collections.emptyMap());
        when(forecastRepository.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));

        List<MedicineDemandForecast> result = forecastRefreshService.refreshAllForecasts();

        assertNotNull(result);
        assertEquals(2, result.size());
        // Verify previous cycle records were wiped in batch before saving fresh cycle
        verify(forecastRepository).deleteAllInBatch();
        verify(forecastRepository).saveAll(anyList());
        verify(expiryRiskService).assessAndStoreExpiryRisks();
    }
}
