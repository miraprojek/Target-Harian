import React from 'react';
import { AppNotification } from '../types';
import { Bell, X, CheckCircle, Sunrise, Sunset, Droplets } from 'lucide-react';

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onViewTarget?: (targetId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onViewTarget,
}) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'morning_brief':
        return <Sunrise className="w-5 h-5 text-amber-500" />;
      case 'evening_review':
        return <Sunset className="w-5 h-5 text-indigo-500" />;
      case 'wellness':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'milestone':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'worship_reminder':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-4 transition-all animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {notification.title}
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              {notification.timestamp}
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
            {notification.message}
          </p>

          {notification.targetId && onViewTarget && (
            <button
              type="button"
              onClick={() => {
                onViewTarget(notification.targetId!);
                onDismiss();
              }}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Buka Target Ini &rarr;
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
