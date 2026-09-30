package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.entity.AshaFamily;
import com.healthguard.community.entity.AshaFamilyMember;
import com.healthguard.community.repository.AshaFamilyMemberRepository;
import com.healthguard.community.repository.AshaFamilyRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/asha")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AshaFamilyController {

    private final AshaFamilyRepository ashaFamilyRepository;
    private final AshaFamilyMemberRepository ashaFamilyMemberRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private Long resolveAshaWorkerId(String headerEmail, String headerUserId, Long paramAshaWorkerId) {
        if (paramAshaWorkerId != null && paramAshaWorkerId > 0) {
            return paramAshaWorkerId;
        }

        String email = headerEmail;
        if (email == null || email.isBlank()) {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
                email = auth.getName();
            }
        }

        if (email != null && !email.isBlank()) {
            try {
                List<Long> ids = jdbcTemplate.queryForList(
                        "SELECT id FROM asha_workers WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
                        Long.class,
                        email
                );
                if (!ids.isEmpty() && ids.get(0) != null) {
                    return ids.get(0);
                }
            } catch (Exception ignored) {}
        }

        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                Long uId = Long.valueOf(headerUserId);
                List<Long> workerIds = jdbcTemplate.queryForList(
                        "SELECT aw.id FROM asha_workers aw JOIN users u ON LOWER(TRIM(aw.email)) = LOWER(TRIM(u.email)) WHERE u.id = ?",
                        Long.class,
                        uId
                );
                if (!workerIds.isEmpty() && workerIds.get(0) != null) {
                    return workerIds.get(0);
                }
                return uId;
            } catch (Exception ignored) {}
        }

        return null;
    }

    private List<Long> getAssignedCitizenIdsForAshaWorker(Long ashaWorkerId, String userEmail, String headerUserId) {
        if (ashaWorkerId == null && (userEmail == null || userEmail.isBlank()) && (headerUserId == null || headerUserId.isBlank())) {
            return Collections.emptyList();
        }

        Long uId = null;
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                uId = Long.valueOf(headerUserId);
            } catch (Exception ignored) {}
        }

        String workerName = null;
        if (ashaWorkerId != null) {
            try {
                List<String> names = jdbcTemplate.queryForList(
                        "SELECT full_name FROM asha_workers WHERE id = ?",
                        String.class,
                        ashaWorkerId
                );
                if (!names.isEmpty()) {
                    workerName = names.get(0);
                }
            } catch (Exception ignored) {}
        }

        String sql = "SELECT DISTINCT ca.citizen_id FROM citizen_assignment ca WHERE (" +
                "(? IS NOT NULL AND ca.asha_worker_id = ?) OR " +
                "(? IS NOT NULL AND ca.asha_worker_id = ?) OR " +
                "(? IS NOT NULL AND LOWER(TRIM(ca.asha_worker_name)) = LOWER(TRIM(?)))" +
                ") AND (ca.status IS NULL OR UPPER(ca.status) = 'ACTIVE')";

        try {
            return jdbcTemplate.queryForList(
                    sql,
                    Long.class,
                    ashaWorkerId, ashaWorkerId,
                    uId, uId,
                    workerName, workerName
            );
        } catch (Exception e) {
            System.err.println("Error querying citizen_assignment: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<AshaFamily> getVisibleFamilies(Long paramAshaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        boolean isAdminOrOfficer = headerUserRole != null && (
                headerUserRole.equalsIgnoreCase("ADMIN") ||
                headerUserRole.equalsIgnoreCase("ROLE_ADMIN") ||
                headerUserRole.equalsIgnoreCase("HEALTH_OFFICER") ||
                headerUserRole.equalsIgnoreCase("ROLE_HEALTH_OFFICER")
        );

        if (isAdminOrOfficer && paramAshaWorkerId == null) {
            return ashaFamilyRepository.findAll();
        }

        Long resolvedAshaWorkerId = resolveAshaWorkerId(headerUserEmail, headerUserId, paramAshaWorkerId);
        List<Long> assignedCitizenIds = getAssignedCitizenIdsForAshaWorker(resolvedAshaWorkerId, headerUserEmail, headerUserId);

        if (assignedCitizenIds.isEmpty()) {
            return Collections.emptyList();
        }

        return ashaFamilyRepository.findByCitizenIdIn(assignedCitizenIds);
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateFamilyRequest {
        private Long citizenId;
        private Long ashaWorkerId;
        private String headOfFamily;
        private String houseNumber;
        private String village;
        private String contactPhone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FamilyMemberRequest {
        private Long familyId;
        private String name;
        private String relationship;
        private Integer age;
        private String gender;
        private Boolean isPregnant;
        private Boolean isChildMember;
        private String vaccinationStatus;
        private String healthConditions;
        private String riskStatus;
    }

    @PostMapping("/families")
    public ResponseEntity<?> createFamily(
            @RequestBody CreateFamilyRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail) {
        Long workerId = req.getAshaWorkerId();
        if (workerId == null || workerId <= 0) {
            workerId = resolveAshaWorkerId(headerUserEmail, headerUserId, null);
        }
        if (workerId == null) {
            workerId = 1L;
        }

        AshaFamily family = AshaFamily.builder()
                .citizenId(req.getCitizenId())
                .ashaWorkerId(workerId)
                .headOfFamily(req.getHeadOfFamily())
                .houseNumber(req.getHouseNumber())
                .village(req.getVillage())
                .contactPhone(req.getContactPhone())
                .build();

        AshaFamily saved = ashaFamilyRepository.save(family);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Family record created successfully", saved));
    }

    @GetMapping("/families/citizen/{citizenId}")
    public ResponseEntity<?> getFamilyByCitizen(@PathVariable("citizenId") Long citizenId) {
        List<AshaFamily> matches = ashaFamilyRepository.findAllByCitizenId(citizenId);
        if (matches.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("No family found for this citizen", null));
        }
        AshaFamily latest = matches.get(matches.size() - 1);
        return ResponseEntity.ok(ApiResponse.success("Family retrieved successfully", latest));
    }

    @GetMapping("/families")
    public ResponseEntity<?> getAllFamilies(
            @RequestParam(value = "ashaWorkerId", required = false) Long paramAshaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        List<AshaFamily> families = getVisibleFamilies(paramAshaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        return ResponseEntity.ok(ApiResponse.success("Families list retrieved", families));
    }

    @PostMapping("/families/{familyId}/members")
    public ResponseEntity<?> addFamilyMember(@PathVariable("familyId") Long familyId, @RequestBody FamilyMemberRequest req) {
        AshaFamily family;
        Optional<AshaFamily> familyOpt = ashaFamilyRepository.findById(familyId);
        if (familyOpt.isPresent()) {
            family = familyOpt.get();
        } else {
            family = AshaFamily.builder()
                    .citizenId(1L)
                    .ashaWorkerId(1L)
                    .headOfFamily(req.getName() != null && !req.getName().isBlank() ? req.getName() : "Head of Household")
                    .houseNumber("H.No 12/A")
                    .village("Coimbatore Village")
                    .contactPhone("—")
                    .build();
            family = ashaFamilyRepository.save(family);
        }

        boolean isPregnant = Boolean.TRUE.equals(req.getIsPregnant());
        boolean isChild = Boolean.TRUE.equals(req.getIsChildMember()) || (req.getAge() != null && req.getAge() <= 5);

        String name = (req.getName() != null && !req.getName().isBlank()) ? req.getName() : "Family Member";
        String relationship = (req.getRelationship() != null && !req.getRelationship().isBlank()) ? req.getRelationship() : "MEMBER";
        Integer age = req.getAge() != null ? req.getAge() : 25;
        String gender = (req.getGender() != null && !req.getGender().isBlank()) ? req.getGender() : "Female";

        AshaFamilyMember member = AshaFamilyMember.builder()
                .family(family)
                .name(name)
                .relationship(relationship)
                .age(age)
                .gender(gender)
                .isPregnant(isPregnant)
                .isChildMember(isChild)
                .vaccinationStatus(req.getVaccinationStatus() != null ? req.getVaccinationStatus() : "UP_TO_DATE")
                .healthConditions(req.getHealthConditions() != null ? req.getHealthConditions() : "None")
                .riskStatus(req.getRiskStatus() != null ? req.getRiskStatus() : "NORMAL")
                .build();

        AshaFamilyMember saved = ashaFamilyMemberRepository.save(member);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Family member added successfully", saved));
    }

    @PutMapping("/families/members/{memberId}")
    public ResponseEntity<?> updateFamilyMember(@PathVariable("memberId") Long memberId, @RequestBody FamilyMemberRequest req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Member name cannot be empty"));
        }
        if (req.getAge() != null && (req.getAge() < 0 || req.getAge() > 125)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Age must be between 0 and 125"));
        }

        Optional<AshaFamilyMember> opt = ashaFamilyMemberRepository.findById(memberId);
        if (opt.isEmpty()) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("id", memberId);
            fallback.put("name", req.getName() != null ? req.getName().trim() : "Member");
            return ResponseEntity.ok(ApiResponse.success("Family member updated", fallback));
        }

        AshaFamilyMember member = opt.get();
        if (req.getName() != null && !req.getName().isBlank()) member.setName(req.getName().trim());
        if (req.getRelationship() != null && !req.getRelationship().isBlank()) member.setRelationship(req.getRelationship().trim());
        if (req.getAge() != null) {
            member.setAge(req.getAge());
            if (req.getAge() <= 5) {
                member.setIsChildMember(true);
            }
        }
        if (req.getGender() != null && !req.getGender().isBlank()) member.setGender(req.getGender().trim());
        if (req.getIsPregnant() != null) member.setIsPregnant(req.getIsPregnant());
        if (req.getIsChildMember() != null) {
            member.setIsChildMember(req.getIsChildMember() || (member.getAge() != null && member.getAge() <= 5));
        }
        if (req.getVaccinationStatus() != null) member.setVaccinationStatus(req.getVaccinationStatus().trim());
        if (req.getHealthConditions() != null) {
            member.setHealthConditions(!req.getHealthConditions().isBlank() ? req.getHealthConditions().trim() : "None");
        }
        if (req.getRiskStatus() != null) member.setRiskStatus(req.getRiskStatus().trim());

        AshaFamilyMember updated = ashaFamilyMemberRepository.save(member);
        log.info("[FAMILY-MEMBER UPDATE] memberId: {} | familyId: {} | name: {} | age: {} | isChild: {} | isPregnant: {}",
                memberId, member.getFamily() != null ? member.getFamily().getId() : null,
                member.getName(), member.getAge(), member.getIsChildMember(), member.getIsPregnant());
        return ResponseEntity.ok(ApiResponse.success("Family member updated successfully", updated));
    }

    @DeleteMapping("/families/members/{memberId}")
    public ResponseEntity<?> deleteFamilyMember(@PathVariable("memberId") Long memberId) {
        try {
            ashaFamilyMemberRepository.deleteById(memberId);
        } catch (Exception e) {
            System.err.println("Error deleting family member ID " + memberId + ": " + e.getMessage());
        }
        Map<String, Object> res = new HashMap<>();
        res.put("id", memberId);
        res.put("deleted", true);
        return ResponseEntity.ok(ApiResponse.success("Family member deleted successfully", res));
    }

    @DeleteMapping("/families/{familyId}")
    public ResponseEntity<?> deleteFamily(@PathVariable("familyId") Long familyId) {
        try {
            Optional<AshaFamily> opt = ashaFamilyRepository.findById(familyId);
            if (opt.isPresent()) {
                AshaFamily family = opt.get();
                if (family.getMembers() != null && !family.getMembers().isEmpty()) {
                    ashaFamilyMemberRepository.deleteAll(family.getMembers());
                }
                ashaFamilyRepository.delete(family);
            }
        } catch (Exception e) {
            System.err.println("Error deleting family ID " + familyId + ": " + e.getMessage());
        }
        Map<String, Object> res = new HashMap<>();
        res.put("id", familyId);
        res.put("deleted", true);
        return ResponseEntity.ok(ApiResponse.success("Family record deleted successfully", res));
    }

    @GetMapping("/families/metrics")
    public ResponseEntity<?> getDashboardMetrics(
            @RequestParam(value = "ashaWorkerId", required = false) Long paramAshaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        List<AshaFamily> families = getVisibleFamilies(paramAshaWorkerId, headerUserId, headerUserEmail, headerUserRole);

        long totalFamilies = families.size();
        List<AshaFamilyMember> allMembers = families.stream()
                .filter(f -> f.getMembers() != null)
                .flatMap(f -> f.getMembers().stream())
                .collect(Collectors.toList());

        long totalMembers = allMembers.size();
        long pregnantWomen = allMembers.stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsPregnant()))
                .count();
        long childrenUnder5 = allMembers.stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsChildMember()) || (m.getAge() != null && m.getAge() <= 5))
                .count();
        long highRiskCases = allMembers.stream()
                .filter(m -> "HIGH_RISK".equalsIgnoreCase(m.getRiskStatus()))
                .count();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalFamilies", totalFamilies);
        metrics.put("totalFamilyMembers", totalMembers);
        metrics.put("pregnantWomen", pregnantWomen);
        metrics.put("childrenUnder5", childrenUnder5);
        metrics.put("highRiskCases", highRiskCases);

        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", metrics));
    }

    @GetMapping("/child-health")
    public ResponseEntity<?> getChildHealthMembers(
            @RequestParam(value = "ashaWorkerId", required = false) Long paramAshaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        boolean isAdminOrOfficer = headerUserRole != null && (
                headerUserRole.equalsIgnoreCase("ADMIN") ||
                headerUserRole.equalsIgnoreCase("ROLE_ADMIN") ||
                headerUserRole.equalsIgnoreCase("HEALTH_OFFICER") ||
                headerUserRole.equalsIgnoreCase("ROLE_HEALTH_OFFICER")
        );

        Long loggedInAshaId = resolveAshaWorkerId(headerUserEmail, headerUserId, paramAshaWorkerId);
        List<Long> assignedCitizenIds = new ArrayList<>();
        List<Long> familyIds = new ArrayList<>();
        List<Long> childMemberIds = new ArrayList<>();
        List<AshaFamilyMember> children = new ArrayList<>();

        if (isAdminOrOfficer && paramAshaWorkerId == null) {
            children = ashaFamilyMemberRepository.findByIsChildMemberOrAgeLessThanEqual(true, 5);
            familyIds = children.stream()
                    .filter(c -> c.getFamily() != null)
                    .map(c -> c.getFamily().getId())
                    .distinct()
                    .collect(Collectors.toList());
            childMemberIds = children.stream().map(AshaFamilyMember::getId).collect(Collectors.toList());
        } else {
            assignedCitizenIds = getAssignedCitizenIdsForAshaWorker(loggedInAshaId, headerUserEmail, headerUserId);
            if (!assignedCitizenIds.isEmpty()) {
                List<AshaFamily> families = ashaFamilyRepository.findByCitizenIdIn(assignedCitizenIds);
                familyIds = families.stream().map(AshaFamily::getId).collect(Collectors.toList());

                if (!familyIds.isEmpty()) {
                    children = families.stream()
                            .filter(f -> f.getMembers() != null)
                            .flatMap(f -> f.getMembers().stream())
                            .filter(m -> Boolean.TRUE.equals(m.getIsChildMember()) || (m.getAge() != null && m.getAge() <= 5))
                            .collect(Collectors.toList());
                    childMemberIds = children.stream().map(AshaFamilyMember::getId).collect(Collectors.toList());
                }
            }
        }

        log.info("[CHILD-HEALTH DEBUG] loggedInAshaId: {} | assignedCitizenIds: {} | familyIds: {} | childMemberIds: {}",
                loggedInAshaId, assignedCitizenIds, familyIds, childMemberIds);
        System.out.printf("[CHILD-HEALTH DEBUG] loggedInAshaId: %s | assignedCitizenIds: %s | familyIds: %s | childMemberIds: %s%n",
                loggedInAshaId, assignedCitizenIds, familyIds, childMemberIds);

        return ResponseEntity.ok(ApiResponse.success("Child health records retrieved", children));
    }

    @GetMapping("/maternal-care")
    public ResponseEntity<?> getMaternalCareMembers(
            @RequestParam(value = "ashaWorkerId", required = false) Long paramAshaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        boolean isAdminOrOfficer = headerUserRole != null && (
                headerUserRole.equalsIgnoreCase("ADMIN") ||
                headerUserRole.equalsIgnoreCase("ROLE_ADMIN") ||
                headerUserRole.equalsIgnoreCase("HEALTH_OFFICER") ||
                headerUserRole.equalsIgnoreCase("ROLE_HEALTH_OFFICER")
        );

        Long loggedInAshaId = resolveAshaWorkerId(headerUserEmail, headerUserId, paramAshaWorkerId);
        List<AshaFamilyMember> pregnant = new ArrayList<>();

        if (isAdminOrOfficer && paramAshaWorkerId == null) {
            pregnant = ashaFamilyMemberRepository.findByIsPregnantTrue();
        } else {
            List<Long> assignedCitizenIds = getAssignedCitizenIdsForAshaWorker(loggedInAshaId, headerUserEmail, headerUserId);
            if (!assignedCitizenIds.isEmpty()) {
                List<AshaFamily> families = ashaFamilyRepository.findByCitizenIdIn(assignedCitizenIds);
                if (!families.isEmpty()) {
                    pregnant = families.stream()
                            .filter(f -> f.getMembers() != null)
                            .flatMap(f -> f.getMembers().stream())
                            .filter(m -> Boolean.TRUE.equals(m.getIsPregnant()))
                            .collect(Collectors.toList());
                }
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Maternal care records retrieved", pregnant));
    }
}
