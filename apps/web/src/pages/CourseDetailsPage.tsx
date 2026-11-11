import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Brain,
  FileText,
  HelpCircle,
  FlaskConical,
  BookCheck,
  Download,
  Eye,
  Bookmark,
  BookmarkCheck,
  Search,
  UploadCloud,
  CheckCircle,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import api from '@yccify/api';
import { Course, Resource, ResourceCategory } from '@yccify/types';

export const CourseDetailsPage: React.FC = () => {
  const { branchCode, semNum, courseId } = useParams<{
    branchCode: string;
    semNum: string;
    courseId: string;
  }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('notes');
  const [activeTab, setActiveTab] = useState<'resources' | 'about' | 'faculty'>('resources');
  const [fileSearch, setFileSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      try {
        const [c, resList] = await Promise.all([
          api.academic.getCourseById(courseId),
          api.resources.getResources({ courseId, status: 'approved' }),
        ]);
        setCourse(c);
        setResources(resList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId]);

  const handleToggleBookmark = async (resourceId: string) => {
    try {
      const res = await api.bookmarks.toggleBookmark(resourceId);
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, isBookmarked: res.isBookmarked } : r))
      );
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

  const categoryStats = {
    notes: resources.filter((r) => r.category === 'notes').length,
    pyqs: resources.filter((r) => r.category === 'pyqs').length,
    practicals: resources.filter((r) => r.category === 'practicals').length,
    assignments: resources.filter((r) => r.category === 'assignments').length,
  };

  const categoryCards = [
    { key: 'notes' as ResourceCategory, label: 'Notes', count: categoryStats.notes, icon: FileText },
    { key: 'pyqs' as ResourceCategory, label: 'PYQs', count: categoryStats.pyqs, icon: HelpCircle },
    { key: 'practicals' as ResourceCategory, label: 'Practicals', count: categoryStats.practicals, icon: FlaskConical },
    { key: 'assignments' as ResourceCategory, label: 'Assignments', count: categoryStats.assignments, icon: BookCheck },
  ];

  const currentCategoryResources = resources
    .filter((r) => r.category === activeCategory)
    .filter(
      (r) =>
        r.title.toLowerCase().includes(fileSearch.toLowerCase()) ||
        r.unitTopic?.toLowerCase().includes(fileSearch.toLowerCase())
    );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs matching Desktop reference */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
          <Link to="/explore" className="hover:text-brand-blue">
            {branchCode?.toUpperCase()} Department
          </Link>
          <span>›</span>
          <Link
            to={`/explore/${branchCode?.toLowerCase()}/sem/${semNum}`}
            className="hover:text-brand-blue"
          >
            Sem {semNum}
          </Link>
          <span>›</span>
          <span className="text-slate-800 font-bold">{course?.name || 'Machine Learning'}</span>
        </div>

        {/* 2. Course Header Card matching screenshot */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 text-brand-purple flex items-center justify-center shrink-0 border border-purple-100 shadow-sm">
                <Brain className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {course?.name} ({course?.code})
                </h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  Assigned Faculty: {course?.facultyName || 'Department Faculty'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-brand-blue text-xs font-bold border border-blue-100">
                Semester {semNum}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                {course?.credits ?? 3} Credits
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                {resources.length} Verified {resources.length === 1 ? 'File' : 'Files'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 border-b border-slate-100 pt-2 text-sm font-bold">
            <button
              onClick={() => setActiveTab('resources')}
              className={`pb-3 border-b-2 transition-all ${
                activeTab === 'resources'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 border-b-2 transition-all ${
                activeTab === 'about'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Curriculum & Objectives
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`pb-3 border-b-2 transition-all ${
                activeTab === 'faculty'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Faculty Profiles
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* 3. Four Category Cards matching Screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categoryCards.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.key;
              return (
                <div
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 border-brand-blue'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">{cat.label}</div>
                      <div
                        className={`text-xs ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        } font-semibold`}
                      >
                        {cat.count} {cat.count === 1 ? 'File' : 'Files'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Category Resource List Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 capitalize tracking-tight">
                  {activeCategory} ({currentCategoryResources.length} Files)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified syllabus files for {course?.name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search ${activeCategory}...`}
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>

                <Link
                  to="/upload"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-hover shadow-sm shrink-0"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload</span>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading resources...</div>
            ) : currentCategoryResources.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {currentCategoryResources.map((res) => {
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
                            <span className="font-semibold text-slate-700">
                              {res.unitTopic || 'Curriculum Topic'}
                            </span>
                            <span>•</span>
                            <span>{sizeMb} MB</span>
                            <span>•</span>
                            <span>{new Date(res.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>•</span>
                            <span className="text-slate-500 font-medium">By {res.uploaderName || 'Faculty'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons matching Screenshot */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleToggleBookmark(res.id)}
                          title={res.isBookmarked ? 'Remove Bookmark' : 'Bookmark File'}
                          className={`p-2 rounded-xl border transition-colors ${
                            res.isBookmarked
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                          }`}
                        >
                          {res.isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        <Link
                          to={`/preview/${res.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-brand-blue hover:text-brand-blue text-xs font-bold transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </Link>

                        <button
                          onClick={() => handleDownload(res)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                No files found in {activeCategory}. Click Upload to add the first file.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Course Syllabus & Description</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {course?.description ||
              'This course covers foundational and advanced topics in Machine Learning, encompassing Supervised Learning, Decision Trees, Support Vector Machines, Neural Networks, Deep Learning architectures, and Model Evaluation standards aligned with YCCE 2025–26 autonomous curriculum.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Prerequisites</h4>
              <p className="text-xs text-slate-500">
                Engineering Mathematics III, Linear Algebra, Probability & Statistics, Object Oriented Programming with Python.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Examination Scheme</h4>
              <p className="text-xs text-slate-500">
                Continuous Internal Evaluation (MSE 1 & MSE 2): 40 Marks. End Semester Examination: 60 Marks.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faculty' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Course Faculty Instructor</h3>
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              alt="Faculty"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-blue"
            />
            <div>
              <h4 className="text-lg font-bold text-slate-900">{course?.facultyName || 'Dr. S. S. Khedkar'}</h4>
              <p className="text-xs text-brand-blue font-semibold">Professor • Department of Information Technology</p>
              <p className="text-xs text-slate-500 mt-1">Specialization: Machine Learning, Artificial Intelligence, Neural Networks</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

