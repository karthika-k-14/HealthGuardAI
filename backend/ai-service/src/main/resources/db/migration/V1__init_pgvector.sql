-- Enable pgvector extension for AI vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Medical Knowledge Base Table
CREATE TABLE IF NOT EXISTS medical_knowledge (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    source VARCHAR(150),
    tags VARCHAR(255),
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast cosine similarity vector search
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_embedding 
ON medical_knowledge 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Initial WHO & Public Health Knowledge Seed
INSERT INTO medical_knowledge (title, content, category, source, tags) VALUES
('WHO Fever & Infection Guidelines', 'Fever persisting longer than 3 days requires clinical evaluation to rule out bacterial infection, malaria, or vector-borne illness. Hydration and rest are recommended for early symptom management.', 'General Health', 'WHO', 'fever, infection, triage'),
('Cardiac Symptoms & Chest Pain Alert', 'Chest pain spreading to left arm, neck, or jaw accompanied by shortness of breath indicates potential acute coronary syndrome. Emergency medical services must be contacted immediately.', 'Cardiology', 'WHO Guidelines', 'chest pain, heart attack, emergency'),
('Stroke Early Detection (FAST Protocol)', 'Sudden facial drooping, arm weakness, or slurred speech indicates acute ischemic or hemorrhagic stroke. Immediate emergency hospital transport is critical within the thrombolytic window.', 'Neurology', 'AHA/WHO', 'stroke, emergency, FAST'),
('Spinal & Lumbar Radiculopathy Management', 'Lower back pain accompanied by leg numbness, tingling, or bowel/bladder incontinence requires urgent orthopedic or neurological examination for lumbar disc herniation.', 'Orthopedics', 'ICMR Guidelines', 'back pain, numbness, nerve'),
('Dengue & Vector-Borne Infection Protocol', 'High fever, severe eye pain, muscle aches, and skin rash during monsoon season warrant blood count testing for DengueNS1 antigen and platelet monitoring.', 'Infectious Disease', 'National Vector Control', 'dengue, fever, rash');
