import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { GitPullRequest, Search, Building2, User, CheckCircle, ArrowRight, X } from 'lucide-react';
import { trackReferral } from '../../api/workflowApi';
import { Spinner } from '../common/Loader';
import Button from '../common/Button';

export default function ReferralTrackerModal({ isOpen, onClose }) {
  const [referralIdInput, setReferralIdInput] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!referralIdInput.trim()) return;

    setLoading(true);
    try {
      const data = await trackReferral(referralIdInput.trim());
      setTrackingData(data);
    } catch {
      toast.error('No referral tracking records found for that Referral ID');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-lg p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <GitPullRequest className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Referral Case Tracker</h3>
              <p className="text-xs text-slate-400">Track cases linked to a referral ID</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="number"
            placeholder="Enter Referral ID (e.g. 1, 101)"
            value={referralIdInput}
            onChange={(e) => setReferralIdInput(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <Button type="submit" variant="primary" isLoading={loading} className="text-xs">
            <Search className="h-3.5 w-3.5" /> Track
          </Button>
        </form>

        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner size={24} />
          </div>
        ) : trackingData ? (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {trackingData.citizenName || 'Referral Case'}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {trackingData.referralStatus || 'ACTIVE'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                <span>{trackingData.fromFacility || 'Origin PHC'}</span>
                <ArrowRight className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                <span>{trackingData.toFacility || 'Target Hospital'}</span>
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Reason: {trackingData.referralReason || 'Clinical referral'}
              </p>
              <p className="text-slate-400 text-[10px]">Referred By: {trackingData.referredBy || 'Medical Officer'}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide text-[10px]">
                Associated Workflow Cases ({(trackingData.associatedWorkflows || []).length})
              </h4>

              {(trackingData.associatedWorkflows || []).length === 0 ? (
                <p className="text-slate-400 italic">No associated workflow cases found for this referral.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {trackingData.associatedWorkflows.map((w) => (
                    <div
                      key={w.id}
                      className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{w.title}</p>
                        <p className="text-slate-400 text-[10px]">Case #: {w.caseNumber || w.id} · Assigned: {w.assignedTo || 'Unassigned'}</p>
                      </div>
                      <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                        {w.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs">
            Enter a Referral ID above to track associated workflow cases.
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
