import React from 'react';
import { BarChart3, TrendingUp, Download, CheckCircle, FileText } from 'lucide-react';

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Analytics & Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Resource utilization metrics, active courses, and department download statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="text-xs font-bold text-slate-400 uppercase">Total File Downloads</div>
          <div className="text-3xl font-black text-slate-900 mt-2">14,820</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">+24% vs last month</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="text-xs font-bold text-slate-400 uppercase">Average Reading Time</div>
          <div className="text-3xl font-black text-slate-900 mt-2">18.4 mins</div>
          <div className="text-xs text-brand-blue font-semibold mt-1">Per PDF lecture note</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="text-xs font-bold text-slate-400 uppercase">Approval Pass Rate</div>
          <div className="text-3xl font-black text-slate-900 mt-2">92.6%</div>
          <div className="text-xs text-purple-600 font-semibold mt-1">Syllabus compliant</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Department Contribution Summary</h3>
        <div className="space-y-3">
          {[
            { dept: 'Information Technology (IT)', count: 1240, percent: 36 },
            { dept: 'Computer Science & Engg. (CSE)', count: 980, percent: 29 },
            { dept: 'Electronics & Telecomm. (ETC)', count: 540, percent: 16 },
            { dept: 'Mechanical Engineering (ME)', count: 410, percent: 12 },
            { dept: 'Civil Engineering (CE)', count: 250, percent: 7 },
          ].map((d) => (
            <div key={d.dept} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{d.dept}</span>
                <span>{d.count} files ({d.percent}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-brand-blue rounded-full"
                  style={{ width: `${d.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          InsForge backend integration, PostgreSQL storage policies, and YCCE authentication rules
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Backend Infrastructure Configuration</h3>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">InsForge BaaS Endpoint</div>
              <div className="text-slate-400 font-mono mt-0.5">http://localhost:7130 / InsForge Cloud</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
              Active & Healthy
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">PostgreSQL Schema Migrations</div>
              <div className="text-slate-400 font-mono mt-0.5">001_initial_schema.sql (12 Entities Applied)</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
              Synchronized
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">InsForge File Storage Bucket</div>
              <div className="text-slate-400 font-mono mt-0.5">s3://ycce-academic-resources (Max 50MB per file)</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
              Read/Write Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

