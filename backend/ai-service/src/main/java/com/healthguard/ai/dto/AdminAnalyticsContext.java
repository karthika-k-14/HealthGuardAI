package com.healthguard.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAnalyticsContext {

    private String totalUsers;
    private String totalCitizens;
    private String totalAdmins;
    private String totalHealthOfficers;
    private String totalAshaWorkers;
    private String totalPharmacists;
    private String totalHospitals;
    private String totalPhcs;
    private String totalCampaigns;
    private String totalHealthArticles;
    private String totalMedicines;
    private String totalPrescriptions;
    private String totalHealthRecords;
    private String totalHomeVisits;
    private String totalWorkflows;
    private String totalNotifications;
    private String totalChatHistory;
    private String totalSymptomAssessments;
    private String totalTriageSessions;
    private String totalOutbreakAlerts;
    private String totalSurveillanceReports;
    private String totalAuditLogs;

    public String toFormattedMetrics() {
        return String.format(
            "REAL POSTGRESQL PLATFORM METRICS:\n" +
            "=== User & Access Statistics ===\n" +
            "- Total Registered Users: %s\n" +
            "- Total Citizens: %s\n" +
            "- Total Admins: %s\n" +
            "- Total Health Officers: %s\n" +
            "- Total ASHA Workers: %s\n" +
            "- Total Pharmacists: %s\n" +
            "=== Healthcare & Facilities ===\n" +
            "- Total Hospitals: %s\n" +
            "- Total Primary Health Centres (PHCs): %s\n" +
            "- Total Medicines in Inventory: %s\n" +
            "- Total Prescriptions Issued: %s\n" +
            "- Total Health Records: %s\n" +
            "=== Operational & Field Activity ===\n" +
            "- Total Public Health Campaigns: %s\n" +
            "- Total Published Health Articles: %s\n" +
            "- Total ASHA Home Visits: %s\n" +
            "- Total Active Workflows: %s\n" +
            "- Total Platform Notifications: %s\n" +
            "- Total Audit Log Entries: %s\n" +
            "=== Clinical AI & Disease Surveillance ===\n" +
            "- Total Symptom Assessments: %s\n" +
            "- Total AI Triage Sessions: %s\n" +
            "- Total Outbreak Alerts: %s\n" +
            "- Total Disease Surveillance Reports: %s\n" +
            "- Total AI Chat Interactions: %s\n",
            totalUsers, totalCitizens, totalAdmins, totalHealthOfficers, totalAshaWorkers, totalPharmacists,
            totalHospitals, totalPhcs, totalMedicines, totalPrescriptions, totalHealthRecords,
            totalCampaigns, totalHealthArticles, totalHomeVisits, totalWorkflows, totalNotifications, totalAuditLogs,
            totalSymptomAssessments, totalTriageSessions, totalOutbreakAlerts, totalSurveillanceReports, totalChatHistory
        );
    }
}
