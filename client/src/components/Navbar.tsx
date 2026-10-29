import React from 'react';
import {
  Dumbbell,
  LayoutDashboard,
  PlusCircle,
  History,
  TrendingUp,
  BookOpen,
  Calculator,
  Timer,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openPlateCalc: () => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openPlateCalc,
  openAuthModal,
}) => {
  const { user, unit, toggleUnit, logout, restTimer } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workout', label: 'Log Workout', icon: PlusCircle, highlight: true },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Progress', icon: TrendingUp },
    { id: 'exercises', label: 'Exercises', icon: BookOpen },
  ];

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Top Desktop & Tablet Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                IRON<span className="text-emerald-400">TRACK</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block -mt-1">
                Workout Progress
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Rest Timer Pill (if running) */}
            {restTimer.isActive && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono font-semibold animate-pulse cursor-pointer"
                onClick={() => restTimer.addSeconds(30)}
                title="Click to add +30s"
              >
                <Timer className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                <span>Rest: {formatTimer(restTimer.secondsLeft)}</span>
                <span className="text-[10px] bg-emerald-500/20 px-1 py-0.2 rounded">+30s</span>
              </div>
            )}

            {/* Plate Calculator Button */}
            <button
              onClick={openPlateCalc}
              title="Barbell Plate Calculator"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:border-zinc-700 transition-colors"
            >
              <Calculator className="w-4 h-4" />
            </button>

            {/* Unit Toggle Pill (KG / LBS) */}
            <button
              onClick={toggleUnit}
              title="Toggle Unit (KG / LBS)"
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-all uppercase"
            >
              {unit}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-zinc-200 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {user.email.includes('example.com') ? 'Demo Mode' : 'Online'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg mb-0.5 ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
};
