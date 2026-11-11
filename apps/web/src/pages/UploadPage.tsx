import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FlaskConical,
  BookCheck,
  ArrowRight,
} from 'lucide-react';
import api from '@yccify/api';
import { Branch, Course, ResourceCategory } from '@yccify/types';

export const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(7);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('notes');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitTopic, setUnitTopic] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load branches
  useEffect(() => {
    api.academic
      .getBranches()
      .then((b) => {
        setBranches(b);
        if (b.length > 0) {
          setSelectedBranchId(b[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Load courses when branch or semester changes
  useEffect(() => {
    if (!selectedBranchId) return;
    api.academic
      .getCourses({
        branchId: selectedBranchId,
        semesterNumber: selectedSemester,
      })
      .then((cList) => {
        setCourses(cList);
        if (cList.length > 0) {
          setSelectedCourseId(cList[0].id);
        } else {
          setSelectedCourseId('');
        }
      })
      .catch((err) => console.error(err));
  }, [selectedBranchId, selectedSemester]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Validate file sizes (max 50MB)
      const oversized = filesArray.some((f) => f.size > 50 * 1024 * 1024);
      if (oversized) {
        setError('One or more files exceed the 50MB limit.');
        return;
      }
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError('Please select a course for this resource.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a descriptive resource title.');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Please choose at least one PDF or document to upload.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Step 1: Upload physical files to storage
      setUploadProgress(40);
      const uploadedFileMeta = await api.storage.uploadFiles(selectedFiles);
      setUploadProgress(75);

      // Step 2: Create resource entry in PostgreSQL database
      const newRes = await api.resources.createResource({
        courseId: selectedCourseId,
        category,
        title,
        description,
        unitTopic,
        academicYear: '2025-2026',
        files: uploadedFileMeta,
      });

      setUploadProgress(100);
      setSuccess(
        user?.role === 'admin'
          ? 'Resource published immediately to course repository!'
          : 'Resource uploaded successfully! It has been submitted for faculty/admin approval.'
      );

      setTimeout(() => {
        navigate(`/explore/it/sem/${selectedSemester}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please check network and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const categoryOptions = [
    { key: 'notes' as ResourceCategory, label: 'Notes', icon: FileText },
    { key: 'pyqs' as ResourceCategory, label: 'PYQs', icon: HelpCircle },
    { key: 'practicals' as ResourceCategory, label: 'Practicals', icon: FlaskConical },
    { key: 'assignments' as ResourceCategory, label: 'Assignments', icon: BookCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Upload Resource</h1>
        <p className="text-sm text-slate-500 mt-1">
          Share verified lecture notes, question papers, practical manuals or assignments with YCCE students
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Branch and Semester Selectors matching UI Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Branch *
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Semester *
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Course Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Course *
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
            >
              {courses.length > 0 ? (
                courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) – {c.facultyName || 'Department Faculty'}
                  </option>
                ))
              ) : (
                <option value="">No courses found for this semester</option>
              )}
            </select>
          </div>

          {/* 3. Resource Category Selector matching UI Screenshot */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Resource Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categoryOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = category === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setCategory(opt.key)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20 border-brand-blue'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Title & Unit / Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Resource Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unit 6 - Deep Learning Notes.pdf"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Unit / Topic Tag
              </label>
              <input
                type="text"
                value={unitTopic}
                onChange={(e) => setUnitTopic(e.target.value)}
                placeholder="e.g. Unit 6: Advanced Deep Learning"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description / Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short note explaining content coverage, topics, or solution notes..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
            />
          </div>

          {/* 5. Multiple File Upload Dropzone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Attach Files (PDF, DOCX, PPT - Max 50MB) *
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-brand-blue/50 rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
              <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-800">
                Drag and drop your academic files here, or{' '}
                <label className="text-brand-blue hover:underline cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supports multiple files per upload. Verified files appear directly in the course.
              </p>
            </div>

            {/* Selected File Badges with Delete button */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-700">Selected Files:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-brand-blue shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          ({(f.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 hover:text-red-500 text-slate-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Uploading to InsForge Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-brand-blue transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-4 px-6 rounded-2xl bg-brand-blue hover:bg-brand-hover text-white font-bold text-sm shadow-lg shadow-brand-blue/30 transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                <span>Upload & Submit for Verification</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

