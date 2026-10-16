import React from 'react';
import { ViewTab } from '../types';
import { Plus, Bell, Volume2, VolumeX } from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenNewTargetModal: () => void;
  unreadCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewTargetModal,
  unreadCount,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('targets')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
                  TH
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                  TargetHarian
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <button
              onClick={() => onTabChange('targets')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'targets'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rencana Target
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'analytics'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Analitik & Performa
            </button>
            <button
              onClick={() => onTabChange('reminders')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 relative ${
                currentTab === 'reminders'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengingat Otomatis
              {unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onTabChange('calendar')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'calendar'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Riwayat Kalender
            </button>
          </nav>

          {/* Zone 3: 1 primary action button + sound/quick toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? 'Suara Aktif' : 'Suara Dimatikan'}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-slate-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('reminders')}
              title="Notifikasi & Pengingat"
              className="md:hidden relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenNewTargetModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Target Baru</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 gap-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => onTabChange('targets')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              currentTab === 'targets' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Target
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              currentTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Analitik
          </button>
          <button
            onClick={() => onTabChange('reminders')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-1 ${
              currentTab === 'reminders' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            <span>Pengingat</span>
            {unreadCount > 0 && (
              <span className="px-1 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('calendar')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              currentTab === 'calendar' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Kalender
          </button>
        </div>
      </div>
    </header>
  );
};
