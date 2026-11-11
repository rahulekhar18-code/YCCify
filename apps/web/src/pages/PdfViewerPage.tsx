import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Bookmark,
  BookmarkCheck,
  Maximize2,
  Printer,
  FileText,
  CheckCircle,
  ExternalLink,
  Layers,
  BookOpen,
  Calendar,
  User,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import api from '@yccify/api';
import { Resource, ResourceFile } from '@yccify/types';

export const PdfViewerPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();

  const [resource, setResource] = useState<Resource | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const loadResource = async () => {
      if (!resourceId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.resources.getResourceById(resourceId);
        setResource(res);
        setIsBookmarked(!!res.isBookmarked);
        setActiveFileIndex(0);
        await api.resources.recordView(resourceId);
      } catch (err: any) {
        console.error('Error loading resource:', err);
        setError(err.message || 'Failed to load document.');
      } finally {
        setLoading(false);
      }
    };
    loadResource();
  }, [resourceId]);

  const handleToggleBookmark = async () => {
    if (!resource) return;
    try {
      const res = await api.bookmarks.toggleBookmark(resource.id);
      setIsBookmarked(res.isBookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const activeFile: ResourceFile | undefined = resource?.files?.[activeFileIndex] || resource?.files?.[0];
  const fileUrl = activeFile ? api.storage.getFileUrl(activeFile.fileUrl) : '';
  const downloadUrl = activeFile ? api.storage.getFileUrl(activeFile.fileUrl, true) : '';

  const handleDownload = async () => {
    if (!resource || !activeFile) return;
    try {
      await api.resources.recordDownload(resource.id);
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  const isPdf = activeFile?.fileName?.toLowerCase().endsWith('.pdf') || activeFile?.mimeType === 'application/pdf';
  const isImage =
    activeFile?.fileName?.toLowerCase().endsWith('.png') ||
    activeFile?.fileName?.toLowerCase().endsWith('.jpg') ||
    activeFile?.fileName?.toLowerCase().endsWith('.jpeg');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col -m-8">
      {/* Top Controls Header */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-md font-black shrink-0 ${isPdf
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
            >
              {isPdf ? 'PDF' : isImage ? 'IMG' : 'DOC'}
            </span>
            <div className="truncate">
              <h1 className="text-sm font-bold text-white tracking-wide truncate">
                {activeFile?.fileName || resource?.title || 'Academic Resource Preview'}
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                {resource?.courseCode ? `${resource.courseCode} • ` : ''}
                {resource?.courseName || 'YCCE Academic Material'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bookmark */}
          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
            className={`p-2 rounded-xl border transition-colors ${isBookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:text-white'
              }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-amber-400 text-amber-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Refresh iframe preview */}
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            title="Reload Preview"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/80 hover:text-white transition-colors hidden sm:inline-flex"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Open full page in native browser tab */}
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Native Full Tab"
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/80 hover:text-white transition-colors hidden sm:inline-flex"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-brand-blue/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
      </header>

      {/* Mobile Multi-File Switcher Bar (Appears when resource has multiple attachments) */}
      {resource && resource.files && resource.files.length > 1 && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Files ({resource.files.length}):
          </span>
          {resource.files.map((file, idx) => {
            const isCurrent = idx === activeFileIndex;
            return (
              <button
                key={file.id || idx}
                onClick={() => setActiveFileIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-brand-blue text-white font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {file.fileName}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Preview Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Document Information & Multi-File Switcher Sidebar */}
        <aside className="w-64 sm:w-72 bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto space-y-6 shrink-0 hidden md:block">
          {/* Document Header Card */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Document Information
            </span>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] text-brand-blue font-bold uppercase tracking-wider">
                  {resource?.category || 'Notes'}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-2">
                  {resource?.title}
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{resource?.courseName || 'Calculus and Vectors'}</span>
                </div>
                {resource?.unitTopic && (
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{resource.unitTopic}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{resource?.uploaderName || 'Admin Authority'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{resource?.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'Active Session'}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold">Verified Live Document</span>
                </div>
              </div>
            </div>
          </div>

          {/* Files List if multi-file resource */}
          {resource && resource.files && resource.files.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Attached Files ({resource.files.length})
              </span>

              <div className="space-y-1.5">
                {resource.files.map((file, idx) => {
                  const isCurrent = idx === activeFileIndex;
                  const sizeMB = (file.fileSizeBytes / (1024 * 1024)).toFixed(1);
                  return (
                    <button
                      key={file.id || idx}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${isCurrent
                          ? 'bg-blue-950/60 border-brand-blue ring-1 ring-brand-blue text-white'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                    >
                      <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isCurrent ? 'text-brand-blue' : 'text-slate-400'}`} />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold truncate">{file.fileName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{sizeMB} MB • PDF</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Helpful Tip */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300">💡 Native PDF Viewer:</span>
            <p>
              Use the PDF toolbar inside the preview to zoom, jump pages, print, or use page thumbnails.
            </p>
          </div>
        </aside>

        {/* Center PDF Viewer Iframe / Object Container */}
        <main className="flex-1 bg-slate-950 p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden">
          {loading ? (
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading your uploaded document...</p>
            </div>
          ) : error ? (
            <div className="p-8 max-w-md bg-slate-900 border border-red-500/30 rounded-3xl text-center space-y-4">
              <FileText className="w-12 h-12 text-red-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">Document Preview Unavailable</h3>
                <p className="text-xs text-slate-400 mt-1">{error}</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Go Back to Course
              </button>
            </div>
          ) : isPdf && fileUrl ? (
            /* Real Embedded PDF via iframe connecting directly to the uploaded file stream */
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
              <iframe
                key={iframeKey}
                src={`${fileUrl}#view=FitH&toolbar=1&navpanes=1`}
                title={resource?.title || 'PDF Preview'}
                className="w-full h-full border-0 bg-white"
              />
            </div>
          ) : isImage && fileUrl ? (
            /* Image Preview */
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img
                src={fileUrl}
                alt={resource?.title || 'Preview'}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          ) : (
            /* Generic File Preview & Direct Download fallback */
            <div className="p-10 max-w-lg bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-5">
              <FileText className="w-14 h-14 text-brand-blue mx-auto" />
              <div>
                <h3 className="text-lg font-black text-white">{activeFile?.fileName || resource?.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This file is available for direct download and viewing.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                  >
                    Open in Browser
                  </a>
                )}
                <button
                  onClick={handleDownload}
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
