package com.healthguard.admin.medicine.scheduler;

import com.healthguard.admin.medicine.service.ForecastRefreshService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ForecastScheduler {

    private final ForecastRefreshService forecastRefreshService;

    /**
     * Executes immediately upon application startup so dashboards and widgets have fresh data.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("ForecastScheduler: Performing initial forecast synchronization on startup...");
        try {
            forecastRefreshService.refreshAllForecasts();
            log.info("ForecastScheduler: Initial forecast synchronization complete.");
        } catch (Exception e) {
            log.warn("Non-blocking error during startup forecast sync: {}", e.getMessage());
        }
    }

    /**
     * Hourly automatic recovery job.
     * If the ML service was temporarily unreachable during an inventory operation,
     * this automatically repairs and synchronizes all forecasts.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void syncForecasts() {
        log.info("ForecastScheduler: Running hourly forecast synchronization job...");
        try {
            forecastRefreshService.refreshAllForecasts();
        } catch (Exception e) {
            log.error("Error during hourly forecast synchronization: {}", e.getMessage(), e);
        }
    }
}
