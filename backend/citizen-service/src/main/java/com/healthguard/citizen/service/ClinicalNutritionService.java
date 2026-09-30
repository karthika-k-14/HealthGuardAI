package com.healthguard.citizen.service;

import com.healthguard.citizen.dto.ApiResponse;
import com.healthguard.citizen.entity.Citizen;
import com.healthguard.citizen.entity.CitizenHealthProfile;
import com.healthguard.citizen.repository.CitizenHealthProfileRepository;
import com.healthguard.citizen.repository.CitizenRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClinicalNutritionService {

    private final CitizenRepository citizenRepository;
    private final CitizenHealthProfileRepository healthProfileRepository;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NutritionGenerateRequest {
        private Long userId;
        private Long citizenId;
        private String condition;
        private String disease;
        private List<String> symptoms;
        private String riskLevel;
        private Integer age;
        private String gender;
        private Double height;
        private Double weight;
        private String allergies;
        private String medicalHistory;
        private String language;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NutritionPlanResult {
        private Long planId;
        private Long citizenId;
        private String targetCondition; // FEVER, DIABETES, HYPERTENSION, ANEMIA, MALNUTRITION, GENERAL
        private Double bmi;
        private String bmiStatus;
        private Integer dailyCalorieTarget;
        private Double dailyWaterGoalLiters;
        private String breakfast;
        private String midMorning;
        private String lunch;
        private String eveningSnack;
        private String dinner;
        private List<String> foodsRecommended;
        private List<String> foodsToAvoid;
        private List<String> clinicalRecoveryTips;
        private String governmentNutritionScheme;
        private String clinicalAdvice;
        private LocalDateTime generatedAt;
    }

    public NutritionPlanResult generatePlan(NutritionGenerateRequest request) {
        Long citizenId = request.getCitizenId() != null ? request.getCitizenId() : request.getUserId();
        if (citizenId == null) citizenId = 1L;

        // 1. Fetch citizen profile from PostgreSQL to enrich biometrics if missing
        Double height = request.getHeight();
        Double weight = request.getWeight();
        Integer age = request.getAge();
        String gender = request.getGender();
        String medicalHistory = request.getMedicalHistory();

        Optional<Citizen> citizenOpt = citizenRepository.findById(citizenId);
        if (citizenOpt.isEmpty()) citizenOpt = citizenRepository.findByUserId(citizenId);
        if (citizenOpt.isPresent()) {
            Citizen c = citizenOpt.get();
            if (age == null && c.getDateOfBirth() != null) {
                age = java.time.Period.between(c.getDateOfBirth(), java.time.LocalDate.now()).getYears();
            }
            if (gender == null && c.getGender() != null) gender = c.getGender();
            if (height == null && c.getHeight() != null) height = c.getHeight();
            if (weight == null && c.getWeight() != null) weight = c.getWeight();
            if (medicalHistory == null && c.getMedicalHistory() != null) medicalHistory = c.getMedicalHistory();
        }

        Optional<CitizenHealthProfile> profileOpt = healthProfileRepository.findByCitizenId(citizenId);
        if (profileOpt.isPresent()) {
            CitizenHealthProfile hp = profileOpt.get();
            if (height == null && hp.getHeight() != null) height = hp.getHeight();
            if (weight == null && hp.getWeight() != null) weight = hp.getWeight();
        }

        if (height == null || height <= 0) height = 165.0; // Default 165 cm
        if (weight == null || weight <= 0) weight = 62.0;  // Default 62 kg
        if (age == null || age <= 0) age = 32;
        if (gender == null || gender.isBlank()) gender = "Female";

        // 2. Compute BMI: weight (kg) / (height (m) ^ 2)
        double heightInMeters = height / 100.0;
        double bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10.0) / 10.0;
        String bmiStatus = bmi < 18.5 ? "Underweight" : (bmi < 24.9 ? "Normal weight" : (bmi < 29.9 ? "Overweight" : "Obese"));

        // 3. Determine Condition
        String conditionInput = (request.getCondition() != null && !request.getCondition().isBlank())
                ? request.getCondition()
                : (request.getDisease() != null ? request.getDisease() : "");

        String symptomsText = request.getSymptoms() != null ? String.join(" ", request.getSymptoms()) : "";
        String combined = (conditionInput + " " + symptomsText + " " + (medicalHistory != null ? medicalHistory : "")).toLowerCase();

        String targetCondition = "GENERAL";
        if (combined.contains("fever") || combined.contains("dengue") || combined.contains("malaria") || combined.contains("typhoid") || combined.contains("temperature")) {
            targetCondition = "FEVER";
        } else if (combined.contains("diabet") || combined.contains("sugar") || combined.contains("glucose")) {
            targetCondition = "DIABETES";
        } else if (combined.contains("hypertens") || combined.contains("blood pressure") || combined.contains("bp") || combined.contains("cardiac")) {
            targetCondition = "HYPERTENSION";
        } else if (combined.contains("anemi") || combined.contains("hemoglobin") || combined.contains("iron") || combined.contains("pale")) {
            targetCondition = "ANEMIA";
        } else if (combined.contains("malnutri") || bmi < 18.5 || combined.contains("underweight") || combined.contains("weight loss")) {
            targetCondition = "MALNUTRITION";
        }

        log.info("[NutritionEngine] Generating condition-aware plan for citizenId={}: Condition={}, BMI={}, Weight={}, Height={}",
                citizenId, targetCondition, bmi, weight, height);

        // 4. Generate Visibly Distinct Condition-Specific Protocol
        NutritionPlanResult plan = new NutritionPlanResult();
        plan.setPlanId(System.currentTimeMillis());
        plan.setCitizenId(citizenId);
        plan.setTargetCondition(targetCondition);
        plan.setBmi(bmi);
        plan.setBmiStatus(bmiStatus);
        plan.setGeneratedAt(LocalDateTime.now());

        switch (targetCondition) {
            case "FEVER":
                plan.setDailyCalorieTarget(1850);
                plan.setDailyWaterGoalLiters(3.5);
                plan.setBreakfast("Soft Moong Dal Khichdi with a pinch of turmeric, steamed idlis (2 pcs) with mild coriander chutney, and 200ml warm electrolyte water.");
                plan.setMidMorning("Fresh tender coconut water (300ml) with a bowl of papaya and pomegranate slices (rich in Vitamin C and platelet co-factors).");
                plan.setLunch("Warm vegetable broth or clear tomato soup, steamed white rice with light bottle gourd (lauki) kootu, and curd.");
                plan.setEveningSnack("Warm barley water with lemon and honey, or ginger-tulsi herbal tea with 2 Marie biscuits.");
                plan.setDinner("Thin vegetable soup, 1 soft boiled potato with pinch of rock salt, and 1 cup warm chamomile tea.");
                plan.setFoodsRecommended(List.of("Oral Rehydration Salts (ORS) solution", "Tender coconut water & electrolyte fluids", "Clear vegetable broths and soups", "Papaya, oranges, sweet lime, and amla (Vitamin C)", "Soft easily digestible foods (khichdi, porridge, idli)"));
                plan.setFoodsToAvoid(List.of("Oily, deep-fried foods and spicy gravies", "Heavy dairy like whole milk, paneer, and cheese", "Raw unpeeled salads or outside street food", "Caffeinated coffee, cola, and carbonated sodas"));
                plan.setClinicalRecoveryTips(List.of("Take frequent sips of fluid every 20-30 minutes to prevent dehydration", "Monitor urine output; light pale yellow indicates good hydration", "Rest completely and avoid solid heavy foods until fever subsides"));
                plan.setGovernmentNutritionScheme("National Health Mission (NHM) Community ORS & Zinc Distribution Drive via ASHA Workers");
                plan.setClinicalAdvice("Hydration is the single most critical factor in viral fevers. If vomiting prevents oral fluids for >6 hours, visit the PHC for IV fluid assessment.");
                break;

            case "DIABETES":
                plan.setDailyCalorieTarget(1600);
                plan.setDailyWaterGoalLiters(2.8);
                plan.setBreakfast("Sprouted fenugreek (methi) salad, steel-cut oats upma with carrots and beans, and 1 boiled egg white or 50g roasted chana.");
                plan.setMidMorning("Bitter gourd (karela) juice or amla shot with 5-6 soaked almonds and 2 walnut halves.");
                plan.setLunch("2 multi-millet rotis (Ragi/Jowar), 1 cup palak dal, 1 cup bitter gourd subzi, and fresh cucumber salad with flaxseed powder.");
                plan.setEveningSnack("1 cup green tea with roasted makhana (foxnuts) sprinkled with black pepper.");
                plan.setDinner("1 bowl mixed vegetable dalia with French beans and zucchini, paired with fresh mint raita made from low-fat curd.");
                plan.setFoodsRecommended(List.of("Low-Glycemic Index grains: Jowar, Ragi, Bajra, Oats", "High-fiber vegetables: Bitter gourd, fenugreek leaves, spinach, beans", "Sprouted legumes and lentils for plant protein", "Cinnamon, methi seeds soaked overnight in water", "Raw chia seeds and flaxseeds"));
                plan.setFoodsToAvoid(List.of("Refined white sugars, jaggery, honey, and sweets", "White bread, maida products, and white polished rice", "High-glycemic fruits in excess: Mango, grapes, chikoo, watermelon", "Packaged fruit juices and carbonated beverages"));
                plan.setClinicalRecoveryTips(List.of("Maintain consistent meal timings to avoid glycemic spikes or dips", "Walk for 15-20 minutes after each main meal to improve insulin sensitivity", "Check fasting and postprandial glucose levels weekly"));
                plan.setGovernmentNutritionScheme("National Programme for Prevention & Control of NCDs (NP-NCD) Dietary Counselling Protocol");
                plan.setClinicalAdvice("Ensure carbohydrates are strictly paired with fiber and lean protein. Never skip meals when on antihyperglycemic medication.");
                break;

            case "HYPERTENSION":
                plan.setDailyCalorieTarget(1750);
                plan.setDailyWaterGoalLiters(3.0);
                plan.setBreakfast("DASH Oat bowl with sliced bananas and crushed walnuts, or Vegetable Poha cooked with zero added salt and rich in green peas and coriander.");
                plan.setMidMorning("1 large banana (high potassium) or fresh unsalted coconut water.");
                plan.setLunch("Brown rice with drumstick sambar, boiled spinach (palak) sabzi, beetroot poriyal, and 1 cup homemade low-sodium curd.");
                plan.setEveningSnack("1 glass unsalted pomegranate juice or Hibiscus tea with roasted unsalted pumpkin seeds.");
                plan.setDinner("2 whole wheat phulkas without ghee, yellow moong dal with crushed garlic cloves, and steamed pumpkin.");
                plan.setFoodsRecommended(List.of("DASH diet principles with strictly <5g salt per day (1 level tsp)", "Potassium-dense foods: Bananas, spinach, sweet potatoes, coconut water", "Garlic cloves (allicin helps dilate blood vessels)", "Magnesium-rich foods: Pumpkin seeds, flaxseeds, almonds", "Fresh curd and probiotic fermented buttermilk"));
                plan.setFoodsToAvoid(List.of("Table salt additions, pickles (achar), and papads", "Processed salty snacks: chips, salted namkeens, instant noodles", "Commercial baking powder products and canned soups", "Excess caffeine and alcoholic beverages"));
                plan.setClinicalRecoveryTips(List.of("Replace salt in cooking with lemon juice, garlic, ginger, and herbs", "Engage in 30 minutes of brisk walking 5 days a week", "Practice 10 minutes of deep slow diaphragmatic breathing every morning"));
                plan.setGovernmentNutritionScheme("India Hypertension Control Initiative (IHCI) Salt-Reduction Protocol");
                plan.setClinicalAdvice("Strict dietary sodium restriction reduces systolic BP by 5-8 mmHg within 4 weeks. Continue prescribed BP tablets without interruption.");
                break;

            case "ANEMIA":
                plan.setDailyCalorieTarget(1900);
                plan.setDailyWaterGoalLiters(2.5);
                plan.setBreakfast("Moringa (drumstick leaves) adai or paratha with tomato chutney, 1 boiled egg, and a glass of fresh amla-beetroot juice.");
                plan.setMidMorning("Handful of black raisins soaked overnight, 2 Medjool dates, and roasted sesame seeds (til laddu with jaggery).");
                plan.setLunch("Iron-rich red rice with drumstick leaves (murungai keerai) dal, beetroot-carrot stir fry, and fresh lime squeezed over rice.");
                plan.setEveningSnack("Roasted horse gram (kollu) sundal with shredded coconut, paired with fresh lemon water (Vitamin C).");
                plan.setDinner("2 multi-grain rotis with rajma / black chana masala, cooked in a cast iron pan to boost bioavailable iron.");
                plan.setFoodsRecommended(List.of("Heme and non-heme iron sources: Moringa leaves, spinach, beetroot, lentils", "Vitamin C pairing: Amla, lemon, tomatoes, guava (doubles iron absorption)", "Jaggery (gur) with roasted peanuts or sesame seeds", "Pomegranates, black raisins, and dates", "Foods cooked in traditional cast-iron cookware"));
                plan.setFoodsToAvoid(List.of("Tea, green tea, or coffee within 1 hour before or after meals (tannins block iron absorption)", "Calcium supplements taken simultaneously with iron meals", "Excess bran or whole grain phytates without prior soaking"));
                plan.setClinicalRecoveryTips(List.of("Always squeeze fresh lemon juice over your lentils and green vegetables", "Take Iron-Folic Acid (IFA) tablets at night with water, never with milk or tea", "Have your hemoglobin re-checked in 60 days to evaluate improvement"));
                plan.setGovernmentNutritionScheme("Anemia Mukt Bharat (AMB) Iron & Folic Acid Supplementation Program");
                plan.setClinicalAdvice("Severe anemia (Hb < 7 g/dL) requires clinical evaluation and intravenous iron or blood support. Visit your PHC medical officer immediately.");
                break;

            case "MALNUTRITION":
                plan.setDailyCalorieTarget(2400); // Calorie Surplus
                plan.setDailyWaterGoalLiters(2.8);
                plan.setBreakfast("Calorie-dense banana-peanut butter milkshake with oats, 2 paneer parathas cooked in pure ghee, and 1 whole boiled egg.");
                plan.setMidMorning("Sprouted mixed pulse sundal (moong, chana, green peas) with chopped almonds, cashews, and dates.");
                plan.setLunch("Generous portion of ghee-topped jeera rice, thick toor dal with vegetables, paneer bhurji (100g), and a bowl of sweet curd.");
                plan.setEveningSnack("High-protein roasted soya chunks or chickpea chaat with boiled sweet potato and coconut milk.");
                plan.setDinner("3 whole wheat chapatis with rich vegetable kurma, soya chunk curry, and a glass of warm milk with turmeric and jaggery at bedtime.");
                plan.setFoodsRecommended(List.of("High biological value protein: Eggs, paneer, soya, pulses, milk", "Healthy energy-dense fats: Pure cow ghee, peanut butter, coconut, nuts", "Complex calorie-dense carbohydrates: Potatoes, sweet potatoes, bananas, oats", "Sprouted legumes rich in bioavailable micronutrients", "Dry fruits: Almonds, walnuts, cashews, raisins, figs"));
                plan.setFoodsToAvoid(List.of("Empty calorie junk foods with zero micronutrients", "Caffeinated drinks that suppress appetite", "Skipping meals or fasting"));
                plan.setClinicalRecoveryTips(List.of("Consume 5-6 smaller nutrient-dense meals throughout the day rather than 2 large ones", "Incorporate protein in every single meal without exception", "Track body weight weekly on the same morning scale"));
                plan.setGovernmentNutritionScheme("POSHAN Abhiyaan (National Nutrition Mission) Supplementary Nutrition Program");
                plan.setClinicalAdvice("Aim for a safe, steady weight gain of 0.5 kg per week through clean wholesome whole foods. Consult an Anganwadi worker for supplementary nutrition rations.");
                break;

            default:
                plan.setDailyCalorieTarget(2000);
                plan.setDailyWaterGoalLiters(2.8);
                plan.setBreakfast("Vegetable poha or oats with mixed nuts and a glass of low-fat milk.");
                plan.setMidMorning("1 seasonal fruit (apple, guava, orange) with a handful of soaked almonds.");
                plan.setLunch("2 whole wheat rotis, 1 cup mixed dal, 1 cup green seasonal sabzi, and fresh salad.");
                plan.setEveningSnack("Herbal green tea with roasted makhana or boiled corn.");
                plan.setDinner("1 bowl mixed vegetable khichdi with curd and roasted papad.");
                plan.setFoodsRecommended(List.of("Whole grains, fresh vegetables, lentils, seasonal fruits, clean water"));
                plan.setFoodsToAvoid(List.of("Ultra-processed foods, excess salt, trans-fats, sugary beverages"));
                plan.setClinicalRecoveryTips(List.of("Drink 2.5-3L water daily, sleep 7-8 hours, exercise 30 minutes"));
                plan.setGovernmentNutritionScheme("Eat Right India Initiative (FSSAI) Wellness Guidelines");
                plan.setClinicalAdvice("Maintain a wholesome traditional balanced diet rich in color and variety.");
                break;
        }

        return plan;
    }
}
