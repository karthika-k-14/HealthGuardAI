import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, AlertCircle, Check, ArrowRight, Building2, Pill, Calendar, FileText } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';

export default function CreateOrderModal({
  open,
  onClose,
  onSubmit,
  medicines = [],
  forecastRecommendations = []
}) {
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'ai'

  // Supplier Information
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');

  // Order Information
  const [orderNumber, setOrderNumber] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [status, setStatus] = useState('PLACED');
  const [remarks, setRemarks] = useState('');

  // Medicine Information Items
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('form');
      setSupplierName('');
      setSupplierContact('');
      setSupplierEmail('');
      setSupplierAddress('');
      setOrderNumber('');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setExpectedDeliveryDate(defaultDate.toISOString().split('T')[0]);
      setStatus('PLACED');
      setRemarks('');
      setItems([]);
      setValidationError('');
    }
  }, [open]);

  const handleAddItem = () => {
    if (medicines.length === 0) return;
    const defaultMed = medicines[0];
    const stock = defaultMed.quantity ?? 0;
    const forecast = forecastRecommendations.find(
      (f) => String(f.medicineId) === String(defaultMed.id) || f.medicineName?.toLowerCase() === defaultMed.name?.toLowerCase()
    );
    const predicted = forecast ? forecast.predictedDemand : Math.max(50, stock * 2);
    const recommended = Math.max(0, predicted - stock);

    setItems((prev) => [
      ...prev,
      {
        medicineId: defaultMed.id,
        medicineName: defaultMed.name || defaultMed.medicineName,
        currentStock: stock,
        predictedDemand: predicted,
        recommendedOrder: recommended,
        quantity: recommended > 0 ? recommended : 50
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineSelect = (index, medicineId) => {
    const med = medicines.find((m) => String(m.id) === String(medicineId));
    if (!med) return;

    const stock = med.quantity ?? 0;
    const forecast = forecastRecommendations.find(
      (f) => String(f.medicineId) === String(med.id) || f.medicineName?.toLowerCase() === med.name?.toLowerCase()
    );
    const predicted = forecast ? forecast.predictedDemand : Math.max(50, stock * 2);
    const recommended = Math.max(0, predicted - stock);

    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        medicineId: med.id,
        medicineName: med.name || med.medicineName,
        currentStock: stock,
        predictedDemand: predicted,
        recommendedOrder: recommended,
        quantity: recommended > 0 ? recommended : (copy[index]?.quantity || 50)
      };
      return copy;
    });
  };

  const handleQuantityChange = (index, val) => {
    const qty = Math.max(1, parseInt(val) || 1);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: qty };
      return copy;
    });
  };

  const handleAddAiRecommendation = (rec) => {
    const existingIndex = items.findIndex(
      (i) => String(i.medicineId) === String(rec.medicineId)
    );
    const qty = rec.recommendedOrder > 0 ? rec.recommendedOrder : 50;

    if (existingIndex >= 0) {
      setItems((prev) => {
        const copy = [...prev];
        copy[existingIndex].quantity = qty;
        return copy;
      });
    } else {
      setItems((prev) => [
        ...prev,
        {
          medicineId: rec.medicineId,
          medicineName: rec.medicineName,
          currentStock: rec.currentStock ?? 0,
          predictedDemand: rec.predictedDemand ?? 0,
          recommendedOrder: rec.recommendedOrder ?? 0,
          quantity: qty
        }
      ]);
    }
  };

  const handleAddAllRecommendations = () => {
    const newItems = forecastRecommendations.map((rec) => ({
      medicineId: rec.medicineId,
      medicineName: rec.medicineName,
      currentStock: rec.currentStock ?? 0,
      predictedDemand: rec.predictedDemand ?? 0,
      recommendedOrder: rec.recommendedOrder ?? 0,
      quantity: rec.recommendedOrder > 0 ? rec.recommendedOrder : 50
    }));
    setItems(newItems);
    setActiveTab('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!supplierName.trim()) {
      setValidationError('Please provide the Supplier Name.');
      return;
    }

    if (items.length === 0) {
      setValidationError('Please select at least one medicine item to order.');
      return;
    }

    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) {
        setValidationError('Medicine quantity must be greater than zero.');
        return;
      }
    }

    const payload = {
      orderNumber: orderNumber.trim() || undefined,
      supplierName: supplierName.trim(),
      supplierContact: supplierContact.trim() || undefined,
      supplierEmail: supplierEmail.trim() || undefined,
      supplierAddress: supplierAddress.trim() || undefined,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
      status,
      remarks: remarks.trim() || undefined,
      items: items.map((i) => ({
        medicineId: i.medicineId,
        quantity: i.quantity,
        predictedDemand: i.predictedDemand,
        recommendedOrder: i.recommendedOrder
      }))
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
    } catch (err) {
      setValidationError(err?.response?.data?.message || err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Medicine Procurement Order"
      className="max-w-3xl"
    >
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-white/10 mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`pb-2.5 px-4 transition-colors border-b-2 ${
            activeTab === 'form'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Order Form ({items.length} items)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`pb-2.5 px-4 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'ai'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-amber-600 dark:text-amber-400 hover:text-amber-700'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Forecast Recommendations
          {forecastRecommendations.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px]">
              {forecastRecommendations.length}
            </span>
          )}
        </button>
      </div>

      {validationError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {activeTab === 'ai' ? (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/30">
            <div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Demand Forecasting AI Model
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Formula: Recommended Order = Math.max(0, Predicted Demand - Current Stock)
              </p>
            </div>
            {forecastRecommendations.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddAllRecommendations}
                className="text-xs flex items-center gap-1.5 py-1 px-3 border-amber-300 dark:border-amber-700"
              >
                Add All ({forecastRecommendations.length}) <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="grid gap-2.5">
            {forecastRecommendations.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All inventory items currently maintain safe stock levels.
              </p>
            ) : (
              forecastRecommendations.map((rec) => {
                const isSelected = items.some((i) => String(i.medicineId) === String(rec.medicineId));
                return (
                  <div
                    key={rec.medicineId}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-500/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                          {rec.medicineName}
                        </p>
                        <Badge tone={rec.riskLevel === 'CRITICAL' ? 'rose' : rec.riskLevel === 'HIGH' ? 'amber' : 'neutral'}>
                          {rec.riskLevel || 'MEDIUM'} RISK
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Current Stock: <span className="font-semibold text-slate-700 dark:text-slate-300">{rec.currentStock}</span> ·
                        Predicted Demand: <span className="font-semibold text-slate-700 dark:text-slate-300">{rec.predictedDemand}</span> ·
                        Recommended: <span className="font-semibold text-brand-600 dark:text-brand-400">{rec.recommendedOrder} units</span>
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant={isSelected ? 'secondary' : 'primary'}
                      onClick={() => handleAddAiRecommendation(rec)}
                      className="text-xs py-1 px-3 flex items-center gap-1"
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      {isSelected ? 'Added' : 'Add to Order'}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Section 1: Supplier Information */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Building2 className="h-4 w-4 text-brand-500" />
              <span>Supplier Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g., MedLife Pharma Supplies"
                  className="input-field text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier Contact Number
                </label>
                <input
                  type="text"
                  value={supplierContact}
                  onChange={(e) => setSupplierContact(e.target.value)}
                  placeholder="e.g., +91 98765 43210"
                  className="input-field text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier Email
                </label>
                <input
                  type="email"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  placeholder="e.g., orders@medlifepharma.com"
                  className="input-field text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier Address
                </label>
                <input
                  type="text"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  placeholder="e.g., Plot 42, Infocity Road, Bhubaneswar"
                  className="input-field text-sm w-full"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Medicine Information */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Pill className="h-4 w-4 text-brand-500" />
                <span>Medicine Information</span>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddItem}
                className="text-xs py-1 px-2.5 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Medicine
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                <p className="text-xs text-slate-400">No medicines added to order yet.</p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddItem}
                  className="mt-2 text-xs py-1 px-3 inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3 w-3" /> Select Medicine
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Medicine
                      </label>
                      <select
                        value={item.medicineId}
                        onChange={(e) => handleMedicineSelect(idx, e.target.value)}
                        className="input-field text-xs w-full py-1.5"
                      >
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name || m.medicineName} (Stock: {m.quantity ?? 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Current Stock
                      </label>
                      <div className="text-xs font-mono font-semibold py-1.5 px-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300">
                        {item.currentStock ?? 0}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1" title="Predicted Demand">
                        Pred. Demand
                      </label>
                      <div className="text-xs font-mono font-semibold py-1.5 px-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300">
                        {item.predictedDemand ?? 0}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase mb-1">
                        Order Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, e.target.value)}
                        className="input-field text-xs w-full py-1.5 font-bold text-brand-600 dark:text-brand-400"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Order Information */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4 text-brand-500" />
              <span>Order Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Order # (Optional)
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="input-field text-sm w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="input-field text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field text-sm w-full"
                >
                  <option value="PLACED">PLACED (Submit to Supplier)</option>
                  <option value="DRAFT">DRAFT (Save as Draft)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Remarks / Notes
              </label>
              <textarea
                rows="2"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Urgent delivery instructions, batch notes, or PHC procurement reference..."
                className="input-field text-xs w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="min-w-[120px]">
              {status === 'DRAFT' ? 'Save Draft' : 'Place Order'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
