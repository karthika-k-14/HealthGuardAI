import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, Plus, Pencil, Trash2, Eye, Boxes } from 'lucide-react';
import {
  fetchMedicines as fetchInventory,
  fetchMedicineCategories as fetchInventoryCategories,
  addMedicine as addInventoryItem,
  updateMedicine as updateInventoryItem,
  deleteMedicine as deleteInventoryItem,
} from '../../api/pharmacistApi';
import { flagLowStock } from '../../api/workflowApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const STOCK_STATUSES = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Expired'];
const STATUS_TONE = { 'In Stock': 'brand', 'Low Stock': 'amber', 'Out of Stock': 'rose', Expired: 'rose' };

function ItemFormModal({ open, onClose, onSubmit, defaultValues, title }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          onClose();
        })}
        className="space-y-3"
      >
        <input {...register('name', { required: true })} placeholder="Medicine name" className="input-field text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input {...register('category', { required: true })} placeholder="Category" className="input-field text-sm" />
          <input {...register('manufacturer', { required: true })} placeholder="Manufacturer" className="input-field text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input {...register('batchNumber', { required: true })} placeholder="Batch number" className="input-field text-sm" />
          <input
            {...register('quantity', { required: true, valueAsNumber: true, min: 0 })}
            type="number"
            placeholder="Quantity"
            className="input-field text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input {...register('unit', { required: true })} placeholder="Unit (tablets, vials…)" className="input-field text-sm" />
          <input {...register('expiryDate', { required: true })} type="date" className="input-field text-sm" />
        </div>
        <input
          {...register('price', { required: true, valueAsNumber: true, min: 0 })}
          type="number"
          step="0.1"
          placeholder="Price"
          className="input-field text-sm"
        />
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
          Save
        </Button>
      </form>
    </Modal>
  );
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stockStatus, setStockStatus] = useState('All');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchInventoryCategories().then(setCategories);
  }, []);

  const load = () => {
    setIsLoading(true);
    fetchInventory({ search, category, stockStatus }).then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    const handle = setTimeout(load, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, stockStatus]);

  const handleAdd = async (values) => {
    const item = await addInventoryItem(values);
    toast.success('Medicine added to inventory');
    await maybeFlagLowStock(item);
    load();
  };

  const handleEdit = async (values) => {
    const item = await updateInventoryItem(editing.id, values);
    toast.success('Medicine updated');
    await maybeFlagLowStock(item);
    load();
  };

  // Pharmacist -> Health Officer: any item that drops to Low/Out of
  // Stock automatically notifies the Health Officer (and Admin, for a
  // full stock-out) through the shared workflow engine.
  const maybeFlagLowStock = async (item) => {
    if (item && (item.stockStatus === 'Low Stock' || item.stockStatus === 'Out of Stock')) {
      await flagLowStock({ medicine: item.name, quantity: item.quantity, pharmacyName: 'CareWell Pharmacy' });
    }
  };

  const handleDelete = async (id) => {
    await deleteInventoryItem(id);
    toast.success('Medicine removed');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Medicine Inventory</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage stock, batches, and expiry dates.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-sm">
          <Plus className="h-4 w-4" /> Add Medicine
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or manufacturer…"
            className="input-field pl-10"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-full text-sm sm:w-44">
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className="input-field w-full text-sm sm:w-44">
          {STOCK_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && items.length === 0 && (
        <div className="surface-card flex flex-col items-center gap-2 p-10 text-center text-sm text-slate-500">
          <Boxes className="h-6 w-6 text-slate-400" />
          No medicines match your search.
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="surface-card space-y-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <Badge tone={STATUS_TONE[item.stockStatus] || 'neutral'}>{item.stockStatus}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.category} · {item.manufacturer}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Qty: {item.quantity} {item.unit}</span>
                <span>Batch: {item.batchNumber}</span>
                <span className={cn(new Date(item.expiryDate) < new Date() && 'text-signal-rose')}>
                  Exp: {new Date(item.expiryDate).toLocaleDateString()}
                </span>
                <span>₹{item.price}</span>
              </div>
              <div className="flex items-center justify-end gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setViewing(item)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5"
                  aria-label="View"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-signal-rose/10 hover:text-signal-rose"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ItemFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        defaultValues={{ name: '', category: '', manufacturer: '', batchNumber: '', quantity: 0, unit: 'tablets', expiryDate: '', price: 0 }}
        title="Add Medicine"
      />

      <ItemFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        defaultValues={editing || {}}
        title="Edit Medicine"
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name}>
        {viewing && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Category', viewing.category],
              ['Manufacturer', viewing.manufacturer],
              ['Batch Number', viewing.batchNumber],
              ['Quantity', `${viewing.quantity} ${viewing.unit}`],
              ['Expiry Date', new Date(viewing.expiryDate).toLocaleDateString()],
              ['Price', `₹${viewing.price}`],
              ['Stock Status', viewing.stockStatus],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="text-slate-800 dark:text-slate-100">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}
