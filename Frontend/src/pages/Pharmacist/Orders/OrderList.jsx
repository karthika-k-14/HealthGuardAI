import React from 'react';
import { Search, Plus, Eye, Trash2, ShoppingBag, Sparkles, RefreshCw, Calendar } from 'lucide-react';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

const STATUS_TONES = {
  DRAFT: 'neutral',
  PLACED: 'amber',
  APPROVED: 'sky',
  SHIPPED: 'brand',
  DELIVERED: 'emerald',
  CANCELLED: 'rose'
};

const STATUS_TABS = ['ALL', 'DRAFT', 'PLACED', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderList({
  orders,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  orderDateFilter,
  onOrderDateFilterChange,
  onNewOrderClick,
  onOpenAiRecommendations,
  onViewClick,
  onUpdateStatusClick,
  onDeleteClick
}) {
  return (
    <div className="surface-card rounded-2xl p-5 space-y-4 border border-slate-200/70 dark:border-white/10 shadow-sm">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-white/10 pb-3 text-xs font-semibold scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onStatusFilterChange(tab)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
              }`}
            >
              {tab === 'ALL' ? 'All Orders' : tab}
            </button>
          );
        })}
      </div>

      {/* Controls Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by order #, supplier name, remarks..."
              className="input-field pl-9 text-sm w-full"
            />
          </div>

          <div className="relative flex items-center">
            <input
              type="date"
              value={orderDateFilter}
              onChange={(e) => onOrderDateFilterChange(e.target.value)}
              className="input-field text-xs py-2 pr-2"
              title="Filter by Order Date"
            />
            {orderDateFilter && (
              <button
                type="button"
                onClick={() => onOrderDateFilterChange('')}
                className="ml-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={onOpenAiRecommendations}
            className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Forecast
          </Button>

          <Button onClick={onNewOrderClick} className="flex items-center gap-2 text-xs">
            <Plus className="h-4 w-4" /> Create Order
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="py-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200">No orders found</p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL' || orderDateFilter
              ? 'No orders match your search keywords or filter criteria.'
              : 'Start your procurement workflow by placing a medicine order with supplier details.'}
          </p>
          {!search && statusFilter === 'ALL' && !orderDateFilter && (
            <Button onClick={onNewOrderClick} variant="secondary" className="mt-4 inline-flex items-center gap-2 text-xs">
              <Plus className="h-4 w-4" /> Create First Order
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2">Order Number</th>
                <th className="pb-3">Supplier Name</th>
                <th className="pb-3">Supplier Contact</th>
                <th className="pb-3">Order Date</th>
                <th className="pb-3 text-center">Total Items</th>
                <th className="pb-3 text-center">Total Qty</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3">Expected Delivery</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
              {orders.map((o) => {
                const isDraft = o.status?.toUpperCase() === 'DRAFT';
                const isDelivered = o.status?.toUpperCase() === 'DELIVERED';
                const isCancelled = o.status?.toUpperCase() === 'CANCELLED';

                return (
                  <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-semibold text-slate-900 dark:text-white">
                      {o.orderNumber}
                    </td>

                    <td className="py-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {o.supplierName}
                    </td>

                    <td className="py-3.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
                      {o.supplierContact || o.supplierEmail || '—'}
                    </td>

                    <td className="py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {o.orderDate || '—'}
                    </td>

                    <td className="py-3.5 text-center font-semibold text-slate-900 dark:text-white">
                      {o.totalItems ?? o.items?.length ?? 0}
                    </td>

                    <td className="py-3.5 text-center font-mono font-bold text-brand-600 dark:text-brand-400">
                      {o.totalQuantity ?? 0}
                    </td>

                    <td className="py-3.5 text-center">
                      <Badge tone={STATUS_TONES[o.status?.toUpperCase()] || 'neutral'}>
                        {o.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {o.expectedDeliveryDate || 'Standard'}
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewClick(o)}
                          title="View order details"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {!isDelivered && !isCancelled && (
                          <button
                            type="button"
                            onClick={() => onUpdateStatusClick(o)}
                            title="Update status"
                            className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}

                        {isDraft && (
                          <button
                            type="button"
                            onClick={() => onDeleteClick(o)}
                            title="Delete draft order"
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
