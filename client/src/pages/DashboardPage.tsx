import React, { useEffect, useState } from 'react';
import {
  Flame,
  Dumbbell,
  Trophy,
  Award,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  Check,
  Play,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import type { DashboardStats, Workout } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  WEEKLY_SPLIT_ROUTINE,
  getCurrentRoutineDay,
  setRoutineDay,
} from '../services/routinePlan';

interface DashboardPageProps {
  onStartWorkout: () => void;
  onNavigate: (tab: string) => void;
}

const MUSCLE_COLORS: Record<string, string> = {
  Chest: '#10b981',
  Back: '#06b6d4',
  Legs: '#8b5cf6',
  Shoulders: '#f59e0b',
  Biceps: '#ec4899',
  Triceps: '#3b82f6',
  Abs: '#14b8a6',
  Glutes: '#f43f5e',
  Other: '#71717a',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartWorkout,
  onNavigate,
}) => {
  const { user, unit } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const currentDayNum = getCurrentRoutineDay();
  const currentRoutine =
    WEEKLY_SPLIT_ROUTINE.find((r) => r.dayNumber === currentDayNum) ||
    WEEKLY_SPLIT_ROUTINE[0];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsData, workoutsData] = await Promise.all([
          api.stats.getDashboard(),
          api.workouts.getAll(),
        ]);
        setStats(statsData);
        setRecentWorkouts(workoutsData.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      }
    };

    fetchDashboard();
  }, []);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toLocaleString();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready for today's session?</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{user?.name || 'Athlete'}</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-md">
              Log your exercises, hit your progressive overload targets, and track new personal records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartWorkout}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold rounded-2xl text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Start Workout Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Weekly Split Plan Roadmap */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Your Weekly Training Split
              </span>
              <h2 className="text-lg font-black text-white">
                Next Up: <span className="text-emerald-400">{currentRoutine.title}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onStartWorkout}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Day {currentRoutine.dayNumber} ({currentRoutine.focusMuscles.join(' & ') || 'Session'})</span>
          </button>
        </div>

        {/* 7 Days Progress Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {WEEKLY_SPLIT_ROUTINE.map((day) => {
            const isToday = day.dayNumber === currentDayNum;
            const isPast = day.dayNumber < currentDayNum;

            return (
              <div
                key={day.dayNumber}
                onClick={() => {
                  setRoutineDay(day.dayNumber);
                  onStartWorkout();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isToday
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : isPast
                    ? 'bg-zinc-950/60 border-zinc-800/60 opacity-70 hover:opacity-100'
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase ${isToday ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    Day {day.dayNumber}
                  </span>
                  {isToday ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ) : isPast ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : null}
                </div>

                <div className="mt-2">
                  <div className={`font-bold text-xs truncate ${isToday ? 'text-white' : 'text-zinc-300'}`}>
                    {day.focusMuscles[0] || 'Rest'}
                  </div>
                  <span className="text-[10px] text-zinc-500 truncate block">
                    {day.focusMuscles.slice(1).join(', ') || (day.dayNumber === 7 ? 'Recovery' : 'Focus')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Workouts */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Workouts
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {stats?.totalWorkouts ?? 0}
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">Logged sessions</span>
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {stats ? formatVolume(stats.totalVolume) : 0}{' '}
              <span className="text-xs font-sans text-zinc-500 font-normal uppercase">{unit}</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">
              +{stats ? formatVolume(stats.volumeThisWeek) : 0} {unit} this week
            </span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {stats?.currentStreak ?? 0}{' '}
              <span className="text-xs font-sans text-zinc-400 font-normal">days</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">Consistency score</span>
          </div>
        </div>

        {/* PRs Achieved */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              PRs Smashed
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
              {stats?.totalPRs ?? 0}
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">Personal records broken</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Volume Trend Chart */}
        <div className="lg:col-span-2 bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Volume Progression (Recent Workouts)</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Total weight multiplied by repetitions over time
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase">
              {unit}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full mt-2">
            {stats && stats.recentWorkoutsChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.recentWorkoutsChart}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} ${unit}`, 'Volume']}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? `${label} - ${item.title}` : label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#volumeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">
                Log your first workout to view progression graph!
              </div>
            )}
          </div>
        </div>

        {/* Muscle Distribution Chart */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white">Target Muscle Focus</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Breakdown of muscle groups trained</p>
          </div>

          <div className="h-64 w-full mt-4 flex items-center justify-center">
            {stats && stats.muscleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.muscleDistribution} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={65}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(v: any) => [`${v} exercises`, 'Sets logged']}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {stats.muscleDistribution.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={MUSCLE_COLORS[entry.name] || '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-zinc-500 italic">No exercises recorded yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Workouts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Recent Workouts</h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-8 text-center">
            <p className="text-sm text-zinc-400">No workouts recorded yet.</p>
            <button
              onClick={onStartWorkout}
              className="mt-3 px-4 py-2 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-bold hover:bg-emerald-400"
            >
              Start Day {currentDayNum} Workout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentWorkouts.map((w) => (
              <div
                key={w._id}
                onClick={() => onNavigate('history')}
                className="bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/40 rounded-2xl p-4 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-500">
                      {new Date(w.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      {w.totalVolume.toLocaleString()} {unit}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1 line-clamp-1">{w.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                    {w.exercises?.map((e) => e.exerciseName).join(', ')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{Math.round(w.duration / 60)} min</span>
                  </div>
                  {w.prsAchieved && w.prsAchieved.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Award className="w-3 h-3" />
                      <span>{w.prsAchieved.length} PRs</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
