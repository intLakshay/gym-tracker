import React, { useEffect, useState } from 'react';
import {
  Clock,
  Dumbbell,
  Trash2,
  ChevronDown,
  ChevronUp,
  Award,
  Search,
  RotateCcw,
} from 'lucide-react';
import type { Workout } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HistoryPage: React.FC = () => {
  const { unit } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const data = await api.workouts.getAll();
      setWorkouts(data);
      if (data.length > 0 && !expandedId) {
        setExpandedId(data[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workout log?')) return;

    try {
      await api.workouts.delete(id);
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
    } catch (err: any) {
      alert(`Failed to delete workout: ${err.message}`);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredWorkouts = workouts.filter((w) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = w.title.toLowerCase().includes(query);
    const exerciseMatch = w.exercises?.some((e) =>
      e.exerciseName.toLowerCase().includes(query)
    );
    return titleMatch || exerciseMatch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Workout History</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review past sessions, set progression, and personal records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search workout or exercise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadWorkouts}
            title="Reload workouts"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Workout Logs List */}
      {loading && workouts.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading workout history...</div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-12 text-center space-y-3">
          <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="font-bold text-white text-base">No workouts found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? `No sessions matched "${searchQuery}". Try a different keyword.`
              : 'You have not logged any workouts yet. Hit "Log Workout" in the navigation to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredWorkouts.map((workout) => {
            const isExpanded = expandedId === workout._id;
            const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={workout._id}
                className={`bg-zinc-900/70 border rounded-2xl overflow-hidden transition-all ${
                  isExpanded ? 'border-zinc-700 shadow-xl' : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Header Card (Click to expand) */}
                <div
                  onClick={() => toggleExpand(workout._id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-emerald-400">
                        {formattedDate}
                      </span>
                      {workout.prsAchieved && workout.prsAchieved.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Award className="w-3 h-3" />
                          <span>{workout.prsAchieved.length} PRs</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-white">{workout.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {workout.exercises?.map((e) => e.exerciseName).join(' • ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.round((workout.duration || 0) / 60)} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>
                          {workout.totalVolume?.toLocaleString()} {unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDelete(workout._id, e)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-zinc-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-zinc-800/80 bg-zinc-950/40 space-y-4">
                    {/* PRs Achieved callout */}
                    {workout.prsAchieved && workout.prsAchieved.length > 0 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs font-medium text-amber-300">
                        <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>
                          Personal Records:{' '}
                          {workout.prsAchieved
                            .map((pr) => `${pr.exerciseName} (${pr.value} ${unit} ${pr.type})`)
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Exercises breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {workout.exercises?.map((ex, exIdx) => (
                        <div
                          key={`${ex.exerciseName}-${exIdx}`}
                          className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-white">{ex.exerciseName}</span>
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {ex.targetMuscle}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {ex.sets?.map((s) => (
                              <div
                                key={s.setNumber}
                                className="flex justify-between items-center text-xs text-zinc-400 font-mono py-1 px-2 rounded bg-zinc-950/50"
                              >
                                <span>Set {s.setNumber}:</span>
                                <span className="font-bold text-zinc-200">
                                  {s.weight} {unit} × {s.reps} reps
                                </span>
                                {s.estimated1RM ? (
                                  <span className="text-[10px] text-zinc-500">
                                    1RM: ~{s.estimated1RM} {unit}
                                  </span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
