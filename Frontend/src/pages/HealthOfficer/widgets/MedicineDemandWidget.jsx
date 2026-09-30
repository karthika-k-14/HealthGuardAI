import React, { useEffect, useState } from 'react';
import { 
  Pill, 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  Activity, 
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react';
import { 
  fetchMedicineDemandPrediction, 
  fetchModelMetrics, 
  fetchOutbreakPrediction, 
  fetchShapExplanation 
} from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';

const RISK_TONE = {
  CRITICAL: 'rose',
  Critical: 'rose',
  HIGH: 'rose',
  High: 'rose',
  MEDIUM: 'amber',
  Medium: 'amber',
  LOW: 'emerald',
  Low: 'emerald'
};

export default function MedicineDemandWidget() {
  const [demand, setDemand] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [outbreaks, setOutbreaks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // SHAP Drawer State
  const [selectedMed, setSelectedMed] = useState(null);
  const [shapData, setShapData] = useState(null);
  const [isShapLoading, setIsShapLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [demandData, metricsData, outbreakData] = await Promise.all([
          fetchMedicineDemandPrediction(),
          fetchModelMetrics(),
          fetchOutbreakPrediction()
        ]);

        if (mounted) {
          setDemand(Array.isArray(demandData) ? demandData : []);
          
          if (Array.isArray(metricsData) && metricsData.length > 0) {
            // Find champion or use first
            const champ = metricsData.find(m => m.isChampion || m.is_champion) || metricsData[0];
            setMetrics(champ);
          } else if (metricsData && typeof metricsData === 'object') {
            setMetrics(metricsData);
          }

          setOutbreaks(Array.isArray(outbreakData) ? outbreakData : []);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const openShapDrawer = async (item) => {
    setSelectedMed(item);
    setIsShapLoading(true);
    setShapData(null);

    const medId = item.medicineId || item.medicine_id || item.id;
    try {
      const explanation = await fetchShapExplanation(medId);
      setShapData(explanation);
    } catch {
      setShapData(null);
    } finally {
      setIsShapLoading(false);
    }
  };

  const closeShapDrawer = () => {
    setSelectedMed(null);
    setShapData(null);
  };

  const championName = metrics?.championModelName || metrics?.champion_model_name || metrics?.modelName || metrics?.model_name || (metrics ? 'ML Demand Model' : 'No Model Registered');
  const championVersion = metrics?.championModelVersion || metrics?.champion_model_version || metrics?.modelVersion || metrics?.model_version || (metrics ? 'Active' : '—');
  const r2Score = metrics?.r2Score ?? metrics?.r2_score ?? null;
  const maeVal = metrics?.mae ?? null;
  const rmseVal = metrics?.rmse ?? null;

  return (
    <div className="surface-card p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
            <Pill className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                ML Medicine Demand Forecasting
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <BrainCircuit className="h-3 w-3" /> Live Model
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              TimeSeriesSplit(n=5) • 14 Database-Derived Features • SHAP Explainable
            </p>
          </div>
        </div>

        {/* Champion Model Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg bg-slate-100 dark:bg-white/5 px-3 py-1.5 border border-slate-200/60 dark:border-white/10">
          <ShieldCheck className="h-4 w-4 text-brand-500" />
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              {championName}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {championVersion}
            </p>
          </div>
        </div>
      </div>

      {/* Model Performance Accuracy Bar */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-3 border border-slate-100 dark:border-white/5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">R² Score</span>
          <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
            {typeof r2Score === 'number' ? r2Score.toFixed(3) : (r2Score || '—')}
          </p>
          <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> {metrics ? 'Production Model' : 'Awaiting Metrics'}
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-3 border border-slate-100 dark:border-white/5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">MAE</span>
          <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
            {typeof maeVal === 'number' ? maeVal.toFixed(1) : (maeVal || '—')}
          </p>
          <span className="text-[10px] text-slate-400">units variance</span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-3 border border-slate-100 dark:border-white/5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">RMSE</span>
          <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
            {typeof rmseVal === 'number' ? rmseVal.toFixed(1) : (rmseVal || '—')}
          </p>
          <span className="text-[10px] text-slate-400">model baseline</span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-3 border border-slate-100 dark:border-white/5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Avg Confidence</span>
          <p className="text-base font-bold text-brand-600 dark:text-brand-400 mt-0.5">
            {(() => {
              const confs = demand.map(d => d.confidenceScore ?? d.confidence_score ?? d.confidence).filter(c => typeof c === 'number');
              if (confs.length > 0) {
                return `${Math.round((confs.reduce((a, b) => a + b, 0) / confs.length) * 100)}%`;
              }
              return '—';
            })()}
          </p>
          <span className="text-[10px] text-slate-400">estimator consensus</span>
        </div>
      </div>

      {/* Main Content: Medicine Demand List */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-brand-500" />
            30-Day Forecast by Medicine
          </h4>
          <span className="text-[11px] text-slate-400">
            Click <strong className="text-brand-600 dark:text-brand-400">Explain</strong> for SHAP drivers
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : demand.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-xs text-slate-400">
            No medicine demand forecasts available yet. Scheduled job runs daily at 01:00 AM.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {demand.map((item, idx) => {
              const medName = item.medicineName || item.medicine_name || item.medicine || `Medicine #${idx + 1}`;
              const predicted = item.predictedDemand ?? item.predicted_demand ?? 0;
              const stock = item.currentStock ?? item.current_stock ?? item.stockAvailable ?? 0;
              const conf = item.confidenceScore ?? item.confidence_score ?? item.confidence ?? null;
              const confDisplay = typeof conf === 'number' ? `${Math.round(conf * 100)}%` : '—';
              const risk = item.riskLevel || item.risk_level || (predicted > stock ? 'High' : 'Low');

              return (
                <div
                  key={item.id || idx}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/70 p-3 transition-all hover:border-brand-500/40 hover:bg-slate-50/70 dark:border-white/10 dark:hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-xs">
                      {medName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {medName}
                        </p>
                        <Badge tone={RISK_TONE[risk] || 'brand'}>{risk} Risk</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>Current Stock: <strong className="text-slate-700 dark:text-slate-300">{stock}</strong></span>
                        <span>•</span>
                        <span>Confidence: <strong className="text-slate-700 dark:text-slate-300">{confDisplay}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-400">Predicted Demand</span>
                      <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                        {predicted.toLocaleString()} units
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openShapDrawer(item)}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-500/10 px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-500/20 dark:text-brand-400 dark:hover:bg-brand-500/30 transition-colors"
                      title="View SHAP TreeExplainer feature attributions"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Explain</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Outbreak Prediction Section Card */}
      <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Village Outbreak Predictions (30-Day Risk)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {outbreaks.length} active village forecasts
          </span>
        </div>

        {outbreaks.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No high-risk outbreaks currently predicted.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {outbreaks.slice(0, 6).map((ob, oidx) => {
              const village = ob.village || ob.area || 'District Ward';
              const disease = ob.disease || 'Unspecified';
              const cases = ob.predictedCases30Days ?? ob.predicted_cases_30_days ?? ob.casesPredicted ?? ob.projectedCases2Weeks ?? 0;
              const risk = ob.riskLevel || ob.risk_level || (cases > 5 ? 'High' : cases > 2 ? 'Medium' : 'Low');
              const prob = ob.outbreakProbability ?? ob.outbreak_probability ?? ob.confidence ?? null;

              return (
                <div
                  key={ob.id || oidx}
                  className="rounded-xl border border-slate-200/70 p-3 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {village}
                    </span>
                    <Badge tone={RISK_TONE[risk] || 'amber'}>{risk}</Badge>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{disease}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ~{cases} cases {prob != null ? `(${Math.round(prob * 100)}%)` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SHAP Explanation Drawer / Modal */}
      {selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    SHAP TreeExplainer Attributions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedMed.medicineName || selectedMed.medicine_name || selectedMed.medicine}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeShapDrawer}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Explanation Summary */}
            <div className="mt-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] p-4 border border-slate-100 dark:border-white/5">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider">Base (Expected) Value</span>
                  <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                    {shapData?.baseValue != null ? Math.round(shapData.baseValue).toLocaleString() : '—'} units
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider">Model Forecast Demand</span>
                  <p className="text-base font-bold text-brand-600 dark:text-brand-400">
                    {(selectedMed.predictedDemand ?? selectedMed.predicted_demand ?? shapData?.predictedDemand ?? 0).toLocaleString()} units
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Impacts */}
            {isShapLoading ? (
              <div className="mt-5 space-y-3">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ) : shapData ? (
              <div className="mt-5 space-y-5">
                {/* Positive Drivers */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Top Factors Increasing Demand (+SHAP)</span>
                  </div>
                  {shapData.positiveFactors && shapData.positiveFactors.length > 0 ? (
                    <div className="space-y-2">
                      {shapData.positiveFactors.map((factor, idx) => (
                        <div key={idx} className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {factor.feature}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              +{typeof factor.impact === 'number' ? factor.impact.toFixed(2) : factor.impact}
                            </span>
                          </div>
                          {factor.value != null && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Feature input value: <span className="font-mono text-slate-600 dark:text-slate-300">{factor.value}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No significant positive push factors.</p>
                  )}
                </div>

                {/* Negative Drivers */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>Top Factors Decreasing Demand (-SHAP)</span>
                  </div>
                  {shapData.negativeFactors && shapData.negativeFactors.length > 0 ? (
                    <div className="space-y-2">
                      {shapData.negativeFactors.map((factor, idx) => (
                        <div key={idx} className="rounded-lg border border-rose-500/20 bg-rose-500/[0.03] p-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {factor.feature}
                            </span>
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              {typeof factor.impact === 'number' ? factor.impact.toFixed(2) : factor.impact}
                            </span>
                          </div>
                          {factor.value != null && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Feature input value: <span className="font-mono text-slate-600 dark:text-slate-300">{factor.value}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No significant negative suppression factors.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] text-center text-xs text-slate-400">
                SHAP TreeExplainer calculation completed on backend. No specific attribution payload returned.
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeShapDrawer}
                className="rounded-xl bg-slate-100 dark:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
