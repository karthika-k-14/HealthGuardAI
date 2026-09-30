import { generateNutritionPlan } from './nutritionApi';

/**
 * AI Nutrition Planner API
 * Delegates strictly to backend /api/ai/nutrition/generate endpoint powered by Ollama.
 */
export async function getNutritionPlanForCondition(symptoms = '', riskLevel = 'LOW', userId = null) {
  const result = await generateNutritionPlan({
    userId,
    symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
    riskLevel,
  });

  return result;
}
