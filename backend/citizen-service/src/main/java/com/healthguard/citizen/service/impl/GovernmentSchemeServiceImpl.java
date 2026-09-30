package com.healthguard.citizen.service.impl;

import com.healthguard.citizen.dto.GovernmentSchemeDTO;
import com.healthguard.citizen.entity.Citizen;
import com.healthguard.citizen.entity.GovernmentScheme;
import com.healthguard.citizen.exception.ResourceNotFoundException;
import com.healthguard.citizen.repository.CitizenRepository;
import com.healthguard.citizen.repository.GovernmentSchemeRepository;
import com.healthguard.citizen.service.GovernmentSchemeService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GovernmentSchemeServiceImpl implements GovernmentSchemeService {

    private final GovernmentSchemeRepository schemeRepository;
    private final CitizenRepository citizenRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GovernmentSchemeDTO> getAllSchemes(String category, String state, String search) {
        String catParam = (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) ? category.trim() : null;
        String stateParam = (state != null && !state.isBlank() && !"all".equalsIgnoreCase(state)) ? state.trim() : null;
        String searchParam = (search != null && !search.isBlank()) ? search.trim() : null;

        List<GovernmentScheme> schemes;
        if (catParam == null && stateParam == null && searchParam == null) {
            schemes = schemeRepository.findAllByIsActiveTrueOrderByCreatedAtDesc();
        } else {
            schemes = schemeRepository.filterSchemes(catParam, stateParam, searchParam);
        }

        return schemes.stream()
                .map(GovernmentSchemeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GovernmentSchemeDTO getSchemeById(Long id) {
        GovernmentScheme scheme = schemeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Government scheme not found with ID: " + id));
        return GovernmentSchemeDTO.fromEntity(scheme);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GovernmentSchemeDTO> getEligibleSchemesForCitizen(Long citizenId) {
        Citizen citizen = citizenRepository.findByUserId(citizenId)
                .or(() -> citizenRepository.findById(citizenId))
                .orElse(null);

        String citizenState = (citizen != null && citizen.getDistrict() != null && citizen.getDistrict().toLowerCase().contains("tamil"))
                ? "Tamil Nadu" : "All India";

        List<GovernmentScheme> allSchemes = schemeRepository.findAllByIsActiveTrueOrderByCreatedAtDesc();

        if (citizen != null) {
            String gender = citizen.getGender() != null ? citizen.getGender().toLowerCase() : "";
            Integer age = (citizen.getDateOfBirth() != null)
                    ? java.time.Period.between(citizen.getDateOfBirth(), java.time.LocalDate.now()).getYears()
                    : null;

            return allSchemes.stream()
                    .filter(s -> {
                        // Gender specific matching for maternal schemes
                        if (s.getCategory() != null && s.getCategory().equalsIgnoreCase("Maternal Health")) {
                            return gender.contains("female") || gender.contains("f");
                        }
                        // Child specific matching
                        if (s.getCategory() != null && s.getCategory().equalsIgnoreCase("Child Health")) {
                            return age == null || age <= 18;
                        }
                        // State matching
                        if (!"All India".equalsIgnoreCase(s.getState())) {
                            return s.getState().equalsIgnoreCase(citizenState);
                        }
                        return true;
                    })
                    .map(GovernmentSchemeDTO::fromEntity)
                    .collect(Collectors.toList());
        }

        return allSchemes.stream()
                .map(GovernmentSchemeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return schemeRepository.findDistinctCategories();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getStates() {
        return schemeRepository.findDistinctStates();
    }

    /**
     * Seed initial sample schemes if the table is empty.
     */
    @PostConstruct
    @Transactional
    public void seedInitialSchemesIfEmpty() {
        if (schemeRepository.count() > 0) {
            log.info("Government schemes table already contains {} records. Skipping seed.", schemeRepository.count());
            return;
        }

        log.info("Seeding initial government health schemes database records...");
        List<GovernmentScheme> initialSchemes = new ArrayList<>();

        // 1. Ayushman Bharat PM-JAY
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Ayushman Bharat PM-JAY")
                .description("World's largest government-funded health insurance scheme offering cashless treatment up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.")
                .benefits("Cashless hospitalization up to ₹5,00,000 per family per year; Covers 1,949+ medical procedures; Zero out-of-pocket expenses at empaneled public and private hospitals; Pre-existing conditions covered from day one.")
                .eligibilityCriteria("Families listed in SECC 2011 database; Rural households with deprivation criteria; Deprived urban occupational categories (e.g. drivers, construction workers, street vendors).")
                .officialLink("https://pmjay.gov.in")
                .applicationLink("https://beneficiary.nha.gov.in")
                .requiredDocuments("Aadhaar Card, Ration Card, PM-JAY Golden Card / Letter, Active Mobile Number.")
                .state("All India")
                .category("Health Insurance")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 2. Janani Suraksha Yojana
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Janani Suraksha Yojana")
                .description("Safe motherhood intervention under the National Health Mission promoting institutional delivery among poor pregnant women through direct cash assistance.")
                .benefits("Direct cash assistance of ₹1,400 for institutional delivery in rural areas and ₹1,000 in urban areas; Free delivery and post-natal care in government health institutions; Dedicated ASHA escort support.")
                .eligibilityCriteria("Pregnant women belonging to BPL/SC/ST households delivering in government health facilities or accredited private clinics; Age 19 years and above.")
                .officialLink("https://nhm.gov.in")
                .applicationLink("https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309")
                .requiredDocuments("Mother and Child Protection (MCP) Card, Aadhaar Card, BPL Certificate / Ration Card, Bank Account Passbook copy.")
                .state("All India")
                .category("Maternal Health")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 3. Pradhan Mantri Matru Vandana Yojana
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Pradhan Mantri Matru Vandana Yojana")
                .description("Centrally sponsored Direct Benefit Transfer (DBT) scheme providing financial assistance of ₹5,000 for the first living child and ₹6,000 for the second girl child to compensate for wage loss during pregnancy.")
                .benefits("Cash incentive of ₹5,000 in two installments for first child; ₹6,000 one-time installment on birth of second girl child; Wage loss compensation and improved maternal nutritional health.")
                .eligibilityCriteria("Pregnant Women and Lactating Mothers (PW&LM) who have registered pregnancy at Anganwadi Centre (AWC) or approved health facility; Excludes government employees.")
                .officialLink("https://pmmvy.wcd.gov.in")
                .applicationLink("https://pmmvy.wcd.gov.in")
                .requiredDocuments("Aadhaar Card of mother & husband, MCP Card, Bank Account Details linked with Aadhaar, Child Birth Registration Certificate.")
                .state("All India")
                .category("Maternal Health")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 4. Universal Immunization Programme
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Universal Immunization Programme")
                .description("One of the largest public health immunization programmes in the world, providing 100% free vaccines against 12 preventable life-threatening diseases for infants and pregnant women.")
                .benefits("Free vaccination against TB, Diphtheria, Pertussis, Tetanus, Polio, Hepatitis B, Pneumonia, Measles, Rubella, and Rotavirus; Digital certificate & tracking via U-WIN platform.")
                .eligibilityCriteria("All infants, children aged 0 to 5 years, and pregnant mothers across all states and union territories in India.")
                .officialLink("https://nhm.gov.in")
                .applicationLink("https://uwin.mohfw.gov.in")
                .requiredDocuments("Parent/Guardian Aadhaar Card, Child Birth Certificate / MCP Card, Active Mobile Number.")
                .state("All India")
                .category("Immunization")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 5. Rashtriya Bal Swasthya Karyakram
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Rashtriya Bal Swasthya Karyakram")
                .description("Child health screening and early intervention service targeting children from birth to 18 years for the 4Ds: Defects at birth, Deficiencies, Diseases, and Development delays including disability.")
                .benefits("Free screening and comprehensive medical and surgical management at District Early Intervention Centres (DEIC); Free corrective surgeries for congenital heart defects, cleft lip, and clubfoot.")
                .eligibilityCriteria("All children from birth to 18 years enrolled in government/aided schools, Anganwadi centres, and newborns delivered at public health facilities.")
                .officialLink("https://nhm.gov.in")
                .applicationLink("https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=818&lid=221")
                .requiredDocuments("School/Anganwadi ID, Aadhaar Card of Parent/Child, Health Card / DEIC Referral Slip.")
                .state("All India")
                .category("Child Health")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 6. Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)")
                .description("Flagship state health insurance scheme in Tamil Nadu providing cashless hospitalization up to ₹5 lakh per family per year for 1,090 medical and surgical procedures across public and private hospitals.")
                .benefits("Cashless coverage up to ₹5,00,000 per family per year; Covers high-end tertiary care, organ transplants, oncology, and cardiac surgeries; 1,000+ network hospitals.")
                .eligibilityCriteria("Resident families of Tamil Nadu with annual family income below ₹1,20,000; Listed in Smart Family Card database.")
                .officialLink("https://cmchistn.com")
                .applicationLink("https://cmchistn.com/enrollment.php")
                .requiredDocuments("Smart Family Ration Card, Aadhaar Card, VAO Income Certificate, Active Mobile Number.")
                .state("Tamil Nadu")
                .category("Health Insurance")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 7. Pradhan Mantri National Dialysis Programme
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Pradhan Mantri National Dialysis Programme")
                .description("National initiative under the National Health Mission providing free hemodialysis sessions to BPL renal failure patients across all district hospitals.")
                .benefits("100% free hemodialysis sessions for BPL patients; Subsidized nominal rates for non-BPL citizens; High-efficiency dialyzers and continuous nephrology monitoring.")
                .eligibilityCriteria("Patients diagnosed with End-Stage Renal Disease (ESRD Stage 5) requiring maintenance hemodialysis; Free for BPL card holders.")
                .officialLink("https://nhm.gov.in")
                .applicationLink("https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=844&lid=312")
                .requiredDocuments("BPL Card / Income Certificate, Nephrologist Dialysis Prescription, Aadhaar Card, Recent Clinical Blood Reports.")
                .state("All India")
                .category("Critical Care")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 8. Ayushman Bharat PM-JAY Senior Citizens Vayo Vandana Card (70+ Universal)
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Ayushman Bharat PM-JAY Senior Citizens Vayo Vandana Card")
                .description("Universal health insurance coverage providing ₹5 Lakh per year free healthcare to ALL senior citizens aged 70 and above, regardless of income.")
                .benefits("Dedicated ₹5,00,000 top-up cover exclusively for seniors aged 70+; Zero waiting period; Cashless geriatric treatment at empaneled hospitals.")
                .eligibilityCriteria("All Indian citizens aged 70 years and above, irrespective of income, ration card category, or economic status.")
                .officialLink("https://beneficiary.nha.gov.in")
                .applicationLink("https://beneficiary.nha.gov.in")
                .requiredDocuments("Aadhaar Card verifying age 70+, Active Mobile Number.")
                .state("All India")
                .category("Elderly Care")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 9. National Programme for Health Care of the Elderly (NPHCE)
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("National Programme for Health Care of the Elderly (NPHCE)")
                .description("Dedicated healthcare programme addressing geriatric healthcare needs through primary, secondary, and tertiary public healthcare institutions.")
                .benefits("Weekly geriatric clinics at PHCs; 10-bed specialized geriatric wards at District Hospitals; Free physiotherapy and medicines.")
                .eligibilityCriteria("All senior citizens aged 60 years and above residing in India.")
                .officialLink("https://nhm.gov.in")
                .applicationLink("https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1073&lid=384")
                .requiredDocuments("Aadhaar Card or Age Proof document.")
                .state("All India")
                .category("Elderly Care")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 10. Rashtriya Vayoshri Yojana (RVY)
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Rashtriya Vayoshri Yojana (RVY)")
                .description("Centrally sponsored scheme providing physical aids and assisted-living devices for senior citizens belonging to BPL category.")
                .benefits("Free walking sticks, crutches, walkers, hearing aids, wheelchairs, artificial dentures, and spectacles.")
                .eligibilityCriteria("Senior citizens aged 60 years and above holding a BPL card or receiving National Old Age Pension.")
                .officialLink("https://alimco.in")
                .applicationLink("https://alimco.in/rvydetails.aspx")
                .requiredDocuments("Aadhaar Card, BPL Card / Pension Passbook, Disability Certificate.")
                .state("All India")
                .category("Elderly Care")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 11. Rashtriya Kishor Swasthya Karyakram (RKSK - Adolescent Health)
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Rashtriya Kishor Swasthya Karyakram (RKSK)")
                .description("Holistic adolescent health programme addressing nutrition, sexual/reproductive health, mental health, and substance misuse.")
                .benefits("Adolescent Friendly Health Clinics (AFHC); Peer education; Free weekly iron & folic acid; Free clinical counselling.")
                .eligibilityCriteria("All adolescents aged 10 to 19 years (in-school and out-of-school).")
                .officialLink("https://nhm.gov.in")
                .applicationLink("https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=823&lid=226")
                .requiredDocuments("School ID or Student Aadhaar Card.")
                .state("All India")
                .category("Adolescent Health")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 12. Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)")
                .description("Quality generic medicines at 50% to 90% cheaper prices compared to branded medicines through Jan Aushadhi Kendras.")
                .benefits("Access to 2,000+ quality generic medicines and 300+ surgical items at up to 90% discount.")
                .eligibilityCriteria("Open to all citizens with a valid doctor's prescription; No age or income restriction.")
                .officialLink("https://janaushadhi.gov.in")
                .applicationLink("https://janaushadhi.gov.in")
                .requiredDocuments("Doctor's Prescription.")
                .state("All India")
                .category("Generic Medicine")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 13. Tele-MANAS Mental Health Helpline
        initialSchemes.add(GovernmentScheme.builder()
                .schemeName("Tele-MANAS (Mental Health Helpline 14416)")
                .description("24x7 free national tele-mental health helpline providing immediate psychological support and psychiatric counselling.")
                .benefits("Toll-free 24x7 clinical support in regional languages (Toll-Free: 14416); District psychiatric escalation.")
                .eligibilityCriteria("Any person experiencing psychological distress across India (All Ages).")
                .officialLink("https://telemanas.mohfw.gov.in")
                .applicationLink("https://telemanas.mohfw.gov.in")
                .requiredDocuments("None required (Anonymous & confidential).")
                .state("All India")
                .category("Mental Health")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build());

        schemeRepository.saveAll(initialSchemes);
        log.info("Successfully seeded {} government health schemes into database.", initialSchemes.size());
    }
}
