/**
 * Validates whether an object represents a valid symptom assessment result.
 * Must be a non-null object where ALL THREE fields exist and are non-empty strings after trim():
 * 1. prediction
 * 2. riskLevel
 * 3. recommendation
 *
 * Condition 2 Validation rule:
 * isValidAssessment = assessment && assessment.prediction?.trim() && assessment.riskLevel?.trim() && assessment.recommendation?.trim()
 */
export function isValidAssessment(assessment) {
  if (!assessment || typeof assessment !== 'object') return false;

  const prediction = assessment.prediction || assessment.predictedCondition;
  const riskLevel = assessment.riskLevel || assessment.severity;
  const recommendation = assessment.recommendation || assessment.recommendations || assessment.doctorAdvice;

  return Boolean(
    prediction &&
    typeof prediction === 'string' &&
    prediction.trim().length > 0 &&
    riskLevel &&
    typeof riskLevel === 'string' &&
    riskLevel.trim().length > 0 &&
    recommendation &&
    typeof recommendation === 'string' &&
    recommendation.trim().length > 0
  );
}

export const isValidSymptomAssessment = isValidAssessment;
