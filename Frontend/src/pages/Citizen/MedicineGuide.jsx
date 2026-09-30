import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Pill, Clock, Plus, Calendar, Edit2, CheckCircle2, XCircle, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchCitizenReminders,
  fetchAdherenceSummary,
  createReminder,
  updateReminder,
  markReminderComplete,
  markReminderMissed,
  deleteReminder
} from '../../api/reminderApi';

export default function MedicineGuide() {
  const { user } = useAuth();
  const citizenId = user?.citizenId || user?.id || user?.userId || 1;

  const [reminders, setReminders] = useState([]);
  const [adherence, setAdherence] = useState({
    completedDoses: 0,
    missedDoses: 0,
    totalScheduledDoses: 0,
    adherencePercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Daily',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reminderTime: '08:00 AM'
  });

  const loadReminders = useCallback(async (targetId = citizenId) => {
    setLoading(true);
    try {
      const [remindersData, summaryData] = await Promise.all([
        fetchCitizenReminders(targetId),
        fetchAdherenceSummary(targetId)
      ]);
      setReminders(remindersData || []);
      if (summaryData) {
        setAdherence({
          completedDoses: summaryData.completedDoses || 0,
          missedDoses: summaryData.missedDoses || 0,
          totalScheduledDoses: summaryData.totalScheduledDoses ?? summaryData.activeReminders ?? (remindersData?.length || 0),
          adherencePercent: summaryData.adherencePercent ?? summaryData.adherencePercentage ?? 0,
        });
      }
    } catch (err) {
      toast.error('Failed to load medicine reminders');
    } finally {
      setLoading(false);
    }
  }, [citizenId]);

  useEffect(() => {
    if (citizenId) {
      loadReminders(citizenId);
    }
  }, [citizenId, loadReminders]);

  function openCreateModal() {
    setEditingId(null);
    setForm({
      medicineName: '',
      dosage: '',
      frequency: 'Daily',
      notes: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reminderTime: '08:00 AM'
    });
    setIsModalOpen(true);
  }

  function openEditModal(reminder) {
    setEditingId(reminder.id);
    setForm({
      medicineName: reminder.medicineName || '',
      dosage: reminder.dosage || '',
      frequency: reminder.frequency || 'Daily',
      notes: reminder.notes || reminder.instructions || '',
      startDate: reminder.startDate || new Date().toISOString().split('T')[0],
      endDate: reminder.endDate || '',
      reminderTime: reminder.reminderTime || '08:00 AM'
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.medicineName || !form.dosage) {
      toast.error('Please enter medicine name and dosage');
      return;
    }

    try {
      const payload = {
        ...form,
        instructions: form.notes,
        citizenId
      };

      if (editingId) {
        await updateReminder(editingId, payload);
        toast.success('Medicine reminder updated!');
      } else {
        await createReminder(payload);
        toast.success('Medicine reminder created!');
      }

      setIsModalOpen(false);
      loadReminders(citizenId);
    } catch (err) {
      toast.error(editingId ? 'Failed to update reminder' : 'Failed to create reminder');
    }
  }

  async function handleComplete(id) {
    try {
      // Optimistic instant UI update
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, todayStatus: 'COMPLETED' } : r))
      );
      setAdherence((prev) => {
        const newCompleted = prev.completedDoses + 1;
        const total = newCompleted + prev.missedDoses;
        const percent = total > 0 ? Math.round((newCompleted / total) * 100 * 10) / 10 : 0;
        return {
          ...prev,
          completedDoses: newCompleted,
          adherencePercent: percent
        };
      });

      await markReminderComplete(id);
      toast.success('Dose marked as COMPLETED for today!');

      // Immediate backend re-fetch to ensure full database sync
      const [remindersData, summaryData] = await Promise.all([
        fetchCitizenReminders(citizenId),
        fetchAdherenceSummary(citizenId)
      ]);
      if (remindersData) setReminders(remindersData);
      if (summaryData) {
        setAdherence({
          completedDoses: summaryData.completedDoses || 0,
          missedDoses: summaryData.missedDoses || 0,
          totalScheduledDoses: summaryData.totalScheduledDoses ?? summaryData.activeReminders ?? 0,
          adherencePercent: summaryData.adherencePercent ?? summaryData.adherencePercentage ?? 0,
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update dose status');
      loadReminders(citizenId);
    }
  }

  async function handleMissed(id) {
    try {
      // Optimistic instant UI update
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, todayStatus: 'MISSED' } : r))
      );
      setAdherence((prev) => {
        const newMissed = prev.missedDoses + 1;
        const total = prev.completedDoses + newMissed;
        const percent = total > 0 ? Math.round((prev.completedDoses / total) * 100 * 10) / 10 : 0;
        return {
          ...prev,
          missedDoses: newMissed,
          adherencePercent: percent
        };
      });

      await markReminderMissed(id);
      toast.error('Dose marked as MISSED for today');

      // Immediate backend re-fetch to ensure full database sync
      const [remindersData, summaryData] = await Promise.all([
        fetchCitizenReminders(citizenId),
        fetchAdherenceSummary(citizenId)
      ]);
      if (remindersData) setReminders(remindersData);
      if (summaryData) {
        setAdherence({
          completedDoses: summaryData.completedDoses || 0,
          missedDoses: summaryData.missedDoses || 0,
          totalScheduledDoses: summaryData.totalScheduledDoses ?? summaryData.activeReminders ?? 0,
          adherencePercent: summaryData.adherencePercent ?? summaryData.adherencePercentage ?? 0,
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update dose status');
      loadReminders(citizenId);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await deleteReminder(id);
      toast.success('Reminder deleted');
      loadReminders(citizenId);
    } catch (err) {
      toast.error('Failed to delete reminder');
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="section-eyebrow">
            <Pill className="h-3.5 w-3.5" /> Medicine Adherence
          </span>
          <h1 className="mt-1 font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Medicine Reminder Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track daily doses, receive automated notifications, and maintain perfect medication adherence.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Medicine Reminder
        </button>
      </div>

      {/* Adherence Stats Banner - Driven by API */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500">Adherence Score</p>
          <p className={`mt-1 text-2xl font-bold ${
            adherence.adherencePercent >= 80
              ? 'text-emerald-600 dark:text-emerald-400'
              : adherence.adherencePercent >= 50
              ? 'text-amber-500'
              : 'text-rose-500'
          }`}>
            {adherence.completedDoses + adherence.missedDoses === 0 ? 'N/A' : `${adherence.adherencePercent}%`}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500">Scheduled Doses</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{adherence.totalScheduledDoses}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500">Completed Doses</p>
          <p className="mt-1 text-2xl font-bold text-emerald-500">{adherence.completedDoses}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500">Missed Doses</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">{adherence.missedDoses}</p>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Scheduled Medicines</h2>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <Pill className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium">No medicine reminders found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{r.medicineName}</h3>
                      <p className="text-xs text-emerald-600 font-medium">{r.dosage} · {r.frequency}</p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        r.todayStatus === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.todayStatus === 'MISSED'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                      }`}
                    >
                      {r.todayStatus ? `TODAY: ${r.todayStatus}` : r.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> Time: {r.reminderTime || '08:00 AM'}
                    </p>
                    {r.startDate && (
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> Start: {r.startDate} {r.endDate ? `· End: ${r.endDate}` : ''}
                      </p>
                    )}
                    {(r.notes || r.instructions) && <p className="mt-1 italic">Notes: {r.notes || r.instructions}</p>}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {r.todayStatus === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Taken Today
                      </span>
                    ) : r.todayStatus === 'MISSED' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <XCircle className="h-3.5 w-3.5 text-rose-600" /> Missed Today
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleComplete(r.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
                        >
                          <Check className="h-3 w-3" /> Complete
                        </button>
                        <button
                          onClick={() => handleMissed(r.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                        >
                          <X className="h-3 w-3" /> Missed
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(r)} className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1">
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-slate-400 hover:text-rose-500">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Edit Medicine Reminder' : 'Add Medicine Reminder'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Medicine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol"
                  value={form.medicineName}
                  onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Reminder Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 AM"
                    value={form.reminderTime}
                    onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Daily">Daily</option>
                  <option value="Twice Daily">Twice Daily</option>
                  <option value="Thrice Daily">Thrice Daily</option>
                  <option value="As Needed">As Needed</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Take after food with warm water"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  {editingId ? 'Update Reminder' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

