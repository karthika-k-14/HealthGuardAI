import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchAwarenessArticles,
  addAwarenessArticle,
  updateAwarenessArticle,
  deleteAwarenessArticle,
  publishAwarenessArticle,
  archiveAwarenessArticle,
  searchAwarenessArticles
} from '../../api/awarenessApi';

const CATEGORIES = ['Nutrition', 'Women Health', 'Child Care', 'Mental Wellness', 'Disease Prevention', 'Public Health'];
const STATUS_TABS = ['PUBLISHED', 'DRAFT', 'ARCHIVED', 'ALL'];

export default function AdminArticleCMS() {
  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState('PUBLISHED');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Nutrition',
    imageUrl: '',
    publishedBy: 'HealthGuard Admin',
    status: 'DRAFT'
  });

  useEffect(() => {
    loadArticles(0);
  }, [activeTab]);

  async function loadArticles(currentPage = 0) {
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const pagedData = await searchAwarenessArticles(searchQuery, 'ALL', activeTab, currentPage, 10);
        setArticles(pagedData.content || []);
        setTotalPages(pagedData.totalPages || 1);
      } else {
        const data = await fetchAwarenessArticles(null, activeTab);
        setArticles(Array.isArray(data) ? data : []);
        setTotalPages(1);
      }
    } catch (err) {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(0);
    loadArticles(0);
  }

  function handleOpenCreate() {
    setEditingId(null);
    setForm({
      title: '',
      summary: '',
      content: '',
      category: 'Nutrition',
      imageUrl: '',
      publishedBy: 'HealthGuard Admin',
      status: 'DRAFT'
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(art) {
    setEditingId(art.id);
    setForm({
      title: art.title || '',
      summary: art.summary || '',
      content: art.content || '',
      category: art.category || 'Nutrition',
      imageUrl: art.imageUrl || '',
      publishedBy: art.publishedBy || 'HealthGuard Admin',
      status: art.status || 'DRAFT'
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.summary || !form.content) {
      toast.error('Please fill in title, summary, and content');
      return;
    }

    try {
      if (editingId) {
        await updateAwarenessArticle(editingId, form);
        toast.success('Article updated successfully');
      } else {
        await addAwarenessArticle(form);
        toast.success('Article created successfully');
      }
      setIsModalOpen(false);
      loadArticles(page);
    } catch (err) {
      toast.error('Failed to save article');
    }
  }

  async function handlePublish(id) {
    try {
      await publishAwarenessArticle(id);
      toast.success('Article published!');
      loadArticles(page);
    } catch (err) {
      toast.error('Failed to publish article');
    }
  }

  async function handleArchive(id) {
    try {
      await archiveAwarenessArticle(id);
      toast.success('Article archived!');
      loadArticles(page);
    } catch (err) {
      toast.error('Failed to archive article');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteAwarenessArticle(id);
      toast.success('Article deleted');
      loadArticles(page);
    } catch (err) {
      toast.error('Failed to delete article');
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Health Awareness CMS</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create, edit, publish, and manage health awareness articles for citizens.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Create Article
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(0); }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {tab === 'PUBLISHED' ? 'Published' : tab === 'DRAFT' ? 'Drafts' : tab === 'ARCHIVED' ? 'Archived' : 'All'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </form>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <FileText className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-2 text-sm font-medium">No articles found in {activeTab.toLowerCase()} status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Published By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{art.title}</td>
                    <td className="px-4 py-3">{art.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                        art.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : art.status === 'ARCHIVED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {art.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{art.publishedBy || 'Admin'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {art.status !== 'PUBLISHED' && (
                        <button onClick={() => handlePublish(art.id)} title="Publish Article" className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold">
                          Publish
                        </button>
                      )}
                      {art.status !== 'ARCHIVED' && (
                        <button onClick={() => handleArchive(art.id)} title="Archive Article" className="text-amber-600 hover:text-amber-700 text-xs font-semibold">
                          Archive
                        </button>
                      )}
                      <button onClick={() => handleOpenEdit(art)} title="Edit Article" className="text-slate-500 hover:text-emerald-600">
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(art.id)} title="Delete Article" className="text-slate-500 hover:text-rose-600">
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                disabled={page === 0}
                onClick={() => { const p = Math.max(0, page - 1); setPage(p); loadArticles(p); }}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs text-slate-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => { const p = page + 1; setPage(p); loadArticles(p); }}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Edit Article' : 'Create Article'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Summary</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

