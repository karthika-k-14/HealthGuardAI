import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Utensils,
  Droplets,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Siren,
  Phone,
  Navigation,
  Stethoscope,
  HeartPulse,
  Activity,
  RefreshCw,
  History,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Scale,
  Flame,
  Zap,
  Info,
  Save,
  Check,
  ArrowRight
} from 'lucide-react';
import { useCaseContext } from '../../contexts/CaseContext';
import { generateNutritionPlan, fetchNutritionHistory, fetchLatestNutritionPlan } from '../../api/nutritionApi';
import { fetchSymptomHistory } from '../../api/symptomApi';
import { fetchAllNearbyHealthcareFacilities } from '../../api/locationApi';
import Badge from '../../components/common/Badge';
import { PATHS } from '../../constants/routes';
import { cn } from '../../utils/cn';
import { isValidSymptomAssessment } from '../../utils/assessmentUtils';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCitizenProfile, updateCitizenProfile } from '../../api/citizenProfileApi';
import { SkeletonGrid } from '../../components/common/Skeleton';

const renderText = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.title || val.message || val.meal || val.condition || val.food || val.symptom || val.label || JSON.stringify(val);
  }
  return String(val);
};

const getArrayOfStrings = (arr) => {
  if (!arr) return [];
  const list = Array.isArray(arr) ? arr : (typeof arr === 'string' && arr.trim() ? arr.split(',') : [arr]);
  return list.map((item) => renderText(item).trim()).filter(Boolean);
};

// ============================================================================
// Clinical Nutrition Recommendation Engine
// Computes BMI, BMR, TDEE, Calorie targets, Macronutrients, Water intake,
// and Condition-Specific clinical recovery protocols (Fever, Diarrhea, Dengue,
// Malaria, Anemia, Diabetes, Hypertension, Underweight, Overweight)
// ============================================================================
function computeClinicalNutrition(profile, assessment = null) {
  const height = Number(profile?.height) || 0;
  const weight = Number(profile?.weight) || 0;
  const effectiveAge = Number(profile?.age) || (profile?.dateOfBirth ? Math.max(1, new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()) : 30);
  const gender = (profile?.gender || 'Other').toLowerCase();
  const chronicDiseases = (profile?.chronicDiseases || '').toLowerCase();
  const medicalHistory = (profile?.medicalHistory || '').toLowerCase();

  const symptomsText = Array.isArray(assessment?.symptoms)
    ? assessment.symptoms.map(s => String(s).toLowerCase()).join(' ')
    : String(assessment?.symptoms || '').toLowerCase();
  const predictionText = String(assessment?.prediction || assessment?.predictedCondition || '').toLowerCase();
  const allConditionsText = `${chronicDiseases} ${medicalHistory} ${symptomsText} ${predictionText}`;

  // 1. BMI calculation: weight (kg) / (height (m) ^ 2)
  const heightInMeters = height > 0 ? height / 100 : 1.65;
  const bmi = heightInMeters > 0 && weight > 0 ? +(weight / (heightInMeters * heightInMeters)).toFixed(1) : 22.0;

  let bmiCategory = 'Normal Weight';
  let bmiTone = 'brand';
  let weightGoal = 'Weight & Muscle Maintenance';
  let weightGoalSuggestion = 'Maintain healthy balanced caloric intake and physical activity.';

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiTone = 'amber';
    weightGoal = 'Healthy Weight Gain';
    weightGoalSuggestion = 'Target gradual caloric surplus (+350-500 kcal/day) with nutrient-dense proteins, healthy fats, and complex carbohydrates.';
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = 'Overweight';
    bmiTone = 'amber';
    weightGoal = 'Weight Management';
    weightGoalSuggestion = 'Target moderate caloric deficit (-400-500 kcal/day), high fiber intake, and portion control to attain healthy body mass index.';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiTone = 'rose';
    weightGoal = 'Structured Weight Loss';
    weightGoalSuggestion = 'Structured hypocaloric clinical diet, elimination of free sugars and processed trans fats, with regular physician monitoring.';
  }

  const minHealthyWeight = +(18.5 * heightInMeters * heightInMeters).toFixed(1);
  const maxHealthyWeight = +(24.9 * heightInMeters * heightInMeters).toFixed(1);

  // 2. Daily Caloric Requirement (Mifflin-St Jeor formula)
  let bmr = (10 * weight) + (6.25 * height) - (5 * effectiveAge);
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78;
  }
  bmr = Math.max(1000, Math.round(bmr));

  // TDEE with moderate activity factor (1.375)
  const tdee = Math.round(bmr * 1.375);

  let targetCalories = tdee;
  if (bmi < 18.5) {
    targetCalories = tdee + 400;
  } else if (bmi >= 25) {
    targetCalories = Math.max(1300, tdee - 450);
  }

  // 3. Protein Requirement (0.8 - 1.2 g / kg)
  const proteinGrams = Math.round(weight * (bmi < 18.5 ? 1.2 : 1.0));

  // 4. Water Intake (adjusted by conditions)
  let waterLiters = +(Math.max(2.0, (weight * 0.035))).toFixed(1);
  if (allConditionsText.includes('fever') || allConditionsText.includes('dengue')) {
    waterLiters = Math.max(waterLiters, 3.8);
  } else if (allConditionsText.includes('diarrhea') || allConditionsText.includes('diarrhoea') || allConditionsText.includes('malaria') || allConditionsText.includes('loose stool')) {
    waterLiters = Math.max(waterLiters, 3.2);
  }
  const waterGlasses = Math.round(waterLiters * 4);

  // 5. Macronutrients breakdown
  const carbGrams = Math.round((targetCalories * 0.50) / 4);
  const fatGrams = Math.round((targetCalories * 0.28) / 9);

  // 6. Condition-specific clinical warnings and protocols
  const conditionWarnings = [];

  // DENGUE
  if (allConditionsText.includes('dengue') || allConditionsText.includes('platelet') || allConditionsText.includes('thrombocytopen')) {
    conditionWarnings.push({
      type: 'DENGUE',
      title: 'Dengue Fever / Platelet Recovery Protocol',
      tone: 'amber',
      warning: 'Platelet count recovery and high-volume fluid replacement indicated.',
      recommendations: 'Tender coconut water, fresh kiwi, pomegranate, and 10-15 ml fresh papaya leaf extract. High-protein foods (paneer, boiled egg whites) and iron-rich foods (beetroot, moringa) support platelet regeneration. Drink fluids every 45 minutes.',
    });
  }

  // MALARIA
  if (allConditionsText.includes('malaria') || allConditionsText.includes('plasmodium')) {
    conditionWarnings.push({
      type: 'MALARIA',
      title: 'Malaria Clinical Recovery Protocol',
      tone: 'rose',
      warning: 'High-calorie tissue recovery and red blood cell rebuilding indicated.',
      recommendations: 'High-protein meals to reverse muscle catabolism from fever cycles. Replenish lysed red blood cells with iron & folate rich foods (moringa leaves, beetroot, jaggery, lentils, eggs/paneer). Ensure aggressive electrolyte rehydration for sweat/chill losses.',
    });
  }

  // DIARRHEA
  if (allConditionsText.includes('diarrhea') || allConditionsText.includes('diarrhoea') || allConditionsText.includes('loose stool') || allConditionsText.includes('dysentery') || allConditionsText.includes('stomach upset')) {
    conditionWarnings.push({
      type: 'DIARRHEA',
      title: 'Acute Diarrhea / Rehydration Protocol',
      tone: 'rose',
      warning: 'Mandatory WHO-standard ORS rehydration and gastrointestinal rest.',
      recommendations: 'Drink 200-300 ml ORS solution after every loose bowel movement. Follow the Indian BRAT protocol: ripe banana, white rice kanji, curd rice, stewed apple, dry toast. Strictly eliminate milk, oily gravies, raw salads, and spices until stool consistency firms.',
    });
  }

  // FEVER
  if (allConditionsText.includes('fever') || allConditionsText.includes('pyrexia') || allConditionsText.includes('chills') || allConditionsText.includes('temperature') || allConditionsText.includes('shivering')) {
    conditionWarnings.push({
      type: 'FEVER',
      title: 'Acute Febrile Illness Protocol',
      tone: 'amber',
      warning: 'Elevate hydration (3.5-4.0L), easy-to-digest carbs, high Vitamin C.',
      recommendations: 'Increase fluids with tender coconut water, warm boiled water, ORS, and clear broths. Eat soft, easily digestible foods like moong dal khichdi, steamed idli, and ragi kanji. Boost Vitamin C with amla and citrus to enhance immunity.',
    });
  }

  // DIABETES
  if (allConditionsText.includes('diabet') || allConditionsText.includes('sugar') || allConditionsText.includes('glucose') || allConditionsText.includes('hba1c')) {
    conditionWarnings.push({
      type: 'DIABETES',
      title: 'Diabetes / Blood Sugar Management Protocol',
      tone: 'amber',
      warning: 'Strict Low-Glycemic Index (GI) dietary protocol indicated.',
      recommendations: 'Prioritize unpolished millets (foxtail, ragi), fenugreek (methi), bitter gourd, and high-protein dals. Avoid all refined sugars, white bread, maida, potatoes, and sugary packaged juices.',
    });
  }

  // HYPERTENSION
  if (allConditionsText.includes('hypertens') || allConditionsText.includes('bp') || allConditionsText.includes('blood pressure')) {
    conditionWarnings.push({
      type: 'HYPERTENSION',
      title: 'Hypertension / DASH Low-Sodium Protocol',
      tone: 'rose',
      warning: 'Sodium restriction (< 2,000 mg/day) strictly recommended.',
      recommendations: 'Eliminate salty pickles, papad, commercial namkeen, and canned items. Increase potassium intake with fresh tender coconut water, bananas, and dark leafy greens.',
    });
  }

  // ANEMIA
  if (allConditionsText.includes('anem') || allConditionsText.includes('iron') || allConditionsText.includes('hemoglobin') || allConditionsText.includes('haemoglobin')) {
    conditionWarnings.push({
      type: 'ANEMIA',
      title: 'Anemia / Iron Replenishment Protocol',
      tone: 'purple',
      warning: 'Iron absorption protocol indicated.',
      recommendations: 'Consume drumstick (moringa) leaves, spinach, pomegranate, beetroot, dates, and jaggery. Always pair with Vitamin C (lemon juice, amla) for optimal absorption. Avoid tea/coffee near meal times.',
    });
  }

  // PREGNANCY
  if (allConditionsText.includes('pregnan') || allConditionsText.includes('trimester') || allConditionsText.includes('lactat')) {
    conditionWarnings.push({
      type: 'PREGNANCY',
      title: 'Maternal & Fetal Nutrition Protocol',
      tone: 'sky',
      warning: 'Increased requirements for calcium, folate, and iron.',
      recommendations: 'Include boiled eggs/paneer, fortified milk, lentils, and leafy greens. Avoid raw unpasteurized dairy, raw papaya, and excess caffeine.',
    });
  }

  return {
    bmi,
    bmiCategory,
    bmiTone,
    weightGoal,
    weightGoalSuggestion,
    minHealthyWeight,
    maxHealthyWeight,
    bmr,
    tdee,
    targetCalories,
    proteinGrams,
    waterLiters,
    waterGlasses,
    carbGrams,
    fatGrams,
    conditionWarnings
  };
}

export default function AINutritionPlanner() {
  const { latestAssessment, latestDiagnosis } = useCaseContext();
  const { user } = useAuth();
  
  // Resolve reliable user ID across AuthContext, user objects, or local storage
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  }, []);

  const currentUserId = user?.id || user?.userId || storedUser.id || storedUser.userId;
  
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [historyPlans, setHistoryPlans] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [hasLoadedHospitals, setHasLoadedHospitals] = useState(false);
  const [latestDbAssessment, setLatestDbAssessment] = useState(null);

  // 1. Fetch latest symptom assessment from backend database on mount
  useEffect(() => {
    if (currentUserId) {
      fetchSymptomHistory(currentUserId)
        .then((history) => {
          if (Array.isArray(history) && history.length > 0) {
            console.log('[NutritionPlanner] Loaded latest symptom assessment from DB:', history[0]);
            setLatestDbAssessment(history[0]);
          }
        })
        .catch((err) => console.warn('[NutritionPlanner] fetchSymptomHistory notice:', err?.message || err));
    }
  }, [currentUserId]);

  const currentAssessment = latestAssessment || latestDiagnosis || latestDbAssessment;

  // Inline profile completion form state
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formHeight, setFormHeight] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formConditions, setFormConditions] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Check if real valid symptom assessment exists
  const hasAssessment = isValidSymptomAssessment(currentAssessment);
  const rawSeverity = (currentAssessment?.riskLevel || currentAssessment?.severity || 'LOW').toUpperCase();
  const severity = rawSeverity === 'MEDIUM' ? 'MODERATE' : rawSeverity;
  const isHighRisk = severity === 'HIGH' || severity === 'CRITICAL' || severity === 'EMERGENCY';
  const conditionName = renderText(currentAssessment?.prediction || currentAssessment?.predictedCondition, 'General Health Check');
  const symptoms = currentAssessment?.symptoms || [];
  const possibleConditions = currentAssessment?.possibleConditions || [conditionName];

  // 1. Fetch citizen profile on mount
  useEffect(() => {
    if (currentUserId) {
      setLoadingProfile(true);
      console.log('[NutritionPlanner] Fetching profile for user ID:', currentUserId);
      fetchCitizenProfile(currentUserId)
        .then((data) => {
          console.log('[NutritionPlanner] Profile loaded successfully:', data);
          setProfile(data);
          if (data) {
            setFormAge(data.age || (data.dateOfBirth ? Math.max(1, new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()) : ''));
            setFormGender(data.gender || '');
            setFormHeight(data.height || '');
            setFormWeight(data.weight || '');
            setFormConditions(data.chronicDiseases || '');
            setFormVillage(data.address || data.villageName || data.district || '');
          }
          setLoadingProfile(false);
        })
        .catch((err) => {
          console.error('[NutritionPlanner] Profile API failure:', err?.message || err);
          setProfile(null);
          setLoadingProfile(false);
        });
    } else {
      console.warn('[NutritionPlanner] No user ID detected in session');
      setLoadingProfile(false);
    }
  }, [currentUserId]);

  // 2. Profile Validation Check
  // Mandatory fields: age (or dateOfBirth), gender, height, weight
  const effectiveAge = profile?.age || (profile?.dateOfBirth ? Math.max(1, new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()) : null);
  const hasAge = Boolean(effectiveAge && Number(effectiveAge) > 0);
  const hasGender = Boolean(profile?.gender && String(profile.gender).trim());
  const hasHeight = Boolean(profile?.height && Number(profile.height) > 0);
  const hasWeight = Boolean(profile?.weight && Number(profile.weight) > 0);
  const isProfileComplete = Boolean(profile && hasAge && hasGender && hasHeight && hasWeight);

  // Log validation status
  useEffect(() => {
    if (!loadingProfile) {
      if (isProfileComplete) {
        console.log('[NutritionPlanner] Validation Success - Profile complete with mandatory fields (age, gender, height, weight).');
      } else {
        console.warn('[NutritionPlanner] Validation Failure - Profile incomplete. Missing mandatory fields:', {
          age: !hasAge,
          gender: !hasGender,
          height: !hasHeight,
          weight: !hasWeight
        });
      }
    }
  }, [loadingProfile, isProfileComplete, hasAge, hasGender, hasHeight, hasWeight]);

  // 3. Compute Clinical Metrics using profile & linked assessment
  const clinical = useMemo(() => {
    if (!profile || !isProfileComplete) return null;
    return computeClinicalNutrition(profile, currentAssessment);
  }, [profile, isProfileComplete, currentAssessment]);

  // 4. Load latest nutrition plan and history from backend
  useEffect(() => {
    if (currentUserId && isProfileComplete) {
      console.log('[NutritionPlanner] Loading latest nutrition plan from backend for user ID:', currentUserId);
      fetchLatestNutritionPlan(currentUserId).then((plan) => {
        if (plan) {
          console.log('[NutritionPlanner] Retrieved latest saved plan:', plan);
          setActivePlan(plan);
        }
      }).catch((err) => {
        console.warn('[NutritionPlanner] fetchLatestNutritionPlan notice:', err?.message || err);
      });

      fetchNutritionHistory(currentUserId).then((history) => {
        if (Array.isArray(history)) {
          setHistoryPlans(history);
        }
      }).catch((err) => {
        console.warn('[NutritionPlanner] fetchNutritionHistory notice:', err?.message || err);
      });
    }
  }, [currentUserId, isProfileComplete]);

  const [selectedCondition, setSelectedCondition] = useState('GENERAL');

  // 5. Generate Personalized AI Nutrition Plan (with force regeneration and condition selection support)
  const handleGeneratePlan = useCallback(async (targetCondition = null, force = false) => {
    if (!isProfileComplete || isHighRisk || !currentUserId || isGenerating) return;

    setIsGenerating(true);

    let assessmentToUse = currentAssessment;
    if (force && currentUserId && !targetCondition) {
      try {
        const freshHistory = await fetchSymptomHistory(currentUserId);
        if (Array.isArray(freshHistory) && freshHistory.length > 0) {
          assessmentToUse = freshHistory[0];
          setLatestDbAssessment(freshHistory[0]);
        }
      } catch (e) {
        console.warn('Could not re-fetch symptom history on regenerate:', e);
      }
    }

    const activeSymptoms = assessmentToUse?.symptoms
      ? (Array.isArray(assessmentToUse.symptoms) ? assessmentToUse.symptoms : [assessmentToUse.symptoms])
      : symptoms;
    const symptomsList = getArrayOfStrings(activeSymptoms);
    const chosenCondition = targetCondition || selectedCondition || assessmentToUse?.prediction || conditionName;
    const activeRisk = (assessmentToUse?.riskLevel || severity || 'LOW').toUpperCase();

    const payload = {
      userId: currentUserId,
      citizenId: currentUserId,
      condition: chosenCondition,
      disease: chosenCondition,
      symptoms: symptomsList.length > 0 ? symptomsList : ['General Nutrition & Health Maintenance'],
      riskLevel: activeRisk === 'MEDIUM' ? 'MODERATE' : activeRisk,
      possibleConditions: [chosenCondition],
      age: effectiveAge,
      gender: profile?.gender,
      allergies: profile?.allergies || 'None reported',
      medicalHistory: profile?.medicalHistory || profile?.chronicDiseases || 'None reported',
      healthProfile: `Height: ${profile?.height}cm, Weight: ${profile?.weight}kg, BMI: ${clinical?.bmi || 'Normal'}, Goal: ${clinical?.weightGoal || 'Maintenance'}`
    };

    console.log('[NutritionPlanner] Generating Condition-Aware AI Nutrition Plan with inputs:', {
      condition: chosenCondition,
      age: effectiveAge,
      gender: profile?.gender,
      height: profile?.height,
      weight: profile?.weight,
      bmi: clinical?.bmi,
      symptomCheckerResult: symptomsList,
      riskLevel: activeRisk
    });

    try {
      const plan = await generateNutritionPlan(payload);
      if (plan) {
        console.log('[NutritionPlanner] Nutrition generation response:', plan);
        setActivePlan(plan);
        if (targetCondition) setSelectedCondition(targetCondition);
        toast.success(`Personalized ${chosenCondition} nutrition plan generated!`);
        
        // Refresh history
        const history = await fetchNutritionHistory(currentUserId);
        if (Array.isArray(history)) setHistoryPlans(history);
      } else {
        console.warn('[NutritionPlanner] Backend returned empty plan.');
        toast.error('AI nutrition service returned no plan. Please try again.');
      }
    } catch (err) {
      console.error('[NutritionPlanner] Nutrition generation API error:', err);
      toast.error('Unable to reach AI service. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [isProfileComplete, isHighRisk, currentUserId, isGenerating, currentAssessment, symptoms, conditionName, severity, effectiveAge, profile, clinical, selectedCondition]);

  // Automatically generate on initial load if profile is complete and no plan exists
  useEffect(() => {
    if (isProfileComplete && !isHighRisk && !activePlan && !isGenerating) {
      handleGeneratePlan();
    }
  }, [isProfileComplete, isHighRisk, activePlan, isGenerating, handleGeneratePlan]);

  // Load emergency facilities if high risk
  useEffect(() => {
    if (isHighRisk && !hasLoadedHospitals) {
      fetchAllNearbyHealthcareFacilities(11.0168, 76.9558).then((res) => {
        setNearbyHospitals((res.hospitals || []).slice(0, 3));
        setHasLoadedHospitals(true);
      });
    }
  }, [isHighRisk, hasLoadedHospitals]);

  // Handle Quick Profile Submission
  const handleQuickProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formAge || !formGender || !formHeight || !formWeight) {
      toast.error('Please enter all mandatory fields: Age, Gender, Height, and Weight.');
      return;
    }

    setIsSavingProfile(true);
    console.log('[NutritionPlanner] Saving citizen profile details:', {
      age: formAge,
      gender: formGender,
      height: formHeight,
      weight: formWeight,
      chronicDiseases: formConditions
    });

    try {
      const birthYear = new Date().getFullYear() - Number(formAge);
      const approxDob = `${birthYear}-01-01`;

      const updated = await updateCitizenProfile(currentUserId, {
        gender: formGender,
        height: Number(formHeight),
        weight: Number(formWeight),
        dateOfBirth: approxDob,
        chronicDiseases: formConditions || null,
        address: formVillage || null,
      });

      console.log('[NutritionPlanner] Profile update response:', updated);
      setProfile(updated);
      toast.success('Health profile saved! Generating your nutrition plan...');
    } catch (err) {
      console.error('[NutritionPlanner] Failed to save profile:', err);
      toast.error('Failed to update profile. Please try again or visit Profile page.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCallEmergency = (phone = '108') => {
    toast(`Calling Emergency Services (${phone})...`, { icon: '📞' });
  };

  const handleNavigate = (hospital) => {
    const lat = hospital.lat || 11.0168;
    const lon = hospital.lon || hospital.lng || 76.9558;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`, '_blank');
  };

  // State 1: Profile Loading
  if (loadingProfile) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-12 pt-6">
        <div className="surface-card p-8 text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Loading your clinical health profile and nutrition plan...
          </p>
        </div>
        <SkeletonGrid count={3} className="grid gap-4" />
      </div>
    );
  }

  // State 2: Incomplete Profile Screen
  // ONLY shown when mandatory fields (age, gender, height, weight) are missing
  if (!isProfileComplete) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-12 pt-4">
        <div className="surface-card p-6 sm:p-10 border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.04] to-transparent shadow-xl rounded-3xl">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/10">
              <User className="h-8 w-8" />
            </div>

            <div>
              <span className="section-eyebrow justify-center">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" /> AI Clinical Nutrition Planner
              </span>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Complete your health profile to generate a nutrition plan
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Personalized dietary calories, BMI classification, hydration targets, and meal schedules require your physical demographics.
              </p>
            </div>

            {/* Validation Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div className={cn("p-2 rounded-xl border flex items-center gap-1.5 justify-center font-medium", hasAge ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : "bg-amber-500/10 text-amber-700 border-amber-500/30")}>
                {hasAge ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                <span>Age {hasAge ? `(${effectiveAge}y)` : 'Needed'}</span>
              </div>
              <div className={cn("p-2 rounded-xl border flex items-center gap-1.5 justify-center font-medium", hasGender ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : "bg-amber-500/10 text-amber-700 border-amber-500/30")}>
                {hasGender ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                <span>Gender {hasGender ? `(${profile?.gender})` : 'Needed'}</span>
              </div>
              <div className={cn("p-2 rounded-xl border flex items-center gap-1.5 justify-center font-medium", hasHeight ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : "bg-amber-500/10 text-amber-700 border-amber-500/30")}>
                {hasHeight ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                <span>Height {hasHeight ? `(${profile?.height}cm)` : 'Needed'}</span>
              </div>
              <div className={cn("p-2 rounded-xl border flex items-center gap-1.5 justify-center font-medium", hasWeight ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : "bg-amber-500/10 text-amber-700 border-amber-500/30")}>
                {hasWeight ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                <span>Weight {hasWeight ? `(${profile?.weight}kg)` : 'Needed'}</span>
              </div>
            </div>
          </div>

          {/* Quick Profile Form */}
          <form onSubmit={handleQuickProfileSubmit} className="mt-8 rounded-2xl bg-white/70 dark:bg-white/[0.03] p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-brand-500" /> Enter Required Health Metrics
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-text">Age <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 28"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label-text">Gender <span className="text-rose-500">*</span></label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="label-text">Height (cm) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  min="40"
                  max="250"
                  placeholder="e.g. 162"
                  value={formHeight}
                  onChange={(e) => setFormHeight(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label-text">Weight (kg) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="300"
                  placeholder="e.g. 58"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label-text">Village / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore Village"
                  value={formVillage}
                  onChange={(e) => setFormVillage(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-text">Chronic Conditions / Health History</label>
                <input
                  type="text"
                  placeholder="e.g. Diabetes, Hypertension, Anemia, None"
                  value={formConditions}
                  onChange={(e) => setFormConditions(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-white/10">
              <Link
                to="/profile"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Go to Full Profile Page</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-xs font-bold shadow-md cursor-pointer"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save & Generate Nutrition Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // State 3: Profile Completed -> Render Full Production AI Nutrition Planner
  // ============================================================================
  const CONDITION_OPTIONS = [
    { id: 'GENERAL', label: 'Balanced General', icon: '🥗' },
    { id: 'FEVER', label: 'Fever (Hydration & ORS)', icon: '🌡️' },
    { id: 'DIABETES', label: 'Diabetes (Low GI & Fiber)', icon: '🩺' },
    { id: 'HYPERTENSION', label: 'Hypertension (DASH Diet)', icon: '❤️' },
    { id: 'ANEMIA', label: 'Anemia (Iron & Vit C)', icon: '🩸' },
    { id: 'MALNUTRITION', label: 'Malnutrition (High Protein)', icon: '💪' },
  ];

  const meals = {
    breakfast: renderText(activePlan?.breakfast, ''),
    midMorning: renderText(activePlan?.midMorning, ''),
    lunch: renderText(activePlan?.lunch, ''),
    eveningSnack: renderText(activePlan?.eveningSnack || activePlan?.healthySnacks, ''),
    dinner: renderText(activePlan?.dinner, ''),
    healthySnacks: renderText(activePlan?.healthySnacks, ''),
    hydrationGoal: renderText(activePlan?.hydrationGoal || (activePlan?.dailyWaterGoalLiters ? `${activePlan.dailyWaterGoalLiters} Liters daily` : ''), `${clinical?.waterLiters || '2.5'} Liters daily`),
    recoveryTips: renderText(Array.isArray(activePlan?.clinicalRecoveryTips) ? activePlan.clinicalRecoveryTips.join('. ') : activePlan?.recoveryTips, ''),
    medicalAdvice: renderText(activePlan?.clinicalAdvice || activePlan?.medicalAdvice, ''),
    governmentScheme: renderText(activePlan?.governmentNutritionScheme, ''),
    targetCondition: activePlan?.targetCondition || selectedCondition,
    foodsRecommended: getArrayOfStrings(activePlan?.foodsRecommended),
    foodsToAvoid: getArrayOfStrings(activePlan?.foodsToAvoid),
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-14 pt-2">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="section-eyebrow">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" /> Evidence-Based Clinical Nutrition
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              AI Nutrition & Diet Planner
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Personalized dietary protocol for <span className="font-semibold text-slate-800 dark:text-slate-200">{profile?.fullName || profile?.name || 'Citizen'}</span> ({effectiveAge}y, {profile?.gender}) • Village: {profile?.address || profile?.district || 'Coimbatore'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isHighRisk && (
              <button
                type="button"
                onClick={() => handleGeneratePlan(true)}
                disabled={isGenerating}
                className="btn-primary text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                <span>{isGenerating ? 'Computing Plan...' : 'Regenerate Plan'}</span>
              </button>
            )}
            <Link
              to="/profile"
              className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <User className="h-4 w-4 text-brand-500" />
              <span>Edit Health Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI/ML Verification & Evidence-Based Health Link Banner */}
      {!isHighRisk && (
        <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50/90 via-emerald-50/60 to-white p-5 dark:border-brand-900/50 dark:from-brand-950/40 dark:via-slate-900 dark:to-slate-900 shadow-sm space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Clinical AI Nutrition Engine
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    ✓ Verified Active
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                  Generated using profile + latest symptom assessment
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGeneratePlan(true)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-brand-600 dark:text-brand-400", isGenerating && "animate-spin")} />
              <span>Regenerate for Latest Symptoms</span>
            </button>
          </div>

          {/* Logged Clinical Inputs & Condition Status */}
          <div className="flex flex-wrap items-center gap-2 border-t border-brand-200/50 pt-3 dark:border-brand-900/40 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 font-semibold text-slate-800 shadow-2xs dark:bg-slate-900 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800">
              <Activity className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
              Detected Condition: <span className="text-brand-600 dark:text-brand-400">{conditionName || 'General Health Profile'}</span>
            </span>
            {symptoms && (Array.isArray(symptoms) ? symptoms.length > 0 : String(symptoms).trim()) && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 font-medium text-slate-700 shadow-2xs dark:bg-slate-900 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800">
                Symptoms: {Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 font-medium text-slate-700 shadow-2xs dark:bg-slate-900 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800">
              BMI: {clinical?.bmi || 'Normal'} ({clinical?.bmiCategory || 'Normal Weight'})
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 font-medium text-slate-700 shadow-2xs dark:bg-slate-900 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800">
              Target: {clinical?.targetCalories || 2000} kcal/day · {clinical?.waterLiters || 2.5}L Hydration Target
            </span>
            {currentAssessment?.timestamp && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-slate-500 shadow-2xs dark:bg-slate-900 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800">
                Assessed: {new Date(currentAssessment.timestamp).toLocaleDateString()} {new Date(currentAssessment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* High Risk Warning Banner (if High or Critical Risk detected from symptom checker) */}
      {isHighRisk && (
        <div className="rounded-3xl bg-rose-600 text-white p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white">
            <AlertTriangle className="h-10 w-10 animate-pulse" />
          </div>
          <div className="space-y-1.5 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold">
              Immediate Medical Evaluation Recommended
            </h2>
            <p className="text-xs text-rose-100 leading-relaxed font-medium">
              Your recent symptom analysis indicates an elevated risk level. Routine dietary meal plans are withheld during acute episodes to prioritize emergency clinical consultation.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleCallEmergency('108')}
              className="btn bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 px-5 py-2.5 rounded-xl shadow"
            >
              <Phone className="h-4 w-4" /> Call 108 Emergency
            </button>
            <Link
              to={PATHS.CITIZEN_EMERGENCY}
              className="btn bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/20"
            >
              <Siren className="h-4 w-4" /> Emergency Center
            </Link>
          </div>
        </div>
      )}

      {/* 4 Key Physical & Clinical Metric Cards (BMI, Calories, Water, Protein) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. BMI Card */}
        <div className="surface-card p-5 border-t-4 border-t-brand-500 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-brand-500" /> Body Mass Index
            </span>
            <Badge tone={clinical?.bmiTone || 'brand'}>{clinical?.bmiCategory || 'Normal'}</Badge>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {clinical?.bmi || '22.0'}
              </span>
              <span className="text-xs text-slate-400 font-medium">kg/m²</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Healthy weight for {profile?.height} cm: <span className="font-semibold text-slate-700 dark:text-slate-300">{clinical?.minHealthyWeight} - {clinical?.maxHealthyWeight} kg</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            Goal: <span className="font-bold text-brand-600 dark:text-brand-400">{clinical?.weightGoal}</span>
          </div>
        </div>

        {/* 2. Daily Calorie Requirement Card */}
        <div className="surface-card p-5 border-t-4 border-t-amber-500 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-500" /> Daily Calorie Target
            </span>
            <Badge tone="amber">TDEE</Badge>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {clinical?.targetCalories || '1850'}
              </span>
              <span className="text-xs text-slate-400 font-medium">kcal / day</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              BMR: {clinical?.bmr} kcal • Maintenance TDEE: {clinical?.tdee} kcal
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
            <span>Carbs: <strong className="text-slate-900 dark:text-white">{clinical?.carbGrams}g</strong></span>
            <span>Fats: <strong className="text-slate-900 dark:text-white">{clinical?.fatGrams}g</strong></span>
          </div>
        </div>

        {/* 3. Water Intake Card */}
        <div className="surface-card p-5 border-t-4 border-t-sky-500 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-sky-500" /> Daily Water Intake
            </span>
            <Badge tone="sky">Hydration</Badge>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {clinical?.waterLiters || '2.5'}
              </span>
              <span className="text-xs text-slate-400 font-medium">Liters / day</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Approx. <span className="font-semibold text-slate-700 dark:text-slate-300">{clinical?.waterGlasses || '10'} standard glasses</span> daily
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-sky-600 dark:text-sky-400 font-medium">
            35 ml per kg body weight
          </div>
        </div>

        {/* 4. Protein Target Card */}
        <div className="surface-card p-5 border-t-4 border-t-emerald-500 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-500" /> Protein Requirement
            </span>
            <Badge tone="emerald">Lean Mass</Badge>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {clinical?.proteinGrams || '58'}
              </span>
              <span className="text-xs text-slate-400 font-medium">grams / day</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              1.0g per kg of body weight for tissue repair
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Dals, paneer, sprouts, eggs
          </div>
        </div>
      </div>

      {/* Weight Management & Health Recommendations Section */}
      <div className="surface-card p-6 border-l-4 border-l-brand-500 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-brand-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Health Recommendations & Clinical Protocols
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Tailored to {effectiveAge}y {profile?.gender} • BMI: {clinical?.bmi}
          </span>
        </div>

        {/* Weight Suggestion */}
        <div className="p-4 rounded-2xl bg-brand-500/[0.05] border border-brand-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-brand-700 dark:text-brand-300 font-bold">Weight Strategy ({clinical?.weightGoal}):</strong> {clinical?.weightGoalSuggestion}
        </div>

        {/* Condition Warnings (Diabetes, Hypertension, Anemia, Pregnancy) */}
        {clinical?.conditionWarnings && clinical.conditionWarnings.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            {clinical.conditionWarnings.map((w, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-2xl border space-y-1.5 text-xs",
                  w.tone === 'amber' && "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200",
                  w.tone === 'rose' && "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200",
                  w.tone === 'purple' && "bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200",
                  w.tone === 'sky' && "bg-sky-500/10 border-sky-500/30 text-sky-900 dark:text-sky-200"
                )}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{w.title}</span>
                </div>
                <p className="font-semibold">{w.warning}</p>
                <p className="text-[11px] opacity-90 leading-relaxed">{w.recommendations}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>No chronic dietary restrictions detected. Maintain a diverse balanced diet rich in local seasonal vegetables and whole grains.</span>
          </div>
        )}
      </div>

      {/* Condition-Specific Clinical Protocol Selector */}
      <div className="surface-card p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              Select Condition-Specific Clinical Diet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate visibly distinct clinical recovery plans adapted to specific acute or chronic conditions.
            </p>
          </div>
          {meals.targetCondition && (
            <Badge tone="brand" className="self-start sm:self-auto font-mono">
              Active: {meals.targetCondition}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {CONDITION_OPTIONS.map((opt) => {
            const isSelected = (selectedCondition === opt.id) || (meals.targetCondition === opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedCondition(opt.id);
                  handleGeneratePlan(opt.id, true);
                }}
                disabled={isGenerating}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  isSelected
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                )}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Meal Personalized Daily Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="h-5 w-5 text-brand-500" />
            Daily Personalized Meal Schedule
          </h2>
          {isGenerating && (
            <span className="text-xs font-semibold text-brand-500 animate-pulse flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Generating via AI...
            </span>
          )}
        </div>

        {activePlan ? (
          <>
            <div className="grid gap-4 md:grid-cols-5">
              {/* 1. Breakfast */}
              <div className="surface-card p-4 border-t-4 border-t-emerald-500 flex flex-col justify-between rounded-2xl">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🥣</span> Breakfast
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">7:30 - 8:30 AM</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {meals.breakfast || 'Consult clinician for personalized breakfast.'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-white/5">Energy & Fiber Focus</span>
              </div>

              {/* 2. Mid-Morning */}
              <div className="surface-card p-4 border-t-4 border-t-sky-500 flex flex-col justify-between rounded-2xl">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🥛</span> Mid-Morning
                    </h3>
                    <span className="text-[10px] font-semibold text-sky-600 bg-sky-500/10 px-1.5 py-0.5 rounded">10:30 - 11:00 AM</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {meals.midMorning || 'Tender coconut water or fresh fruits.'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-white/5">Hydration & Electrolytes</span>
              </div>

              {/* 3. Lunch */}
              <div className="surface-card p-4 border-t-4 border-t-amber-500 flex flex-col justify-between rounded-2xl">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🍛</span> Lunch
                    </h3>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">1:00 - 2:00 PM</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {meals.lunch || 'Balanced whole grain meal with lentils and vegetables.'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-white/5">Primary Protein & Macros</span>
              </div>

              {/* 4. Evening Snack */}
              <div className="surface-card p-4 border-t-4 border-t-purple-500 flex flex-col justify-between rounded-2xl">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>☕</span> Evening Snack
                    </h3>
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded">4:30 - 5:30 PM</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {meals.eveningSnack || 'Roasted pulses, herbal tea, or boiled legumes.'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-white/5">Low-GI Sustained Energy</span>
              </div>

              {/* 5. Dinner */}
              <div className="surface-card p-4 border-t-4 border-t-indigo-500 flex flex-col justify-between rounded-2xl">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🍲</span> Dinner
                    </h3>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-500/10 px-1.5 py-0.5 rounded">7:30 - 8:30 PM</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {meals.dinner || 'Light easily digestible evening meal.'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-white/5">Easily Digestible Recovery</span>
              </div>
            </div>

            {/* Foods Recommended vs Foods to Avoid Cards */}
            {(meals.foodsRecommended.length > 0 || meals.foodsToAvoid.length > 0) && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Recommended Foods */}
                {meals.foodsRecommended.length > 0 && (
                  <div className="surface-card p-6 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                      <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Foods Recommended For Your Profile
                      </h3>
                      <Badge tone="emerald">Beneficial</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {meals.foodsRecommended.map((food, idx) => (
                        <span
                          key={idx}
                          className="rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 px-3 py-1 text-xs font-medium"
                        >
                          ✓ {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Foods To Avoid */}
                {meals.foodsToAvoid.length > 0 && (
                  <div className="surface-card p-6 bg-rose-500/[0.03] border border-rose-500/20 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
                      <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-rose-500" /> Foods To Minimize Or Avoid
                      </h3>
                      <Badge tone="rose">Restricted</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {meals.foodsToAvoid.map((food, idx) => (
                        <span
                          key={idx}
                          className="rounded-xl bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20 px-3 py-1 text-xs font-medium"
                        >
                          ✕ {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Clinical Guidance & Recovery Tips */}
            {(meals.recoveryTips || meals.medicalAdvice) && (
              <div className="surface-card p-6 rounded-3xl border-l-4 border-l-emerald-500 space-y-3">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Clinical Recovery Guidance & Lifestyle Protocol
                  </h3>
                </div>
                {meals.recoveryTips && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/60 dark:border-white/10">
                    {meals.recoveryTips}
                  </p>
                )}
                {meals.medicalAdvice && (
                  <p className="text-[11px] text-slate-400 italic">
                    {meals.medicalAdvice}
                  </p>
                )}
                {meals.governmentScheme && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 flex items-start gap-2.5">
                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-200">Public Health & Nutritional Scheme</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{meals.governmentScheme}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="surface-card p-10 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/20 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Utensils className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                No AI Nutrition Plan Generated Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Click below to generate a tailored, 5-meal daily dietary and recovery schedule powered by HealthGuard AI based on your demographics and latest symptoms.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleGeneratePlan(true)}
              disabled={isGenerating}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-md cursor-pointer"
            >
              <Sparkles className={cn("h-4 w-4", isGenerating && "animate-spin")} />
              <span>{isGenerating ? 'Generating AI Nutrition Plan...' : 'Generate AI Nutrition Plan'}</span>
            </button>
          </div>
        )}
      </div>

      {/* History of Previous Generated Plans */}
      <div className="surface-card p-6 rounded-3xl">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowHistory((s) => !s)}
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Plan History & Previous Records ({historyPlans.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-600">
            {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {showHistory && (
          <div className="mt-4 border-t border-slate-200/60 dark:border-white/10 pt-4 space-y-3">
            {historyPlans.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No previous nutrition plans saved yet.</p>
            ) : (
              historyPlans.map((hp) => (
                <div
                  key={hp.id}
                  className="rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/10 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {hp.healthProfile || 'General Plan'}
                      </span>
                      <Badge tone={hp.isHighRisk ? 'rose' : 'brand'}>
                        {hp.riskLevel || 'LOW'} Risk
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {hp.createdAt ? new Date(hp.createdAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 pt-1 text-slate-600 dark:text-slate-300">
                    <div><span className="font-bold">Breakfast:</span> {renderText(hp.breakfast)}</div>
                    <div><span className="font-bold">Lunch:</span> {renderText(hp.lunch)}</div>
                    <div><span className="font-bold">Dinner:</span> {renderText(hp.dinner)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
