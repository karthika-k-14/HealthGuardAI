import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './contexts/ThemeContext';
import { STORAGE_KEYS } from './constants/storageKeys';
import { setItem } from './utils/storage';

import PublicLayout from './components/layout/PublicLayout';
import Layout from './components/layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import OfflineScreen from './pages/ErrorPages/OfflineScreen';
import PageLoader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useSessionTimeout } from './hooks/useSessionTimeout';




import { ROLES } from './constants/roles';
import { PATHS } from './constants/routes';

// Route-level code splitting — each page is fetched only when its
// route is visited, keeping the initial bundle small.
const Landing = lazy(() => import('./pages/Landing/Landing'));
const Login = lazy(() => import('./pages/Authentication/Login'));
const Register = lazy(() => import('./pages/Authentication/Register'));
const StaffAccessCode = lazy(() => import('./pages/Authentication/StaffAccessCode'));
const PendingApproval = lazy(() => import('./pages/Authentication/PendingApproval'));
const CompleteProfile = lazy(() => import('./pages/Profile/CompleteProfile'));
const Onboarding = lazy(() => import('./pages/Onboarding/Onboarding'));
const NotFound = lazy(() => import('./pages/ErrorPages/NotFound'));
const Unauthorized = lazy(() => import('./pages/ErrorPages/Unauthorized'));
const ServerError = lazy(() => import('./pages/ErrorPages/ServerError'));
const CitizenDashboard = lazy(() => import('./pages/Citizen/CitizenDashboard'));
const MyProfile = lazy(() => import('./pages/Citizen/MyProfile'));
const AIHealthScore = lazy(() => import('./pages/Citizen/AIHealthScore'));
const SymptomChecker = lazy(() => import('./pages/Citizen/SymptomChecker'));
const HealthTimeline = lazy(() => import('./pages/Citizen/HealthTimeline'));
const ChatPage = lazy(() => import('./pages/Citizen/ChatPage'));
const DiseaseAwareness = lazy(() => import('./pages/Citizen/DiseaseAwareness'));
const HospitalLocator = lazy(() => import('./pages/Citizen/HospitalLocator'));
const MedicineGuide = lazy(() => import('./pages/Citizen/MedicineGuide'));
const VaccinationTracker = lazy(() => import('./pages/Citizen/VaccinationTracker'));
const EmergencyCenter = lazy(() => import('./pages/Citizen/EmergencyCenter'));
const GovernmentSchemes = lazy(() => import('./pages/Citizen/GovernmentSchemes'));
const HealthAnalyticsPage = lazy(() => import('./pages/Citizen/HealthAnalyticsPage'));
const AshaDashboard = lazy(() => import('./pages/ASHA/AshaDashboard'));
const AssignedCitizens = lazy(() => import('./pages/ASHA/AssignedCitizens'));
const FamilyManagement = lazy(() => import('./pages/ASHA/FamilyManagement'));
const HomeVisits = lazy(() => import('./pages/ASHA/HomeVisits'));
const ChildHealth = lazy(() => import('./pages/ASHA/ChildHealth'));
const DiseaseSurveillance = lazy(() => import('./pages/ASHA/DiseaseSurveillance'));
const AIFieldAssistant = lazy(() => import('./pages/ASHA/AIFieldAssistant'));
const AshaReports = lazy(() => import('./pages/ASHA/Reports'));
const PharmacistDashboard = lazy(() => import('./pages/Pharmacist/PharmacistDashboard'));
const Inventory = lazy(() => import('./pages/Pharmacist/Inventory'));
const PHCReferralVerification = lazy(() => import('./pages/Pharmacist/PHCReferralVerification'));
const AIMedicineAssistant = lazy(() => import('./pages/Pharmacist/AIMedicineAssistant'));
const StockAlerts = lazy(() => import('./pages/Pharmacist/StockAlerts'));
const Suppliers = lazy(() => import('./pages/Pharmacist/Suppliers'));
const PharmacyOrders = lazy(() => import('./pages/Pharmacist/Orders'));
const PharmacyAnalytics = lazy(() => import('./pages/Pharmacist/Analytics'));
const PharmacyReports = lazy(() => import('./pages/Pharmacist/Reports'));
const OfficerDashboard = lazy(() => import('./pages/HealthOfficer/OfficerDashboard'));
const CaseReviews = lazy(() => import('./pages/HealthOfficer/CaseReviews'));
const DistrictAnalytics = lazy(() => import('./pages/HealthOfficer/DistrictAnalytics'));
const DiseaseMonitoring = lazy(() => import('./pages/HealthOfficer/DiseaseMonitoring'));
const HealthMap = lazy(() => import('./pages/HealthOfficer/HealthMap'));
const ReferralMonitoring = lazy(() => import('./pages/HealthOfficer/ReferralMonitoring'));
const VaccinationMonitor = lazy(() => import('./pages/HealthOfficer/VaccinationMonitor'));
const CampaignManagement = lazy(() => import('./pages/HealthOfficer/CampaignManagement'));
const OfficerEmergencyCenter = lazy(() => import('./pages/HealthOfficer/EmergencyCenter'));
const AIHealthInsights = lazy(() => import('./pages/HealthOfficer/AIHealthInsights'));
const OfficerReports = lazy(() => import('./pages/HealthOfficer/Reports'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const AccessCodeManagement = lazy(() => import('./pages/Admin/AccessCodeManagement'));
const RoleManagement = lazy(() => import('./pages/Admin/RoleManagement'));
const AdminHospitalManagement = lazy(() => import('./pages/Admin/AdminHospitalManagement'));
const AdminPhcManagement = lazy(() => import('./pages/Admin/AdminPhcManagement'));
const AdminReferralManagement = lazy(() => import('./pages/Admin/AdminReferralManagement'));
const AdminCampaignManagement = lazy(() => import('./pages/Admin/AdminCampaignManagement'));
const DiseaseManagement = lazy(() => import('./pages/Admin/DiseaseManagement'));
const AdminAnalytics = lazy(() => import('./pages/Admin/Analytics'));
const SystemMonitoring = lazy(() => import('./pages/Admin/SystemMonitoring'));
const AuditLogs = lazy(() => import('./pages/Admin/AuditLogs'));
const AIAdminInsights = lazy(() => import('./pages/Admin/AIAdminInsights'));
const AdminReports = lazy(() => import('./pages/Admin/Reports'));
const BroadcastNotifications = lazy(() => import('./pages/Admin/BroadcastNotifications'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));

// Persists the current path so it's available in localStorage per the
// project's storage requirements. Session restoration itself is
// handled by AuthContext (token/role/user), not by this value — it's
// kept for reference/debugging rather than driving redirects.
function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    setItem(STORAGE_KEYS.LAST_ROUTE, location.pathname);
  }, [location.pathname]);
  return null;
}

export default function App() {
  const { isDark } = useTheme();
  const isOnline = useOnlineStatus();
  useSessionTimeout();

  return (
    <>
      <OfflineScreen visible={!isOnline} />
      <RouteTracker />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? '#111714' : '#ffffff',
            color: isDark ? '#f1f5f9' : '#0f172a',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.08)',
            fontSize: '0.875rem',
          },
        }}
      />

      <ErrorBoundary>
      <Suspense fallback={<PageLoader label="Loading…" />}>
        <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path={PATHS.HOME} element={<Landing />} />
          <Route path={PATHS.UNAUTHORIZED} element={<Unauthorized />} />
          <Route path={PATHS.SERVER_ERROR} element={<ServerError />} />
        </Route>

        {/* Login — full-bleed split-screen layout, no navbar/footer chrome */}
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.REGISTER} element={<Register />} />
        <Route path={PATHS.STAFF_ACCESS} element={<StaffAccessCode />} />
        <Route path={PATHS.PENDING_APPROVAL} element={<PendingApproval />} />

        {/* Complete Profile — shown once after first login, before onboarding/dashboard */}
        <Route
          path={PATHS.COMPLETE_PROFILE}
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />

        {/* Onboarding — full-screen, authenticated, no dashboard chrome */}
        <Route
          path={PATHS.ONBOARDING}
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected routes — shared dashboard shell */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path={PATHS.CITIZEN}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_MY_PROFILE}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_HEALTH_SCORE}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <AIHealthScore />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_SYMPTOM_CHECKER}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <SymptomChecker />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_TIMELINE}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <HealthTimeline />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_CHAT}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_DISEASES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <DiseaseAwareness />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_HOSPITALS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <HospitalLocator />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_MEDICINES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <MedicineGuide />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_VACCINATIONS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <VaccinationTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_EMERGENCY}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <EmergencyCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_SCHEMES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <GovernmentSchemes />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CITIZEN_ANALYTICS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                <HealthAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ASHA}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ASHA]}>
                <AshaDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ASHA_ASSIGNED_CITIZENS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ASHA]}>
                <AssignedCitizens />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ASHA_FAMILIES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ASHA]}>
                <FamilyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ASHA_VISITS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ASHA]}>
                <HomeVisits />
              </ProtectedRoute>
            }
          />

          <Route
            path={PATHS.ASHA_CHILD_HEALTH}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ASHA]}>
                <ChildHealth />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ASHA_SURVEILLANCE}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ASHA]}>
                <DiseaseSurveillance />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ASHA_ASSISTANT}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ASHA]}>
                <AIFieldAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ASHA_REPORTS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ASHA]}>
                <AshaReports />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PHARMACIST}
            element={
              <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
                <PharmacistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PHARMACIST_INVENTORY}
            element={
              <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PHARMACIST_PRESCRIPTIONS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
                <PHCReferralVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PHARMACIST_ASSISTANT}
            element={
              <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
                <AIMedicineAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PHARMACIST_STOCK_ALERTS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
                <StockAlerts />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PHARMACIST_SUPPLIERS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
                <Suppliers />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PHARMACIST_ORDERS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
                <PharmacyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PHARMACIST_ANALYTICS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
                <PharmacyAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PHARMACIST_REPORTS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
                <PharmacyReports />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_CASE_REVIEWS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <CaseReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_ANALYTICS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <DistrictAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_DISEASE_MONITORING}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <DiseaseMonitoring />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_HEALTH_MAP}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <HealthMap />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_REFERRALS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <ReferralMonitoring />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_VACCINATION}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <VaccinationMonitor />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_CAMPAIGNS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <CampaignManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_EMERGENCY}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <OfficerEmergencyCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_AI_INSIGHTS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <AIHealthInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.OFFICER_REPORTS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.HEALTH_OFFICER]}>
                <OfficerReports />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_USERS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_ACCESS_CODES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AccessCodeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_ROLES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_HOSPITALS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminHospitalManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_PHCS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminPhcManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_REFERRALS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminReferralManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_CAMPAIGNS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminCampaignManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_DISEASES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DiseaseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_ANALYTICS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_SYSTEM}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <SystemMonitoring />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_AUDIT_LOGS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_AI_INSIGHTS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AIAdminInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ADMIN_REPORTS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          <Route
            path={PATHS.ADMIN_BROADCAST}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <BroadcastNotifications />
              </ProtectedRoute>
            }
          />

          {/* Shared authenticated routes — any signed-in role */}
          <Route path={PATHS.PROFILE} element={<Profile />} />
          <Route path={PATHS.SETTINGS} element={<Settings />} />
          <Route path={PATHS.NOTIFICATIONS} element={<Notifications />} />
        </Route>

        {/* 404 */}
        <Route path={PATHS.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </>
  );
}
