import React, { useState } from 'react';
import {
  ShoppingBag,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  Pill,
  History
} from 'lucide-react';
import Modal from '../../../components/common/Modal';
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

const NEXT_STATUS = {
  DRAFT: { next: 'PLACED', label: 'Place Order' },
  PLACED: { next: 'APPROVED', label: 'Approve Order' },
  APPROVED: { next: 'SHIPPED', label: 'Mark as Shipped' },
  SHIPPED: { next: 'DELIVERED', label: 'Confirm Delivery & Increase Stock' }
};

export default function OrderDetailsDrawer({
  open,
  onClose,
  order,
  onUpdateStatus,
  isUpdating
}) {
  const [remarks, setRemarks] = useState('');
  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  if (!order) return null;

  const currentStatus = order.status ? order.status.toUpperCase() : 'DRAFT';
  const nextAction = NEXT_STATUS[currentStatus];
  const canCancel = currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED';
  const isDelivered = currentStatus === 'DELIVERED';
  const isCancelled = currentStatus === 'CANCELLED';

  const handleAdvance = async (targetStatus) => {
    if (targetStatus === 'DELIVERED') {
      setConfirmDeliveryOpen(true);
      return;
    }
    await onUpdateStatus(order.id, {
      status: targetStatus,
      remarks: remarks || `Order advanced to ${targetStatus}`
    });
    setRemarks('');
  };

  const handleExecuteDelivery = async () => {
    await onUpdateStatus(order.id, {
      status: 'DELIVERED',
      remarks: remarks || 'Shipment received at PHC Dispensary. Inventory stock automatically increased.'
    });
    setConfirmDeliveryOpen(false);
    setRemarks('');
  };

  const handleExecuteCancel = async () => {
    await onUpdateStatus(order.id, {
      status: 'CANCELLED',
      remarks: remarks || 'Order cancelled by pharmacist.'
    });
    setConfirmCancelOpen(false);
    setRemarks('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Order Details & Lifecycle"
      className="max-w-2xl"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base font-mono">
                  {order.orderNumber}
                </h3>
                <Badge tone={STATUS_TONES[currentStatus] || 'neutral'}>
                  {currentStatus}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Created by {order.createdBy || 'Pharmacist'} · Placed on {order.orderDate || 'Today'}
              </p>
            </div>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex items-center gap-2">
            {!isDelivered && !isCancelled && nextAction && (
              <Button
                type="button"
                isLoading={isUpdating}
                onClick={() => handleAdvance(nextAction.next)}
                className={`text-xs px-3.5 py-1.5 flex items-center gap-1.5 ${
                  nextAction.next === 'DELIVERED'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : ''
                }`}
              >
                {nextAction.label} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(true)}
                className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3.5 border border-slate-200 dark:border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Status Timeline
          </p>
          <div className="flex items-center justify-between text-xs font-semibold">
            {['DRAFT', 'PLACED', 'APPROVED', 'SHIPPED', 'DELIVERED'].map((st, i) => {
              const orderMap = { DRAFT: 0, PLACED: 1, APPROVED: 2, SHIPPED: 3, DELIVERED: 4 };
              const currentIdx = orderMap[currentStatus] ?? -1;
              const isPastOrCurrent = currentIdx >= i;
              const isCurrent = currentStatus === st;

              return (
                <div key={st} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                      isCurrent
                        ? isDelivered
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-brand-500 text-white shadow-sm'
                        : isPastOrCurrent && !isCancelled
                        ? 'text-brand-600 dark:text-brand-400 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>{st}</span>
                  </div>
                  {i < 4 && (
                    <div
                      className={`flex-1 h-0.5 mx-1.5 ${
                        isPastOrCurrent && !isCancelled && currentIdx > i
                          ? 'bg-brand-500'
                          : 'bg-slate-200 dark:bg-white/10'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {isCancelled && (
            <div className="mt-2 text-xs font-semibold text-rose-500 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" /> Order Cancelled
            </div>
          )}
        </div>

        {/* Supplier Information & Order Information Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Supplier Information */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3.5 bg-slate-50/50 dark:bg-white/5 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-brand-500" /> Supplier Information
            </p>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">
              {order.supplierName}
            </p>
            {order.supplierContact && (
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-slate-400" /> {order.supplierContact}
              </p>
            )}
            {order.supplierEmail && (
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-slate-400" /> {order.supplierEmail}
              </p>
            )}
            {order.supplierAddress && (
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" /> {order.supplierAddress}
              </p>
            )}
          </div>

          {/* Order Information */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3.5 bg-slate-50/50 dark:bg-white/5 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-500" /> Order Information
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Order Number:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order Date:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{order.orderDate || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expected Delivery:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{order.expectedDeliveryDate || 'Standard'}</span>
              </div>
              {order.actualDeliveryDate && (
                <div className="flex justify-between">
                  <span className="text-emerald-500 font-medium">Actual Delivery:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{order.actualDeliveryDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{order.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medicine Information Section */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-brand-500" /> Medicine Information ({order.items?.length || 0} items)
            </p>
            <p className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
              Total: {order.totalQuantity ?? 0} units
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase text-slate-400">
                  <th className="pb-2">Medicine Name</th>
                  <th className="pb-2 text-center">Ordered Qty</th>
                  <th className="pb-2 text-center">Current Stock</th>
                  <th className="pb-2 text-center">Pred. Demand</th>
                  <th className="pb-2 text-center">Recommended</th>
                  {isDelivered && <th className="pb-2 text-center text-emerald-600">Received Qty</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                      {item.medicineName}
                    </td>
                    <td className="py-2.5 text-center font-bold font-mono text-brand-600 dark:text-brand-400">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-600 dark:text-slate-400">
                      {item.currentStock ?? '—'}
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-600 dark:text-slate-400">
                      {item.predictedDemand ?? '—'}
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-600 dark:text-slate-400">
                      {item.recommendedOrder ?? '—'}
                    </td>
                    {isDelivered && (
                      <td className="py-2.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.receivedQuantity || item.quantity}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks */}
        {order.remarks && (
          <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3 bg-slate-50/50 dark:bg-white/5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Remarks
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              {order.remarks}
            </p>
          </div>
        )}

        {/* Audit History Timeline */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3.5 space-y-2.5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-brand-500" /> Audit History
          </p>

          <div className="space-y-2">
            {(order.statusHistory || []).map((h, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs border-l-2 border-brand-500/40 pl-3 py-1"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={STATUS_TONES[h.newStatus?.toUpperCase()] || 'neutral'}>
                      {h.newStatus}
                    </Badge>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {h.changedAt ? new Date(h.changedAt).toLocaleString() : 'Recent'}
                    </span>
                    <span className="text-slate-500 font-medium">by {h.changedBy || 'Pharmacist'}</span>
                  </div>
                  {h.remarks && (
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      {h.remarks}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delivery */}
      {confirmDeliveryOpen && (
        <Modal
          open={confirmDeliveryOpen}
          onClose={() => setConfirmDeliveryOpen(false)}
          title="Confirm Delivery & Increase Inventory"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Automatic Inventory Update</p>
                <p className="mt-0.5">
                  Confirming delivery will automatically increase medicine quantities in inventory for all {order.items?.length} items ({order.totalQuantity} total units).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Delivery Verification Remarks
              </label>
              <textarea
                rows="2"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g., Verified batch numbers and seal integrity upon receipt at dispensary."
                className="input-field text-xs w-full"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setConfirmDeliveryOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleExecuteDelivery}
                isLoading={isUpdating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirm Delivery
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal for Cancel */}
      {confirmCancelOpen && (
        <Modal
          open={confirmCancelOpen}
          onClose={() => setConfirmCancelOpen(false)}
          title="Cancel Order"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 p-3 text-rose-700 dark:text-rose-300 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-xs">
                Are you sure you want to cancel order <strong>{order.orderNumber}</strong>? Cancelled orders cannot be delivered or modified later.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cancellation Reason
              </label>
              <textarea
                rows="2"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g., Supplier unable to fulfill order; batch unavailable."
                className="input-field text-xs w-full"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setConfirmCancelOpen(false)}>
                Back
              </Button>
              <Button
                type="button"
                onClick={handleExecuteCancel}
                isLoading={isUpdating}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Cancel Order
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
