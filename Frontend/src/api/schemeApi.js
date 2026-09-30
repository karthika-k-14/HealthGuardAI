import apiClient from './axios';

/**
 * High-quality seed data matching Government Health Schemes requirements.
 * Used as reliable fallback if citizen-service is starting up or in offline mode.
 */
export const FALLBACK_SCHEMES = [
  // =================== INFANTS & CHILDREN (0 - 18 YEARS) ===================
  {
    id: 1,
    schemeName: 'Universal Immunization Programme (UIP) & Mission Indradhanush',
    description: 'One of the world\'s largest public health immunization drives providing 100% free vaccines against 12 life-threatening diseases for infants and children.',
    benefits: 'Free vaccination against TB, Diphtheria, Pertussis, Tetanus, Polio, Hepatitis B, Pneumonia, Measles, Rubella, Japanese Encephalitis, and Rotavirus; Digital U-WIN vaccination certificate & booster tracking.',
    eligibilityCriteria: 'All infants and children aged 0 to 5 years, plus dropouts and unvaccinated children up to 16 years.',
    officialLink: 'https://nhm.gov.in',
    applicationLink: 'https://uwin.mohfw.gov.in',
    requiredDocuments: 'Parent Aadhaar Card, Child Birth Certificate / MCP Card, Active Mobile Number.',
    state: 'All India',
    category: 'Immunization',
    ageGroup: '0-18',
    eligibleAgeLabel: '0 - 5 Years (Infants & Young Children)',
    isActive: true,
  },
  {
    id: 2,
    schemeName: 'Rashtriya Bal Swasthya Karyakram (RBSK)',
    description: 'National child health screening and early intervention service for all children from birth to 18 years covering the 4Ds: Defects at birth, Deficiencies, Diseases, and Development delays including disability.',
    benefits: 'Free screening by mobile health teams; Free corrective surgeries for congenital heart defects, cleft lip/palate, clubfoot, and congenital cataract at District Early Intervention Centres (DEIC).',
    eligibilityCriteria: 'All children from birth to 18 years enrolled in Anganwadis, government/aided schools, and newborns delivered at public hospitals.',
    officialLink: 'https://nhm.gov.in',
    applicationLink: 'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=818&lid=221',
    requiredDocuments: 'School/Anganwadi ID, Child/Parent Aadhaar Card, DEIC Referral Slip.',
    state: 'All India',
    category: 'Child Health',
    ageGroup: '0-18',
    eligibleAgeLabel: '0 - 18 Years (Children & Students)',
    isActive: true,
  },
  {
    id: 3,
    schemeName: 'Janani Shishu Suraksha Karyakram (JSSK)',
    description: 'Guarantees zero out-of-pocket expenditure for treatment, diagnostics, drugs, diet, and emergency transport for all sick infants up to 1 year of age.',
    benefits: '100% free inpatient treatment and neonatal intensive care (SNCU/NICU); Free medicines, blood transfusions, and free pick-up & drop transport.',
    eligibilityCriteria: 'All sick newborns and infants up to 1 year receiving care at public health facilities.',
    officialLink: 'https://nhm.gov.in',
    applicationLink: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=310',
    requiredDocuments: 'Mother MCP Card, Hospital Discharge/Admission Slip, Parent ID.',
    state: 'All India',
    category: 'Child Health',
    ageGroup: '0-18',
    eligibleAgeLabel: '0 - 1 Year (Sick Newborns & Infants)',
    isActive: true,
  },
  {
    id: 4,
    schemeName: 'POSHAN Abhiyaan (National Nutrition Mission)',
    description: 'Multi-ministerial convergence mission aimed at reducing stunting, under-nutrition, anemia among young children, adolescent girls, and pregnant/lactating mothers.',
    benefits: 'Monthly nutritional take-home ration (THR), growth monitoring, fortified supplementary foods, and micro-nutrient tracking via Poshan Tracker.',
    eligibilityCriteria: 'Children aged 6 months to 6 years registered at local Anganwadi centres; Malnourished and underweight children.',
    officialLink: 'https://poshanabhiyaan.gov.in',
    applicationLink: 'https://poshantracker.in',
    requiredDocuments: 'Aadhaar Card of mother/father, Child Birth Certificate, Anganwadi Registration.',
    state: 'All India',
    category: 'Child Health',
    ageGroup: '0-18',
    eligibleAgeLabel: '6 Months - 6 Years (Pre-school Children)',
    isActive: true,
  },
  {
    id: 5,
    schemeName: 'National Deworming Day (NDD) Campaign',
    description: 'Bi-annual mass deworming programme to eradicate Soil-Transmitted Helminths (STH) and improve cognitive development and nutritional status.',
    benefits: 'Free age-appropriate Albendazole (400mg) chewable tablet distribution twice a year; Health education on personal hygiene and sanitation.',
    eligibilityCriteria: 'All preschool and school-age children aged 1 to 19 years.',
    officialLink: 'https://nhm.gov.in',
    applicationLink: 'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1067&lid=378',
    requiredDocuments: 'School enrollment / Anganwadi attendance.',
    state: 'All India',
    category: 'Child Health',
    ageGroup: '0-18',
    eligibleAgeLabel: '1 - 19 Years (Preschool to College)',
    isActive: true,
  },

  // =================== ADOLESCENTS & YOUTHS (10 - 19 YEARS) ===================
  {
    id: 6,
    schemeName: 'Rashtriya Kishor Swasthya Karyakram (RKSK)',
    description: 'Holistic adolescent health programme addressing sexual/reproductive health, mental health, injuries & violence, substance misuse, and non-communicable diseases.',
    benefits: 'Dedicated Adolescent Friendly Health Clinics (AFHC / Ujala Clinics); Peer educator network; Free weekly iron & folic acid; Free confidential clinical counselling.',
    eligibilityCriteria: 'All adolescents aged 10 to 19 years (both girls and boys, in-school and out-of-school, married and unmarried).',
    officialLink: 'https://nhm.gov.in',
    applicationLink: 'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=823&lid=226',
    requiredDocuments: 'School ID or Student Aadhaar Card.',
    state: 'All India',
    category: 'Adolescent Health',
    ageGroup: '10-19',
    eligibleAgeLabel: '10 - 19 Years (Adolescents)',
    isActive: true,
  },
  {
    id: 7,
    schemeName: 'Anemia Mukt Bharat (AMB) Adolescent Programme',
    description: 'Intensified national strategy to eliminate iron deficiency anemia through the 6x6x6 intervention framework.',
    benefits: 'Weekly Iron and Folic Acid Supplementation (WIFS - Blue tablet) distributed free at schools and Anganwadis; Bi-annual deworming; Digital Hemoglobin screening.',
    eligibilityCriteria: 'Adolescent boys and girls aged 10 to 19 years studying in government/aided schools or rural communities.',
    officialLink: 'https://anemiamuktbharat.info',
    applicationLink: 'https://anemiamuktbharat.info',
    requiredDocuments: 'School ID Card or Aadhaar Card.',
    state: 'All India',
    category: 'Adolescent Health',
    ageGroup: '10-19',
    eligibleAgeLabel: '10 - 19 Years (Teens & Students)',
    isActive: true,
  },
  {
    id: 8,
    schemeName: 'Scheme for Promotion of Menstrual Hygiene (MHS)',
    description: 'Government initiative to promote menstrual health, dignity, and hygiene among rural adolescent girls.',
    benefits: 'High-quality sanitary napkin packs ("Freedays") provided at heavily subsidized cost of ₹6 per pack of 6 pads through village ASHA workers; Safe disposal training.',
    eligibilityCriteria: 'Rural adolescent girls aged 10 to 19 years.',
    officialLink: 'https://nhm.gov.in',
    applicationLink: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=848&lid=316',
    requiredDocuments: 'Aadhaar Card or local residence certificate.',
    state: 'All India',
    category: 'Adolescent Health',
    ageGroup: '10-19',
    eligibleAgeLabel: '10 - 19 Years (Rural Adolescent Girls)',
    isActive: true,
  },

  // =================== MATERNAL HEALTH & REPRODUCTIVE AGE ===================
  {
    id: 9,
    schemeName: 'Janani Suraksha Yojana (JSY)',
    description: 'Safe motherhood intervention under the National Health Mission promoting institutional delivery among poor pregnant women through direct cash transfers.',
    benefits: 'Direct cash assistance of ₹1,400 for institutional delivery in rural areas and ₹1,000 in urban areas; Free institutional delivery and post-natal care; ASHA escort support.',
    eligibilityCriteria: 'All pregnant women delivering in government health facilities or accredited private clinics; Focus on BPL/SC/ST mothers.',
    officialLink: 'https://nhm.gov.in',
    applicationLink: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309',
    requiredDocuments: 'Mother and Child Protection (MCP) Card, Aadhaar Card, Bank Account Passbook.',
    state: 'All India',
    category: 'Maternal Health',
    ageGroup: 'Maternal',
    eligibleAgeLabel: '19 - 49 Years (Pregnant Women)',
    isActive: true,
  },
  {
    id: 10,
    schemeName: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    description: 'Direct Benefit Transfer (DBT) scheme providing financial assistance of ₹5,000 for the first child and ₹6,000 for the second girl child to compensate for wage loss.',
    benefits: 'Cash incentive of ₹5,000 in two installments for first living child; ₹6,000 one-time installment on birth of second girl child; Wage loss compensation & nutritional care.',
    eligibilityCriteria: 'Pregnant Women and Lactating Mothers (PW&LM) who registered pregnancy at Anganwadi Centre or approved health centre; Excludes regular govt employees.',
    officialLink: 'https://pmmvy.wcd.gov.in',
    applicationLink: 'https://pmmvy.wcd.gov.in',
    requiredDocuments: 'Aadhaar Card of mother & husband, MCP Card, Bank Account Details linked with Aadhaar.',
    state: 'All India',
    category: 'Maternal Health',
    ageGroup: 'Maternal',
    eligibleAgeLabel: '19 - 45 Years (Expecting & Nursing Mothers)',
    isActive: true,
  },
  {
    id: 11,
    schemeName: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
    description: 'Guarantees free, comprehensive, and quality antenatal care (ANC) on the 9th of every month to all pregnant women in their 2nd and 3rd trimesters.',
    benefits: 'Free diagnostic tests (blood, urine, ultrasound, Hb, sugar), medical examination by OB/GYN doctors, high-risk pregnancy (HRP) red-flag identification, and free iron/calcium supplements.',
    eligibilityCriteria: 'All pregnant women in their 2nd or 3rd trimester (after 3 months of pregnancy).',
    officialLink: 'https://pmsma.mohfw.gov.in',
    applicationLink: 'https://pmsma.mohfw.gov.in',
    requiredDocuments: 'MCP Card, Aadhaar Card, Recent Clinical Test Reports.',
    state: 'All India',
    category: 'Maternal Health',
    ageGroup: 'Maternal',
    eligibleAgeLabel: '18 - 45 Years (2nd & 3rd Trimester Mothers)',
    isActive: true,
  },

  // =================== ADULTS & GENERAL CITIZENS (18 - 59 YEARS) ===================
  {
    id: 12,
    schemeName: 'Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)',
    description: 'World\'s largest government-funded health insurance scheme offering cashless treatment up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    benefits: 'Cashless hospitalization up to ₹5,00,000 per family per year; Covers 1,949+ medical and surgical procedures; Pre-existing conditions covered from day one; 28,000+ empaneled hospitals.',
    eligibilityCriteria: 'Households listed in SECC 2011 database; Deprived rural occupational categories; Designated urban worker classes.',
    officialLink: 'https://pmjay.gov.in',
    applicationLink: 'https://beneficiary.nha.gov.in',
    requiredDocuments: 'Aadhaar Card, Ration Card, PM-JAY Golden Card, Active Mobile Number.',
    state: 'All India',
    category: 'Health Insurance',
    ageGroup: '18-59',
    eligibleAgeLabel: '18 - 59 Years (All Family Members)',
    isActive: true,
  },
  {
    id: 13,
    schemeName: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)',
    description: 'Ensures availability of quality generic medicines at 50% to 90% cheaper prices compared to branded medicines through dedicated Jan Aushadhi Kendras.',
    benefits: 'Access to 2,046+ high-quality generic medicines and 300+ surgical equipment at up to 90% discount; Tested by NABL accredited laboratories.',
    eligibilityCriteria: 'Open to ALL citizens of India with a valid doctor\'s prescription; No income or age restriction.',
    officialLink: 'https://janaushadhi.gov.in',
    applicationLink: 'https://janaushadhi.gov.in',
    requiredDocuments: 'Doctor\'s Prescription (optional for OTC wellness products).',
    state: 'All India',
    category: 'Generic Medicine',
    ageGroup: 'All',
    eligibleAgeLabel: 'All Ages (Universal Access)',
    isActive: true,
  },
  {
    id: 14,
    schemeName: 'National TB Elimination Programme (NTEP) & Nikshay Poshan',
    description: 'Mission to eradicate Tuberculosis through free diagnostic molecular tests, free first-line and second-line DOTS drugs, and direct nutritional cash support.',
    benefits: 'Free CBNAAT / TrueNat molecular testing; 100% free daily DOTS medication regimen; Nikshay Poshan Yojana ₹500/month DBT cash support throughout treatment.',
    eligibilityCriteria: 'Any patient diagnosed with pulmonary or extra-pulmonary Tuberculosis receiving treatment in India.',
    officialLink: 'https://tbcindia.gov.in',
    applicationLink: 'https://nikshay.in',
    requiredDocuments: 'Aadhaar Card, Bank Account Details for DBT transfer, Sputum/Diagnostic Test Report.',
    state: 'All India',
    category: 'Critical Care',
    ageGroup: 'All',
    eligibleAgeLabel: 'All Ages (TB Patients)',
    isActive: true,
  },
  {
    id: 15,
    schemeName: 'Pradhan Mantri National Dialysis Programme (PMNDP)',
    description: 'National initiative under the National Health Mission providing free hemodialysis sessions to BPL renal failure patients across all district hospitals.',
    benefits: '100% free maintenance hemodialysis sessions for BPL patients; Highly subsidized nominal rates for non-BPL citizens; High-efficiency dialyzers.',
    eligibilityCriteria: 'Patients diagnosed with End-Stage Renal Disease (ESRD) requiring maintenance hemodialysis.',
    officialLink: 'https://nhm.gov.in',
    applicationLink: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=844&lid=312',
    requiredDocuments: 'BPL Card / Income Certificate, Nephrologist Prescription, Aadhaar Card, Recent Clinical Reports.',
    state: 'All India',
    category: 'Critical Care',
    ageGroup: '18-59',
    eligibleAgeLabel: '18+ Years (Renal Disease Patients)',
    isActive: true,
  },
  {
    id: 16,
    schemeName: 'National Viral Hepatitis Control Program (NVHCP)',
    description: 'Comprehensive national initiative for prevention, diagnosis, and cure of Hepatitis B and Hepatitis C infections.',
    benefits: 'Free viral load testing (PCR); 100% free curative direct-acting antiviral (DAA) treatment course for Hepatitis C (Sofosbuvir/Velpatasvir); Free Hepatitis B vaccination and lifelong management.',
    eligibilityCriteria: 'All citizens screened positive or diagnosed with viral hepatitis B or C.',
    officialLink: 'https://nvhcp.mohfw.gov.in',
    applicationLink: 'https://nvhcp.mohfw.gov.in',
    requiredDocuments: 'Aadhaar Card, Hepatitis Serology/PCR Report, Physician Prescription.',
    state: 'All India',
    category: 'Critical Care',
    ageGroup: 'All',
    eligibleAgeLabel: 'All Ages (Hepatitis Patients)',
    isActive: true,
  },
  {
    id: 17,
    schemeName: 'Tele-MANAS (Tele Mental Health Assistance & Networking)',
    description: '24x7 free national tele-mental health helpline providing immediate psychological first aid, psychiatric counselling, and mental health interventions.',
    benefits: 'Toll-free 24x7 clinical support in 20+ regional languages (Toll-Free: 14416 / 1800-891-4416); Direct escalation to district mental health centres (DMHP) when needed.',
    eligibilityCriteria: 'Any person experiencing stress, anxiety, depression, insomnia, grief, or mental distress across India.',
    officialLink: 'https://telemanas.mohfw.gov.in',
    applicationLink: 'https://telemanas.mohfw.gov.in',
    requiredDocuments: 'None required (Anonymous & confidential service).',
    state: 'All India',
    category: 'Mental Health',
    ageGroup: 'All',
    eligibleAgeLabel: 'All Ages (14416 Toll-Free)',
    isActive: true,
  },
  {
    id: 18,
    schemeName: 'Employees\' State Insurance (ESIC) Medical Benefit Scheme',
    description: 'Comprehensive social security scheme offering full medical care and cash sickness benefits to organized sector workers and their families.',
    benefits: '100% cashless medical care from day one of insurable employment for worker, spouse, children, and dependent parents; Sickness cash benefit (70% wages) during illness.',
    eligibilityCriteria: 'Employees in covered factories/establishments drawing wages up to ₹21,000/month (₹25,000 for persons with disabilities).',
    officialLink: 'https://www.esic.gov.in',
    applicationLink: 'https://www.esic.gov.in',
    requiredDocuments: 'ESIC Pehchan Card / Insurance Number, Aadhaar Card, Employer Certificate.',
    state: 'All India',
    category: 'Health Insurance',
    ageGroup: '18-59',
    eligibleAgeLabel: '18 - 60 Years (Insured Employees)',
    isActive: true,
  },
  {
    id: 19,
    schemeName: 'Chief Minister\'s Comprehensive Health Insurance Scheme (CMCHIS)',
    description: 'Flagship state health insurance scheme in Tamil Nadu providing cashless hospitalization up to ₹5 lakh per family per year across public and private hospitals.',
    benefits: 'Cashless coverage up to ₹5,00,000 per family per year; Covers 1,090+ medical procedures, organ transplants, oncology, and open-heart surgeries; 1,000+ network hospitals.',
    eligibilityCriteria: 'Resident families of Tamil Nadu with annual family income below ₹1,20,000 as endorsed on Smart Family Card.',
    officialLink: 'https://cmchistn.com',
    applicationLink: 'https://cmchistn.com/enrollment.php',
    requiredDocuments: 'Smart Family Ration Card, Aadhaar Card, VAO Income Certificate.',
    state: 'Tamil Nadu',
    category: 'Health Insurance',
    ageGroup: 'All',
    eligibleAgeLabel: 'All Ages (Tamil Nadu Residents)',
    isActive: true,
  },
  {
    id: 20,
    schemeName: 'Biju Swasthya Kalyan Yojana (BSKY)',
    description: 'Universal health assurance scheme by the Government of Odisha providing cashless medical care for secondary and tertiary hospitalization.',
    benefits: 'Cashless treatment up to ₹5 lakh per family per year, with enhanced coverage up to ₹10 lakh per year for female members; Empaneled premier hospitals nationwide.',
    eligibilityCriteria: 'All NFSA / SFSS ration card holders residing in Odisha.',
    officialLink: 'https://bsky.odisha.gov.in',
    applicationLink: 'https://bsky.odisha.gov.in',
    requiredDocuments: 'BSKY Nabin Card / NFSA Ration Card, Aadhaar Card.',
    state: 'Odisha',
    category: 'Health Insurance',
    ageGroup: 'All',
    eligibleAgeLabel: 'All Ages (Odisha Residents)',
    isActive: true,
  },

  // =================== SENIOR CITIZENS & ELDERLY (60+ YEARS) ===================
  {
    id: 21,
    schemeName: 'Ayushman Bharat PM-JAY Senior Citizens Vayo Vandana Card',
    description: 'Universal health insurance coverage providing ₹5 Lakh per year free healthcare to ALL senior citizens aged 70 and above, regardless of income or socioeconomic status.',
    benefits: 'Distinct Ayushman Vayo Vandana Card; Dedicated ₹5,00,000 top-up cover exclusively for seniors aged 70+; Zero waiting period; Cashless geriatric treatment at empaneled hospitals.',
    eligibilityCriteria: 'All Indian citizens aged 70 years and above, irrespective of income, ration card category, or economic status.',
    officialLink: 'https://beneficiary.nha.gov.in',
    applicationLink: 'https://beneficiary.nha.gov.in',
    requiredDocuments: 'Aadhaar Card (verifying age 70+), Active Mobile Number linked with Aadhaar.',
    state: 'All India',
    category: 'Elderly Care',
    ageGroup: '60+',
    eligibleAgeLabel: '70+ Years (All Senior Citizens)',
    isActive: true,
  },
  {
    id: 22,
    schemeName: 'National Programme for Health Care of the Elderly (NPHCE)',
    description: 'Dedicated healthcare programme addressing geriatric healthcare needs through primary, secondary, and tertiary public healthcare institutions.',
    benefits: 'Dedicated weekly geriatric clinics at PHCs; 10-bed specialized geriatric wards at District Hospitals; Free physiotherapy, medicines, and specialized geriatric counseling.',
    eligibilityCriteria: 'All senior citizens aged 60 years and above residing in India.',
    officialLink: 'https://nhm.gov.in',
    applicationLink: 'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1073&lid=384',
    requiredDocuments: 'Aadhaar Card or Age Proof document.',
    state: 'All India',
    category: 'Elderly Care',
    ageGroup: '60+',
    eligibleAgeLabel: '60+ Years (Geriatric Care)',
    isActive: true,
  },
  {
    id: 23,
    schemeName: 'Rashtriya Vayoshri Yojana (RVY)',
    description: 'Centrally sponsored scheme providing physical aids and assisted-living devices for senior citizens belonging to BPL category suffering from age-related disabilities.',
    benefits: '100% free assisted living devices: Walking sticks, elbow crutches, walkers, hearing aids, wheelchairs, artificial dentures, and spectacles; Custom fitted at assessment camps.',
    eligibilityCriteria: 'Senior citizens aged 60 years and above holding a BPL card or receiving National Old Age Pension (NOAPS).',
    officialLink: 'https://alimco.in',
    applicationLink: 'https://alimco.in/rvydetails.aspx',
    requiredDocuments: 'Aadhaar Card, BPL Card / Pension Passbook, Medical Certificate of Disability.',
    state: 'All India',
    category: 'Elderly Care',
    ageGroup: '60+',
    eligibleAgeLabel: '60+ Years (Senior Citizens with Physical Needs)',
    isActive: true,
  },

  // =================== UNIVERSAL DIGITAL HEALTH ===================
  {
    id: 24,
    schemeName: 'Ayushman Bharat Digital Mission (ABDM / ABHA Card)',
    description: 'National digital health backbone empowering every citizen with a 14-digit unique health account to securely store, access, and share digital medical records.',
    benefits: '14-digit digital ABHA address; Instant paperless sharing of lab reports, prescriptions, and discharge summaries with doctors across India; Seamless hospital OPD token registration.',
    eligibilityCriteria: 'Every citizen of India (No age limit).',
    officialLink: 'https://abdm.gov.in',
    applicationLink: 'https://abha.abdm.gov.in',
    requiredDocuments: 'Aadhaar Card or Driving License, Active Mobile Number.',
    state: 'All India',
    category: 'Digital Health',
    ageGroup: 'All',
    eligibleAgeLabel: 'All Ages (Universal Digital ID)',
    isActive: true,
  },
];

const SCHEME_STORAGE_KEY = 'hg_citizen_scheme_applications';

function getStoredApplications() {
  try {
    const raw = localStorage.getItem(SCHEME_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredApplications(apps) {
  try {
    localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

/**
 * Normalize and filter fallback schemes locally
 */
function filterFallbackSchemes({ category, state, search } = {}) {
  let list = [...FALLBACK_SCHEMES];

  if (category && category.toLowerCase() !== 'all') {
    list = list.filter((s) => s.category && s.category.toLowerCase() === category.toLowerCase());
  }

  if (state && state.toLowerCase() !== 'all') {
    list = list.filter((s) => {
      const sState = (s.state || '').toLowerCase();
      const targetState = state.toLowerCase();
      return sState === targetState || sState === 'all india';
    });
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.schemeName.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.benefits && s.benefits.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
    );
  }

  return list;
}

/**
 * Fetch all government schemes with optional filters
 * @param {Object} filters
 * @param {string} filters.category
 * @param {string} filters.state
 * @param {string} filters.search
 */
export async function fetchSchemes(filters = {}) {
  const params = {};
  if (filters.category && filters.category.toLowerCase() !== 'all') params.category = filters.category;
  if (filters.state && filters.state.toLowerCase() !== 'all') params.state = filters.state;
  if (filters.search && filters.search.trim()) params.search = filters.search.trim();

  // 1. Try API Gateway endpoints (/api/citizen/schemes and /api/citizens/schemes)
  const candidateEndpoints = ['/api/citizen/schemes', '/api/citizens/schemes'];

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await apiClient.get(endpoint, { params, timeout: 3000 });
      const payload = response?.data?.data || response?.data;
      if (Array.isArray(payload) && payload.length > 0) {
        return payload;
      }
    } catch {
      // try next candidate endpoint
    }
  }

  // 2. Try direct Citizen Service on port 8082
  try {
    const directRes = await fetch(`http://localhost:8082/api/citizen/schemes?${new URLSearchParams(params)}`);
    if (directRes.ok) {
      const json = await directRes.json();
      const list = json?.data || json;
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch {
    // ignore
  }

  // 3. Guaranteed instant fallback
  return filterFallbackSchemes(filters);
}

/**
 * Fetch single scheme by ID
 */
export async function fetchSchemeById(id) {
  try {
    const response = await apiClient.get(`/api/citizen/schemes/${id}`);
    return response?.data?.data || response?.data || null;
  } catch {
    const found = FALLBACK_SCHEMES.find((s) => String(s.id) === String(id));
    return found || null;
  }
}

/**
 * Fetch schemes tailored to citizen profile
 */
export async function fetchEligibleSchemes(citizenId) {
  try {
    const response = await apiClient.get(`/api/citizen/schemes/eligible/${citizenId}`);
    const list = response?.data?.data || response?.data;
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  } catch {
    // ignore
  }
  return FALLBACK_SCHEMES;
}

/**
 * Search schemes by keyword
 */
export async function searchSchemes(query) {
  return fetchSchemes({ search: query });
}

/**
 * Apply for a government scheme
 */
export async function applyForScheme(schemeId, remarks = '') {
  const newApp = {
    id: Date.now(),
    schemeId: Number(schemeId),
    status: 'PENDING',
    appliedAt: new Date().toISOString(),
    remarks: remarks || 'Application submitted for eligibility verification.',
  };

  const current = getStoredApplications();
  const updated = [newApp, ...current.filter((a) => a.schemeId !== Number(schemeId))];
  saveStoredApplications(updated);

  return newApp;
}

/**
 * Fetch all applications submitted by the current citizen
 */
export async function fetchMySchemeApplications() {
  return getStoredApplications();
}
