import apiClient from './axios';

export async function fetchAwarenessArticles(category, status = 'PUBLISHED') {
  try {
    const { data } = await apiClient.get('/api/articles', {
      params: { category, status }
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
  } catch (err) {
    console.error('Failed to fetch articles:', err);
    return [];
  }
}

export async function fetchAwarenessArticleById(id) {
  try {
    const { data } = await apiClient.get(`/api/articles/${id}`);
    return data;
  } catch (err) {
    console.error('Failed to fetch article:', err);
    throw err;
  }
}

export async function addAwarenessArticle(article) {
  try {
    const { data } = await apiClient.post('/api/articles', article);
    return data;
  } catch (err) {
    console.error('Failed to create article:', err);
    throw err;
  }
}

export async function updateAwarenessArticle(articleId, article) {
  try {
    const { data } = await apiClient.put(`/api/articles/${articleId}`, article);
    return data;
  } catch (err) {
    console.error('Failed to update article:', err);
    throw err;
  }
}

export async function publishAwarenessArticle(articleId) {
  try {
    const { data } = await apiClient.put(`/api/articles/${articleId}/publish`);
    return data;
  } catch (err) {
    console.error('Failed to publish article:', err);
    throw err;
  }
}

export async function archiveAwarenessArticle(articleId) {
  try {
    const { data } = await apiClient.put(`/api/articles/${articleId}/archive`);
    return data;
  } catch (err) {
    console.error('Failed to archive article:', err);
    throw err;
  }
}

export async function searchAwarenessArticles(keyword, category, status = 'PUBLISHED', page = 0, size = 20) {
  try {
    const { data } = await apiClient.get('/api/articles/search', {
      params: { keyword, category, status, page, size }
    });
    return data;
  } catch (err) {
    console.error('Failed to search articles:', err);
    return { content: [], totalPages: 1 };
  }
}

export async function deleteAwarenessArticle(articleId) {
  try {
    await apiClient.delete(`/api/articles/${articleId}`);
    return true;
  } catch (err) {
    console.error('Failed to delete article:', err);
    throw err;
  }
}

/**
 * Requirement: GET /api/diseases/search?q={query}
 * Strictly from backend microservice and PostgreSQL search engine
 */
export async function searchDiseaseAwareness(query = '', language = 'english', citizenId = null) {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const targetCitizenId = citizenId || userObj.citizenId || userObj.userId || userObj.id;

    const { data } = await apiClient.get('/api/diseases/search', {
      params: { q: query, language, citizenId: targetCitizenId }
    });
    if (data?.data) return data.data;
    if (data && data.diseaseName) return data;
  } catch (err) {
    console.error('Failed to search disease awareness from backend:', err);
  }
  return null;
}

export async function getDiseaseSuggestions(prefix = '', language = 'english') {
  try {
    const { data } = await apiClient.get('/api/diseases/suggestions', {
      params: { q: prefix, language }
    });
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
  } catch (err) {
    console.error('Failed to fetch disease suggestions:', err);
  }
  return [];
}

export async function getTrendingDiseases(language = 'english') {
  try {
    const { data } = await apiClient.get('/api/diseases/search', {
      params: { q: '', language }
    });
    if (data?.data) return data.data;
    if (data && data.diseaseName) return data;
  } catch (err) {
    console.error('Failed to fetch trending diseases:', err);
  }
  return null;
}

export async function fetchDiseaseSearchHistory(citizenId = null) {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const targetCitizenId = citizenId || userObj.citizenId || userObj.userId || userObj.id;

    const { data } = await apiClient.get('/api/diseases/history', {
      params: { citizenId: targetCitizenId }
    });
    return data?.data || { recentSearches: [], topSearched: [] };
  } catch (err) {
    console.error('Failed to fetch search history:', err);
    return { recentSearches: [], topSearched: [] };
  }
}

export async function recordDiseaseSearch(diseaseName, citizenId = null) {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const targetCitizenId = citizenId || userObj.citizenId || userObj.userId || userObj.id;

    await apiClient.post('/api/diseases/history', {
      diseaseName,
      citizenId: targetCitizenId
    });
  } catch (err) {
    console.debug('Failed to record search history:', err?.message);
  }
}
