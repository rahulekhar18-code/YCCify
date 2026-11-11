import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkCheck,
  Download,
  Eye,
  Trash2,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import api from '@yccify/api';
import { Resource } from '@yccify/types';

export const SavedResourcesPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<'all' | 'notes' | 'pyqs' | 'practicals' | 'assignments'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    try {
      const data = await api.bookmarks.getBookmarks();
      setBookmarks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (id: string) => {
    try {
      await api.bookmarks.toggleBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      await api.resources.recordDownload(resource.id);
      const file = resource.files[0];
      if (file) {
        const url = api.storage.getFileUrl(file.fileUrl, true);
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookmarks = bookmarks
    .filter((b) => filter === 'all' || b.category === filter)
    .filter(
      (b) =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Resources</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your bookmarked study notes, past papers, and practical files
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
          />
        </div>
      </div>

      {/* Filter Pills matching Screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['all', 'notes', 'pyqs', 'practicals', 'assignments'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === cat
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bookmarked Files List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading saved items...</div>
        ) : filteredBookmarks.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredBookmarks.map((res) => {
              const file = res.files[0];
              const sizeMb = file ? (file.fileSizeBytes / (1024 * 1024)).toFixed(1) : '2.1';

              return (
                <div
                  key={res.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 -mx-4 px-4 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 font-bold text-xs uppercase">
                      PDF
                    </div>

                    <div>
                      <Link
                        to={`/preview/${res.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-brand-blue transition-colors line-clamp-1"
                      >
                        {res.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                        <span className="font-semibold text-slate-700">{res.courseName}</span>
                        <span>•</span>
                        <span>{res.branchCode || 'IT'}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue font-bold text-[10px] uppercase">
                          {res.category}
                        </span>
                        <span>•</span>
                        <span>{sizeMb} MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/preview/${res.id}`}
                      className="p-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:text-brand-blue hover:bg-slate-50 transition-colors"
                      title="Preview PDF"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDownload(res)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRemoveBookmark(res.id)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 space-y-3">
            <BookmarkCheck className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No saved resources found</p>
            <p className="text-xs text-slate-400">
              Bookmark notes and PYQs during study sessions to quickly access them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

