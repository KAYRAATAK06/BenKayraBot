
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-20 md:w-64 glass flex flex-col border-r border-slate-800 transition-all duration-300">
      <div className="p-6 flex items-center justify-center md:justify-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <i className="fas fa-robot text-xl text-white"></i>
        </div>
        <h1 className="hidden md:block text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          BenKayraBot
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        <button
          onClick={() => setActiveTab(AppTab.CHAT)}
          className={`w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === AppTab.CHAT
              ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 shadow-sm shadow-cyan-900/10'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <i className="fas fa-comment-dots text-lg"></i>
          <span className="hidden md:block font-medium">Sohbet</span>
        </button>

        <button
          onClick={() => setActiveTab(AppTab.IMAGE)}
          className={`w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === AppTab.IMAGE
              ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30 shadow-sm shadow-purple-900/10'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <i className="fas fa-magic text-lg"></i>
          <span className="hidden md:block font-medium">Görsel Oluştur</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <div className="hidden md:block p-3 rounded-lg bg-slate-900/50 border border-slate-800">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Durum</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-slate-300">Aktif - Kayra AI v1</span>
          </div>
        </div>
        <div className="md:hidden flex justify-center py-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
