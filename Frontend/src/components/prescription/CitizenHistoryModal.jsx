import React, { useEffect, useState } from 'react';
import { User, Pill, Calendar, Stethoscope, Search, FileText } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { SkeletonGrid } from '../common/Skeleton';
import { fetchCitizenPrescriptionHistory } from '../../api/prescriptionApi';

const STATUS_TONE = {
  pending: 'amber',
  verified: 'sky',
  approved: 'brand',
  available: 'brand',
  dispensed: 'brand',
  rejected: 'rose',
  cancelled: 'rose',
};

export default function CitizenHistoryModal({ open, onClose, citizenId, patientName }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (open && (citizenId || patientName)) {
      setLoading(true);
      const query = citizenId || patientName;
      fetchCitizenPrescriptionHistory(query)
        .then(data => setPrescriptions(data))
        .catch(() => setPrescriptions([]))
        .finally(() => setLoading(false));
    }
  }, [open, citizenId, patientName]);

  const filtered = prescriptions.filter(p => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (p.patientName && p.patientName.toLowerCase().includes(q)) ||
      (p.doctorName && p.doctorName.toLowerCase().includes(q)) ||
      (p.diagnosis && p.diagnosis.toLowerCase().includes(q)) ||
      (Array.isArray(p.medicines) && p.medicines.some(m => m.toLowerCase().includes(q)))
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Citizen Prescription History — ${patientName || citizenId || 'Patient'}`}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <input
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter citizen history by medicine, doctor, or diagnosis..."
            className="input-field text-xs pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        {loading ? (
          <SkeletonGrid count={3} className="grid gap-3" />
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-white/10">
            <FileText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p>No prescription history records found for this citizen.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="surface-card space-y-2 p-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User className="h-4 w-4 text-brand-500" />
                      {item.patientName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="h-3.5 w-3.5" /> {item.doctorName || item.referredBy}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[item.status] || 'neutral'}>
                    {item.status}
                  </Badge>
                </div>

                {item.diagnosis && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong className="font-semibold text-slate-700 dark:text-slate-200">Diagnosis:</strong> {item.diagnosis}
                  </p>
                )}

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Prescribed Medicines</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {Array.isArray(item.medicines) && item.medicines.length > 0 ? (
                      item.medicines.map((m, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-300"
                        >
                          <Pill className="h-3 w-3 text-brand-500" />
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No medicines listed</span>
                    )}
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs italic text-slate-500 dark:text-slate-400 pt-1">
                    "{item.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
