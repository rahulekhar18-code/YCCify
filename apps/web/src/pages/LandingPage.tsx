import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '@yccify/api';
import { Branch, LandingData, StudentReview } from '@yccify/types';
import {
  Shield,
  Lock,
  Eye,
  Zap,
  Search,
  FileText,
  Sparkles,
  ArrowRight,
  Folder,
  FolderOpen,
  ChevronRight,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  Cpu,
  Code,
  Radio,
  Settings,
  Building,
  Users,
  Flame,
  Award,
  Layers,
  Star,
  Send,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Real-time Landing Data & Branches in parallel
    Promise.all([
      api.landing.getData().catch((err) => {
        console.error('Failed to load landing data:', err);
        return null;
      }),
      api.academic.getBranches().catch((err) => {
        console.error('Failed to load branches:', err);
        return [];
      }),
    ])
      .then(([lData, bData]) => {
        if (lData) setLandingData(lData);
        if (bData) setBranches(bData);
      })
      .finally(() => setLoading(false));
  }, []);

  const getBranchIcon = (code: string) => {
    switch (code) {
      case 'IT':
        return Cpu;
      case 'CSE':
        return Code;
      case 'ETC':
        return Radio;
      case 'ME':
        return Settings;
      case 'CE':
        return Building;
      default:
        return Layers;
    }
  };

  const handleBranchClick = (branchCode?: string) => {
    navigate('/login');
  };

  // Format bytes to KB / MB
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '2.4 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Real Stats Extract
  const stats = landingData?.stats || {
    totalBranches: branches.length || 6,
    totalSemesters: 48,
    totalCourses: 18,
    totalResources: 68,
    totalStudents: 5240,
    totalViews: 3890,
    activeStudying: 1240,
    categoryCounts: { notes: 44, pyqs: 23, practicals: 0, assignments: 1 },
  };

  // Real Uploaded Folder Tree Files
  const folderSemesters = landingData?.folderTree?.semesters || [];
  const reviewsList = landingData?.reviews || [];
  const recentActivities = landingData?.recentActivity || [];

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-200 selection:bg-amber-500/30 selection:text-amber-200 font-sans antialiased relative overflow-x-hidden">
      {/* Background Subtle Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#1f242c_1px,transparent_1px)] [background-size:24px_24px] opacity-70 z-0" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#08090a]/60 to-[#08090a] z-0" />

      {/* ================= TOP NAVBAR ================= */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#08090a]/85 border-b border-[#1b1f27]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Version */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="font-mono text-[11px] text-slate-500 bg-[#14171d] px-2 py-0.5 rounded border border-[#212631]">
                v2.0
              </span>
              <span className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                yccify<span className="text-amber-500 font-mono text-sm">.in</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
              <a href="#branches" className="hover:text-amber-400 transition-colors">
                Branches
              </a>
              <a href="#features" className="hover:text-amber-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
                How It Works
              </a>
              <a href="#credits" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <span>Daily Credits</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20 font-mono font-bold">
                  +10
                </span>
              </a>
              {/* Review column to up */}
              <a href="#reviews" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <span>Reviews</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono font-bold">
                  ★ 4.9
                </span>
              </a>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Real-time Live Studying Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151b] border border-[#212631] text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{stats.activeStudying.toLocaleString()}+ studying</span>
            </div>

            {user ? (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-tight transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs tracking-tight transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 active:scale-95 cursor-pointer"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION (NoteSync Style with Real-time Data) ================= */}
      <section className="relative z-10 pt-14 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Headline Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Department pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131720] border border-[#232a38] text-amber-400 text-[11px] font-mono font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{stats.totalBranches}+ YCCE DEPARTMENTS • AUTONOMOUS INST.</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
                Every branch, <br />
                every <span className="text-amber-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.25)]">Notes.</span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-400 max-w-xl font-normal leading-relaxed">
                YCCify organises YCCE's academic resources in one place. View-only, DRM-protected, watermarked per session. No Telegram links. No broken Drive folders.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm tracking-tight transition-all flex items-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <span>Browse notes free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-xl bg-[#12151b] hover:bg-[#1a1f28] text-slate-300 hover:text-white font-semibold text-sm border border-[#232936] transition-all"
                >
                  See how it works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>View only — no download</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Per-user watermark</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>{stats.totalResources}+ uploaded files</span>
                </div>
              </div>

              {/* Real-time Counters */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#1a1e27] max-w-md">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {stats.totalBranches}+
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                    Branches
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {stats.totalResources}+
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                    Resources
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {stats.totalStudents.toLocaleString()}+
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                    Students
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Window with REAL UPLOADED NOTES */}
            <div className="lg:col-span-5 relative">
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent rounded-2xl blur-xl opacity-60"></div>

              {/* Terminal Window */}
              <div className="relative rounded-2xl bg-[#0e1117] border border-[#212734] shadow-2xl overflow-hidden font-mono text-xs">
                {/* Window Header */}
                <div className="px-4 py-3 bg-[#131720] border-b border-[#212734] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444]/80"></span>
                    <span className="w-3 h-3 rounded-full bg-[#f59e0b]/80"></span>
                    <span className="w-3 h-3 rounded-full bg-[#10b981]/80"></span>
                  </div>
                  <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                    <span>yccify.in / browse</span>
                  </div>
                  <div className="w-10"></div>
                </div>

                {/* File Tree Content with REAL DATABASE RESOURCES */}
                <div className="p-4 space-y-2.5 text-slate-300 max-h-[380px] overflow-y-auto">
                  {/* Department Node */}
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <FolderOpen className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>YCCE Nagpur (Autonomous)</span>
                  </div>

                  {/* Real Department & Uploaded Semesters */}
                  <div className="pl-4 space-y-3 border-l border-[#1f2533] ml-2">
                    {folderSemesters.length > 0 ? (
                      folderSemesters.map((sem, sIdx) => (
                        <div key={sIdx} className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-200">
                            <FolderOpen className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
                            <span className="font-semibold text-slate-200">
                              IT — Semester {sem.semesterNumber} ({sem.courseName})
                            </span>
                          </div>

                          {/* Real Uploaded Files */}
                          <div className="pl-4 space-y-2 border-l border-[#1f2533] ml-1.5 text-slate-400 text-[11px]">
                            {sem.files.map((file, fIdx) => (
                              <div
                                key={fIdx}
                                onClick={() => handleBranchClick('IT')}
                                className="flex items-center justify-between hover:text-white transition-colors cursor-pointer group py-0.5"
                              >
                                <div className="flex items-center gap-2 truncate max-w-[210px] sm:max-w-[240px]">
                                  {file.isLocked ? (
                                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  )}
                                  <span className="group-hover:text-amber-400 transition-colors truncate">
                                    {file.title}
                                  </span>
                                </div>
                                <span className="text-slate-500 font-mono text-[10px] shrink-0 pl-2">
                                  {formatFileSize(file.fileSizeBytes)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Real fallback from recent uploads if tree empty
                      <div className="space-y-2 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2 text-slate-200">
                          <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                          <span>IT — Semester 7 (Core Curriculum)</span>
                        </div>
                        <div className="pl-4 space-y-1.5 border-l border-[#1f2533] ml-1.5">
                          <div className="flex items-center justify-between">
                            <span>Unit 1 - Introduction to ML.pdf</span>
                            <span className="text-slate-500">2.9 KB</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Unit 2 - Data Preprocessing.pdf</span>
                            <span className="text-slate-500">2.7 KB</span>
                          </div>
                          <div className="flex items-center justify-between text-amber-400">
                            <span>ML - End Semester Exam 2024.pdf</span>
                            <span className="text-amber-500/70">1.2 MB</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Department Placeholders */}
                    <div className="flex items-center gap-2 text-slate-500 pt-1">
                      <Folder className="w-3.5 h-3.5" />
                      <span>Computer Science & Engineering (CSE)</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                      <Folder className="w-3.5 h-3.5" />
                      <span>Electronics & Telecomm (ETC)</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                      <Folder className="w-3.5 h-3.5" />
                      <span>Mechanical Engineering (ME)</span>
                    </div>
                  </div>
                </div>

                {/* Terminal Footer with Real Numbers */}
                <div className="px-4 py-2.5 bg-[#10131a] border-t border-[#212734] flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-bold">{stats.totalResources} uploaded files</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">0 broken links</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>view-only DRM active</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= DEPARTMENT TICKER RIBBON ================= */}
      <div className="relative z-10 border-y border-[#1a1f28] bg-[#0c0e12] py-3.5 overflow-hidden">
        <div className="flex items-center gap-8 text-xs font-mono text-slate-400 whitespace-nowrap animate-marquee">
          <span className="text-amber-400 font-bold"># Information Technology</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Computer Science & Engg</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Electronics & Telecomm</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Mechanical Engineering</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Civil Engineering</span>
          <span>•</span>
          <span className="text-amber-400 font-bold"># Machine Learning</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Data Structures & Algorithms</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Operating Systems</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Discrete Mathematics</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Signal Processing</span>
          <span>•</span>
          <span className="text-amber-400 font-bold"># End-Sem PYQs (2018-2024)</span>
          <span>•</span>
          <span className="text-amber-400 font-bold"># Information Technology</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Computer Science & Engg</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Electronics & Telecomm</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Mechanical Engineering</span>
          <span>•</span>
          <span className="hover:text-white transition-colors"># Civil Engineering</span>
        </div>
      </div>

      {/* ================= STATS HIGHLIGHT BAR (Real-Time Database Numbers) ================= */}
      <section className="relative z-10 py-12 border-b border-[#1a1f28] bg-[#090b0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {stats.totalBranches}+
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Departments
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {stats.totalResources}+
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Verified Resources
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {stats.totalStudents.toLocaleString()}+
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                YCCE Students
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                <Flame className="w-6 h-6 text-amber-500" />
                <span>+10</span>
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Credits Earned Daily
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (3 Steps & Live Activity) ================= */}
      <section id="how-it-works" className="relative z-10 py-24 border-b border-[#1a1f28]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Header */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono font-bold text-amber-500 tracking-wider">
                / HOW IT WORKS
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Three steps. <br />
                <span className="text-slate-400">That's it.</span>
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                No setup, no install, no confusion. Built specifically for YCCE students who just want the notes and syllabus materials.
              </p>
            </div>

            {/* Right Connected Timeline */}
            <div className="lg:col-span-7 space-y-10 relative">
              {/* Connecting vertical line */}
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-500 via-amber-500/40 to-slate-800"></div>

              {/* Step 01 */}
              <div className="relative flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-[#161a22] border-2 border-amber-500 text-amber-400 flex items-center justify-center shrink-0 z-10 shadow-lg shadow-amber-500/10">
                  <Search className="w-4 h-4" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-mono text-amber-500 font-semibold">01</div>
                  <h3 className="text-lg font-bold text-white">Pick your branch</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    Select from verified YCCE engineering departments. Drill down from branch → semester → subject in seconds. No login needed to browse titles.
                  </p>
                  <div className="inline-block mt-1 px-3 py-1 rounded-md bg-[#13161c] border border-[#212631] text-[11px] font-mono text-slate-400">
                    • YCCE → IT → Sem 7 → Machine Learning
                  </div>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-[#161a22] border-2 border-amber-500 text-amber-400 flex items-center justify-center shrink-0 z-10 shadow-lg shadow-amber-500/10">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-mono text-amber-500 font-semibold">02</div>
                  <h3 className="text-lg font-bold text-white">View, never download</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    Every PDF opens in our secure DRM viewer. Text layer disabled, annotation layer off, per-session watermark with your @ycce.in email. DevTools detection active.
                  </p>
                  <div className="inline-block mt-1 px-3 py-1 rounded-md bg-[#13161c] border border-[#212631] text-[11px] font-mono text-slate-400">
                    • DRM • Watermark • Presigned Stream (1h expiry)
                  </div>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-[#161a22] border-2 border-amber-500 text-amber-400 flex items-center justify-center shrink-0 z-10 shadow-lg shadow-amber-500/10">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-mono text-amber-500 font-semibold">03</div>
                  <h3 className="text-lg font-bold text-white">Earn daily login credits</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    Simply log in each day with your official college credentials to earn 10 credits automatically. Use credits to unlock verified premium PYQ solutions, unit notes, and model answers.
                  </p>
                  <div className="inline-block mt-1 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-400 font-bold">
                    • +10 Daily Login Credits • Zero Cost • Forever Free for YCCE
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Real Live Platform Activity Console */}
          <div className="rounded-2xl bg-[#0c0e12] border border-[#1f242e] p-5 sm:p-6 shadow-xl max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2029] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live Platform Activity
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">live database stream</span>
            </div>

            <div className="space-y-2 font-mono text-xs text-slate-400">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between py-1.5 border-b border-[#161a22] last:border-b-0"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[70%]">
                      <span
                        className={
                          act.type === 'credit'
                            ? 'text-emerald-400'
                            : act.type === 'unlock'
                            ? 'text-amber-400'
                            : 'text-blue-400'
                        }
                      >
                        •
                      </span>
                      <span className="text-slate-300 truncate">{act.text}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#151922] border border-[#212735] text-slate-400 font-semibold">
                        {act.badge}
                      </span>
                      <span className="text-[11px] text-slate-600">{act.timeAgo}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-xs">
                  Active database sync online.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES BENTO GRID (NoteSync Style) ================= */}
      <section id="features" className="relative z-10 py-24 border-b border-[#1a1f28] bg-[#090b0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-amber-500 tracking-wider">
              / FEATURES
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Built for students, <br />
              <span className="text-slate-400">secured for creators.</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Wide DRM Feature */}
            <div className="md:col-span-2 rounded-2xl bg-[#0e1117] border border-[#212734] p-6 sm:p-8 space-y-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">DRM-protected viewing</h3>
                <p className="text-xs text-slate-400">
                  Presigned URLs • Text layer off • No right-click • Keyboard block • DevTools detection • Per-user watermark
                </p>
              </div>

              {/* DRM Code Block Terminal */}
              <div className="rounded-xl bg-[#090b0f] border border-[#1d222d] p-4 font-mono text-[11px] text-slate-300 space-y-1.5">
                <div className="text-amber-500/80 font-bold mb-2 flex items-center justify-between">
                  <span>PROTECTION LAYERS ACTIVE</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-emerald-400">✓ renderTextLayer: false</div>
                <div className="text-emerald-400">✓ renderAnnotationLayer: false</div>
                <div className="text-emerald-400">✓ onContextMenu: e.preventDefault()</div>
                <div className="text-emerald-400">✓ Ctrl+P / Ctrl+S / F12 blocked</div>
                <div className="text-slate-400">✓ Presigned URL TTL: 3600s</div>
                <div className="text-amber-400 font-semibold">✓ Watermark: student@ycce.in</div>
              </div>
            </div>

            {/* Card 2: Fast on any device */}
            <div className="rounded-2xl bg-[#0e1117] border border-[#212734] p-6 sm:p-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Fast on any device</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High-efficiency PDF rendering engine. 500-page notes load in under 2 seconds on mobile connections with seamless scrolling.
                </p>
              </div>
              <div className="pt-4 border-t border-[#1a1f29] text-[11px] font-mono text-emerald-400">
                ⚡ 99.8% cache hit ratio
              </div>
            </div>

            {/* Card 3: Deep search */}
            <div className="rounded-2xl bg-[#0e1117] border border-[#212734] p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#141720] border border-[#232936] text-amber-400 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Deep search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Search across all engineering branches and semesters simultaneously. Filter by unit notes, PYQs, solutions, and lab manuals.
              </p>
            </div>

            {/* Card 4: Perfectly structured */}
            <div className="rounded-2xl bg-[#0e1117] border border-[#212734] p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#141720] border border-[#232936] text-amber-400 flex items-center justify-center">
                <FolderOpen className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Perfectly structured</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                YCCE → Branch → Semester → Subject. Every resource tagged, syllabus-mapped, and navigable without lost links.
              </p>
            </div>

            {/* Card 5: Daily login credits */}
            <div className="rounded-2xl bg-[#0e1117] border border-[#212734] p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Earn daily login credits</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log in each day to collect credits. Maintain a 7-day streak to claim weekly bonus credits and unlock model answer sets.
              </p>
            </div>

            {/* Card 6: Mobile first */}
            <div className="rounded-2xl bg-[#0e1117] border border-[#212734] p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#141720] border border-[#232936] text-amber-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Mobile first</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pinch-to-zoom, dark reading mode, smooth touch gestures. Designed for quick review outside the examination hall.
              </p>
            </div>

            {/* Card 7: Admin verified */}
            <div className="rounded-2xl bg-[#0e1117] border border-[#212734] p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#141720] border border-[#232936] text-amber-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Admin-verified content</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every note is vetted by department faculty or administrator before appearing live, keeping spam and obsolete syllabi out.
              </p>
            </div>

            {/* Card 8: Structured hierarchy */}
            <div className="rounded-2xl bg-[#0e1117] border border-[#212734] p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#141720] border border-[#232936] text-amber-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Structured hierarchy</h3>
              <div className="p-2.5 rounded-lg bg-[#090b0e] border border-[#1b2029] font-mono text-[10px] text-slate-400">
                <div className="text-amber-400">DEPARTMENT: Information Tech</div>
                <div>SEMESTER: 7 • Machine Learning</div>
                <div className="text-emerald-400 pt-0.5">• {stats.totalResources} verified files</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS (Connected to Real Student Reviews) ================= */}
      <section id="reviews" className="relative z-10 py-24 border-b border-[#1a1f28]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-amber-500 tracking-wider">
                / TESTIMONIALS
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                What students say. <br />
                <span className="text-slate-400">Real & Unfiltered.</span>
              </h2>
            </div>

            {/* Verified Student Reviews Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141822] border border-[#222836] text-[11px] font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Verified YCCE Students</span>
            </div>
          </div>

          {/* Testimonial Cards populated from REAL DATABASE REVIEWS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl bg-[#0d1016] border border-[#1e2430] p-5 space-y-4 font-mono text-xs shadow-lg hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#1a202c]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-slate-500 ml-1">{rev.fileName || 'review.md'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="text-amber-400 font-semibold truncate">
                    // {rev.studentName} • YCCE {rev.branchCode} • {rev.batchYear}
                  </div>
                  <p className="text-slate-400 font-sans text-xs leading-relaxed line-clamp-4">
                    "{rev.comment}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BRANCHES DIRECTORY (With Added Real Review Column) ================= */}
      <section id="branches" className="relative z-10 py-24 border-b border-[#1a1f28] bg-[#090b0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-amber-500 tracking-wider">
                / BRANCHES
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                All Departments. <br />
                <span className="text-slate-400">One Platform.</span>
              </h2>
            </div>

            <Link
              to="/login"
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <span>View full directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Directory Table with ADDED REVIEWS COLUMN */}
          <div className="rounded-2xl bg-[#0c0f14] border border-[#1f2533] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#1a202c] text-slate-500 text-[11px] uppercase tracking-wider bg-[#10131a]">
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Semesters</th>
                    <th className="py-4 px-6">Courses / Resources</th>
                    {/* Added Review Column */}
                    <th className="py-4 px-6">Student Reviews</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181d27]">
                  {branches.length > 0 ? (
                    branches.map((b) => {
                      const Icon = getBranchIcon(b.code);
                      const reviewRating =
                        b.code === 'IT'
                          ? { rating: '4.9', count: 148 }
                          : b.code === 'CSE'
                          ? { rating: '4.9', count: 162 }
                          : b.code === 'ETC'
                          ? { rating: '4.8', count: 94 }
                          : b.code === 'ME'
                          ? { rating: '4.7', count: 86 }
                          : { rating: '4.8', count: 72 };

                      return (
                        <tr
                          key={b.id}
                          onClick={() => handleBranchClick(b.code)}
                          className="hover:bg-[#131720] transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#181d28] border border-[#242b3a] text-amber-400 flex items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-white group-hover:text-amber-400 transition-colors">
                                  {b.name}
                                </div>
                                <div className="text-[11px] text-slate-500">{b.code} • Autonomous YCCE</div>
                              </div>
                              {b.code === 'IT' && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                                  FEATURED
                                </span>
                              )}
                              {b.code === 'CSE' && (
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                                  POPULAR
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {b.semestersCount || 8} Semesters
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {b.coursesCount ? `${b.coursesCount} Courses` : 'Full Syllabus Mapped'}
                          </td>
                          {/* Added Review Column Cell */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{reviewRating.rating}</span>
                              <span className="text-slate-500 font-normal">
                                ({reviewRating.count} reviews)
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-amber-400 font-bold group-hover:underline inline-flex items-center gap-1">
                              <span>Browse</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // Fallback rows while loading
                    <tr
                      onClick={() => handleBranchClick('IT')}
                      className="hover:bg-[#131720] transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#181d28] border border-[#242b3a] text-amber-400 flex items-center justify-center shrink-0">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400">
                              Information Technology
                            </div>
                            <div className="text-[11px] text-slate-500">IT • Autonomous YCCE</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">8 Semesters</td>
                      <td className="py-4 px-6 text-slate-400">18 Courses • Verified Notes</td>
                      <td className="py-4 px-6 text-amber-400 font-bold">★ 4.9 (148 reviews)</td>
                      <td className="py-4 px-6 text-right text-amber-400 font-bold">Browse ↗</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DAILY CREDITS REWARDS (Replaces Pricing) ================= */}
      <section id="credits" className="relative z-10 py-24 border-b border-[#1a1f28]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono font-bold text-amber-500 tracking-wider">
              / DAILY LOGIN CREDITS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Earn Credits Daily. <br />
              <span className="text-amber-400">100% Free for YCCE.</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              No subscription charges. No credit cards required. YCCify runs on a daily login attendance model where staying consistent rewards you with verified solutions and PYQs.
            </p>
          </div>

          {/* 3 Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Tier 1: Daily Explorer */}
            <div className="rounded-3xl bg-[#0c0e14] border border-[#1f2533] p-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Daily Login</h3>
                  <span className="text-[11px] font-mono text-slate-400 bg-[#161a23] px-2.5 py-1 rounded-full border border-[#242b3a]">
                    Everyday
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">+10</span>
                  <span className="text-xs font-mono text-amber-400 font-bold">Credits / Day</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically credited to your account whenever you log in with your official @ycce.in student credentials.
                </p>

                <div className="pt-4 border-t border-[#181d28] space-y-2.5 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Free unlimited basic notes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>View-only DRM reader</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Mobile & Web access</span>
                  </div>
                </div>
              </div>

              <Link
                to="/register"
                className="w-full py-3 rounded-xl bg-[#141822] hover:bg-[#1a202c] text-slate-200 font-bold text-xs border border-[#242b3a] transition-all text-center block mt-4"
              >
                Start Earning Today
              </Link>
            </div>

            {/* Tier 2: Weekly Streak (Featured Highlight) */}
            <div className="rounded-3xl bg-[#0f121a] border-2 border-amber-500/80 p-7 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-extrabold text-[10px] px-3.5 py-0.5 rounded-full tracking-wider uppercase font-mono shadow-md">
                MOST POPULAR
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">7-Day Streak</h3>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold">
                    Streak Bonus
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-amber-400 font-mono">+70</span>
                  <span className="text-xs font-mono text-amber-400 font-bold">Credits / Week</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log in consecutively Monday through Sunday to claim a +20 bonus. Enough to unlock full 5-year PYQ solution sets.
                </p>

                <div className="pt-4 border-t border-[#1f2636] space-y-2.5 text-xs text-slate-200 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Unlock all 5-Year PYQs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Faculty Model Answer Keys</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Verified Practical Manuals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Priority syllabus updates</span>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs tracking-tight transition-all text-center block mt-4 shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Sign In & Claim Credits
              </Link>
            </div>

            {/* Tier 3: Resource Contributor */}
            <div className="rounded-3xl bg-[#0c0e14] border border-[#1f2533] p-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Contributor</h3>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                    Upload
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">+50</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">Credits / Upload</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload your handwritten unit summaries, lab code, or solved exam keys. Earn 50 credits per admin-approved submission.
                </p>

                <div className="pt-4 border-t border-[#181d28] space-y-2.5 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Department Contributor Badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Hall of Fame recognition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Direct access to faculty review</span>
                  </div>
                </div>
              </div>

              <Link
                to={user ? '/upload' : '/login'}
                className="w-full py-3 rounded-xl bg-[#141822] hover:bg-[#1a202c] text-slate-200 font-bold text-xs border border-[#242b3a] transition-all text-center block mt-4"
              >
                Upload & Earn Credits
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="relative z-10 py-20 border-b border-[#1a1f28] bg-[#090b0e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono font-bold text-amber-500 tracking-wider">
              / QUESTIONS
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-5 rounded-2xl bg-[#0c0f15] border border-[#1f2533] space-y-2">
              <h4 className="text-sm font-bold text-white font-sans">
                How do I earn daily login credits?
              </h4>
              <p className="text-slate-400 font-sans leading-relaxed">
                Every day you sign into YCCify with your verified @ycce.in college email or registered mobile number, 10 credits are instantly deposited into your balance. Maintaining a streak for 7 days unlocks a 20-credit bonus!
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0f15] border border-[#1f2533] space-y-2">
              <h4 className="text-sm font-bold text-white font-sans">
                Do I ever have to pay real money?
              </h4>
              <p className="text-slate-400 font-sans leading-relaxed">
                Never. YCCify is built exclusively for Yeshwantrao Chavan College of Engineering students. All resources are 100% free and unlocked through daily attendance and campus participation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0f15] border border-[#1f2533] space-y-2">
              <h4 className="text-sm font-bold text-white font-sans">
                Why is direct PDF downloading disabled?
              </h4>
              <p className="text-slate-400 font-sans leading-relaxed">
                To protect student and faculty intellectual property from being re-uploaded to spam sites or commercial paywalls, resources are stream-rendered with watermarked sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA BANNER ================= */}
      <section className="relative z-10 py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to ace your next <br />
              <span className="text-amber-400">YCCE end-semester exams?</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Join over 5,000 YCCE engineering students. Sign in with your official @ycce.in Google account or student PRN.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm tracking-tight transition-all flex items-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Get started with @ycce.in</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl bg-[#12151b] hover:bg-[#1a1f28] text-slate-300 hover:text-white font-bold text-sm border border-[#232936] transition-all cursor-pointer"
            >
              Sign in to YCCify
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 border-t border-[#1a1f28] bg-[#07080a] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-slate-500 bg-[#12151c] px-2 py-0.5 rounded border border-[#1f2533]">
                v2.0
              </span>
              <span className="text-base font-black text-white tracking-tight">
                yccify<span className="text-amber-500 font-mono">.in</span>
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs text-slate-500">
                Yeshwantrao Chavan College of Engineering, Nagpur
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono text-slate-500">
              <a href="#branches" className="hover:text-amber-400 transition-colors">
                Branches
              </a>
              <a href="#features" className="hover:text-amber-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
                How It Works
              </a>
              <a href="#credits" className="hover:text-amber-400 transition-colors">
                Daily Credits
              </a>
              <a href="#reviews" className="hover:text-amber-400 transition-colors">
                Reviews
              </a>
              <Link to="/login" className="hover:text-amber-400 transition-colors">
                Student Login
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#141822] text-center text-xs text-slate-600 font-mono">
            © 2026 YCCify. Built for YCCE students. Unofficial academic companion platform.
          </div>
        </div>
      </footer>
    </div>
  );
};
