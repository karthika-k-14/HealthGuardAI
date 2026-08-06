import apiClient from './axios';

/**
 * Wraps the real Awareness Article backend (AwarenessArticleController:
 * /awareness-articles/** for reads, /admin/awareness-articles/** for
 * writes). Talks to the real backend over HTTP via the shared apiClient
 * (Bearer token attached automatically), mirroring the
 * citizenProfileApi.js pattern.
 */

function mapArticle(data) {
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid,
    title: data.title,
    category: data.category,
    summary: data.summary,
    content: data.content,
    imageUrl: data.imageUrl,
    author: data.author,
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// ---- View ------------------------------------------------------------

export async function fetchAwarenessArticles() {
  const { data } = await apiClient.get('/awareness-articles');
  return (data || []).map(mapArticle);
}

export async function fetchAwarenessArticleById(id) {
  const { data } = await apiClient.get(`/awareness-articles/${id}`);
  return mapArticle(data);
}

// ---- Search ------------------------------------------------------------

export async function searchAwarenessArticles(query, category) {
  const { data } = await apiClient.get('/awareness-articles/search', {
    params: {
      query: query || undefined,
      category: category || undefined,
    },
  });
  return (data || []).map(mapArticle);
}

// ---- Admin: Add / Update / Delete ---------------------------------------

export async function addAwarenessArticle(article) {
  const { data } = await apiClient.post('/admin/awareness-articles', {
    title: article.title,
    category: article.category || null,
    summary: article.summary || null,
    content: article.content || null,
    imageUrl: article.imageUrl || null,
    author: article.author || null,
    publishedAt: article.publishedAt || null,
  });
  return mapArticle(data);
}

export async function updateAwarenessArticle(articleId, article) {
  const { data } = await apiClient.put(`/admin/awareness-articles/${articleId}`, {
    title: article.title,
    category: article.category || null,
    summary: article.summary || null,
    content: article.content || null,
    imageUrl: article.imageUrl || null,
    author: article.author || null,
    publishedAt: article.publishedAt || null,
  });
  return mapArticle(data);
}

export async function deleteAwarenessArticle(articleId) {
  await apiClient.delete(`/admin/awareness-articles/${articleId}`);
  return true;
}
