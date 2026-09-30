import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  Boxes,
  CalendarX2,
  ShoppingCart,
  AlertTriangle,
  Download,
  RefreshCw,
  ArrowRight,
  PackageX,
  FileText
} from 'lucide-react';
import { fetchPharmacistReport } from '../../api/pharmacistApi';
import { Spinner } from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { PATHS } from '../../constants/routes';

// CORE PHARMACIST REPORTS
const PHARMACIST_REPORT_TYPES = [
  {
    key: 'inventory',
    label: 'Inventory Report',
    icon: Boxes,
    tone: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-200 dark:border-purple-900/40',
    description: 'Current stock levels, low-stock medicines, and out-of-stock items.',
    badges: ['Stock Levels', 'Low Stock', 'Out of Stock']
  },
  {
    key: 'expiry',
    label: 'Expiry Alert Report',
    icon: CalendarX2,
    tone: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-200 dark:border-rose-900/40',
    description: 'Expired medicines, batches expiring in 30 days and 60 days.',
    badges: ['Expired', '≤ 30 Days', '≤ 60 Days']
  },
  {
    key: 'procurement',
    label: 'Procurement Report',
    icon: ShoppingCart,
    tone: 'text-brand-600 dark:text-brand-400 bg-brand-500/10 border-brand-200 dark:border-brand-900/40',
    description: 'Purchase orders, pending & completed deliveries, and supplier summary.',
    badges: ['Orders Placed', 'Pending Deliveries', 'Completed Deliveries']
  }
];

export default function Reports() {
  const [activeReportKey, setActiveReportKey] = useState('inventory');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async (key) => {
    setLoading(true);
    setActiveReportKey(key);
    try {
      const data = await fetchPharmacistReport(key);
      setReportData(data);
    } catch (err) {
      toast.error(`Failed to load ${key} report.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport('inventory');
  }, []);

  const handleDownload = () => {
    const active = PHARMACIST_REPORT_TYPES.find((r) => r.key === activeReportKey);
    toast.success(`Exporting ${active?.label || 'Report'} as PDF...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Pharmacy Operational Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time analytics for inventory levels, batch expiries, and procurement orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadReport(activeReportKey)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            disabled={loading || !reportData}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download Summary
          </Button>
        </div>
      </div>

      {/* 3 Essential Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PHARMACIST_REPORT_TYPES.map((r) => {
          const isSelected = activeReportKey === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => loadReport(r.key)}
              className={`surface-card flex flex-col p-5 text-left transition-all border rounded-2xl hover:-translate-y-0.5 ${
                isSelected
                  ? 'ring-2 ring-brand-500 border-brand-500/50 bg-brand-50/20 dark:bg-brand-500/5 shadow-md'
                  : 'hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${r.tone}`}>
                  <r.icon className="h-5 w-5" />
                </span>
                {isSelected && (
                  <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
                )}
              </div>
              <p className="mt-4 font-semibold text-slate-900 dark:text-white text-base">
                {r.label}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {r.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.badges.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Report View */}
      {loading ? (
        <div className="surface-card flex flex-col items-center justify-center py-20">
          <Spinner size={32} />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Generating live operational report...
          </p>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Report Meta Header */}
          <div className="surface-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {reportData.reportTitle || 'Operational Report'}
                </h2>
                <Badge tone="brand">{reportData.reportType || activeReportKey.toUpperCase()}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Generated: {reportData.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : new Date().toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeReportKey === 'inventory' && (
                <Link
                  to={PATHS.PHARMACIST_INVENTORY}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 transition-colors"
                >
                  Manage Inventory <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              {activeReportKey === 'expiry' && (
                <Link
                  to={PATHS.PHARMACIST_STOCK_ALERTS}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 transition-colors"
                >
                  Review Expiry Alerts <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              {activeReportKey === 'procurement' && (
                <Link
                  to={PATHS.PHARMACIST_ORDERS}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300 transition-colors"
                >
                  Purchase Orders <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          {/* REPORT 1: INVENTORY REPORT VIEW */}
          {activeReportKey === 'inventory' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="surface-card p-5 border rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">Total Catalogue Medicines</span>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {reportData.totalMedicines ?? 0}
                  </p>
                </div>
                <div className="surface-card p-5 border rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">In-Stock Healthy Items</span>
                  <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {reportData.inStockCount ?? 0}
                  </p>
                </div>
                <div className="surface-card p-5 border rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">Low Stock Items</span>
                  <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {reportData.lowStockCount ?? 0}
                  </p>
                </div>
                <div className="surface-card p-5 border rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">Out-of-Stock Items</span>
                  <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {reportData.outOfStockCount ?? 0}
                  </p>
                </div>
              </div>

              {/* Low Stock & Out of Stock Breakdowns */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="surface-card p-5 rounded-2xl border">
                  <div className="flex items-center gap-2 mb-3">
                    <PackageX className="h-4 w-4 text-amber-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      Low Stock Medicines (Action Required)
                    </h3>
                  </div>
                  {(!reportData.lowStockMedicines || reportData.lowStockMedicines.length === 0) ? (
                    <p className="text-xs text-slate-400 py-3">No medicines currently in low-stock status.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-60 overflow-y-auto">
                      {reportData.lowStockMedicines.map((m, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</p>
                            <p className="text-[11px] text-slate-400">Batch: {m.batchNumber || 'N/A'}</p>
                          </div>
                          <Badge tone="amber">{m.quantity} units left (Min: {m.minStockThreshold})</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="surface-card p-5 rounded-2xl border">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      Out-of-Stock Medicines
                    </h3>
                  </div>
                  {(!reportData.outOfStockMedicines || reportData.outOfStockMedicines.length === 0) ? (
                    <p className="text-xs text-slate-400 py-3">No out-of-stock items reported.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-60 overflow-y-auto">
                      {reportData.outOfStockMedicines.map((m, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</p>
                            <p className="text-[11px] text-slate-400">Category: {m.category || 'General'}</p>
                          </div>
                          <Badge tone="rose">0 units in stock</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Breakdown */}
              {reportData.categoryBreakdown && Object.keys(reportData.categoryBreakdown).length > 0 && (
                <div className="surface-card p-5 rounded-2xl border">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                    Inventory by Category
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Object.entries(reportData.categoryBreakdown).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{count} items</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REPORT 2: EXPIRY ALERT REPORT VIEW */}
          {activeReportKey === 'expiry' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="surface-card p-5 border rounded-xl border-rose-200 dark:border-rose-900/30">
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Expired Medicines</span>
                  <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {reportData.expiredCount ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Must be disposed / quarantined immediately</p>
                </div>
                <div className="surface-card p-5 border rounded-xl border-amber-200 dark:border-amber-900/30">
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Expiring within 30 Days</span>
                  <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {reportData.expiring30DaysCount ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">High urgency for rotation or reorder</p>
                </div>
                <div className="surface-card p-5 border rounded-xl border-blue-200 dark:border-blue-900/30">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Expiring within 60 Days</span>
                  <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {reportData.expiring60DaysCount ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Moderate urgency batch monitoring</p>
                </div>
              </div>

              {/* Expired Batches */}
              <div className="surface-card p-5 rounded-2xl border">
                <h3 className="font-semibold text-rose-600 dark:text-rose-400 text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Expired Stock List
                </h3>
                {(!reportData.expiredMedicines || reportData.expiredMedicines.length === 0) ? (
                  <p className="text-xs text-slate-400 py-3">No expired medicines in pharmacy inventory.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {reportData.expiredMedicines.map((m, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{m.name || m.medicineName}</p>
                          <p className="text-[11px] text-slate-400">Batch: {m.batchNumber || 'N/A'} • Expired: {m.expiryDate}</p>
                        </div>
                        <Badge tone="rose">{m.quantity ?? 0} units expired</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expiring Soon */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="surface-card p-5 rounded-2xl border">
                  <h3 className="font-semibold text-amber-600 dark:text-amber-400 text-sm mb-3">
                    Batches Expiring in ≤ 30 Days
                  </h3>
                  {(!reportData.expiring30DaysMedicines || reportData.expiring30DaysMedicines.length === 0) ? (
                    <p className="text-xs text-slate-400 py-3">No batches expiring within 30 days.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-56 overflow-y-auto">
                      {reportData.expiring30DaysMedicines.map((m, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{m.name || m.medicineName}</p>
                            <p className="text-[11px] text-slate-400">Batch: {m.batchNumber} • Expiry: {m.expiryDate}</p>
                          </div>
                          <Badge tone="amber">{m.quantity} units</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="surface-card p-5 rounded-2xl border">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-sm mb-3">
                    Batches Expiring in 31 - 60 Days
                  </h3>
                  {(!reportData.expiring60DaysMedicines || reportData.expiring60DaysMedicines.length === 0) ? (
                    <p className="text-xs text-slate-400 py-3">No batches expiring between 31-60 days.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-56 overflow-y-auto">
                      {reportData.expiring60DaysMedicines.map((m, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{m.name || m.medicineName}</p>
                            <p className="text-[11px] text-slate-400">Batch: {m.batchNumber} • Expiry: {m.expiryDate}</p>
                          </div>
                          <Badge tone="sky">{m.quantity} units</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* REPORT 3: PROCUREMENT REPORT VIEW */}
          {activeReportKey === 'procurement' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="surface-card p-5 border rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">Total Orders Placed</span>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {reportData.totalOrders ?? 0}
                  </p>
                </div>
                <div className="surface-card p-5 border rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">Pending Deliveries</span>
                  <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {reportData.pendingDeliveries ?? 0}
                  </p>
                </div>
                <div className="surface-card p-5 border rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">Completed Deliveries</span>
                  <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {reportData.completedDeliveries ?? 0}
                  </p>
                </div>
                <div className="surface-card p-5 border rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">Total Procurement Spend</span>
                  <p className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400">
                    ₹{(reportData.totalSpend ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Supplier-wise Procurement Summary */}
              {reportData.supplierBreakdown && Object.keys(reportData.supplierBreakdown).length > 0 && (
                <div className="surface-card p-5 rounded-2xl border">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                    Supplier-wise Procurement Summary
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {Object.entries(reportData.supplierBreakdown).map(([supplier, info]) => (
                      <div key={supplier} className="p-4 rounded-xl border border-slate-200/70 dark:border-white/10 space-y-2">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{supplier}</p>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Purchase Orders:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{info.orderCount}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Total Amount:</span>
                          <span className="font-semibold text-brand-600 dark:text-brand-400">
                            ₹{Number(info.totalSpend).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders List */}
              {reportData.orders && reportData.orders.length > 0 && (
                <div className="surface-card p-5 rounded-2xl border">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                    Recent Purchase Orders
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {reportData.orders.slice(0, 6).map((o) => (
                      <div key={o.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{o.orderNumber}</p>
                          <p className="text-[11px] text-slate-400">Supplier: {o.supplierName} • {o.orderDate}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            ₹{Number(o.totalAmount || 0).toLocaleString()}
                          </span>
                          <Badge tone={o.status === 'DELIVERED' ? 'emerald' : o.status === 'CANCELLED' ? 'rose' : 'amber'}>
                            {o.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

