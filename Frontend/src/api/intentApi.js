import apiClient from './axios';

export async function detectIntent(message) {
  const { data } = await apiClient.post('/api/ai/chat', { message });
  return data?.data || data;
}
