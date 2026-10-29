import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Award,
  Dumbbell,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import type { Exercise, ExerciseProgressionPoint } from '../types';
import { useAuth } from '../context/AuthContext';

interface AnalyticsPageProps {
  initialExerciseName?: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  initialExerciseName = 'Barbell Bench Press',
}) => {
  const { unit } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>(initialExerciseName);
  const [progressionData, setProgressionData] = useState<ExerciseProgressionPoint[]>([]);
  const [activeMetric, setActiveMetric] = useState<'1rm' | 'weight' | 'volume'>('1rm');

  // Load available exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await api.exercises.getAll();
        setExercises(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchExercises();
  }, []);

  // Load progression points whenever selected exercise changes
  useEffect(() => {
    const fetchProgression = async () => {
      try {
        const points = await api.stats.getProgression(selectedExercise);
        setProgressionData(points);
      } catch (e) {
        console.error(e);
      }
    };

    if (selectedExercise) {
      fetchProgression();
    }
  }, [selectedExercise]);

  // Derived metrics for selected exercise
  const maxWeightAchieved = progressionData.reduce(
    (max, p) => (p.maxWeight > max ? p.maxWeight : max),
    0
  );

  const best1RMAchieved = progressionData.reduce(
    (max, p) => (p.estimated1RM > max ? p.estimated1RM : max),
    0
  );

  const totalVolumeLifetime = progressionData.reduce((sum, p) => sum + p.volume, 0);
  const totalSetsLifetime = progressionData.reduce((sum, p) => sum + p.setsCount, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header & Exercise Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Progress & 1RM Analytics</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track progressive overload curves and estimated 1-Rep Max milestones over time.
          </p>
        </div>

        {/* Exercise Dropdown */}
        <div className="relative min-w-[260px]">
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full appearance-none bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer pr-10"
          >
            {exercises.map((ex) => (
              <option key={ex._id} value={ex.name}>
                {ex.name} ({ex.targetMuscle})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* 4 Quick Stat Cards for Selected Exercise */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. 1RM Best</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {best1RMAchieved}{' '}
            <span className="text-xs font-sans text-zinc-500 font-normal uppercase">{unit}</span>
          </div>
          <span className="text-[10px] text-zinc-500">Calculated via Epley formula</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Max Weight</span>
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {maxWeightAchieved}{' '}
            <span className="text-xs font-sans text-zinc-500 font-normal uppercase">{unit}</span>
          </div>
          <span className="text-[10px] text-zinc-500">Heaviest successful set</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {totalVolumeLifetime.toLocaleString()}{' '}
            <span className="text-xs font-sans text-zinc-500 font-normal uppercase">{unit}</span>
          </div>
          <span className="text-[10px] text-zinc-500">Lifetime weight lifted</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sessions Logged</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            {progressionData.length}
          </div>
          <span className="text-[10px] text-zinc-500">{totalSetsLifetime} total sets performed</span>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        {/* Metric Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white">
              {selectedExercise} Progression
            </h3>
            <p className="text-xs text-zinc-400">
              Interactive timeline of your performance across workouts
            </p>
          </div>

          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveMetric('1rm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMetric === '1rm'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Estimated 1RM
            </button>
            <button
              onClick={() => setActiveMetric('weight')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMetric === 'weight'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Max Weight
            </button>
            <button
              onClick={() => setActiveMetric('volume')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMetric === 'volume'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Volume
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 sm:h-80 w-full pt-2">
          {progressionData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs italic">
              <Dumbbell className="w-8 h-8 mb-2 opacity-50" />
              <span>No recorded logs for {selectedExercise} yet.</span>
              <span className="text-[11px] text-zinc-600 mt-1">
                Perform this exercise in an active workout to build your progression curve!
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [
                    `${Number(value).toLocaleString()} ${unit}`,
                    activeMetric === '1rm'
                      ? 'Estimated 1RM'
                      : activeMetric === 'weight'
                      ? 'Max Set Weight'
                      : 'Exercise Volume',
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${label} - ${item.workoutTitle}` : label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={
                    activeMetric === '1rm'
                      ? 'estimated1RM'
                      : activeMetric === 'weight'
                      ? 'maxWeight'
                      : 'volume'
                  }
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#metricGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Historical Logs Table for this Exercise */}
      {progressionData.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-sm text-white">Session History Log</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3">Max Weight</th>
                  <th className="py-2.5 px-3">Estimated 1RM</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Sets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 font-mono">
                {progressionData
                  .slice()
                  .reverse()
                  .map((p, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/20 text-zinc-300">
                      <td className="py-2.5 px-3">{p.date}</td>
                      <td className="py-2.5 px-3 font-sans text-white font-medium">
                        {p.workoutTitle}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">
                        {p.maxWeight} {unit}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">
                        {p.estimated1RM} {unit}
                      </td>
                      <td className="py-2.5 px-3">
                        {p.volume.toLocaleString()} {unit}
                      </td>
                      <td className="py-2.5 px-3">{p.setsCount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
