import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  TrendingUp,
  PackageX,
  ShoppingCart,
  BarChart3,
  FileText,
  Bell,
  User,
  Settings
} from 'lucide-react';
import { PATHS } from '../../constants/routes';

export const PHARMACIST_NAV_ITEMS = [
  { label: 'Dashboard', to: PATHS.PHARMACIST, icon: LayoutDashboard },
  { label: 'Inventory', to: PATHS.PHARMACIST_INVENTORY, icon: Boxes },
  { label: 'Medicine Forecasting', to: PATHS.PHARMACIST_FORECASTING, icon: TrendingUp },
  { label: 'Stock & Expiry', to: PATHS.PHARMACIST_STOCK_ALERTS, icon: PackageX },
  { label: 'Procurement', to: PATHS.PHARMACIST_ORDERS, icon: ShoppingCart },
  { label: 'Analytics', to: PATHS.PHARMACIST_ANALYTICS, icon: BarChart3 },
  { label: 'Reports', to: PATHS.PHARMACIST_REPORTS, icon: FileText },
  { label: 'Notifications', to: PATHS.PHARMACIST_NOTIFICATIONS, icon: Bell },
  { label: 'Profile', to: PATHS.PROFILE, icon: User },
  { label: 'Settings', to: PATHS.SETTINGS, icon: Settings }
];

export default function PharmacistSidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2">
      <div className="font-bold text-lg text-slate-800 dark:text-white px-3 py-2">
        Pharmacist Portal
      </div>
      <nav className="space-y-1">
        {PHARMACIST_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
