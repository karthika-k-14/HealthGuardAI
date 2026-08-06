import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Siren, Droplets, Info, HeartPulse, MapPin, PhoneCall, CheckCircle2, ChevronDown, ChevronUp, History } from 'lucide-react';
import { fetchEmergencyServices, fetchBloodBanks, fetchEmergencyTips } from '../../api/emergencyApi';
import { createSosRequest, fetchSosHistory } from '../../api/sosApi';
import { fetchNearbyHospitals, fetchNearestPHCs } from '../../api/hospitalApi';
import { useCaseContext } from '../../contexts/CaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { getIcon } from '../../utils/iconRegistry';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';

const SOS_STATUS_TONE = {
  PENDING: 'amber',
  ACKNOWLEDGED: 'brand',
  IN_PROGRESS: 'brand',
  RESOLVED: 'brand',
  CANCELLED: 'neutral',
};

const ACCENT_CLASS = {
  rose: 'bg-signal-rose/10 text-signal-rose',
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
  amber: 'bg-signal-amber/10 text-signal-amber',
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
};

const EMERGENCY_TYPES = ['Chest pain', 'Stroke symptoms', 'Severe bleeding', 'Breathing difficulty'];

export default function EmergencyCenter() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { submitEmergency, shareLocation } = useCaseContext();
  const [services, setServices] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [tips, setTips] = useState([]);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [nearestPHCs, setNearestPHCs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guidance, setGuidance] = useState(null);
  const [isReporting, setIsReporting] = useState(false);
  const [emergencyCase, setEmergencyCase] = useState(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [sosRequest, setSosRequest] = useState(null);
  const [sosHistory, setSosHistory] = useState([]);
  const [showSosHistory, setShowSosHistory] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchEmergencyServices(),
      fetchBloodBanks(),
      fetchEmergencyTips(),
      fetchNearbyHospitals(),
      fetchNearestPHCs(2),
    ]).then(([svc, bb, tips, hospitals, phcs]) => {
      setServices(svc);
      setBloodBanks(bb);
      setTips(tips);
      setNearestHospitals(hospitals.slice(0, 2));
      setNearestPHCs(phcs);
      setIsLoading(false);
    });
    fetchSosHistory().then(setSosHistory).catch(() => {});
  }, []);

  const handleCall = (svc) => toast(`${t('Calling')} ${t(svc.label)}: ${svc.number}`, { icon: '📞' });

  const emergencyContact = user?.citizenProfile?.emergencyContact;
  const handleCallEmergencyContact = () => {
    if (!emergencyContact) {
      toast('No emergency contact saved. Add one in your profile.', { icon: 'ℹ️' });
      return;
    }
    toast(`${t('Calling')} emergency contact: ${emergencyContact}`, { icon: '📞' });
  };

  // The Emergency Screen (warning, numbers, nearest hospital/PHC) is
  // already visible below the moment this page renders — the citizen
  // never waits on this call for guidance. This just logs the case
  // and surfaces the AI's emergency guidance text; per spec, NO
  // healthcare worker is notified yet. That only happens once the
  // citizen explicitly taps "Share Location" (handleShareLocation).
  const handleReportEmergency = async (type = 'General emergency') => {
    setIsReporting(true);
    try {
      const { guidance: guidanceText, case: record } = await submitEmergency({ citizenName: user?.name || 'Citizen', type });
      setGuidance(guidanceText);
      setEmergencyCase(record);
      toast.error(`${type}: emergency guidance provided. Share your location to notify healthcare workers.`);

      try {
        const sos = await createSosRequest({ emergencyType: type });
        setSosRequest(sos);
        setSosHistory((prev) => [sos, ...prev]);
      } catch {
        // SOS record creation failing shouldn't block the on-screen emergency guidance above.
      }
    } finally {
      setIsReporting(false);
    }
  };

  // Fires only on explicit "Share Location" tap. Requests GPS
  // permission; if granted, stores the coordinates and immediately
  // notifies the assigned ASHA worker and the Health Officer — the
  // citizen is never made to wait for anyone's approval.
  const handleShareLocation = () => {
    if (!emergencyCase) return;
    if (!('geolocation' in navigator)) {
      toast.error('Location sharing is not available on this device.');
      return;
    }
    setIsSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await shareLocation(emergencyCase.id, { lat: latitude, lng: longitude });
          setEmergencyCase(result.case);
          toast.success('Healthcare workers have been notified.');
        } finally {
          setIsSharingLocation(false);
        }
      },
      () => {
        setIsSharingLocation(false);
        toast.error('Location permission denied. Healthcare workers have not been notified yet.');
      }
    );
  };

  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full bg-signal-rose/30"
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="absolute inset-3 rounded-full bg-signal-rose/40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <button
          type="button"
          onClick={() => handleReportEmergency()}
          disabled={isReporting}
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-signal-rose text-white shadow-glow disabled:opacity-70"
        >
          <Siren className="h-8 w-8" />
        </button>
      </div>
      <p className="mt-4 font-display text-xl font-semibold text-slate-900 dark:text-white">{t('Emergency Center')}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('emergency_subtitle')}</p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EMERGENCY_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleReportEmergency(type)}
            disabled={isReporting}
            className="rounded-full border border-signal-rose/30 px-3 py-1.5 text-xs font-medium text-signal-rose hover:bg-signal-rose/10 disabled:opacity-60"
          >
            {type}
          </button>
        ))}
      </div>

      {guidance && (
        <div className="surface-card mt-6 space-y-4 p-4 text-left">
          <div className="flex items-start gap-2">
            <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-signal-rose" />
            <p className="text-sm text-slate-700 dark:text-slate-200">{guidance}</p>
          </div>

          {sosRequest && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-white/5">
              <span className="text-slate-500 dark:text-slate-400">SOS Request #{sosRequest.id}</span>
              <Badge tone={SOS_STATUS_TONE[sosRequest.status] || 'neutral'}>{sosRequest.status}</Badge>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCallEmergencyContact}
              className="flex items-center gap-1.5 rounded-full border border-signal-rose/30 px-3 py-1.5 text-xs font-medium text-signal-rose hover:bg-signal-rose/10"
            >
              <PhoneCall className="h-3.5 w-3.5" /> Call Emergency Contact
            </button>
          </div>

          {(nearestHospitals.length > 0 || nearestPHCs.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {nearestHospitals.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nearest Hospital</p>
                  {nearestHospitals.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                      <MapPin className="h-4 w-4 shrink-0 text-signal-rose" />
                      <div>
                        <p className="text-slate-700 dark:text-slate-200">{h.name}</p>
                        <p className="text-xs text-slate-400">{h.distanceKm} km · {h.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {nearestPHCs.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nearest PHC</p>
                  {nearestPHCs.map((phc) => (
                    <div key={phc.id} className="flex items-center gap-2 rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                      <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
                      <div>
                        <p className="text-slate-700 dark:text-slate-200">{phc.name}</p>
                        <p className="text-xs text-slate-400">{phc.distanceKm} km · {phc.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {emergencyCase && emergencyCase.requiresLocationShare && !emergencyCase.locationShared && (
            <button
              type="button"
              onClick={handleShareLocation}
              disabled={isSharingLocation}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-signal-rose px-3 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
            >
              <MapPin className="h-4 w-4" /> {isSharingLocation ? 'Sharing…' : 'Share Location'}
            </button>
          )}
          {emergencyCase?.locationShared && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Healthcare workers have been notified.
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid count={5} className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5" cardClassName="p-5" />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {services.map((svc) => {
            const Icon = getIcon(svc.icon);
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => handleCall(svc)}
                className="surface-card flex flex-col items-center gap-2 p-5 transition-transform hover:-translate-y-1"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${ACCENT_CLASS[svc.accent] || ACCENT_CLASS.brand}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t(svc.label)}</p>
                <p className="text-xs text-slate-400">{svc.number}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="surface-card mt-8 p-6 text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
            <Droplets className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Nearby Blood Banks')}</p>
        </div>
        <div className="mt-4 space-y-3">
          {bloodBanks.map((bb) => (
            <div key={bb.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{bb.name}</p>
                <p className="text-xs text-slate-400">{bb.distanceKm} {t('km away')}</p>
              </div>
              <Badge tone={bb.stock.toLowerCase().includes('low') ? 'amber' : 'brand'}>{t(bb.stock)}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6 text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Info className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Emergency Tips')}</p>
        </div>
        <ul className="mt-4 space-y-2">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {t(tip)}
            </li>
          ))}
        </ul>
      </div>

      {sosHistory.length > 0 && (
        <div className="surface-card mt-4 p-6 text-left">
          <button
            type="button"
            onClick={() => setShowSosHistory((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
                <History className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('SOS History')}</p>
            </div>
            {showSosHistory ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {showSosHistory && (
            <div className="mt-4 space-y-2">
              {sosHistory.map((sos) => (
                <div key={sos.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{sos.emergencyType}</p>
                    <p className="text-xs text-slate-400">
                      {sos.createdAt ? new Date(sos.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <Badge tone={SOS_STATUS_TONE[sos.status] || 'neutral'}>{sos.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
