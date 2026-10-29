import React, { useEffect, useState } from 'react';
import {
  Timer,
  Plus,
  Trash2,
  Check,
  Dumbbell,
  X,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Exercise, WorkoutExercise, WorkoutSet } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ActiveWorkoutPageProps {
  onFinishWorkout: () => void;
  onCancel: () => void;
}

export const ActiveWorkoutPage: React.FC<ActiveWorkoutPageProps> = ({
  onFinishWorkout,
  onCancel,
}) => {
  const { unit, restTimer } = useAuth();
  const [title, setTitle] = useState('Upper Body Push');
  const [duration, setDuration] = useState(0); // in seconds
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [ghostDataMap, setGhostDataMap] = useState<Record<string, WorkoutSet[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Stopwatch timer for active workout
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch available exercises
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await api.exercises.getAll();
        setAllExercises(data);
        
        // Add 2 default exercises to kickstart the workout
        if (data.length > 0 && exercises.length === 0) {
          const bench = data.find((e) => e.name.includes('Bench Press')) || data[0];
          handleAddExercise(bench);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadExercises();
  }, []);

  const formatStopwatch = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAddExercise = async (ex: Exercise) => {
    // Check if we already have ghost data for this exercise
    if (!ghostDataMap[ex.name]) {
      try {
        const perf = await api.workouts.getLastPerformance(ex.name);
        if (perf.found) {
          setGhostDataMap((prev) => ({ ...prev, [ex.name]: perf.sets }));
        }
      } catch (err) {
        // Ignore ghost fetch error
      }
    }

    const previousSets = ghostDataMap[ex.name] || [];
    const defaultWeight = previousSets[0]?.weight || (unit === 'kg' ? 60 : 135);
    const defaultReps = previousSets[0]?.reps || 10;

    const newEx: WorkoutExercise = {
      exercise: ex._id,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscle,
      sets: [
        {
          setNumber: 1,
          type: 'normal',
          weight: defaultWeight,
          reps: defaultReps,
          completed: false,
        },
      ],
    };

    setExercises((prev) => [...prev, newEx]);
    setIsExerciseModalOpen(false);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = updated[exerciseIndex];
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      const newSet: WorkoutSet = {
        setNumber: targetEx.sets.length + 1,
        type: 'normal',
        weight: lastSet ? lastSet.weight : (unit === 'kg' ? 50 : 115),
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
      };
      targetEx.sets.push(newSet);
      return updated;
    });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = updated[exerciseIndex];
      if (targetEx.sets.length > 1) {
        targetEx.sets.splice(setIndex, 1);
        // re-number remaining sets
        targetEx.sets.forEach((s, idx) => {
          s.setNumber = idx + 1;
        });
      }
      return updated;
    });
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: any
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      const set = updated[exerciseIndex].sets[setIndex];
      (set as any)[field] = value;

      if (field === 'completed' && value === true) {
        // Automatically start the rest timer (90 seconds by default)
        restTimer.start(90);

        // Calculate 1RM (Epley: w * (1 + r / 30))
        if (set.weight > 0 && set.reps > 0) {
          set.estimated1RM = Math.round(set.weight * (1 + set.reps / 30) * 10) / 10;
        }

        // Small haptic or confetti feedback if heavy
        if (set.weight >= (unit === 'kg' ? 100 : 225)) {
          confetti({
            particleCount: 25,
            spread: 40,
            origin: { y: 0.8 },
          });
        }
      }

      return updated;
    });
  };

  const handleFinish = async () => {
    if (exercises.length === 0) {
      alert('Please add at least one exercise to your workout!');
      return;
    }

    setIsSaving(true);
    try {
      await api.workouts.create({
        title: title.trim() || 'Workout Session',
        date: new Date().toISOString(),
        duration,
        exercises,
      });

      // Big victory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      onFinishWorkout();
    } catch (err: any) {
      alert(`Error saving workout: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter exercises for modal
  const filteredExercises = allExercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.targetMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const muscleGroups: string[] = [
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Active Workout Header Bar */}
      <div className="sticky top-16 z-30 bg-zinc-950/90 backdrop-blur-md -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 border-b border-zinc-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono font-bold text-sm">
            <Timer className="w-4 h-4 animate-spin text-emerald-400" style={{ animationDuration: '4s' }} />
            <span>{formatStopwatch(duration)}</span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-extrabold text-base sm:text-lg text-white border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none px-1 py-0.5 max-w-[180px] sm:max-w-xs transition-colors"
            placeholder="Workout Title"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleFinish}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Finish Workout'}</span>
          </button>
        </div>
      </div>

      {/* Exercises Section */}
      <div className="space-y-4">
        {exercises.map((workoutEx, exIdx) => {
          const ghostSets = ghostDataMap[workoutEx.exerciseName] || [];

          return (
            <div
              key={`${workoutEx.exerciseName}-${exIdx}`}
              className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4"
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{workoutEx.exerciseName}</h3>
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {workoutEx.targetMuscle}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveExercise(exIdx)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/50 transition-colors"
                  title="Remove exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800/60 pb-2">
                      <th className="py-2 px-2 text-center w-12">Set</th>
                      <th className="py-2 px-3">Previous</th>
                      <th className="py-2 px-3 text-center">{unit.toUpperCase()}</th>
                      <th className="py-2 px-3 text-center">Reps</th>
                      <th className="py-2 px-2 text-center w-12">Done</th>
                      <th className="py-2 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {workoutEx.sets.map((set, setIdx) => {
                      const ghost = ghostSets[setIdx];

                      return (
                        <tr
                          key={set.setNumber}
                          className={`transition-colors ${
                            set.completed ? 'bg-emerald-500/5' : 'hover:bg-zinc-800/20'
                          }`}
                        >
                          {/* Set number */}
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-xs text-zinc-400">
                            {set.setNumber}
                          </td>

                          {/* Previous performance ghost data */}
                          <td className="py-2.5 px-3 text-xs text-zinc-500 font-mono">
                            {ghost ? (
                              <span>
                                {ghost.weight} {unit} × {ghost.reps}
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>

                          {/* Weight input */}
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              step="2.5"
                              min="0"
                              value={set.weight || ''}
                              onChange={(e) =>
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'weight',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-16 sm:w-20 text-center bg-zinc-950 border border-zinc-800 rounded-lg py-1 px-1.5 text-xs sm:text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                            />
                          </td>

                          {/* Reps input */}
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={set.reps || ''}
                              onChange={(e) =>
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'reps',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-14 sm:w-16 text-center bg-zinc-950 border border-zinc-800 rounded-lg py-1 px-1.5 text-xs sm:text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                            />
                          </td>

                          {/* Completed tick button */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateSet(exIdx, setIdx, 'completed', !set.completed)
                              }
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                set.completed
                                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/25'
                                  : 'bg-zinc-800 text-zinc-400 hover:border hover:border-emerald-500/50 hover:text-white'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </td>

                          {/* Delete set */}
                          <td className="py-2.5 px-1 text-center">
                            {workoutEx.sets.length > 1 && (
                              <button
                                onClick={() => handleRemoveSet(exIdx, setIdx)}
                                className="text-zinc-600 hover:text-rose-400 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Set Button */}
              <button
                type="button"
                onClick={() => handleAddSet(exIdx)}
                className="w-full py-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Set</span>
              </button>
            </div>
          );
        })}

        {/* Add Exercise Trigger Button */}
        <button
          type="button"
          onClick={() => setIsExerciseModalOpen(true)}
          className="w-full py-4 border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-2xl text-sm font-bold text-zinc-400 hover:text-emerald-400 flex items-center justify-center gap-2 transition-all cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/60"
        >
          <Plus className="w-5 h-5 text-emerald-400" />
          <span>Add Exercise to Session</span>
        </button>
      </div>

      {/* Exercise Picker Modal */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Select Exercise</h3>
              <button
                onClick={() => setIsExerciseModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input & Filter Pills */}
            <div className="p-4 border-b border-zinc-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search exercise..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
                />
              </div>

              {/* Muscle Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {muscleGroups.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMuscle(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedMuscle === m
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="p-2 overflow-y-auto flex-1 divide-y divide-zinc-800/40">
              {filteredExercises.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No matching exercises found.
                </div>
              ) : (
                filteredExercises.map((ex) => (
                  <div
                    key={ex._id}
                    onClick={() => handleAddExercise(ex)}
                    className="p-3 hover:bg-zinc-800/60 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm text-white">{ex.name}</div>
                      <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-400 font-medium">{ex.targetMuscle}</span>
                        <span>•</span>
                        <span>{ex.category}</span>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-zinc-400" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
