package com.healthguard.service;

import com.healthguard.entity.AwarenessArticle;
import com.healthguard.entity.Campaign;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.EmergencyContact;
import com.healthguard.entity.FamilyMember;
import com.healthguard.entity.HealthRecord;
import com.healthguard.entity.Hospital;
import com.healthguard.entity.Notification;
import com.healthguard.entity.Phc;
import com.healthguard.entity.Prescription;
import com.healthguard.entity.Scheme;
import com.healthguard.entity.SchemeApplication;
import com.healthguard.entity.SosRequest;
import com.healthguard.entity.User;
import com.healthguard.entity.Workflow;
import com.healthguard.repository.AwarenessArticleRepository;
import com.healthguard.repository.CampaignRepository;
import com.healthguard.repository.CitizenRepository;
import com.healthguard.repository.EmergencyContactRepository;
import com.healthguard.repository.FamilyMemberRepository;
import com.healthguard.repository.HealthRecordRepository;
import com.healthguard.repository.HospitalRepository;
import com.healthguard.repository.NotificationRepository;
import com.healthguard.repository.PhcRepository;
import com.healthguard.repository.PrescriptionRepository;
import com.healthguard.repository.SchemeApplicationRepository;
import com.healthguard.repository.SchemeRepository;
import com.healthguard.repository.SosRequestRepository;
import com.healthguard.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Queries real PostgreSQL database records for authenticated user queries.
 * Reuses existing repositories without raw SQL to ensure ownership security.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DatabaseQueryService {

    private final CitizenRepository citizenRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final NotificationRepository notificationRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final SchemeRepository schemeRepository;
    private final SchemeApplicationRepository schemeApplicationRepository;
    private final HospitalRepository hospitalRepository;
    private final CampaignRepository campaignRepository;
    private final AwarenessArticleRepository articleRepository;
    private final SosRequestRepository sosRequestRepository;
    private final WorkflowRepository workflowRepository;
    private final PhcRepository phcRepository;

    /**
     * Executes database queries based on the user's specific inquiry.
     */
    public String executeQuery(User user, String query) {
        if (user == null) {
            return "Unable to access personal records. User session is unauthenticated.";
        }

        String q = query.toLowerCase(Locale.ROOT);
        Long userId = user.getId();

        try {
            if (q.contains("prescription") || q.contains("medicine")) {
                return getPrescriptionsSummary(userId);
            } else if (q.contains("record") || q.contains("health record") || q.contains("blood test") || q.contains("report")) {
                return getHealthRecordsSummary(userId);
            } else if (q.contains("notification")) {
                return getNotificationsSummary(userId);
            } else if (q.contains("emergency contact") || q.contains("contact")) {
                return getEmergencyContactsSummary(userId);
            } else if (q.contains("family")) {
                return getFamilyMembersSummary(userId);
            } else if (q.contains("scheme application") || q.contains("application")) {
                return getSchemeApplicationsSummary(userId);
            } else if (q.contains("scheme")) {
                return getSchemesSummary(userId);
            } else if (q.contains("hospital")) {
                return getHospitalsSummary();
            } else if (q.contains("campaign")) {
                return getCampaignsSummary();
            } else if (q.contains("article") || q.contains("awareness")) {
                return getArticlesSummary();
            } else if (q.contains("sos")) {
                return getSosSummary(userId);
            } else if (q.contains("workflow") || q.contains("case")) {
                return getWorkflowSummary(userId);
            } else if (q.contains("phc") || q.contains("village")) {
                return getPhcSummary(user);
            } else if (q.contains("profile") || q.contains("dashboard") || q.contains("analytic")) {
                return getUserProfileSummary(user);
            } else {
                // Combined general summary of user's personal health state
                return getGeneralUserDataSummary(user);
            }
        } catch (Exception e) {
            log.error("Error executing database query for user ID {}: {}", userId, e.getMessage(), e);
            return "An error occurred while retrieving your database records. Please try again later.";
        }
    }

    public String getUserProfileSummary(User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("📋 **User Profile Overview:**\n");
        sb.append("- Name: ").append(user.getFirstName()).append(" ").append(user.getLastName()).append("\n");
        sb.append("- Email: ").append(user.getEmail()).append("\n");
        sb.append("- Phone: ").append(user.getPhone()).append("\n");
        sb.append("- Gender: ").append(user.getGender() != null ? user.getGender() : "Not specified").append("\n");
        sb.append("- Blood Group: ").append(user.getBloodGroup() != null ? user.getBloodGroup() : "Not specified").append("\n");
        if (user.getDistrict() != null) {
            sb.append("- District: ").append(user.getDistrict()).append(", State: ").append(user.getState()).append("\n");
        }
        return sb.toString();
    }

    public String getPrescriptionsSummary(Long citizenId) {
        List<Prescription> list = prescriptionRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
        if (list.isEmpty()) {
            return "You have no active or historical prescriptions on file in HealthGuard.";
        }

        StringBuilder sb = new StringBuilder("💊 **Your Prescriptions:**\n");
        for (Prescription p : list) {
            sb.append("• Prescription #").append(p.getId())
              .append(" | Doctor: ").append(p.getReferredBy() != null ? p.getReferredBy() : "Healthcare Officer")
              .append(" | Status: ").append(p.getStatus())
              .append(" | Notes: ").append(p.getNotes() != null ? p.getNotes() : "N/A");
            if (p.getItems() != null && !p.getItems().isEmpty()) {
                String itemsStr = p.getItems().stream()
                        .map(i -> i.getMedicineName() + " (" + i.getDosage() + ")")
                        .collect(Collectors.joining(", "));
                sb.append(" | Medicines: ").append(itemsStr);
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    public String getHealthRecordsSummary(Long citizenId) {
        List<HealthRecord> records = healthRecordRepository.findByCitizenIdOrderByRecordDateDesc(citizenId);
        if (records.isEmpty()) {
            return "No health records or lab test reports have been logged in your account.";
        }

        StringBuilder sb = new StringBuilder("📁 **Your Health Records & Lab Reports:**\n");
        for (HealthRecord r : records) {
            sb.append("• Date: ").append(r.getRecordDate())
              .append(" | Type: ").append(r.getRecordType())
              .append(" | Description: ").append(r.getDescription() != null ? r.getDescription() : "General Checkup")
              .append(" | Facility: ").append(r.getHospitalName() != null ? r.getHospitalName() : "PHC Center")
              .append("\n");
        }
        return sb.toString();
    }

    public String getNotificationsSummary(Long userId) {
        List<Notification> notes = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        if (notes.isEmpty()) {
            return "You have no notifications.";
        }

        StringBuilder sb = new StringBuilder("🔔 **Your Notifications:**\n");
        int count = 0;
        for (Notification n : notes) {
            if (count++ >= 5) break;
            sb.append("• [").append(n.getRead() ? "Read" : "Unread").append("] ")
              .append(n.getTitle()).append(": ").append(n.getMessage()).append("\n");
        }
        return sb.toString();
    }

    public String getEmergencyContactsSummary(Long citizenId) {
        List<EmergencyContact> contacts = emergencyContactRepository.findByCitizenIdOrderByIsPrimaryDescCreatedAtAsc(citizenId);
        if (contacts.isEmpty()) {
            return "You have not saved any emergency contacts in your profile.";
        }

        StringBuilder sb = new StringBuilder("🚨 **Your Emergency Contacts:**\n");
        for (EmergencyContact c : contacts) {
            sb.append("• ").append(c.getName())
              .append(" (").append(c.getRelationship()).append("): ")
              .append(c.getPhone())
              .append(Boolean.TRUE.equals(c.getIsPrimary()) ? " [Primary]" : "")
              .append("\n");
        }
        return sb.toString();
    }

    public String getFamilyMembersSummary(Long citizenId) {
        List<FamilyMember> members = familyMemberRepository.findByCitizenIdOrderByCreatedAtAsc(citizenId);
        if (members.isEmpty()) {
            return "No family members are linked to your account.";
        }

        StringBuilder sb = new StringBuilder("👨‍👩‍👧 **Your Registered Family Members:**\n");
        for (FamilyMember m : members) {
            sb.append("• ").append(m.getName())
              .append(" | Relation: ").append(m.getRelation())
              .append(" | Age: ").append(m.getAge() != null ? m.getAge() : "N/A")
              .append(" | Gender: ").append(m.getGender() != null ? m.getGender() : "N/A")
              .append("\n");
        }
        return sb.toString();
    }

    public String getSchemesSummary() {
        List<Scheme> schemes = schemeRepository.findAll();
        if (schemes.isEmpty()) {
            return "There are no government health schemes currently listed.";
        }

        StringBuilder sb = new StringBuilder("🏛️ **Government Health Schemes Available:**\n");
        for (Scheme s : schemes) {
            sb.append("• ").append(s.getName())
              .append(": ").append(s.getDescription())
              .append(" (Category: ").append(s.getCategory() != null ? s.getCategory() : "General").append(")")
              .append("\n");
        }
        return sb.toString();
    }

    public String getSchemeApplicationsSummary(Long citizenId) {
        List<SchemeApplication> apps = schemeApplicationRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
        if (apps.isEmpty()) {
            return "You have not submitted any government scheme applications yet.";
        }

        StringBuilder sb = new StringBuilder("📝 **Your Scheme Applications:**\n");
        for (SchemeApplication a : apps) {
            sb.append("• Scheme: ").append(a.getScheme() != null ? a.getScheme().getName() : "Health Scheme")
              .append(" | Status: ").append(a.getStatus())
              .append(" | Date: ").append(a.getCreatedAt() != null ? a.getCreatedAt().toLocalDate() : "N/A")
              .append("\n");
        }
        return sb.toString();
    }

    public String getHospitalsSummary() {
        List<Hospital> list = hospitalRepository.findAll();
        if (list.isEmpty()) {
            return "No hospital facilities are currently registered in the database.";
        }

        StringBuilder sb = new StringBuilder("🏥 **Registered Hospitals & Facilities:**\n");
        for (Hospital h : list) {
            sb.append("• ").append(h.getName())
              .append(" (").append(h.getType() != null ? h.getType() : "General Hospital").append(")")
              .append(" | District: ").append(h.getDistrict())
              .append(" | Beds Available: ").append(h.getAvailableBeds() != null ? h.getAvailableBeds() : "Contact Hospital")
              .append(" | Phone: ").append(h.getPhone() != null ? h.getPhone() : "108")
              .append("\n");
        }
        return sb.toString();
    }

    public String getCampaignsSummary() {
        List<Campaign> list = campaignRepository.findAll();
        if (list.isEmpty()) {
            return "No health campaigns are currently active.";
        }

        StringBuilder sb = new StringBuilder("📢 **Active Public Health Campaigns:**\n");
        for (Campaign c : list) {
            sb.append("• ").append(c.getTitle())
              .append(" - ").append(c.getDescription() != null ? c.getDescription() : "")
              .append(" (Status: ").append(c.getStatus()).append(")\n");
        }
        return sb.toString();
    }

    public String getArticlesSummary() {
        List<AwarenessArticle> list = articleRepository.findAll();
        if (list.isEmpty()) {
            return "No health awareness articles are available at present.";
        }

        StringBuilder sb = new StringBuilder("📖 **Health Awareness Articles:**\n");
        for (AwarenessArticle a : list) {
            sb.append("• ").append(a.getTitle())
              .append(" - ").append(a.getCategory() != null ? a.getCategory() : "General")
              .append("\n");
        }
        return sb.toString();
    }

    public String getSosSummary(Long citizenId) {
        List<SosRequest> list = sosRequestRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
        if (list.isEmpty()) {
            return "You have no active or historical emergency SOS requests.";
        }

        StringBuilder sb = new StringBuilder("🆘 **Your SOS Requests:**\n");
        for (SosRequest sos : list) {
            sb.append("• Request #").append(sos.getId())
              .append(" | Type: ").append(sos.getEmergencyType() != null ? sos.getEmergencyType() : "Emergency")
              .append(" | Status: ").append(sos.getStatus())
              .append(" | Date: ").append(sos.getCreatedAt() != null ? sos.getCreatedAt().toLocalDate() : "N/A")
              .append("\n");
        }
        return sb.toString();
    }

    public String getWorkflowSummary(Long citizenId) {
        List<Workflow> list = workflowRepository.findByCitizenId(citizenId);
        if (list.isEmpty()) {
            return "No active healthcare workflow cases found for your account.";
        }

        StringBuilder sb = new StringBuilder("🔄 **Your Healthcare Workflow Cases:**\n");
        for (Workflow w : list) {
            sb.append("• Case #").append(w.getCaseNumber())
              .append(" | Title: ").append(w.getTitle())
              .append(" | Status: ").append(w.getStatus())
              .append(" | Priority: ").append(w.getPriority())
              .append("\n");
        }
        return sb.toString();
    }

    public String getPhcSummary(User user) {
        Citizen citizen = citizenRepository.findById(user.getId()).orElse(null);
        if (citizen != null && citizen.getVillage() != null && citizen.getVillage().getPhc() != null) {
            Phc phc = citizen.getVillage().getPhc();
            return "🏥 **Your Assigned Primary Health Centre (PHC):**\n" +
                   "• Name: " + phc.getName() + "\n" +
                   "• Location: " + phc.getLocation() + "\n" +
                   "• Contact: " + (phc.getContactPhone() != null ? phc.getContactPhone() : "N/A") + "\n" +
                   "• Village: " + citizen.getVillage().getName();
        }

        List<Phc> phcs = phcRepository.findAll();
        if (phcs.isEmpty()) {
            return "No Primary Health Centres (PHC) are registered in your area.";
        }
        Phc p = phcs.get(0);
        return "🏥 **Primary Health Centre (PHC) Info:**\n" +
               "• Name: " + p.getName() + "\n" +
               "• Location: " + p.getLocation() + "\n" +
               "• Contact: " + (p.getContactPhone() != null ? p.getContactPhone() : "N/A");
    }

    public String getGeneralUserDataSummary(User user) {
        String profileStr = getUserProfileSummary(user);
        String presStr = getPrescriptionsSummary(user.getId());
        String recordsStr = getHealthRecordsSummary(user.getId());
        return profileStr + "\n" + presStr + "\n" + recordsStr;
    }
}
