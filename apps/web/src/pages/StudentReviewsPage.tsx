import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import api from '@yccify/api';
import { StudentReview } from '@yccify/types';

export const StudentReviewsPage: React.FC = () => {
  const { user } = useAuth();

  // Form State
  const [studentName, setStudentName] = useState(user?.name || '');
  const [branchCode, setBranchCode] = useState('IT');
  const [batchYear, setBatchYear] = useState('2025 Batch');
  const [semesterNumber, setSemesterNumber] = useState<number>(user?.semesterNumber || 7);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // My reviews & community reviews
  const [myReviews, setMyReviews] = useState<StudentReview[]>([]);
  const [communityReviews, setCommunityReviews] = useState<StudentReview[]>([]);
  const [loading, setLoading] = useState(true);

  const branchNames: Record<string, string> = {
    IT: 'Information Technology',
    CSE: 'Computer Science & Engineering',
    ETC: 'Electronics & Telecommunication',
    ME: 'Mechanical Engineering',
    CE: 'Civil Engineering',
    EE: 'Electrical Engineering',
  };

  const ratingDescriptions: Record<number, string> = {
    5: 'Outstanding! Everything I need for YCCE academics.',
    4: 'Very good — highly helpful notes and PYQs.',
    3: 'Good experience, helped with my semester exams.',
    2: 'Decent, but needs more department notes.',
    1: 'Needs improvement.',
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [myList, commList] = await Promise.all([
        api.reviews.getMyReviews().catch(() => []),
        api.reviews.getReviews().catch(() => []),
      ]);
      setMyReviews(myList);
      setCommunityReviews(commList);
    } catch (err: any) {
      console.error('Failed to load reviews data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update name if user loads after mount
  useEffect(() => {
    if (user?.name && !studentName) {
      setStudentName(user.name);
    }
    if (user?.branchName) {
      const bn = user.branchName.toLowerCase();
      if (bn.includes('computer')) setBranchCode('CSE');
      else if (bn.includes('electronic')) setBranchCode('ETC');
      else if (bn.includes('mechanical')) setBranchCode('ME');
      else if (bn.includes('civil')) setBranchCode('CE');
      else if (bn.includes('electrical')) setBranchCode('EE');
      else setBranchCode('IT');
    }
    if (user?.semesterNumber) {
      setSemesterNumber(user.semesterNumber);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !comment.trim()) {
      setErrorMsg('Please enter your name and review comments.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.reviews.submitReview({
        studentName: studentName.trim(),
        studentEmail: user?.email,
        branchCode,
        branchName: branchNames[branchCode] || 'Engineering',
        batchYear,
        semesterNumber,
        rating,
        comment: comment.trim(),
      });

      if (res.data) {
        setSuccessMsg(
          'Thank you! Your review has been submitted for admin verification and will be published once approved.'
        );
        setComment('');
        await loadData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Student Reviews & Feedback
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Share your authentic academic experience with YCCify notes, PYQs, and daily check-in credits.
              </p>
            </div>
          </div>
        </div>

        <a
          href="/#testimonials"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <span>View Homepage Testimonials</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Admin Verification Advisory Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-start gap-3.5 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900">Admin Approval Policy: </span>
          To prevent spam and ensure trusted feedback for all YCCE students, all reviews are reviewed by the platform administrator before being published live to the homepage.
        </div>
      </div>

      {/* Main Grid: Submit Form (Left) & My Reviews / Live Community (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Review Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Write Your Review</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your feedback helps fellow branchmates discover essential study materials.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Review Submitted Successfully!</span>
                  <span>{successMsg}</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name & College Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">YCCE College Email</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'student@ycce.in'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-xs font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Department & Batch Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Department / Branch</label>
                  <select
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="IT">Information Technology (IT)</option>
                    <option value="CSE">Computer Science & Engg (CSE)</option>
                    <option value="ETC">Electronics & Telecomm (ETC)</option>
                    <option value="ME">Mechanical Engineering (ME)</option>
                    <option value="CE">Civil Engineering (CE)</option>
                    <option value="EE">Electrical Engineering (EE)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Batch Year</label>
                  <select
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="2024 Batch">2024 Batch</option>
                    <option value="2025 Batch">2025 Batch</option>
                    <option value="2026 Batch">2026 Batch</option>
                    <option value="2027 Batch">2027 Batch</option>
                  </select>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div className="space-y-2 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Your Overall Rating *</label>
                  <span className="text-xs font-black text-amber-600">{rating} of 5 Stars</span>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-medium text-slate-600 ml-2">
                    {ratingDescriptions[rating]}
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Your Academic Experience / Review *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How did YCCify help with your mid-semesters or end-sems? What notes or PYQ solutions helped you the most?"
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue leading-relaxed"
                ></textarea>
                <span className="text-[11px] text-slate-400">
                  Min 20 characters. Be specific about branches, units, and courses.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold tracking-tight shadow-md shadow-brand-blue/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Submit Review for Admin Approval</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Student's Own Reviews & Verification Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-blue" />
                <h3 className="text-sm font-bold text-slate-900">Your Submitted Reviews</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                {myReviews.length}
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading your submissions...</div>
            ) : myReviews.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Star className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-700">No reviews submitted yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Use the form on the left to write your first review. It will appear here along with its admin approval status.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {myReviews.map((rev) => {
                  const isApproved = rev.isApproved || rev.status === 'approved';
                  const isPending = rev.status === 'pending' || (!rev.isApproved && rev.status !== 'rejected');
                  const isRejected = rev.status === 'rejected';

                  return (
                    <div
                      key={rev.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isPending
                          ? 'bg-amber-50/40 border-amber-200'
                          : isApproved
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Status Badge */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Awaiting Admin Approval
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Live on Homepage
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-sans italic">
                        "{rev.comment}"
                      </p>

                      {isRejected && rev.rejectionReason && (
                        <div className="p-2 rounded-xl bg-rose-100/70 text-[10px] text-rose-800 font-medium">
                          Note: {rev.rejectionReason}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>{rev.branchName || rev.branchCode} • {rev.batchYear}</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Peer Highlights Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Live Peer Testimonials</h3>
            </div>
            <p className="text-xs text-slate-500">
              See what fellow YCCE students have shared across branches.
            </p>

            <div className="space-y-3">
              {communityReviews.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{item.studentName}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                    "{item.comment}"
                  </p>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {item.branchName || item.branchCode} • {item.batchYear}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReviewsPage;
