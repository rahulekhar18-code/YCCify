import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle2, Info, AlertTriangle, AlertCircle, Check } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead } = useAuth();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-brand-blue" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">
          Stay informed about resource approvals, new lecture notes, and department alerts
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-4">
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`py-4 px-4 -mx-4 rounded-2xl flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                  n.isRead ? 'hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100 shrink-0">
                    {getIcon(n.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                      {new Date(n.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(n.id);
                    }}
                    title="Mark as Read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-white transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <Bell className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No notifications yet</p>
            <p className="text-xs text-slate-400">
              You will receive updates here whenever your uploads are reviewed or new course notes are published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

