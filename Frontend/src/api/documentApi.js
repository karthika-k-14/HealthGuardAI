import apiClient from './axios';

export async function uploadDocument(citizenId, documentType, file) {
  const formData = new FormData();
  formData.append('citizenId', citizenId);
  formData.append('documentType', documentType);
  formData.append('file', file);

  try {
    const { data } = await apiClient.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (err) {
    console.error('Failed to upload document:', err);
    throw err;
  }
}

export async function fetchCitizenDocuments(citizenId = 1, page = null, size = 20) {
  try {
    const params = page !== null ? { page, size } : {};
    const { data } = await apiClient.get(`/api/documents/citizen/${citizenId}`, { params });
    if (data?.content) {
      return data;
    }
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch citizen documents:', err);
    return [];
  }
}


export async function getDocumentById(id) {
  try {
    const { data } = await apiClient.get(`/api/documents/${id}`);
    return data;
  } catch (err) {
    console.error('Failed to fetch document:', err);
    throw err;
  }
}

export async function deleteDocument(id) {
  try {
    await apiClient.delete(`/api/documents/${id}`);
    return { id, deleted: true };
  } catch (err) {
    console.error('Failed to delete document:', err);
    throw err;
  }
}

export function getDocumentDownloadUrl(id) {
  return `/api/documents/download/${id}`;
}
