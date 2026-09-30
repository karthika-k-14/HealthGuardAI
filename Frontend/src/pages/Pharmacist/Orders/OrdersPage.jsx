import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  fetchOrders,
  fetchOrderStatistics,
  fetchForecastRecommendations,
  createOrder,
  updateOrderStatus,
  deleteOrder
} from '../../../api/orderApi';
import { fetchMedicines } from '../../../api/pharmacistApi';
import OrderStatisticsCard from './OrderStatisticsCard';
import OrderList from './OrderList';
import CreateOrderModal from './CreateOrderModal';
import OrderDetailsDrawer from './OrderDetailsDrawer';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { SkeletonGrid } from '../../../components/common/Skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = ['PLACED', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [forecastRecommendations, setForecastRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [orderDateFilter, setOrderDateFilter] = useState('');

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Quick Status Update Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [orderForStatusUpdate, setOrderForStatusUpdate] = useState(null);
  const [quickTargetStatus, setQuickTargetStatus] = useState('PLACED');
  const [quickRemarks, setQuickRemarks] = useState('');

  // Delete Draft Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load auxiliary data (medicines, AI forecasts)
  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchMedicines(),
      fetchForecastRecommendations()
    ])
      .then(([medsData, forecastData]) => {
        if (!mounted) return;
        setMedicines(Array.isArray(medsData) ? medsData : []);
        setForecastRecommendations(Array.isArray(forecastData) ? forecastData : []);
      })
      .catch((err) => {
        console.error('Failed to load order auxiliary data:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Load orders & stats
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        fetchOrders({
          status: statusFilter,
          orderDate: orderDateFilter || null,
          search
        }),
        fetchOrderStatistics()
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, orderDateFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  const handleCreateOrder = async (payload) => {
    try {
      const created = await createOrder(payload);
      toast.success(`Order ${created.orderNumber || ''} placed successfully!`);
      setCreateModalOpen(false);
      loadOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create order';
      toast.error(msg);
      throw err;
    }
  };

  const handleUpdateStatus = async (orderId, payload) => {
    try {
      setIsUpdatingStatus(true);
      const updated = await updateOrderStatus(orderId, payload);
      toast.success(`Order ${updated.orderNumber} status updated to ${updated.status}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      loadOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update order status';
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleQuickStatusSubmit = async (e) => {
    e.preventDefault();
    if (!orderForStatusUpdate) return;
    try {
      setIsUpdatingStatus(true);
      await updateOrderStatus(orderForStatusUpdate.id, {
        status: quickTargetStatus,
        remarks: quickRemarks || undefined
      });
      toast.success(`Order ${orderForStatusUpdate.orderNumber} status updated to ${quickTargetStatus}`);
      setStatusModalOpen(false);
      setOrderForStatusUpdate(null);
      loadOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update order status';
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setIsDeleting(true);
      await deleteOrder(orderToDelete.id);
      toast.success(`Draft order ${orderToDelete.orderNumber} deleted successfully`);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
      loadOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to delete draft order';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const openQuickStatusModal = (order) => {
    setOrderForStatusUpdate(order);
    const curr = order.status?.toUpperCase();
    const defaults = {
      DRAFT: 'PLACED',
      PLACED: 'APPROVED',
      APPROVED: 'SHIPPED',
      SHIPPED: 'DELIVERED'
    };
    setQuickTargetStatus(defaults[curr] || 'PLACED');
    setQuickRemarks('');
    setStatusModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Medicine Orders Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Streamlined procurement workflow with direct supplier information, AI demand forecast assistance, and automated inventory delivery.
          </p>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <OrderStatisticsCard stats={stats} loading={loading && !stats} />

      {/* Orders Table & Filters */}
      {loading && orders.length === 0 ? (
        <SkeletonGrid count={5} className="grid gap-3" />
      ) : (
        <OrderList
          orders={orders}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          orderDateFilter={orderDateFilter}
          onOrderDateFilterChange={setOrderDateFilter}
          onNewOrderClick={() => setCreateModalOpen(true)}
          onOpenAiRecommendations={() => {
            setCreateModalOpen(true);
          }}
          onViewClick={(order) => {
            setSelectedOrder(order);
            setDetailsDrawerOpen(true);
          }}
          onUpdateStatusClick={openQuickStatusModal}
          onDeleteClick={(order) => {
            setOrderToDelete(order);
            setDeleteModalOpen(true);
          }}
        />
      )}

      {/* Create Order Modal */}
      {createModalOpen && (
        <CreateOrderModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateOrder}
          medicines={medicines}
          forecastRecommendations={forecastRecommendations}
        />
      )}

      {/* Order Details Drawer */}
      {detailsDrawerOpen && (
        <OrderDetailsDrawer
          open={detailsDrawerOpen}
          onClose={() => {
            setDetailsDrawerOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdatingStatus}
        />
      )}

      {/* Quick Status Update Modal */}
      {statusModalOpen && orderForStatusUpdate && (
        <Modal
          open={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false);
            setOrderForStatusUpdate(null);
          }}
          title={`Update Status: ${orderForStatusUpdate.orderNumber}`}
        >
          <form onSubmit={handleQuickStatusSubmit} className="space-y-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Supplier: <span className="font-semibold text-slate-800 dark:text-slate-200">{orderForStatusUpdate.supplierName}</span> · Current Status:{' '}
              <span className="font-bold text-brand-600 dark:text-brand-400">{orderForStatusUpdate.status}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Status
              </label>
              <select
                value={quickTargetStatus}
                onChange={(e) => setQuickTargetStatus(e.target.value)}
                className="input-field text-sm w-full font-medium"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {quickTargetStatus === 'DELIVERED' && (
                <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Notice: Setting status to DELIVERED will automatically increase medicine quantities in inventory.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Remarks / Change Notes
              </label>
              <textarea
                rows="2"
                value={quickRemarks}
                onChange={(e) => setQuickRemarks(e.target.value)}
                placeholder="e.g., Confirmed delivery, goods verified..."
                className="input-field text-xs w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setStatusModalOpen(false);
                  setOrderForStatusUpdate(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isUpdatingStatus}>
                Update Status
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Draft Order Modal */}
      {deleteModalOpen && orderToDelete && (
        <Modal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setOrderToDelete(null);
          }}
          title="Delete Draft Order"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 p-3 text-rose-700 dark:text-rose-300 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-xs">
                Are you sure you want to permanently delete draft order{' '}
                <strong>{orderToDelete.orderNumber}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setOrderToDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteOrder}
                isLoading={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Draft
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
