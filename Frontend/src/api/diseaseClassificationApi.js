import apiClient from './axios';

export async function classifyDisease(symptoms) {
  const { data } = await apiClient.post('/api/ai/symptoms/assess', { symptoms });
  return data?.data || data;
}
