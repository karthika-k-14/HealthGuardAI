/**
 * Centralized API Configuration for HealthGuard AI
 * All requests are routed exclusively through the API Gateway (port 8080).
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Authentication Microservice (via Gateway: 8080 -> 8081)
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REGISTER_CITIZEN: '/api/auth/register',
    REGISTER_ASHA: '/api/auth/register/asha',
    REGISTER_OFFICER: '/api/auth/register/officer',
    REGISTER_PHARMACIST: '/api/auth/register/pharmacist',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },

  // Citizen Microservice (via Gateway: 8080 -> 8082)
  CITIZENS: {
    BASE: '/api/citizens',
    PROFILE: '/api/citizens/profile',
    BY_ID: (id) => `/api/citizens/${id}`,
    UPDATE: (id) => `/api/citizens/${id}`,
    DELETE: (id) => `/api/citizens/${id}`,
    CHAT: '/api/citizen/chat',
    NOTIFICATIONS: '/api/notifications',
    REMINDERS: '/api/reminders',
    DOCUMENTS: '/api/documents',
  },

  // AI Microservice (via Gateway: 8080 -> 8084 / 8000)
  AI: {
    CHAT: '/api/ai/chat',
    ANALYZE_SYMPTOMS: '/api/ai/analyze-symptoms',
    CLASSIFY: '/api/ai/classify',
    TRIAGE: '/api/ai/triage',
    HEALTH_PREDICT: '/api/ai/health/predict',
  },

  // Community Microservice (via Gateway: 8080 -> 8083)
  COMMUNITY: {
    PHC: '/api/phc',
    ASHA: '/api/asha',
    SURVEILLANCE: '/api/surveillance',
  },

  // Admin Microservice (via Gateway: 8080 -> 8085)
  ADMIN: {
    BASE: '/api/admin',
    USERS: '/api/admin/users',
    USER_BY_ID: (id) => `/api/admin/users/${id}`,
    SYSTEM_HEALTH: '/actuator/health',
    HOSPITALS: '/api/admin/hospitals',
  },
};
