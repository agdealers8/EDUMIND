
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { UserProfile } from '../types';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  profile: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ activeTab, profile }) => {
  const currentLabel = NAV_ITEMS.find(i => i.id === activeTab)?.label || 'Dashboard';

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-slate-500">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
          {currentLabel}
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-full text-slate-500 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          <Search className="w-4 h-4 mr-2" />
          <input 
            type="text" 
            placeholder="Search syllabus..." 
            className="bg-transparent text-sm outline-none w-48"
          />
        </div>

        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{profile.name}</p>
            <p className="text-xs text-slate-500 mt-1">{profile.level} • {profile.language}</p>
          </div>
          <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
            {profile.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
