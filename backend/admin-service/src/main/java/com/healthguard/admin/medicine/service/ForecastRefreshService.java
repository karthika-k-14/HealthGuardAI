package com.healthguard.admin.medicine.service;

import com.healthguard.admin.medicine.entity.MedicineDemandForecast;

import java.util.List;

/**
 * Dedicated event-driven ML Forecast Refresh Service for HealthGuard AI.
 * Keeps Medicine Demand Forecasts, Restock Recommendations, and Alerts
 * permanently synchronized with real-time inventory changes.
 */
public interface ForecastRefreshService {

    /**
     * Refreshes forecasts for all medicines across the entire inventory.
     * Clears previous records to prevent table growth and guarantees 1 row per medicine.
     */
    List<MedicineDemandForecast> refreshAllForecasts();

    /**
     * Synchronously refreshes the demand forecast and associated alerts for a single medicine.
     * Performs atomic upsert without creating duplicate rows.
     */
    MedicineDemandForecast refreshMedicineForecast(Long medicineId);

    /**
     * Asynchronously refreshes a single medicine's forecast so HTTP inventory transactions
     * never block or wait on the ML prediction API.
     */
    void refreshMedicineForecastAsync(Long medicineId);

    /**
     * Refreshes forecasts for a targeted batch of medicines (e.g. delivered order items)
     * without performing an expensive full-catalog rebuild.
     */
    void refreshMedicinesBatch(List<Long> medicineIds);

    /**
     * Removes the forecast, expiry alerts, and anomaly alerts for a deleted medicine.
     */
    void removeMedicineForecast(Long medicineId);
}
