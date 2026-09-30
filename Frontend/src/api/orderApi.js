import apiClient from './axios';

/**
 * Production-ready Order Management API for Pharmacist Workspace
 * Connects to backend /api/pharmacist/orders endpoints.
 */

export async function fetchOrders(params = {}) {
  const queryParams = {};
  if (params.status && params.status !== 'ALL') queryParams.status = params.status;
  if (params.orderDate) queryParams.orderDate = params.orderDate;
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;
  if (params.search) queryParams.search = params.search;

  const { data } = await apiClient.get('/api/pharmacist/orders', { params: queryParams });
  return data?.data || data || [];
}

export async function fetchOrderById(id) {
  const { data } = await apiClient.get(`/api/pharmacist/orders/${id}`);
  return data?.data || data;
}

export async function fetchOrderStatistics() {
  const { data } = await apiClient.get('/api/pharmacist/orders/statistics');
  return data?.data || data || {
    totalOrders: 0,
    pendingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    draftOrders: 0
  };
}

export async function fetchForecastRecommendations() {
  const { data } = await apiClient.get('/api/pharmacist/orders/forecast-recommendations');
  return data?.data || data || [];
}

export async function createOrder(payload) {
  const { data } = await apiClient.post('/api/pharmacist/orders', payload);
  return data?.data || data;
}

export async function updateOrderStatus(id, payload) {
  const { data } = await apiClient.put(`/api/pharmacist/orders/${id}/status`, payload);
  return data?.data || data;
}

export async function deleteOrder(id) {
  const { data } = await apiClient.delete(`/api/pharmacist/orders/${id}`);
  return data?.data || data;
}
