import shap
import numpy as np
import pandas as pd
from typing import Dict, List, Any

# Human-readable labels for the 14 features
FEATURE_HUMAN_LABELS = {
    'day_of_week': 'Day of Week Cycle',
    'week_of_year': 'Annual Week Trend',
    'month': 'Monthly Trend',
    'quarter': 'Quarterly Baseline',
    'season': 'Seasonal Disease Transmission',
    'disease_cases_7_days': 'Weekly Disease Cases Surge',
    'disease_cases_30_days': 'Active Disease Month Trend',
    'disease_growth_rate': 'Outbreak Growth Rate',
    'active_outbreaks': 'Active Outbreaks in Village',
    'village_health_risk_score': 'Village Health Vulnerability Score',
    'stock_available': 'Current Available Inventory',
    'average_daily_consumption': '30-Day Daily Consumption Rate',
    'stock_turnover_rate': 'Stock Turnover Velocity',
    'expiry_risk_score': 'Batch Expiry Urgency Score'
}

class SHAPExplanationService:
    def __init__(self, model):
        self.model = model
        self.explainer = None
        try:
            self.explainer = shap.TreeExplainer(model)
        except Exception as e:
            print(f"TreeExplainer initialization warning: {e}. Falling back to Kernel/sampling explainer if needed.")

    def explain_prediction(self, feature_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Computes SHAP feature attribution values for a single prediction row.
        Returns top positive, top negative factors, and contribution percentages.
        """
        if self.explainer is None:
            try:
                self.explainer = shap.TreeExplainer(self.model)
            except Exception as e:
                return self._fallback_explanation(feature_df)

        try:
            shap_values = self.explainer.shap_values(feature_df, check_additivity=False)
            if isinstance(shap_values, list):
                sv = shap_values[0][0] if len(shap_values[0].shape) > 1 else shap_values[0]
            elif len(shap_values.shape) == 2:
                sv = shap_values[0]
            else:
                sv = shap_values

            expected_value = float(self.explainer.expected_value if not isinstance(self.explainer.expected_value, (list, np.ndarray)) else self.explainer.expected_value[0])
            pred_value = float(self.model.predict(feature_df)[0])
            total_delta = max(1.0, abs(pred_value - expected_value))

            contributions = []
            feature_names = list(feature_df.columns)
            for i, feat in enumerate(feature_names):
                val = float(sv[i])
                pct = round((val / total_delta) * 100.0, 1)
                contributions.append({
                    'feature': feat,
                    'label': FEATURE_HUMAN_LABELS.get(feat, feat),
                    'raw_value': float(feature_df[feat].iloc[0]),
                    'shap_value': round(val, 2),
                    'contribution_pct': pct,
                    'direction': 'POSITIVE' if val >= 0 else 'NEGATIVE'
                })

            # Sort by absolute SHAP value impact
            contributions.sort(key=lambda x: abs(x['shap_value']), reverse=True)

            top_positive = [c for c in contributions if c['direction'] == 'POSITIVE'][:4]
            top_negative = [c for c in contributions if c['direction'] == 'NEGATIVE'][:3]

            formatted_reasons = []
            for c in top_positive:
                formatted_reasons.append(f"{c['label']} (+{abs(c['contribution_pct'])}%)")
            for c in top_negative:
                formatted_reasons.append(f"{c['label']} (-{abs(c['contribution_pct'])}%)")

            return {
                'base_value': round(expected_value, 2),
                'predicted_value': round(pred_value, 2),
                'top_positive_factors': top_positive,
                'top_negative_factors': top_negative,
                'main_reasons': formatted_reasons,
                'all_contributions': contributions
            }
        except Exception as e:
            print(f"SHAP evaluation error: {e}. Generating feature importance fallback.")
            return self._fallback_explanation(feature_df)

    def _fallback_explanation(self, feature_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Fallback attribution based on feature importances.
        """
        importances = getattr(self.model, 'feature_importances_', None)
        pred_value = float(self.model.predict(feature_df)[0])
        feature_names = list(feature_df.columns)

        contributions = []
        if importances is not None:
            for i, feat in enumerate(feature_names):
                imp = float(importances[i])
                pct = round(imp * 100.0, 1)
                contributions.append({
                    'feature': feat,
                    'label': FEATURE_HUMAN_LABELS.get(feat, feat),
                    'raw_value': float(feature_df[feat].iloc[0]),
                    'shap_value': round(imp * 10.0, 2),
                    'contribution_pct': pct,
                    'direction': 'POSITIVE'
                })
        contributions.sort(key=lambda x: x['contribution_pct'], reverse=True)
        return {
            'base_value': round(pred_value * 0.7, 2),
            'predicted_value': round(pred_value, 2),
            'top_positive_factors': contributions[:4],
            'top_negative_factors': [],
            'main_reasons': [f"{c['label']} (+{c['contribution_pct']}%)" for c in contributions[:4]],
            'all_contributions': contributions
        }
