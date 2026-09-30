package com.healthguard.admin.medicine.scheduler;

import com.healthguard.admin.medicine.client.MLForecastClient;
import com.healthguard.admin.medicine.service.ExpiryRiskService;
import com.healthguard.admin.medicine.service.MedicineForecastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class MedicineScheduledJobs {

    private final MedicineForecastService forecastService;
    private final ExpiryRiskService expiryRiskService;
    private final MLForecastClient mlForecastClient;

    /**
     * Executes immediately upon application startup so dashboards have fresh data.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("Initializing HealthGuard AI Medicine Forecast & Expiry Engines on startup...");
        try {
            forecastService.runFullForecast();
            expiryRiskService.assessAndStoreExpiryRisks();
            log.info("Startup initialization of ML forecasts and expiry alerts completed.");
        } catch (Exception e) {
            log.warn("Non-blocking error during startup forecast run: {}", e.getMessage());
        }
    }

    /**
     * Daily ML Demand Forecasting job at 1:00 AM.
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void runDailyDemandForecast() {
        log.info("Cron Triggered: Daily ML Medicine Demand Forecasting Job (01:00 AM)...");
        try {
            forecastService.runFullForecast();
        } catch (Exception e) {
            log.error("Error running daily demand forecast: {}", e.getMessage(), e);
        }
    }

    /**
     * Daily Expiry Risk Assessment job at 2:00 AM.
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void runDailyExpiryRiskAssessment() {
        log.info("Cron Triggered: Daily Expiry Risk Assessment Job (02:00 AM)...");
        try {
            expiryRiskService.assessAndStoreExpiryRisks();
        } catch (Exception e) {
            log.error("Error running daily expiry risk assessment: {}", e.getMessage(), e);
        }
    }

    /**
     * Weekly Automated Model Retraining every Sunday at 3:00 AM.
     * Enforces TimeSeriesSplit validation, sample size checks (>=300), and strict champion promotion.
     */
    @Scheduled(cron = "0 0 3 * * SUN")
    public void runWeeklyModelRetraining() {
        log.info("Cron Triggered: Weekly Continuous Learning & Model Retraining (Sunday 03:00 AM)...");
        try {
            Map<String, Object> retrainResult = mlForecastClient.triggerRetraining();
            log.info("Weekly retraining result: {}", retrainResult);
            // Refresh forecasts with new champion model
            forecastService.runFullForecast();
        } catch (Exception e) {
            log.error("Error during scheduled weekly retraining: {}", e.getMessage(), e);
        }
    }
}
