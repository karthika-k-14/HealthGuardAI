import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchCitizenDocuments, uploadDocument, deleteDocument, getDocumentDownloadUrl } from '../../api/documentApi';

const DOCUMENT_CATEGORIES = [
  { key: 'ALL', label: 'All Documents' },
  { key: 'PRESCRIPTION', label: 'Prescriptions' },
  { key: 'LAB_REPORT', label: 'Lab Reports' },
  { key: 'MEDICAL_RECORD', label: 'Medical Records' },
  { key: 'VACCINATION_CERTIFICATE', label: 'Vaccination Certificates' },
  { key: 'INSURANCE_DOCUMENT', label: 'Insurance' },
  { key: 'OTHER', label: 'Other' },
];

export default function HealthDocumentVault() {
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [uploadDocType, setUploadDocType] = useState('PRESCRIPTION');
  const [selectedFile, setSelectedFile] = useState(null);

  const citizenId = 1;

  useEffect(() => {
    loadDocuments(page);
  }, [page]);

  async function loadDocuments(currentPage = 0) {
    setLoading(true);
    try {
      const data = await fetchCitizenDocuments(citizenId, currentPage, 20);
      if (data?.content) {
        setDocuments(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setDocuments(Array.isArray(data) ? data : []);
        setTotalPages(1);
      }
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a document file');
      return;
    }

    setIsUploading(true);
    try {
      await uploadDocument(citizenId, uploadDocType, selectedFile);
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      loadDocuments(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      loadDocuments(page);
    } catch (err) {
      toast.error('Failed to delete document');
    }
  }

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'ALL' || doc.documentType === selectedCategory;
    const matchesSearch = doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) || doc.documentType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Health Document Vault</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Securely store, view, and organize your prescriptions, lab reports, and medical records.</p>
        </div>
      </div>

      {/* Upload Form Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Upload className="h-5 w-5 text-emerald-500" /> Upload New Medical Document
        </h2>
        <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-3 md:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Document Type</label>
            <select
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {DOCUMENT_CATEGORIES.filter((c) => c.key !== 'ALL').map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Select File (PDF, PNG, JPG)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {DOCUMENT_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading document vault...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <FileText className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-2 text-sm">No medical documents found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {doc.documentType}
                    </span>
                    <button onClick={() => handleDelete(doc.id)} className="text-slate-400 hover:text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="mt-3 truncate text-sm font-semibold text-slate-900 dark:text-white">{doc.fileName}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Uploaded: {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <a
                    href={getDocumentDownloadUrl(doc.id)}
                    download
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs text-slate-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

