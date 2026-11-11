import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder,
  FolderPlus,
  FolderOpen,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  Download,
  Plus,
  BookOpen,
  CheckCircle,
  AlertCircle,
  X,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  FileCheck,
  Files,
  HardDrive,
  List,
  Sparkles,
  HelpCircle,
  FlaskConical,
  BookCheck,
} from 'lucide-react';
import api from '@yccify/api';
import { Semester, Branch, Course, Faculty, Resource, ResourceCategory } from '@yccify/types';

export const AdminSemesters: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'units' | 'list'>('units');
  const [loading, setLoading] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);

  // Expanded state for Unit Folders (track unit names)
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  // Custom unit folders added dynamically by admin
  const [customUnitFolders, setCustomUnitFolders] = useState<Record<string, string[]>>({});

  // Modals State
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewUnitModal, setShowNewUnitModal] = useState(false);

  // New Subject Folder (Course) Form State
  const [folderName, setFolderName] = useState('');
  const [folderCode, setFolderCode] = useState('');
  const [folderCredits, setFolderCredits] = useState(4);
  const [folderFacultyId, setFolderFacultyId] = useState('');
  const [folderDesc, setFolderDesc] = useState('');
  const [folderError, setFolderError] = useState<string | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);

  // New Unit Folder Modal State
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitError, setNewUnitError] = useState<string | null>(null);

  // Upload Resource Form State
  const [uploadMode, setUploadMode] = useState<'folder' | 'files'>('folder');
  const [uploadCourseId, setUploadCourseId] = useState('');
  const [uploadCategory, setUploadCategory] = useState<ResourceCategory>('notes');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadUnitTopic, setUploadUnitTopic] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [detectedFolderName, setDetectedFolderName] = useState('');
  const [uploadStrategy, setUploadStrategy] = useState<'individual' | 'bundle'>('individual');
  const [uploading, setUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Refs for hidden HTML5 file & folder inputs
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Load: Branches & Faculty
  useEffect(() => {
    const init = async () => {
      try {
        const [bList, fList] = await Promise.all([
          api.academic.getBranches(),
          api.academic.getFaculty(),
        ]);
        setBranches(bList);
        setFaculty(fList);
        if (bList.length > 0) {
          setSelectedBranchId(bList[0].id);
        }
      } catch (err) {
        console.error('Error loading initial metadata:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // When branch changes: Load Semesters
  useEffect(() => {
    if (!selectedBranchId) return;
    const loadSemesters = async () => {
      try {
        const sList = await api.academic.getSemesters(selectedBranchId);
        setSemesters(sList);
        if (sList.length > 0) {
          // Default to Sem 1 or whatever is active
          const sem1 = sList.find((s) => s.semesterNumber === 1) || sList[0];
          setSelectedSemester(sem1);
        } else {
          setSelectedSemester(null);
        }
      } catch (err) {
        console.error('Error loading semesters:', err);
      }
    };
    loadSemesters();
  }, [selectedBranchId]);

  // When selected semester or branch changes: Load Courses for this semester
  useEffect(() => {
    if (!selectedSemester || !selectedBranchId) {
      setCourses([]);
      setSelectedCourse(null);
      return;
    }

    const loadCourses = async () => {
      try {
        const cList = await api.academic.getCourses({
          branchId: selectedBranchId,
          semesterId: selectedSemester.id,
          semesterNumber: selectedSemester.semesterNumber,
        });
        setCourses(cList);
        if (cList.length > 0) {
          setSelectedCourse(cList[0]);
          setUploadCourseId(cList[0].id);
        } else {
          setSelectedCourse(null);
          setUploadCourseId('');
        }
      } catch (err) {
        console.error('Error loading courses for semester:', err);
      }
    };

    loadCourses();
  }, [selectedSemester, selectedBranchId]);

  // When selected course changes: Load Resources (Files)
  const loadCourseResources = async (courseId: string) => {
    setLoadingResources(true);
    try {
      const rList = await api.resources.getResources({ courseId, status: 'all' });
      setResources(rList);
      
      // Auto-expand all unit folders that have files
      const initialExpanded: Record<string, boolean> = {};
      rList.forEach((r) => {
        const u = getUnitName(r);
        initialExpanded[u] = true;
      });
      // Also expand standard unit 1 & 2
      initialExpanded['Unit 1: Differential Calculus'] = true;
      initialExpanded['Unit 1'] = true;
      setExpandedUnits((prev) => ({ ...initialExpanded, ...prev }));
    } catch (err) {
      console.error('Error loading resources for course:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      loadCourseResources(selectedCourse.id);
    } else {
      setResources([]);
    }
  }, [selectedCourse]);

  // Intelligent Unit Name Extractor
  const getUnitName = (res: Resource): string => {
    if (res.unitTopic && res.unitTopic !== 'General Unit' && res.unitTopic.trim() !== '') {
      return res.unitTopic.trim();
    }
    const title = res.title || res.files?.[0]?.fileName || '';
    const match = title.match(/unit[\s\-_]*(\d+)/i);
    if (match) {
      return `Unit ${match[1]}`;
    }
    if (title.toLowerCase().includes('handout') || title.toLowerCase().includes('syllabus')) {
      return 'Course Handouts & Syllabus';
    }
    return 'General Unit';
  };

  // Group resources into Units for the active Course
  const unitGroups = useMemo(() => {
    const groups: Record<string, Resource[]> = {};

    // 1. Pre-populate custom units created by user for this course
    const courseCustomUnits = (selectedCourse && customUnitFolders[selectedCourse.id]) || [];
    courseCustomUnits.forEach((u) => {
      groups[u] = [];
    });

    // 2. Filter resources by category if selected
    const filtered = resources.filter((r) =>
      selectedCategory === 'all' ? true : r.category === selectedCategory
    );

    // 3. Put resources in their respective Unit Folders
    filtered.forEach((r) => {
      const uName = getUnitName(r);
      if (!groups[uName]) {
        groups[uName] = [];
      }
      groups[uName].push(r);
    });

    return groups;
  }, [resources, selectedCategory, selectedCourse, customUnitFolders]);

  const existingUnitNames = useMemo(() => {
    const names = new Set<string>();
    // Default YCCE curriculum units
    names.add('Unit 1: Differential Calculus');
    names.add('Unit 2: Partial Differentiation');
    names.add('Unit 3: Integral Calculus');
    names.add('Unit 4: Multiple Integrals');
    names.add('Unit 5: Vector Differentiation');
    names.add('Unit 6: Vector Integration');
    names.add('Course Handouts & Syllabus');

    // Add units from live resources
    resources.forEach((r) => {
      if (r.unitTopic && r.unitTopic !== 'General Unit') {
        names.add(r.unitTopic);
      }
    });

    // Add custom units
    if (selectedCourse && customUnitFolders[selectedCourse.id]) {
      customUnitFolders[selectedCourse.id].forEach((u) => names.add(u));
    }

    return Array.from(names);
  }, [resources, selectedCourse, customUnitFolders]);

  // Toggle open/close of a Unit Folder
  const toggleUnit = (unitName: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitName]: !prev[unitName],
    }));
  };

  // Create New Course Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemester || !selectedBranchId) return;

    if (!folderName.trim() || !folderCode.trim()) {
      setFolderError('Folder/Course Name and Code (e.g. IT706) are required.');
      return;
    }

    setCreatingFolder(true);
    setFolderError(null);

    try {
      const newCourse = await api.academic.addCourse({
        semesterId: selectedSemester.id,
        branchId: selectedBranchId,
        name: folderName.trim(),
        code: folderCode.trim().toUpperCase(),
        credits: Number(folderCredits) || 3,
        description: folderDesc.trim() || `Course folder for ${folderName}`,
        facultyId: folderFacultyId || undefined,
        icon: 'Folder',
      });

      setCourses((prev) => [...prev, newCourse]);
      setSemesters((prev) =>
        prev.map((sem) =>
          sem.id === selectedSemester.id
            ? { ...sem, coursesCount: (sem.coursesCount ?? 0) + 1 }
            : sem
        )
      );
      setSelectedCourse(newCourse);
      setUploadCourseId(newCourse.id);
      setShowFolderModal(false);

      // Reset form
      setFolderName('');
      setFolderCode('');
      setFolderCredits(4);
      setFolderFacultyId('');
      setFolderDesc('');
    } catch (err: any) {
      setFolderError(err.message || 'Failed to create folder/course.');
    } finally {
      setCreatingFolder(false);
    }
  };

  // Handle User Creating a New Unit Folder (e.g. "Unit 1: Differential Calculus")
  const handleCreateUnitFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const trimmed = newUnitName.trim();
    if (!trimmed) {
      setNewUnitError('Please enter a Unit name.');
      return;
    }

    setCustomUnitFolders((prev) => {
      const current = prev[selectedCourse.id] || [];
      if (!current.includes(trimmed)) {
        return { ...prev, [selectedCourse.id]: [...current, trimmed] };
      }
      return prev;
    });

    // Automatically expand the newly created unit
    setExpandedUnits((prev) => ({ ...prev, [trimmed]: true }));
    setShowNewUnitModal(false);
    setNewUnitName('');
    setNewUnitError(null);
  };

  // Handle Folder Selection via HTML5 `webkitdirectory`
  const handleFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setSelectedFiles(fileList);

      // Extract top folder name from webkitRelativePath
      const firstPath = fileList[0].webkitRelativePath || '';
      const folderSegment = firstPath.split('/')[0] || '';
      const cleanFolderName = folderSegment || 'Unit Materials';

      setDetectedFolderName(cleanFolderName);
      setUploadUnitTopic(cleanFolderName);
      setUploadTitle(cleanFolderName);
    }
  };

  // Handle Individual Files Selection
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setSelectedFiles(fileList);
      if (!uploadTitle) {
        setUploadTitle(fileList[0].name);
      }
    }
  };

  // Upload Files / Folder Handler
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCourseId) {
      setUploadError('Please select a target subject folder.');
      return;
    }
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one file or folder to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgressMsg(`Uploading ${selectedFiles.length} file(s) to storage server...`);

    try {
      // 1. Upload files to Storage Server
      const uploadedFiles = await api.storage.uploadFiles(selectedFiles);

      setUploadProgressMsg(`Publishing ${uploadedFiles.length} academic resource(s)...`);

      const effectiveUnit = uploadUnitTopic.trim() || 'General Unit';
      const academicYear = selectedSemester?.academicYear || '2025-2026';

      let newlyCreated: Resource[] = [];

      if (uploadMode === 'folder' && uploadStrategy === 'individual') {
        // Option A: Create a separate live resource entry for EACH file in this unit
        // This gives each file its own name, category, and direct preview button!
        const batchItems = uploadedFiles.map((f) => ({
          courseId: uploadCourseId,
          category: uploadCategory,
          title: f.fileName,
          unitTopic: effectiveUnit,
          description: `Uploaded from folder "${detectedFolderName || effectiveUnit}" for Sem ${selectedSemester?.semesterNumber}`,
          academicYear,
          files: [
            {
              fileName: f.fileName,
              fileUrl: f.fileUrl,
              storagePath: f.storagePath,
              fileSizeBytes: f.fileSizeBytes,
              mimeType: f.mimeType,
              pageCount: f.pageCount || 10,
            },
          ],
        }));

        try {
          newlyCreated = await api.resources.createResourcesBatch(batchItems);
        } catch {
          // Direct fallback if batch endpoint is not used
          for (const item of batchItems) {
            const single = await api.resources.createResource(item);
            newlyCreated.push(single);
          }
        }
      } else {
        // Option B: Multi-file bundle resource OR single file upload
        const resourceItem = await api.resources.createResource({
          courseId: uploadCourseId,
          category: uploadCategory,
          title: uploadTitle.trim() || effectiveUnit,
          unitTopic: effectiveUnit,
          description: `Uploaded by Admin for Semester ${selectedSemester?.semesterNumber}`,
          academicYear,
          files: uploadedFiles.map((f) => ({
            fileName: f.fileName,
            fileUrl: f.fileUrl,
            storagePath: f.storagePath,
            fileSizeBytes: f.fileSizeBytes,
            mimeType: f.mimeType,
            pageCount: f.pageCount || 10,
          })),
        });
        newlyCreated = [resourceItem];
      }

      // Update current resources state
      if (selectedCourse && selectedCourse.id === uploadCourseId) {
        setResources((prev) => [...newlyCreated, ...prev]);
        // Expand the target unit folder so the newly uploaded files are immediately visible
        setExpandedUnits((prev) => ({ ...prev, [effectiveUnit]: true }));
      }

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadModal(false);
        setSelectedFiles([]);
        setUploadTitle('');
        setUploadUnitTopic('');
        setDetectedFolderName('');
      }, 1200);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload files.');
    } finally {
      setUploading(false);
      setUploadProgressMsg('');
    }
  };

  // Delete Resource File
  const handleDeleteResource = async (id: string) => {
    if (!confirm('Permanently delete this resource and its associated files?')) return;
    try {
      await api.resources.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert('Error deleting resource: ' + err.message);
    }
  };

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  // Quick helper to open upload modal with prefilled unit
  const openUploadWithUnit = (unitName: string, mode: 'folder' | 'files' = 'folder') => {
    setUploadCourseId(selectedCourse?.id || '');
    setUploadUnitTopic(unitName);
    setUploadTitle(unitName);
    setUploadMode(mode);
    setShowUploadModal(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16 px-1 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-brand-blue flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5" />
              Academic Folder & Unit System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            Semester & Subject Unit Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize semesters, manage subject folders, and upload entire unit folders (Notes, PYQs, Practicals, Assignments).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Branch Department Selector */}
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>

          {/* Upload Entire Folder Button */}
          <button
            onClick={() => {
              setUploadCourseId(selectedCourse?.id || courses[0]?.id || '');
              setUploadMode('folder');
              setShowUploadModal(true);
            }}
            className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
          >
            <FolderOpen className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Upload Folder</span>
          </button>

          {/* Direct Upload Files Button */}
          <button
            onClick={() => {
              setUploadCourseId(selectedCourse?.id || courses[0]?.id || '');
              setUploadMode('files');
              setShowUploadModal(true);
            }}
            className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-blue/20 flex items-center justify-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Upload Files</span>
          </button>

          {/* New Subject Folder Button */}
          <button
            onClick={() => setShowFolderModal(true)}
            className="w-full sm:w-auto px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">+ Add Subject Folder</span>
          </button>
        </div>
      </div>

      {/* 8-Semester Selection Cards (2 rows of 4 on mobile, 8 in 1 row on laptop) */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
            Select Semester to Manage
          </h2>
          <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
            Active: <strong className="text-slate-700">{selectedBranch?.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {semesters.map((s) => {
            const isSelected = selectedSemester?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSemester(s)}
                className={`text-left rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-200 border relative ${
                  isSelected
                    ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/30 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span
                    className={`text-[11px] sm:text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-brand-blue'
                    }`}
                  >
                    {s.semesterNumber}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      isSelected ? 'bg-cyan-300 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="text-xs sm:text-sm font-black tracking-tight">Sem {s.semesterNumber}</div>
                <div className={`text-[10px] sm:text-[11px] mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {s.coursesCount ?? 0} {(s.coursesCount ?? 0) === 1 ? 'Course' : 'Courses'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Semester Academic Explorer & File Manager */}
      {selectedSemester && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          {/* Header of Active Semester */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-brand-blue flex-wrap">
                <span>{selectedBranch?.code} Dept</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span>Semester {selectedSemester.semesterNumber}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-500 font-medium">Course Folders & Materials</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-brand-blue fill-brand-blue/10 shrink-0" />
                <span className="truncate">Sem {selectedSemester.semesterNumber} Folders & Resources</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <button
                onClick={() => setShowFolderModal(true)}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5 text-brand-blue" />
                <span>New Subject</span>
              </button>
              <button
                onClick={() => {
                  setUploadCourseId(selectedCourse?.id || courses[0]?.id || '');
                  setUploadMode('folder');
                  setShowUploadModal(true);
                }}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Upload Folder</span>
              </button>
              <button
                onClick={() => {
                  setUploadCourseId(selectedCourse?.id || courses[0]?.id || '');
                  setUploadMode('files');
                  setShowUploadModal(true);
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload to Sem {selectedSemester.semesterNumber}</span>
              </button>
            </div>
          </div>

          {/* Subject Folders Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Subject Folders in Sem {selectedSemester.semesterNumber} ({courses.length})
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">Click a subject folder to view units</span>
            </div>

            {courses.length === 0 ? (
              <div className="p-6 sm:p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No subject folders created yet for this semester.</p>
                <p className="text-xs text-slate-400 mt-1">Click "+ Add Subject Folder" to create the first subject.</p>
                <button
                  onClick={() => setShowFolderModal(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-sm"
                >
                  Create First Subject Folder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
                {courses.map((c) => {
                  const isSelected = selectedCourse?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourse(c)}
                      className={`cursor-pointer rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border text-left flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/70 border-brand-blue shadow-md ring-2 ring-brand-blue/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                              isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Folder className="w-4 h-4" />
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {c.code}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{c.name}</h4>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {c.facultyName || 'Faculty Assigned'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500 text-[10px] sm:text-[11px]">
                          {isSelected ? 'Currently Viewing' : 'Click to Open'}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-blue' : 'text-slate-300'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Folder's Files Area */}
          {selectedCourse && (
            <div className="pt-5 sm:pt-6 border-t border-slate-100 space-y-5 sm:space-y-6">
              {/* Course Title & Actions Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/80 p-3.5 sm:p-5 rounded-2xl border border-slate-200/60">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-bold shadow-md shadow-brand-blue/20 shrink-0">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-black text-brand-blue bg-blue-100/70 px-2 py-0.5 rounded shrink-0">
                        {selectedCourse.code}
                      </span>
                      <h3 className="text-base sm:text-xl font-black text-slate-900 truncate">{selectedCourse.name}</h3>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                      Faculty: <span className="font-bold text-slate-700">{selectedCourse.facultyName || 'Prof. Faculty Dean'}</span> • {selectedCourse.credits} Credits • {resources.length} Files
                    </p>
                  </div>
                </div>

                {/* Primary Unit & Folder Upload Buttons */}
                <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                  <button
                    onClick={() => {
                      setUploadCourseId(selectedCourse.id);
                      setUploadMode('folder');
                      setShowUploadModal(true);
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    <FolderOpen className="w-4 h-4 shrink-0" />
                    <span>+ Upload Folder</span>
                  </button>

                  <button
                    onClick={() => {
                      setUploadCourseId(selectedCourse.id);
                      setUploadMode('files');
                      setShowUploadModal(true);
                    }}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4 shrink-0" />
                    <span>+ Add Files</span>
                  </button>

                  <button
                    onClick={() => setShowNewUnitModal(true)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>+ New Unit</span>
                  </button>
                </div>
              </div>

              {/* Sub-toolbar: View Switcher (Unit Folders vs Flat List) & Category Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-fit">
                  <button
                    onClick={() => setViewMode('units')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      viewMode === 'units'
                        ? 'bg-white text-brand-blue shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Unit Folders</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      viewMode === 'list'
                        ? 'bg-white text-brand-blue shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Flat List</span>
                  </button>
                </div>

                {/* Category Filter Pills (horizontally scrollable on mobile) */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-xs font-bold overflow-x-auto max-w-full pb-1 sm:pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'notes', label: '📝 Notes' },
                    { id: 'pyqs', label: '📄 PYQs' },
                    { id: 'practicals', label: '🔬 Practicals' },
                    { id: 'assignments', label: '📋 Assignments' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                        selectedCategory === tab.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Files Area Rendering */}
              {loadingResources ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                  <span>Loading subject unit folders and files...</span>
                </div>
              ) : viewMode === 'units' ? (
                /* ========================================================================= */
                /* VIEW 1: UNIT FOLDERS VIEW (GROUPED BY UNIT)                               */
                /* ========================================================================= */
                <div className="space-y-4">
                  {Object.keys(unitGroups).length === 0 ? (
                    <div className="p-10 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 space-y-3">
                      <Folder className="w-10 h-10 text-slate-300 mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">No Unit Folders Created Yet</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          Engineering units contain multiple files (Notes, PYQs, Practicals). Upload an entire unit folder from your computer or create a unit folder manually.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            setUploadCourseId(selectedCourse.id);
                            setUploadMode('folder');
                            setShowUploadModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2"
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span>Upload Unit Folder</span>
                        </button>
                        <button
                          onClick={() => setShowNewUnitModal(true)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                        >
                          + Create Empty Unit
                        </button>
                      </div>
                    </div>
                  ) : (
                    Object.entries(unitGroups).map(([unitName, unitResources]) => {
                      const isExpanded = expandedUnits[unitName] ?? true;
                      const hasFiles = unitResources.length > 0;
                      
                      // Count distinct categories in this unit
                      const categoriesPresent = Array.from(new Set(unitResources.map((r) => r.category)));

                      return (
                        <div
                          key={unitName}
                          className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs transition-all hover:border-slate-300"
                        >
                          {/* Unit Folder Header */}
                          <div
                            onClick={() => toggleUnit(unitName)}
                            className="p-4 sm:p-4.5 bg-slate-50/70 hover:bg-slate-50 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                  hasFiles
                                    ? 'bg-blue-100 text-brand-blue'
                                    : 'bg-slate-200/70 text-slate-400'
                                }`}
                              >
                                {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                              </span>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-black text-sm text-slate-900 tracking-tight">
                                    {unitName}
                                  </h4>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      hasFiles
                                        ? 'bg-blue-50 text-brand-blue'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                                  >
                                    {unitResources.length} {unitResources.length === 1 ? 'file' : 'files'}
                                  </span>

                                  {/* Category badges present */}
                                  {categoriesPresent.map((cat) => (
                                    <span
                                      key={cat}
                                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                        cat === 'notes'
                                          ? 'bg-blue-50 text-brand-blue'
                                          : cat === 'pyqs'
                                          ? 'bg-amber-50 text-amber-700'
                                          : cat === 'practicals'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-purple-50 text-purple-700'
                                      }`}
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {hasFiles
                                    ? `Contains lecture materials, notes & question sets for ${unitName}`
                                    : 'Empty unit folder • Ready for uploads'}
                                </p>
                              </div>
                            </div>

                            {/* Header Actions */}
                            <div
                              className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-center w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => openUploadWithUnit(unitName, 'folder')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors flex items-center gap-1"
                                title="Upload a folder of files directly to this unit"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                <span>Upload Folder</span>
                              </button>

                              <button
                                onClick={() => openUploadWithUnit(unitName, 'files')}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-blue text-xs font-bold transition-colors flex items-center gap-1"
                                title="Upload files to this unit"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Add File</span>
                              </button>

                              <button
                                onClick={() => toggleUnit(unitName)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Unit Files Body */}
                          {isExpanded && (
                            <div className="divide-y divide-slate-100">
                              {!hasFiles ? (
                                <div className="p-6 text-center bg-slate-50/40 text-slate-400 text-xs space-y-2">
                                  <p>No files uploaded for {unitName} yet.</p>
                                  <button
                                    onClick={() => openUploadWithUnit(unitName, 'folder')}
                                    className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
                                  >
                                    <FolderOpen className="w-3 h-3" />
                                    <span>Upload entire folder to this unit</span>
                                  </button>
                                </div>
                              ) : (
                                unitResources.map((res) => {
                                  const firstFile = res.files?.[0];
                                  const sizeMB = firstFile
                                    ? (firstFile.fileSizeBytes / (1024 * 1024)).toFixed(1)
                                    : '2.4';
                                  const multiCount = res.files?.length || 1;

                                  return (
                                    <div
                                      key={res.id}
                                      className="p-3.5 sm:px-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                      <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                          PDF
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-xs sm:text-sm text-slate-900 break-words">
                                              {res.title}
                                            </span>
                                            {multiCount > 1 && (
                                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                                {multiCount} files
                                              </span>
                                            )}
                                            <span
                                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                                res.category === 'notes'
                                                  ? 'bg-blue-50 text-brand-blue'
                                                  : res.category === 'pyqs'
                                                  ? 'bg-amber-50 text-amber-700'
                                                  : res.category === 'practicals'
                                                  ? 'bg-emerald-50 text-emerald-700'
                                                  : 'bg-purple-50 text-purple-700'
                                              }`}
                                            >
                                              {res.category}
                                            </span>
                                            {res.approvalStatus === 'approved' && (
                                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                                <CheckCircle className="w-3 h-3" /> Live
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11px] text-slate-400">
                                            {sizeMB} MB • Uploaded {new Date(res.createdAt).toLocaleDateString()} by {res.uploaderName}
                                          </p>
                                        </div>
                                      </div>

                                      {/* File Actions */}
                                      <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-center shrink-0">
                                        <Link
                                          to={`/preview/${res.id}`}
                                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                                          title="Preview PDF Document"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          <span>Preview</span>
                                        </Link>
                                        {firstFile && (
                                          <a
                                            href={api.storage.getFileUrl(firstFile.fileUrl, true)}
                                            download={firstFile.fileName}
                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                            title="Download File"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                        <button
                                          onClick={() => handleDeleteResource(res.id)}
                                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors"
                                          title="Delete Resource"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* ========================================================================= */
                /* VIEW 2: ALL FILES (FLAT LIST)                                             */
                /* ========================================================================= */
                resources.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 space-y-3">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">No files found</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        There are currently no files uploaded for {selectedCourse.name}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                    {resources
                      .filter((r) => (selectedCategory === 'all' ? true : r.category === selectedCategory))
                      .map((res) => {
                        const firstFile = res.files?.[0];
                        const sizeMB = firstFile ? (firstFile.fileSizeBytes / (1024 * 1024)).toFixed(1) : '2.4';
                        return (
                          <div
                            key={res.id}
                            className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                PDF
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-slate-900">{res.title}</span>
                                  <span
                                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                      res.category === 'notes'
                                        ? 'bg-blue-50 text-brand-blue'
                                        : res.category === 'pyqs'
                                        ? 'bg-amber-50 text-amber-700'
                                        : res.category === 'practicals'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-purple-50 text-purple-700'
                                    }`}
                                  >
                                    {res.category}
                                  </span>
                                  {res.approvalStatus === 'approved' && (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Live
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400">
                                  Unit/Topic: <span className="text-slate-600 font-medium">{res.unitTopic || 'General Unit'}</span> • {sizeMB} MB • Uploaded {new Date(res.createdAt).toLocaleDateString()} by {res.uploaderName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <Link
                                to={`/preview/${res.id}`}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                                title="Preview PDF"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </Link>
                              {firstFile && (
                                <a
                                  href={api.storage.getFileUrl(firstFile.fileUrl, true)}
                                  download={firstFile.fileName}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                  title="Download File"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteResource(res.id)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors"
                                title="Delete Resource"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW SUBJECT FOLDER (COURSE)                                 */}
      {/* ========================================================================= */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-5 sm:space-y-6 animate-scale-in my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Add Subject Folder</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Semester {selectedSemester?.semesterNumber} • {selectedBranch?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {folderError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{folderError}</span>
              </div>
            )}

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Course / Folder Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artificial Intelligence"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT706"
                    value={folderCode}
                    onChange={(e) => setFolderCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={folderCredits}
                    onChange={(e) => setFolderCredits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Assigned Faculty</label>
                  <select
                    value={folderFacultyId}
                    onChange={(e) => setFolderFacultyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:outline-none bg-white"
                  >
                    <option value="">Select Faculty...</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description / Syllabus Overview</label>
                <textarea
                  rows={2}
                  placeholder="Short description of this course folder..."
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-blue focus:outline-none resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingFolder}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-blue/20"
                >
                  {creatingFolder ? 'Creating Folder...' : 'Create Subject Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW UNIT FOLDER (e.g. Unit 1: Differential Calculus)          */}
      {/* ========================================================================= */}
      {showNewUnitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 md:p-7 shadow-2xl space-y-4 sm:space-y-5 animate-scale-in my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center shrink-0">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">Create Unit Folder</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">For {selectedCourse?.name || 'Subject'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewUnitModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newUnitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                {newUnitError}
              </div>
            )}

            <form onSubmit={handleCreateUnitFolder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Unit Name / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 2: Partial Differentiation"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>

              {/* Quick Naming Suggestion Chips */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Suggestions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Unit 1',
                    'Unit 2',
                    'Unit 3',
                    'Unit 4',
                    'Unit 5',
                    'Unit 6',
                    'Course Handouts & Syllabus',
                    'Practical Lab Manuals',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewUnitName(sug)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-brand-blue text-[11px] font-semibold text-slate-600 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewUnitModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-brand-blue/20"
                >
                  Create Unit Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UPLOAD FOLDER OR FILES                                           */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-5 animate-scale-in my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  {uploadMode === 'folder' ? <FolderOpen className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {uploadMode === 'folder' ? 'Upload Entire Unit Folder' : 'Upload Academic Material'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Semester {selectedSemester?.semesterNumber} • {selectedBranch?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Mode Selector Tabs (Folder vs Files) */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1.5 bg-slate-100 rounded-xl sm:rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('folder');
                  setSelectedFiles([]);
                }}
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  uploadMode === 'folder'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Upload Folder</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('files');
                  setSelectedFiles([]);
                }}
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  uploadMode === 'files'
                    ? 'bg-white text-brand-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Files className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue shrink-0" />
                <span className="truncate">Select Files</span>
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Folder and files successfully uploaded and published to unit!</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-4">
              {/* Target Course Folder Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Target Subject Folder *</label>
                <select
                  required
                  value={uploadCourseId}
                  onChange={(e) => setUploadCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:outline-none bg-white"
                >
                  <option value="">Select a Course Folder...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit / Topic Target */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Unit / Topic Name *</label>
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">e.g. Unit 1: Differential Calculus</span>
                </div>
                <input
                  type="text"
                  required
                  list="unit-suggestions"
                  placeholder="e.g. Unit 1: Differential Calculus"
                  value={uploadUnitTopic}
                  onChange={(e) => setUploadUnitTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
                <datalist id="unit-suggestions">
                  {existingUnitNames.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>

              {/* Category Selector Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Material Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'notes', label: '📝 Notes', desc: 'Lecture slides & docs' },
                    { id: 'pyqs', label: '📄 PYQs', desc: 'Question papers' },
                    { id: 'practicals', label: '🔬 Practicals', desc: 'Lab manuals & code' },
                    { id: 'assignments', label: '📋 Assignments', desc: 'Tutorials & tasks' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setUploadCategory(cat.id as ResourceCategory)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        uploadCategory === cat.id
                          ? 'bg-blue-50/80 border-brand-blue text-brand-blue shadow-xs ring-1 ring-brand-blue'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="font-bold text-xs">{cat.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* FILE / FOLDER PICKER ZONE */}
              {uploadMode === 'folder' ? (
                /* FOLDER PICKER */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Select Entire Folder from Your Computer *</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Folder Upload Enabled
                    </span>
                  </label>

                  {/* Hidden folder input with webkitdirectory */}
                  <input
                    type="file"
                    ref={folderInputRef}
                    {...({ webkitdirectory: '', directory: '' } as any)}
                    multiple
                    onChange={handleFolderSelected}
                    className="hidden"
                  />

                  <div
                    onClick={() => folderInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 bg-emerald-50/30 rounded-2xl p-4 sm:p-6 text-center hover:bg-emerald-50/60 transition-colors cursor-pointer space-y-2"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                      <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to select an entire folder on your PC
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        All notes, question banks & files in the unit folder will be detected
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
                      Browse Folder
                    </span>
                  </div>

                  {/* Detected Folder Breakdown */}
                  {selectedFiles.length > 0 && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-left">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                            Folder: <strong>{detectedFolderName || 'Selected Folder'}</strong>
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          {selectedFiles.length} files ({(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>

                      {/* File item listing */}
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                        {selectedFiles.map((f, i) => (
                          <div key={i} className="text-xs text-slate-600 flex items-center justify-between py-1 gap-2">
                            <span className="truncate max-w-[260px] font-medium">{f.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {(f.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Folder Upload Strategy Option */}
                      <div className="pt-2 border-t border-slate-200/80">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          How should these {selectedFiles.length} files be organized?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <label
                            onClick={() => setUploadStrategy('individual')}
                            className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2 ${
                              uploadStrategy === 'individual'
                                ? 'bg-white border-brand-blue ring-1 ring-brand-blue text-slate-900 font-bold'
                                : 'bg-slate-100/60 border-slate-200 text-slate-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="strategy"
                              checked={uploadStrategy === 'individual'}
                              onChange={() => setUploadStrategy('individual')}
                              className="mt-0.5"
                            />
                            <div>
                              <div className="text-xs">Individual Files (Recommended)</div>
                              <div className="text-[10px] font-normal text-slate-400">
                                Each file gets its own row with direct preview & download
                              </div>
                            </div>
                          </label>

                          <label
                            onClick={() => setUploadStrategy('bundle')}
                            className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2 ${
                              uploadStrategy === 'bundle'
                                ? 'bg-white border-brand-blue ring-1 ring-brand-blue text-slate-900 font-bold'
                                : 'bg-slate-100/60 border-slate-200 text-slate-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="strategy"
                              checked={uploadStrategy === 'bundle'}
                              onChange={() => setUploadStrategy('bundle')}
                              className="mt-0.5"
                            />
                            <div>
                              <div className="text-xs">Unit Package Bundle</div>
                              <div className="text-[10px] font-normal text-slate-400">
                                Combined into 1 document with multi-file viewer
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* INDIVIDUAL FILES PICKER */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Select Files (PDF, DOCX, PPT) *</label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFilesSelected}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-4 sm:p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer space-y-2"
                  >
                    <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 text-brand-blue mx-auto" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Click to browse or drag and drop files here
                      </span>
                      <span className="text-[11px] text-slate-400">
                        PDF, DOCX, PPT up to 50MB each
                      </span>
                    </div>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <p className="text-xs font-bold text-slate-700">Selected ({selectedFiles.length}):</p>
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="text-xs text-slate-600 flex items-center justify-between py-0.5 gap-2">
                          <span className="truncate max-w-[240px] sm:max-w-[280px]">{f.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {(f.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 ${
                    uploadMode === 'folder'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-brand-blue hover:bg-blue-700 shadow-brand-blue/20'
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{uploadProgressMsg || 'Uploading...'}</span>
                    </>
                  ) : uploadMode === 'folder' ? (
                    <>
                      <FolderOpen className="w-4 h-4" />
                      <span>Upload & Publish Folder ({selectedFiles.length} files)</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Publish Files Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
