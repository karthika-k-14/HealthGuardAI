import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Settings,
  Bell,
  LogOut,
  HeartPulse,
  MessageCircle,
  History,
  BookOpenText,
  Hospital,
  Building2,
  Pill,
  Syringe,
  Siren,
  Landmark,
  LineChart,
  Users,
  KeyRound,
  CalendarCheck,
  Baby,
  Weight,
  TriangleAlert,
  FileText,
  Boxes,
  ClipboardCheck,
  PackageX,
  Truck,
  ShoppingCart,
  BarChart3,
  Activity,
  MapPinned,
  Megaphone,
  Radio,
  BrainCircuit,
  ShieldCheck,
  Bug,
  ServerCog,
  ScrollText,
  Stethoscope,
  ArrowUpRight,
} from 'lucide-react';
import Logo from '../../common/Logo';
import { useAuth } from '../../../contexts/AuthContext';
import { useChat } from '../../../contexts/ChatContext';
import { ROLE_HOME_ROUTE, ROLE_LABELS, ROLES } from '../../../constants/roles';
import { PATHS } from '../../../constants/routes';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * Citizen, ASHA, Pharmacist, Health Officer, and Admin all have fully
 * built-out sub-pages, so every role now gets full sidebar
 * sub-navigation.
 */
function buildNavItems(role) {
  const home = ROLE_HOME_ROUTE[role] || PATHS.HOME;
  const base = [{ label: 'Dashboard', to: home, icon: LayoutDashboard, end: true }];

  if (role === ROLES.CITIZEN) {
    base.push(
      { label: 'My Health Profile', to: PATHS.CITIZEN_MY_PROFILE, icon: User },
      { label: 'AI Chat', to: PATHS.CITIZEN_CHAT, icon: MessageCircle, isChat: true },
      { label: 'Symptom Checker', to: PATHS.CITIZEN_SYMPTOM_CHECKER, icon: Stethoscope },
      { label: 'Health Timeline', to: PATHS.CITIZEN_TIMELINE, icon: History },
      { label: 'Disease Awareness', to: PATHS.CITIZEN_DISEASES, icon: BookOpenText },
      { label: 'Hospitals', to: PATHS.CITIZEN_HOSPITALS, icon: Hospital },
      { label: 'Medicine Guide', to: PATHS.CITIZEN_MEDICINES, icon: Pill },
      { label: 'Vaccinations', to: PATHS.CITIZEN_VACCINATIONS, icon: Syringe },
      { label: 'Emergency', to: PATHS.CITIZEN_EMERGENCY, icon: Siren },
      { label: 'Govt. Schemes', to: PATHS.CITIZEN_SCHEMES, icon: Landmark },
      { label: 'Health Analytics', to: PATHS.CITIZEN_ANALYTICS, icon: LineChart }
    );
  }

  if (role === ROLES.ASHA) {
    base.push(
      { label: 'Assigned Citizens', to: PATHS.ASHA_ASSIGNED_CITIZENS, icon: Users },
      { label: 'Families', to: PATHS.ASHA_FAMILIES, icon: Users },
      { label: 'Home Visits', to: PATHS.ASHA_VISITS, icon: CalendarCheck },
      { label: 'Child Health', to: PATHS.ASHA_CHILD_HEALTH, icon: Weight },
      { label: 'Disease Surveillance', to: PATHS.ASHA_SURVEILLANCE, icon: TriangleAlert },
      { label: 'AI Field Assistant', to: PATHS.ASHA_ASSISTANT, icon: MessageCircle, isChat: true },
      { label: 'Reports', to: PATHS.ASHA_REPORTS, icon: FileText }
    );
  }

  if (role === ROLES.PHARMACIST) {
    base.push(
      { label: 'Inventory', to: PATHS.PHARMACIST_INVENTORY, icon: Boxes },
      { label: 'PHC Referral Verification', to: PATHS.PHARMACIST_PRESCRIPTIONS, icon: ClipboardCheck },
      { label: 'AI Assistant', to: PATHS.PHARMACIST_ASSISTANT, icon: MessageCircle, isChat: true },
      { label: 'Stock & Expiry', to: PATHS.PHARMACIST_STOCK_ALERTS, icon: PackageX },
      { label: 'Suppliers', to: PATHS.PHARMACIST_SUPPLIERS, icon: Truck },
      { label: 'Orders', to: PATHS.PHARMACIST_ORDERS, icon: ShoppingCart },
      { label: 'Analytics', to: PATHS.PHARMACIST_ANALYTICS, icon: BarChart3 },
      { label: 'Reports', to: PATHS.PHARMACIST_REPORTS, icon: FileText }
    );
  }

  if (role === ROLES.HEALTH_OFFICER) {
    base.push(
      { label: 'Case Reviews', to: PATHS.OFFICER_CASE_REVIEWS, icon: ClipboardCheck },
      { label: 'District Analytics', to: PATHS.OFFICER_ANALYTICS, icon: LineChart },
      { label: 'Disease Monitoring', to: PATHS.OFFICER_DISEASE_MONITORING, icon: Activity },
      { label: 'Health Map', to: PATHS.OFFICER_HEALTH_MAP, icon: MapPinned },
      { label: 'Referral Monitoring', to: PATHS.OFFICER_REFERRALS, icon: Building2 },
      { label: 'Vaccination Monitor', to: PATHS.OFFICER_VACCINATION, icon: Syringe },
      { label: 'Campaign Management', to: PATHS.OFFICER_CAMPAIGNS, icon: Megaphone },
      { label: 'Emergency Center', to: PATHS.OFFICER_EMERGENCY, icon: Siren },
      { label: 'AI Insights', to: PATHS.OFFICER_AI_INSIGHTS, icon: BrainCircuit, isChat: true },
      { label: 'Reports', to: PATHS.OFFICER_REPORTS, icon: FileText }
    );
  }

  if (role === ROLES.ADMIN) {
    base.push(
      { label: 'User Management', to: PATHS.ADMIN_USERS, icon: Users },
      { label: 'Staff Access Codes', to: PATHS.ADMIN_ACCESS_CODES, icon: KeyRound },
      { label: 'Role Management', to: PATHS.ADMIN_ROLES, icon: ShieldCheck },
      { label: 'Hospital Management', to: PATHS.ADMIN_HOSPITALS, icon: Building2 },
      { label: 'PHC Management', to: PATHS.ADMIN_PHCS, icon: Building2 },
      { label: 'Referral Management', to: PATHS.ADMIN_REFERRALS, icon: ArrowUpRight },
      { label: 'Campaign Management', to: PATHS.ADMIN_CAMPAIGNS, icon: Megaphone },
      { label: 'Broadcast Notification', to: PATHS.ADMIN_BROADCAST, icon: Radio },
      { label: 'Disease Management', to: PATHS.ADMIN_DISEASES, icon: Bug },
      { label: 'Analytics', to: PATHS.ADMIN_ANALYTICS, icon: BarChart3 },
      { label: 'System Monitoring', to: PATHS.ADMIN_SYSTEM, icon: ServerCog },
      { label: 'Audit Logs', to: PATHS.ADMIN_AUDIT_LOGS, icon: ScrollText },
      { label: 'AI Insights', to: PATHS.ADMIN_AI_INSIGHTS, icon: BrainCircuit, isChat: true },
      { label: 'Reports', to: PATHS.ADMIN_REPORTS, icon: FileText }
    );
  }

  base.push(
    { label: 'Notifications', to: PATHS.NOTIFICATIONS, icon: Bell },
    { label: 'Profile', to: PATHS.PROFILE, icon: User },
    { label: 'Settings', to: PATHS.SETTINGS, icon: Settings }
  );

  return base;
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { role, logout } = useAuth();
  const { hasUnread } = useChat();
  const { t } = useLanguage();
  const navItems = useMemo(() => buildNavItems(role), [role]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/70 bg-white/90 backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-surface-darkcard/90 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Logo />
        </div>

        <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />
          {ROLE_LABELS[role] ? t(`${ROLE_LABELS[role]} workspace`) : t('Member workspace')}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4" aria-label="Dashboard">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {t(item.label)}
              {item.isChat && hasUnread && (
                <span
                  className="ml-auto h-2 w-2 shrink-0 rounded-full bg-brand-500"
                  aria-label="Unread AI messages"
                />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200/70 p-4 dark:border-white/10">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('Sign out')}
          </button>
        </div>
      </aside>
    </>
  );
}

