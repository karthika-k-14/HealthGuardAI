import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ShieldAlert,
  Send,
  CheckCircle2,
  FileText,
  Camera,
  Activity,
  AlertCircle,
  Clock,
  Plus,
  Upload,
  HeartPulse,
  Siren,
  Trash2,
} from 'lucide-react';
import {
  fetchSurveillanceReports,
  submitSurveillanceReport,
  fetchSurveillanceStatistics,
  deleteSurveillanceReport,
} from '../../api/surveillanceApi';
import { fetchAssignedCitizens } from '../../api/ashaAssignedApi';
import { fetchFamilyByCitizen } from '../../api/ashaFamilyApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const SEVERITY_TONE = { Low: 'brand', Medium: 'amber', High: 'rose', Critical: 'critical' };
const STATUS_TONE = {
  'Pending Review': 'amber',
  'Under Investigation': 'sky',
  Verified: 'brand',
  Referred: 'purple',
  Resolved: 'brand',
  Rejected: 'rose',
  Escalated: 'critical',
};

const DISEASES = [
  'Fever',
  'Dengue',
  'Malaria',
  'Tuberculosis (TB)',
  'COVID-19',
  'Diarrhea',
  'Chikungunya',
  'Other',
];

// Requirement 6: 10 Symptoms checklist
const SYMPTOMS_LIST = [
  'Fever',
  'Cough',
  'Body Pain',
  'Vomiting',
  'Rash',
  'Breathing Difficulty',
  'Diarrhea',
  'Headache',
  'Fatigue',
  'Other',
];

// Helper to format relationship strings for clean display
function formatRelationship(rel) {
  if (!rel) return 'Head of Household';
  const u = String(rel).trim().toUpperCase();
  if (u === 'HEAD' || u === 'HEAD OF HOUSEHOLD') return 'Head of Household';
  if (u === 'SPOUSE' || u === 'WIFE' || u === 'HUSBAND') return 'Spouse';
  if (u === 'CHILD' || u === 'CHILD 1' || u === 'CHILD 2' || u === 'CHILD1' || u === 'CHILD2' || u === 'SON' || u === 'DAUGHTER') return 'Child';
  if (u === 'PARENT' || u === 'MOTHER' || u === 'FATHER') return 'Parent';
  if (u === 'GRANDPARENT' || u === 'GRANDMOTHER' || u === 'GRANDFATHER') return 'Grandparent';
  if (u === 'SIBLING' || u === 'BROTHER' || u === 'SISTER') return 'Sibling';
  if (u === 'OTHER' || u === 'OTHER PERSON' || u === 'OTHER_PERSON' || u === 'OTHER FAMILY MEMBER') return 'Other Person';
  return rel.charAt(0).toUpperCase() + rel.slice(1).toLowerCase();
}

const CHART_COLORS = ['#1aab6f', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function DiseaseSurveillance() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReviews: 0,
    highCriticalCases: 0,
    activeOutbreaks: 0,
    resolvedCases: 0,
    diseaseTrends: {},
    villageCases: {},
    outbreakAlerts: [],
  });
  const [assignedCitizens, setAssignedCitizens] = useState([]);
  const [familyMap, setFamilyMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters state (Requirement 15)
  const [diseaseFilter, setDiseaseFilter] = useState('ALL');
  const [villageFilter, setVillageFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDateFilter] = useState('');
  const [endDateFilter] = useState('');
  const [search] = useState('');

  // Form State (Requirements 1 - 9)
  const [selectedCitizenId, setSelectedCitizenId] = useState('');
  const [affectedPersonOptions, setAffectedPersonOptions] = useState([]);
  const [selectedAffectedPersonKey, setSelectedAffectedPersonKey] = useState('');
  const [autoVillage, setAutoVillage] = useState('');
  const [autoAddress, setAutoAddress] = useState('');
  const [autoPhone, setAutoPhone] = useState('');
  const [autoFamilyId, setAutoFamilyId] = useState('');

  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportTime, setReportTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [diseaseInput, setDiseaseInput] = useState('Dengue');
  const [customDiseaseInput, setCustomDiseaseInput] = useState('');
  const [severityInput, setSeverityInput] = useState('Medium');

  // Clinical Vitals (Requirement 4)
  const [tempCInput, setTempCInput] = useState(38.0);
  const [pulseRateInput, setPulseRateInput] = useState(82);
  const [bpInput, setBpInput] = useState('120/80');
  const [spo2Input, setSpo2Input] = useState(98);

  const [selectedSymptoms, setSelectedSymptoms] = useState(['Fever']);
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [observationsInput, setObservationsInput] = useState('');
  const [photoBase64, setPhotoBase64] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [emergencyReferral, setEmergencyReferral] = useState(false); // Requirement 9
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Details Modal & Photo Modal
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);

  // Other Person State (Requirements 3, 4, 6)
  const [otherPersonName, setOtherPersonName] = useState('');
  const [otherPersonRelationship, setOtherPersonRelationship] = useState('');
  const [otherPersonAge, setOtherPersonAge] = useState('');
  const [otherPersonGender, setOtherPersonGender] = useState('');

  // Delete Confirmation Modal State (Requirement: Issue 3)
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const rawUser = localStorage.getItem('hg_user') || localStorage.getItem('user');
      const currentUser = rawUser ? JSON.parse(rawUser) : {};
      const ashaWorkerId = currentUser.ashaWorkerId || currentUser.id;

      const [rList, sData, cList] = await Promise.all([
        fetchSurveillanceReports(ashaWorkerId ? { ashaWorkerId } : {}),
        fetchSurveillanceStatistics(ashaWorkerId ? { ashaWorkerId } : {}),
        fetchAssignedCitizens(),
      ]);

      setReports(rList || []);
      setStats(sData || {
        totalReports: 0,
        pendingReviews: 0,
        highCriticalCases: 0,
        activeOutbreaks: 0,
        resolvedCases: 0,
        diseaseTrends: {},
        villageCases: {},
        outbreakAlerts: [],
      });
      setAssignedCitizens(cList || []);

      // Load families for citizen auto-fill
      const map = {};
      await Promise.all(
        (cList || []).map(async (c) => {
          const fam = await fetchFamilyByCitizen(c.id);
          if (fam) map[String(c.id)] = fam;
        })
      );
      setFamilyMap(map);
    } catch (e) {
      toast.error('Failed to load surveillance records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentSelectedPerson = useMemo(() => {
    return affectedPersonOptions.find((p) => p.key === selectedAffectedPersonKey) || null;
  }, [affectedPersonOptions, selectedAffectedPersonKey]);

  const buildAffectedPersonOptions = (citizen, fam) => {
    const headName = citizen?.name || citizen?.citizenName || fam?.headOfFamily || 'Head of Household';
    const headAge = citizen?.age || 28;
    const headGender = citizen?.gender || 'Not specified';

    const headPerson = {
      key: 'HEAD',
      id: null,
      name: headName,
      relationship: 'Head of Household',
      age: headAge,
      gender: headGender,
      displayName: `${headName} (Head of Household, ${headAge} yrs)`,
      isOther: false,
    };

    const memberPersons = (fam?.members || [])
      .filter((m) => {
        if (!m || !m.name) return false;
        if (m.name.trim().toLowerCase() === headName.trim().toLowerCase() && (m.relationship === 'HEAD' || m.relationship === 'Head of Household')) {
          return false;
        }
        return true;
      })
      .map((m) => {
        const rel = formatRelationship(m.relationship);
        const ageStr = m.age ? `, ${m.age} yrs` : '';
        return {
          key: `MEMBER_${m.id}`,
          id: m.id,
          name: m.name,
          relationship: m.relationship || 'Member',
          age: m.age || null,
          gender: m.gender || 'Not specified',
          displayName: `${m.name} (${rel}${ageStr})`,
          isOther: false,
        };
      });

    const otherPerson = {
      key: 'OTHER_PERSON',
      id: null,
      name: '',
      relationship: 'Other',
      age: null,
      gender: '',
      displayName: 'Other Person',
      isOther: true,
    };

    const options = [headPerson, ...memberPersons, otherPerson];
    setAffectedPersonOptions(options);
    setSelectedAffectedPersonKey('HEAD');
    setOtherPersonName('');
    setOtherPersonRelationship('');
    setOtherPersonAge('');
    setOtherPersonGender('');
  };

  // Requirement 1: Citizen Selection & Complete Family Fetch
  const handleCitizenChange = async (cId) => {
    setSelectedCitizenId(cId);
    setOtherPersonName('');
    setOtherPersonRelationship('');
    setOtherPersonAge('');
    setOtherPersonGender('');

    if (!cId) {
      setAutoVillage('');
      setAutoAddress('');
      setAutoPhone('');
      setAutoFamilyId('');
      setAffectedPersonOptions([]);
      setSelectedAffectedPersonKey('');
      return;
    }

    const citizen = assignedCitizens.find((c) => String(c.id) === String(cId));
    let fam = familyMap[String(cId)] || (citizen ? familyMap[String(citizen.id)] : null);

    // Initial build with currently cached data
    buildAffectedPersonOptions(citizen, fam);

    // Fetch complete, fresh family record from backend
    try {
      const freshFam = await fetchFamilyByCitizen(cId);
      if (freshFam) {
        fam = freshFam;
        setFamilyMap((prev) => ({ ...prev, [String(cId)]: freshFam, [String(citizen?.id)]: freshFam }));
        buildAffectedPersonOptions(citizen, freshFam);
      }
    } catch (e) {
      // Preserve cached fallback
    }

    const vName = fam?.village || citizen?.village || citizen?.villageName || '';
    const houseNo = fam?.houseNumber || '';
    const vilName = fam?.village || citizen?.villageName || citizen?.village || '';
    const addr = [houseNo, vilName].filter(Boolean).join(', ') || citizen?.address || '';
    const ph = fam?.contactPhone || citizen?.phone || citizen?.phoneNumber || '';
    const fId = fam?.id ? `FAM-${fam.id}` : '';

    setAutoVillage(vName);
    setAutoAddress(addr);
    setAutoPhone(ph);
    setAutoFamilyId(fId);
  };

  // Toggle symptom checkbox
  const toggleSymptom = (sym) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  // Requirement 8: Photo/Doc File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
        toast.success(`Attached document/photo: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Suspected Disease Report with Strict Form Validation
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedCitizenId) {
      toast.error('Please select an assigned citizen.');
      return;
    }
    if (!selectedAffectedPersonKey) {
      toast.error('Please select the affected person.');
      return;
    }
    if (!diseaseInput) {
      toast.error('Please select a disease.');
      return;
    }
    if (diseaseInput === 'Other' && !customDiseaseInput.trim()) {
      toast.error('Please specify the disease / condition.');
      return;
    }
    if (!severityInput) {
      toast.error('Please select severity assessment.');
      return;
    }
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom.');
      return;
    }
    if (selectedSymptoms.includes('Other') && !customSymptomInput.trim()) {
      toast.error('Please specify the Other Symptom.');
      return;
    }
    if (!observationsInput.trim()) {
      toast.error('Please enter detailed clinical notes / observations.');
      return;
    }

    if (currentSelectedPerson?.isOther) {
      if (!otherPersonName.trim()) {
        toast.error('Please enter the affected person name.');
        return;
      }
      if (!otherPersonRelationship.trim()) {
        toast.error('Please enter the relationship.');
        return;
      }
      if (!otherPersonAge) {
        toast.error('Please enter the age.');
        return;
      }
      if (!otherPersonGender) {
        toast.error('Please select the gender.');
        return;
      }
    }

    const citizen = assignedCitizens.find((c) => String(c.id) === String(selectedCitizenId));
    const citizenName = citizen ? (citizen.name || citizen.citizenName || 'Citizen') : '';

    let affectedPersonId = null;
    let affectedPersonName = citizenName;
    let relationship = 'Head of Household';
    let personAge = citizen?.age || null;
    let personGender = citizen?.gender || null;

    if (currentSelectedPerson?.isOther) {
      affectedPersonId = null;
      affectedPersonName = otherPersonName.trim();
      relationship = otherPersonRelationship.trim();
      personAge = Number(otherPersonAge);
      personGender = otherPersonGender;
    } else if (currentSelectedPerson) {
      affectedPersonId = currentSelectedPerson.id || null;
      affectedPersonName = currentSelectedPerson.name || citizenName;
      relationship = currentSelectedPerson.relationship || 'Head of Household';
      personAge = currentSelectedPerson.age || citizen?.age || null;
      personGender = currentSelectedPerson.gender || citizen?.gender || null;
    }

    const finalDisease = diseaseInput === 'Other' ? (customDiseaseInput.trim() || 'Other') : diseaseInput;
    const otherDiseaseName = diseaseInput === 'Other' ? customDiseaseInput.trim() : null;
    const otherSymptoms = selectedSymptoms.includes('Other') ? customSymptomInput.trim() : null;

    const rawUser = localStorage.getItem('hg_user') || localStorage.getItem('user');
    const currentUser = rawUser ? JSON.parse(rawUser) : {};
    const ashaWorkerId = currentUser.ashaWorkerId || currentUser.id || null;

    setIsSubmitting(true);
    try {
      const res = await submitSurveillanceReport({
        ashaWorkerId,
        assignedCitizenId: citizen ? citizen.id : selectedCitizenId,
        citizenId: citizen ? citizen.id : selectedCitizenId,
        familyId: familyMap[String(selectedCitizenId)]?.id || null,
        affectedPersonId,
        affectedPersonName,
        relationship,
        age: personAge,
        gender: personGender,
        citizenName,
        village: autoVillage,
        address: autoAddress,
        phoneNumber: autoPhone,
        reportDate,
        reportTime,
        disease: finalDisease,
        otherDiseaseName,
        severity: emergencyReferral ? 'Critical' : severityInput,
        symptoms: selectedSymptoms,
        otherSymptoms,

        temperature: tempCInput,
        bloodPressure: bpInput,
        pulseRate: pulseRateInput,
        spo2: spo2Input,

        observations: observationsInput,
        photoBase64,
        attachmentName,
        emergencyReferral,
      });

      if (res?.outbreakAlert) {
        toast.error(`🚨 ${res.outbreakAlert.message}`, { duration: 7000 });
      } else if (emergencyReferral) {
        toast.success(`HIGH PRIORITY Emergency referral created for ${affectedPersonName} (${formatRelationship(relationship)}). Health Officer notified immediately!`);
      } else {
        toast.success(`Surveillance report submitted for ${affectedPersonName} (${formatRelationship(relationship)}). Forwarded to Health Officer.`);
      }

      setObservationsInput('');
      setCustomDiseaseInput('');
      setCustomSymptomInput('');
      setOtherPersonName('');
      setOtherPersonRelationship('');
      setOtherPersonAge('');
      setOtherPersonGender('');
      setPhotoBase64(null);
      setAttachmentName('');
      setEmergencyReferral(false);
      setSelectedSymptoms(['Fever']);
      setSelectedAffectedPersonKey('HEAD');
      loadData();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to submit surveillance report to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Requirement: Delete surveillance report handler (Issue 3)
  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    const repId = reportToDelete.reportId || reportToDelete.id;
    setIsDeleting(true);
    try {
      await deleteSurveillanceReport(repId);
      toast.success('Surveillance report deleted successfully.');
      setReports((prev) => prev.filter((r) => (r.reportId || r.id) !== repId));
      setReportToDelete(null);
      await loadData();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to delete surveillance report.');
    } finally {
      setIsDeleting(false);
    }
  };

  const villageOptions = useMemo(() => {
    const set = new Set(reports.map((r) => r.village).filter(Boolean));
    return Array.from(set);
  }, [reports]);

  // Requirement 15: Filtered reports history
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesDisease = diseaseFilter === 'ALL' || r.disease === diseaseFilter;
      const matchesVillage = villageFilter === 'ALL' || r.village === villageFilter;
      const matchesSeverity = severityFilter === 'ALL' || r.severity === severityFilter;
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesStart = !startDateFilter || (r.reportDate && r.reportDate >= startDateFilter);
      const matchesEnd = !endDateFilter || (r.reportDate && r.reportDate <= endDateFilter);
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (r.affectedPersonName || '').toLowerCase().includes(q) ||
        (r.citizenName || '').toLowerCase().includes(q) ||
        (r.relationship || '').toLowerCase().includes(q) ||
        (r.village || '').toLowerCase().includes(q) ||
        (r.disease || '').toLowerCase().includes(q);

      return matchesDisease && matchesVillage && matchesSeverity && matchesStatus && matchesStart && matchesEnd && matchesSearch;
    });
  }, [reports, diseaseFilter, villageFilter, severityFilter, statusFilter, startDateFilter, endDateFilter, search]);

  // Analytics Charts Data
  const diseaseTrendData = useMemo(() => {
    if (!stats.diseaseTrends) return [];
    return Object.entries(stats.diseaseTrends).map(([disease, count]) => ({ disease, count }));
  }, [stats.diseaseTrends]);

  // Requirement: Risk Severity Distribution Analytics (Low Risk, Medium Risk, High Risk, Critical)
  const severityDistributionData = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    let lowCount = 0;
    let mediumCount = 0;
    let highCount = 0;
    let criticalCount = 0;

    reports.forEach((r) => {
      const s = (r.severityAssessment || r.severity || '').toString().trim().toUpperCase();
      if (s === 'LOW' || s.startsWith('LOW')) {
        lowCount++;
      } else if (s === 'CRITICAL' || s.startsWith('CRITICAL')) {
        criticalCount++;
      } else if (s === 'HIGH' || s.startsWith('HIGH')) {
        highCount++;
      } else if (s === 'MEDIUM' || s.startsWith('MEDIUM')) {
        mediumCount++;
      }
    });

    const total = lowCount + mediumCount + highCount + criticalCount;
    if (total === 0) return [];

    const categories = [
      { name: 'Low Risk', count: lowCount, color: '#10b981' },
      { name: 'Medium Risk', count: mediumCount, color: '#eab308' },
      { name: 'High Risk', count: highCount, color: '#f97316' },
      { name: 'Critical', count: criticalCount, color: '#ef4444' },
    ];

    return categories
      .filter((c) => c.count > 0)
      .map((c) => ({
        ...c,
        percentage: ((c.count / total) * 100).toFixed(1),
        total,
      }));
  }, [reports]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Disease Surveillance &amp; Outbreak System</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Production public health surveillance: Citizen auto-population, clinical vitals, emergency referrals, outbreak detection, and audit trail tracking.
          </p>
        </div>
      </div>

      {/* Requirement 13: 🚨 Outbreak Alerts Banner */}
      {stats.outbreakAlerts && stats.outbreakAlerts.length > 0 && (
        <div className="space-y-2">
          {stats.outbreakAlerts.map((a, idx) => (
            <div key={a.id || idx} className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-300 shadow-xs">
              <div className="flex items-start gap-3">
                <Siren className="mt-0.5 h-6 w-6 shrink-0 text-rose-600 animate-pulse" />
                <div>
                  <p className="text-sm font-extrabold text-rose-700 dark:text-rose-300">
                    {a.message || `🚨 Outbreak Alert: ${a.disease} in ${a.village}`}
                  </p>
                  <p className="text-xs text-rose-600/90 dark:text-rose-300/90 mt-0.5">
                    Automated outbreak rule triggered (&gt;5 cases of {a.disease} in {a.village} within 7 days). High priority notifications dispatched to Health Officer, Admin &amp; PHC.
                  </p>
                </div>
              </div>
              <Badge tone="rose">Active Outbreak</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Requirement 14: 5 Dashboard Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Reports</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.totalReports}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Activity className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Pending Reviews</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">{stats.pendingReviews}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Clock className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">High/Critical Cases</p>
            <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.highCriticalCases}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Active Outbreaks</p>
            <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-400">{stats.activeOutbreaks}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600">
            <ShieldAlert className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Resolved Cases</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.resolvedCases}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Production Field Case Reporting Form */}
        <div className="surface-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Plus className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Field Disease Surveillance Report</h2>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-4 text-sm">
            {/* Requirement 1: Citizen Selection Dropdown (Citizen Name, Age, Gender) */}
            <div>
              <label className="label-text font-bold text-slate-800 dark:text-slate-100">
                Select Assigned Citizen <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedCitizenId}
                onChange={(e) => handleCitizenChange(e.target.value)}
                className="input-field text-sm font-semibold"
              >
                <option value="">-- Choose Assigned Citizen --</option>
                {assignedCitizens.map((c) => {
                  const citizenName = c.name || c.citizenName || 'Citizen';
                  const ageStr = c.age ? `${c.age}` : '28';
                  const genderStr = c.gender || 'Not specified';
                  return (
                    <option key={c.id} value={c.id}>
                      {citizenName} ({ageStr}, {genderStr})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Requirement 2: Affected Person Dropdown (Person-centric actual people) */}
            <div>
              <label className="label-text font-bold text-slate-800 dark:text-slate-100">
                Affected Person <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={!selectedCitizenId}
                value={selectedAffectedPersonKey}
                onChange={(e) => {
                  setSelectedAffectedPersonKey(e.target.value);
                  setOtherPersonName('');
                  setOtherPersonRelationship('');
                  setOtherPersonAge('');
                  setOtherPersonGender('');
                }}
                className="input-field text-sm font-semibold"
              >
                {!selectedCitizenId && (
                  <option value="">-- First Select an Assigned Citizen --</option>
                )}
                {selectedCitizenId && affectedPersonOptions.length === 0 && (
                  <option value="">Loading family members…</option>
                )}
                {affectedPersonOptions.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Requirement 4 & 5: Auto-fill display for selected family member (No manual entry) */}
            {selectedCitizenId && currentSelectedPerson && !currentSelectedPerson.isOther && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                <div>
                  <p className="text-slate-400">Family Member Name</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{currentSelectedPerson.name || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Relationship</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{formatRelationship(currentSelectedPerson.relationship)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Age</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{currentSelectedPerson.age ? `${currentSelectedPerson.age} yrs` : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Gender</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{currentSelectedPerson.gender || '—'}</p>
                </div>
              </div>
            )}

            {/* Requirement 6: "Other Person" input fields for unregistered individual */}
            {currentSelectedPerson?.isOther && (
              <div className="space-y-3 rounded-xl bg-slate-50 p-3.5 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Unregistered Person Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-text font-semibold">
                      Person Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={otherPersonName}
                      onChange={(e) => setOtherPersonName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar, Sunita"
                      className="input-field text-sm font-medium"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="label-text font-semibold">
                      Relationship <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={otherPersonRelationship}
                      onChange={(e) => setOtherPersonRelationship(e.target.value)}
                      placeholder="e.g. Cousin, Neighbour, Guest, Relative"
                      className="input-field text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="label-text font-semibold">
                      Age <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="125"
                      value={otherPersonAge}
                      onChange={(e) => setOtherPersonAge(e.target.value)}
                      placeholder="e.g. 35"
                      className="input-field text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="label-text font-semibold">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={otherPersonGender}
                      onChange={(e) => setOtherPersonGender(e.target.value)}
                      className="input-field text-sm font-semibold"
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Requirement 2: Auto Population Display */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <div>
                <p className="text-slate-400">Village Name</p>
                <p className="font-bold text-brand-600 dark:text-brand-400">{autoVillage || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400">Family Record ID</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{autoFamilyId || 'Not Recorded'}</p>
              </div>
              <div>
                <p className="text-slate-400">Household Address</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{autoAddress || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400">Contact Phone</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{autoPhone || '—'}</p>
              </div>
            </div>

            {/* Requirement 3: Report Date & Report Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">Report Date</label>
                <input
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="label-text">Report Time</label>
                <input
                  type="text"
                  required
                  value={reportTime}
                  onChange={(e) => setReportTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Suspected Disease <span className="text-rose-500">*</span></label>
                  <select
                    value={diseaseInput}
                    onChange={(e) => setDiseaseInput(e.target.value)}
                    className="input-field text-sm font-semibold"
                  >
                    {DISEASES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Requirement 5: Severity Assessment */}
                <div>
                  <label className="label-text">Severity Assessment <span className="text-rose-500">*</span></label>
                  <select
                    value={severityInput}
                    onChange={(e) => setSeverityInput(e.target.value)}
                    className="input-field text-sm font-semibold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Urgent)</option>
                    <option value="Critical">Critical (Immediate Alert)</option>
                  </select>
                </div>
              </div>

              {/* Custom Disease Input for 'Other' */}
              {diseaseInput === 'Other' && (
                <div>
                  <label className="label-text font-bold text-slate-800 dark:text-slate-100">
                    Specify Disease / Condition <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customDiseaseInput}
                    onChange={(e) => setCustomDiseaseInput(e.target.value)}
                    placeholder="e.g. Chickenpox, Typhoid, Cholera"
                    className="input-field text-sm font-semibold"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Requirement 4: Clinical Information Vitals */}
            <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4 text-brand-500" /> Clinical Vitals Measurements
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempCInput}
                    onChange={(e) => setTempCInput(e.target.value)}
                    className="input-field text-xs py-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={pulseRateInput}
                    onChange={(e) => setPulseRateInput(e.target.value)}
                    className="input-field text-xs py-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block">BP (mmHg)</label>
                  <input
                    value={bpInput}
                    onChange={(e) => setBpInput(e.target.value)}
                    placeholder="120/80"
                    className="input-field text-xs py-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2Input}
                    onChange={(e) => setSpo2Input(e.target.value)}
                    className="input-field text-xs py-1"
                  />
                </div>
              </div>
            </div>

            {/* Requirement 6: 10 Symptoms Checklist */}
            <div>
              <label className="label-text font-bold text-slate-800 dark:text-slate-100 mb-1 block">
                Symptoms Checklist <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs">
                {SYMPTOMS_LIST.map((sym) => {
                  const isChecked = selectedSymptoms.includes(sym);
                  return (
                    <label key={sym} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSymptom(sym)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                      />
                      {sym}
                    </label>
                  );
                })}
              </div>

              {/* ISSUE 2: Other Symptom Text Input */}
              {selectedSymptoms.includes('Other') && (
                <div className="mt-3">
                  <label className="label-text font-bold text-slate-800 dark:text-slate-100">
                    Other Symptom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customSymptomInput}
                    onChange={(e) => setCustomSymptomInput(e.target.value)}
                    placeholder="Specify symptom description"
                    className="input-field text-sm font-medium"
                  />
                </div>
              )}
            </div>

            {/* Requirement 7: Detailed Observations Textarea */}
            <div>
              <label className="label-text">Detailed Observations &amp; Clinical Notes</label>
              <textarea
                rows={3}
                value={observationsInput}
                onChange={(e) => setObservationsInput(e.target.value)}
                placeholder="Detail symptom onset date, duration, environmental conditions, risk factors, and patient condition…"
                className="input-field text-sm"
              />
            </div>

            {/* Requirement 8: File / Evidence Upload Controls */}
            <div>
              <label className="label-text flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-brand-500" /> Evidence Attachment (Upload Photo / Take Photo / Upload Document)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 shadow-xs">
                  <Upload className="h-3.5 w-3.5 text-brand-600" />
                  {attachmentName ? attachmentName : 'Attach Photo or Document'}
                  <input type="file" accept="image/*,.pdf,.doc" onChange={handleFileUpload} className="hidden" />
                </label>
                {photoBase64 && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Attached</span>}
              </div>
            </div>

            {/* Requirement 9: Emergency Referral Checkbox */}
            <div className="rounded-xl bg-rose-500/10 p-3.5 border border-rose-500/30 text-rose-800 dark:text-rose-300">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                <input
                  type="checkbox"
                  checked={emergencyReferral}
                  onChange={(e) => setEmergencyReferral(e.target.checked)}
                  className="rounded border-rose-400 text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                Requires Immediate Emergency Referral (Automatically notifies Health Officer &amp; marks HIGH PRIORITY)
              </label>
            </div>

            <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm font-bold shadow-sm">
              {!isSubmitting && (
                <>
                  <Send className="h-4 w-4" /> Submit Report to Health Officer
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Analytics & Surveillance Reports History */}
        <div className="space-y-6">
          {/* Analytics Charts (Disease Trends & Risk Severity Distribution) */}
          <div className="surface-card p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Disease Surveillance Analytics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Disease Cases Breakdown</p>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diseaseTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <XAxis dataKey="disease" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="count" fill="#1aab6f" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Requirement 1 - 9: Risk Severity Distribution Pie Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Risk Severity Distribution</p>
                  {severityDistributionData.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {reports.length} {reports.length === 1 ? 'case' : 'cases'}
                    </span>
                  )}
                </div>

                <div className="h-36 flex items-center justify-center">
                  {severityDistributionData.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">No severity data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityDistributionData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={48}
                          paddingAngle={3}
                        >
                          {severityDistributionData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs dark:border-white/10 dark:bg-slate-800 dark:text-white">
                                  <p className="font-bold flex items-center gap-1.5" style={{ color: d.color }}>
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                                    {d.name}
                                  </p>
                                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                                    Total Cases: <strong className="text-slate-900 dark:text-white">{d.count}</strong>
                                  </p>
                                  <p className="text-slate-500 dark:text-slate-400">
                                    Percentage: <strong className="text-slate-900 dark:text-white">{d.percentage}%</strong> ({d.count} of {d.total})
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {severityDistributionData.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 pt-1">
                    {severityDistributionData.map((item) => (
                      <span key={item.name} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span>{item.name}: {item.count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Requirement 15: Filterable Report History */}
          <div className="surface-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Surveillance Report History</h2>
              <Badge tone="brand">{filteredReports.length} Reports</Badge>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-medium text-slate-400 block">Disease</label>
                <select value={diseaseFilter} onChange={(e) => setDiseaseFilter(e.target.value)} className="input-field py-1 text-xs">
                  <option value="ALL">All Diseases</option>
                  {DISEASES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400 block">Village</label>
                <select value={villageFilter} onChange={(e) => setVillageFilter(e.target.value)} className="input-field py-1 text-xs">
                  <option value="ALL">All Villages</option>
                  {villageOptions.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400 block">Severity</label>
                <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input-field py-1 text-xs">
                  <option value="ALL">All Severities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400 block">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field py-1 text-xs">
                  <option value="ALL">All Statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Verified">Verified</option>
                  <option value="Referred">Referred</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {isLoading && <SkeletonGrid count={3} className="space-y-2" />}

            {!isLoading && reports.length === 0 && (
              <EmptyState
                icon={FileText}
                title="No surveillance reports available."
              />
            )}

            {!isLoading && reports.length > 0 && filteredReports.length === 0 && (
              <EmptyState
                icon={FileText}
                title="No reports match filters"
                description="No surveillance records found matching your selection criteria."
              />
            )}

            {!isLoading && filteredReports.length > 0 && (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredReports.map((r) => {
                  const sev = r.severity || 'Medium';
                  const displayDisease = (r.disease === 'Other' && r.otherDiseaseName) ? r.otherDiseaseName : (r.otherDiseaseName || r.disease || '');
                  const displaySymptoms = r.otherSymptoms ? `${r.symptoms || ''} (Other: ${r.otherSymptoms})` : (r.symptoms || '');

                  return (
                    <div key={r.reportId || r.id} className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-white/5 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {r.affectedPersonName ? `${r.affectedPersonName} (${formatRelationship(r.relationship)})` : `${r.citizenName} (Head)`} - <span className="font-semibold">{displayDisease}</span>
                          </p>
                          <p className="text-slate-500 font-medium">
                            Household: <span className="text-slate-700 dark:text-slate-300 font-semibold">{r.citizenName}</span> · <span className="text-brand-600 dark:text-brand-400">{r.village}</span> · Date: {r.reportDate} ({r.reportTime})
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge tone={SEVERITY_TONE[sev] || 'amber'}>{sev}</Badge>
                          <Badge tone={STATUS_TONE[r.status] || 'sky'}>{r.status}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 p-1.5 rounded-lg text-[11px] font-semibold dark:bg-white/5">
                        <div><span className="text-slate-400 block font-normal">Temp</span>{r.temperature}°C</div>
                        <div><span className="text-slate-400 block font-normal">BP</span>{r.bloodPressure}</div>
                        <div><span className="text-slate-400 block font-normal">Pulse</span>{r.pulseRate} bpm</div>
                        <div><span className="text-slate-400 block font-normal">SpO2</span>{r.spo2}%</div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>Symptoms:</strong> {displaySymptoms}
                      </p>

                      {/* Requirement 18: Audit Trail Display & Delete Action */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400">
                        <span>Created by: {r.createdBy || 'UMA S'}</span>
                        <span>{r.reviewedBy ? `Reviewed by: ${r.reviewedBy}` : 'Awaiting Review'}</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedReportDetail(r)}
                            className="font-bold text-brand-600 hover:underline dark:text-brand-400 text-xs"
                          >
                            Details &amp; Audit Trail
                          </button>
                          <button
                            type="button"
                            onClick={() => setReportToDelete(r)}
                            className="font-bold text-rose-600 hover:text-rose-700 hover:underline dark:text-rose-400 text-xs flex items-center gap-1"
                            title="Delete report"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details & Audit Trail Modal */}
      <Modal open={!!selectedReportDetail} onClose={() => setSelectedReportDetail(null)} title={`Surveillance Audit Report - ${selectedReportDetail?.affectedPersonName || selectedReportDetail?.citizenName}`}>
        {selectedReportDetail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 text-xs">
              <div>
                <p className="text-slate-400">Affected Person</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedReportDetail.affectedPersonName ? `${selectedReportDetail.affectedPersonName} (${formatRelationship(selectedReportDetail.relationship)})` : `${selectedReportDetail.citizenName} (Head of Household)`}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Household (Head)</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReportDetail.citizenName}</p>
              </div>
              <div>
                <p className="text-slate-400">Age &amp; Gender</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedReportDetail.age ? `${selectedReportDetail.age} yrs` : '—'} · {selectedReportDetail.gender || '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Village / Address</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReportDetail.village}</p>
              </div>
              <div>
                <p className="text-slate-400">Report Date &amp; Time</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReportDetail.reportDate} at {selectedReportDetail.reportTime}</p>
              </div>
              <div>
                <p className="text-slate-400">Suspected Disease</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedReportDetail.disease === 'Other' && selectedReportDetail.otherDiseaseName
                    ? selectedReportDetail.otherDiseaseName
                    : (selectedReportDetail.otherDiseaseName || selectedReportDetail.disease)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Severity Level</p>
                <Badge tone={SEVERITY_TONE[selectedReportDetail.severity] || 'amber'}>{selectedReportDetail.severity}</Badge>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Symptoms</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedReportDetail.otherSymptoms
                    ? `${selectedReportDetail.symptoms || ''} (Other: ${selectedReportDetail.otherSymptoms})`
                    : selectedReportDetail.symptoms}
                </p>
              </div>
            </div>

            <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/5">
              <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Requirement 18: Complete Audit Trail</p>
              <p className="text-slate-500">Created By: <strong className="text-slate-700 dark:text-slate-200">{selectedReportDetail.createdBy || 'ASHA Worker (UMA S)'}</strong></p>
              <p className="text-slate-500">Reviewed By: <strong className="text-slate-700 dark:text-slate-200">{selectedReportDetail.reviewedBy || 'Pending Health Officer Review'}</strong></p>
              <p className="text-slate-500">Date Created: <strong className="text-slate-700 dark:text-slate-200">{selectedReportDetail.createdAt || 'Today'}</strong></p>
              {selectedReportDetail.resolutionDate && (
                <p className="text-emerald-600 font-semibold">Resolution Date: {selectedReportDetail.resolutionDate}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
      {/* Delete Confirmation Modal (Requirement: Issue 3) */}
      <Modal
        open={!!reportToDelete}
        onClose={() => !isDeleting && setReportToDelete(null)}
        title="Delete Surveillance Report"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Are you sure you want to delete this surveillance report?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isDeleting}
              onClick={() => setReportToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              onClick={handleDeleteReport}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
