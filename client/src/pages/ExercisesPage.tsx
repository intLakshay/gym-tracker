import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Dumbbell,
  TrendingUp,
  Trash2,
  BookOpen,
} from 'lucide-react';
import type { Exercise } from '../types';
import { api } from '../services/api';
import { AddExerciseModal } from '../components/AddExerciseModal';

interface ExercisesPageProps {
  onSelectForProgression: (exerciseName: string) => void;
}

export const ExercisesPage: React.FC<ExercisesPageProps> = ({
  onSelectForProgression,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadExercises = async () => {
    try {
      const data = await api.exercises.getAll();
      setExercises(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const handleAddExercise = async (newEx: Omit<Exercise, '_id'>) => {
    try {
      const created = await api.exercises.create(newEx);
      setExercises((prev) => [...prev, created]);
    } catch (err: any) {
      alert(`Failed to create exercise: ${err.message}`);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom exercise?')) return;
    try {
      await api.exercises.delete(id);
      setExercises((prev) => prev.filter((e) => e._id !== id));
    } catch (err: any) {
      alert(`Failed to delete exercise: ${err.message}`);
    }
  };

  const muscleGroups = [
    'All',
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Abs',
    'Glutes',
  ];

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.targetMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <span>Exercise Library</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse standard gym movements or create custom exercises tailored to your training.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Exercise</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search exercises by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
          />
        </div>

        {/* Muscle Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {muscleGroups.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMuscle === m
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading exercises...</div>
      ) : filteredExercises.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-12 text-center space-y-3">
          <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="font-bold text-white text-base">No exercises found</h3>
          <p className="text-xs text-zinc-400">
            No movements matched your query. Click "New Exercise" to add one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise._id}
              className="bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4.5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">{exercise.name}</h3>
                  {exercise.isCustom && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-md flex-shrink-0">
                      Custom
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                    {exercise.targetMuscle}
                  </span>
                  <span className="text-xs text-zinc-400 bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-zinc-700/60">
                    {exercise.category}
                  </span>
                </div>

                {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Secondary: {exercise.secondaryMuscles.join(', ')}
                  </p>
                )}

                {exercise.notes && (
                  <p className="text-xs text-zinc-400 italic mt-2 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/50">
                    "{exercise.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => onSelectForProgression(exercise.name)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>View Progression</span>
                </button>

                {exercise.isCustom && (
                  <button
                    onClick={() => handleDeleteExercise(exercise._id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Delete custom exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddExercise}
      />
    </div>
  );
};
