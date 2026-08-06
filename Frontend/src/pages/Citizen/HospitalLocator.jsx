import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPinned, Star, Phone, Navigation, Siren, Bookmark, Ambulance, Droplets, Pill } from 'lucide-react';
import { fetchNearbyHospitals, fetchNearbyPharmacies } from '../../api/hospitalApi';
import { fetchBloodBanks, fetchEmergencyServices } from '../../api/emergencyApi';
import { updateHospitalOccupancy } from '../../api/workflowApi';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const TABS = [
  { key: 'hospitals', label: 'Hospitals', icon: MapPinned },
  { key: 'pharmacies', label: 'Pharmacies', icon: Pill },
  { key: 'bloodBanks', label: 'Blood Banks', icon: Droplets },
  { key: 'ambulance', label: 'Ambulance', icon: Ambulance },
];

export default function HospitalLocator() {
  const [activeTab, setActiveTab] = useState('hospitals');
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [ambulanceServices, setAmbulanceServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());

  useEffect(() => {
    Promise.all([fetchNearbyHospitals(), fetchNearbyPharmacies(), fetchBloodBanks(), fetchEmergencyServices()]).then(
      ([h, p, bb, svc]) => {
        setHospitals(h);
        setPharmacies(p);
        setBloodBanks(bb);
        setAmbulanceServices(svc.filter((s) => s.label.toLowerCase().includes('ambulance')));
        setIsLoading(false);
      }
    );
  }, []);

  const handleCall = (name, phone) => toast(`Calling ${name}: ${phone}`, { icon: '📞' });
  const handleDirections = (name, distanceKm) => toast(`Opening directions to ${name} (${distanceKm} km away)`, { icon: '🧭' });

  // Hospital Integration: treat "Directions" on a hospital as a visit
  // — updates the shared occupancy signal and notifies the Health
  // Officer automatically once a facility crosses 90% occupancy.
  const handleVisitHospital = (hospital) => {
    handleDirections(hospital.name, hospital.distanceKm);
    const occupancyPercent = Math.min(99, 65 + (hospital.beds % 35));
    updateHospitalOccupancy({ hospitalName: hospital.name, occupancyPercent });
  };
  const handleSave = (id, name) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast(`Removed ${name} from saved places`);
      } else {
        next.add(id);
        toast.success(`Saved ${name}`);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <span className="section-eyebrow">
        <MapPinned className="h-3.5 w-3.5" /> Hospital & Pharmacy Locator
      </span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
        Find care near you
      </h1>

      {/* Interactive map placeholder */}
      <div className="surface-card relative mt-6 flex h-64 items-center justify-center overflow-hidden bg-dot-grid">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/5 to-sky-500/5" />
        <div className="text-center">
          <MapPinned className="mx-auto h-8 w-8 text-brand-500" />
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Interactive map view — coming soon
          </p>
          <p className="text-xs text-slate-400">Showing {hospitals.length + pharmacies.length} facilities near Coimbatore</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors',
              activeTab === t.key
                ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {isLoading && <SkeletonGrid count={4} className="mt-6 grid gap-4 sm:grid-cols-2" cardClassName="p-5" />}

      {!isLoading && activeTab === 'hospitals' && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {hospitals.map((h) => (
            <div key={h.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{h.name}</p>
                  <p className="text-xs text-slate-400">{h.type} · {h.beds} beds</p>
                </div>
                {h.emergency && (
                  <Badge tone="rose">
                    <Siren className="mr-1 h-3 w-3" /> Emergency
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {h.specialties?.map((s) => (
                  <Badge key={s} tone="neutral">{s}</Badge>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-signal-amber text-signal-amber" /> {h.rating}
                </span>
                <span>{h.distanceKm} km away</span>
              </div>

              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => handleCall(h.name, h.phone)} className="btn-secondary flex-1 text-xs">
                  <Phone className="h-3.5 w-3.5" /> Call
                </button>
                <button type="button" onClick={() => handleVisitHospital(h)} className="btn-primary flex-1 text-xs">
                  <Navigation className="h-3.5 w-3.5" /> Directions
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(h.id, h.name)}
                  aria-label="Save"
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors',
                    saved.has(h.id)
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 text-slate-400 hover:border-brand-300 dark:border-white/10'
                  )}
                >
                  <Bookmark className={cn('h-4 w-4', saved.has(h.id) && 'fill-current')} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && activeTab === 'pharmacies' && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pharmacies.map((p) => (
            <div key={p.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                {p.open24Hours && <Badge tone="brand">24 hrs</Badge>}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-signal-amber text-signal-amber" /> {p.rating}
                </span>
                <span>{p.distanceKm} km away</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => handleCall(p.name, p.phone)} className="btn-secondary flex-1 text-xs">
                  <Phone className="h-3.5 w-3.5" /> Call
                </button>
                <button type="button" onClick={() => handleDirections(p.name, p.distanceKm)} className="btn-primary flex-1 text-xs">
                  <Navigation className="h-3.5 w-3.5" /> Directions
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(p.id, p.name)}
                  aria-label="Save"
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors',
                    saved.has(p.id)
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 text-slate-400 hover:border-brand-300 dark:border-white/10'
                  )}
                >
                  <Bookmark className={cn('h-4 w-4', saved.has(p.id) && 'fill-current')} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && activeTab === 'bloodBanks' && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bloodBanks.length === 0 && <EmptyState icon={Droplets} title="No blood banks found" className="sm:col-span-2 lg:col-span-3" />}
          {bloodBanks.map((bb) => (
            <div key={bb.id} className="surface-card flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{bb.name}</p>
                <p className="text-xs text-slate-400">{bb.distanceKm} km away</p>
              </div>
              <Badge tone={bb.stock.toLowerCase().includes('low') ? 'amber' : 'brand'}>{bb.stock}</Badge>
            </div>
          ))}
        </div>
      )}

      {!isLoading && activeTab === 'ambulance' && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ambulanceServices.map((svc) => (
            <div key={svc.id} className="surface-card flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{svc.label}</p>
                <p className="text-xs text-slate-400">{svc.number}</p>
              </div>
              <button type="button" onClick={() => handleCall(svc.label, svc.number)} className="btn-primary text-xs">
                <Phone className="h-3.5 w-3.5" /> Call
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
