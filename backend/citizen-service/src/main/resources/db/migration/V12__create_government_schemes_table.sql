-- V12: Create government_schemes table and seed initial schemes
CREATE TABLE IF NOT EXISTS government_schemes (
    id BIGSERIAL PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    benefits TEXT,
    eligibility_criteria TEXT,
    official_link VARCHAR(500),
    application_link VARCHAR(500),
    required_documents TEXT,
    state VARCHAR(100) DEFAULT 'All India',
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scheme_category ON government_schemes(category);
CREATE INDEX IF NOT EXISTS idx_scheme_state ON government_schemes(state);
CREATE INDEX IF NOT EXISTS idx_scheme_active ON government_schemes(is_active);

-- Initial seed data
INSERT INTO government_schemes (scheme_name, description, benefits, eligibility_criteria, official_link, application_link, required_documents, state, category, is_active, created_at)
VALUES
(
    'Ayushman Bharat PM-JAY',
    'World''s largest government-funded health insurance scheme offering cashless treatment up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    'Cashless hospitalization up to ₹5,00,000 per family per year; Covers 1,949+ medical procedures; Zero out-of-pocket expenses at empaneled public and private hospitals; Pre-existing conditions covered from day one.',
    'Families listed in SECC 2011 database; Rural households with deprivation criteria; Deprived urban occupational categories (e.g. drivers, construction workers, street vendors).',
    'https://pmjay.gov.in',
    'https://beneficiary.nha.gov.in',
    'Aadhaar Card, Ration Card, PM-JAY Golden Card / Letter, Active Mobile Number.',
    'All India',
    'Health Insurance',
    TRUE,
    CURRENT_TIMESTAMP
),
(
    'Janani Suraksha Yojana',
    'Safe motherhood intervention under the National Health Mission promoting institutional delivery among poor pregnant women through direct cash assistance.',
    'Direct cash assistance of ₹1,400 for institutional delivery in rural areas and ₹1,000 in urban areas; Free delivery and post-natal care in government health institutions; Dedicated ASHA escort support.',
    'Pregnant women belonging to BPL/SC/ST households delivering in government health facilities or accredited private clinics; Age 19 years and above.',
    'https://nhm.gov.in',
    'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309',
    'Mother and Child Protection (MCP) Card, Aadhaar Card, BPL Certificate / Ration Card, Bank Account Passbook copy.',
    'All India',
    'Maternal Health',
    TRUE,
    CURRENT_TIMESTAMP
),
(
    'Pradhan Mantri Matru Vandana Yojana',
    'Centrally sponsored Direct Benefit Transfer (DBT) scheme providing financial assistance of ₹5,000 for the first living child and ₹6,000 for the second girl child to compensate for wage loss during pregnancy.',
    'Cash incentive of ₹5,000 in two installments for first child; ₹6,000 one-time installment on birth of second girl child; Wage loss compensation and improved maternal nutritional health.',
    'Pregnant Women and Lactating Mothers (PW&LM) who have registered pregnancy at Anganwadi Centre (AWC) or approved health facility; Excludes government employees.',
    'https://pmmvy.wcd.gov.in',
    'https://pmmvy.wcd.gov.in',
    'Aadhaar Card of mother & husband, MCP Card, Bank Account Details linked with Aadhaar, Child Birth Registration Certificate.',
    'All India',
    'Maternal Health',
    TRUE,
    CURRENT_TIMESTAMP
),
(
    'Universal Immunization Programme',
    'One of the largest public health immunization programmes in the world, providing 100% free vaccines against 12 preventable life-threatening diseases for infants and pregnant women.',
    'Free vaccination against TB, Diphtheria, Pertussis, Tetanus, Polio, Hepatitis B, Pneumonia, Measles, Rubella, and Rotavirus; Digital certificate & tracking via U-WIN platform.',
    'All infants, children aged 0 to 5 years, and pregnant mothers across all states and union territories in India.',
    'https://nhm.gov.in',
    'https://uwin.mohfw.gov.in',
    'Parent/Guardian Aadhaar Card, Child Birth Certificate / MCP Card, Active Mobile Number.',
    'All India',
    'Immunization',
    TRUE,
    CURRENT_TIMESTAMP
),
(
    'Rashtriya Bal Swasthya Karyakram',
    'Child health screening and early intervention service targeting children from birth to 18 years for the 4Ds: Defects at birth, Deficiencies, Diseases, and Development delays including disability.',
    'Free screening and comprehensive medical and surgical management at District Early Intervention Centres (DEIC); Free corrective surgeries for congenital heart defects, cleft lip, and clubfoot.',
    'All children from birth to 18 years enrolled in government/aided schools, Anganwadi centres, and newborns delivered at public health facilities.',
    'https://nhm.gov.in',
    'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=818&lid=221',
    'School/Anganwadi ID, Aadhaar Card of Parent/Child, Health Card / DEIC Referral Slip.',
    'All India',
    'Child Health',
    TRUE,
    CURRENT_TIMESTAMP
),
(
    'Chief Minister''s Comprehensive Health Insurance Scheme (CMCHIS)',
    'Flagship state health insurance scheme in Tamil Nadu providing cashless hospitalization up to ₹5 lakh per family per year for 1,090 medical and surgical procedures across public and private hospitals.',
    'Cashless coverage up to ₹5,00,000 per family per year; Covers high-end tertiary care, organ transplants, oncology, and cardiac surgeries; 1,000+ network hospitals.',
    'Resident families of Tamil Nadu with annual family income below ₹1,20,000; Listed in Smart Family Card database.',
    'https://cmchistn.com',
    'https://cmchistn.com/enrollment.php',
    'Smart Family Ration Card, Aadhaar Card, VAO Income Certificate, Active Mobile Number.',
    'Tamil Nadu',
    'Health Insurance',
    TRUE,
    CURRENT_TIMESTAMP
),
(
    'Pradhan Mantri National Dialysis Programme',
    'National initiative under the National Health Mission providing free hemodialysis sessions to BPL renal failure patients across all district hospitals.',
    '100% free hemodialysis sessions for BPL patients; Subsidized nominal rates for non-BPL citizens; High-efficiency dialyzers and continuous nephrology monitoring.',
    'Patients diagnosed with End-Stage Renal Disease (ESRD Stage 5) requiring maintenance hemodialysis; Free for BPL card holders.',
    'https://nhm.gov.in',
    'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=844&lid=312',
    'BPL Card / Income Certificate, Nephrologist Dialysis Prescription, Aadhaar Card, Recent Clinical Blood Reports.',
    'All India',
    'Critical Care',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;
