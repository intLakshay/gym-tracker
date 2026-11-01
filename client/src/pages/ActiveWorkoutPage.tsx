import React, { useEffect, useState } from 'react';
import {
  Timer,
  Plus,
  Trash2,
  Check,
  Dumbbell,
  X,
  Search,
  Sparkles,
  Layers,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Exercise, WorkoutExercise, WorkoutSet } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  WEEKLY_SPLIT_ROUTINE,
  getCurrentRoutineDay,
  setRoutineDay,
  advanceRoutineDay,
  type RoutineDay,
} from '../services/routinePlan';

interface ActiveWorkoutPageProps {
  onFinishWorkout: () => void;
  onCancel: () => void;
}

export const ActiveWorkoutPage: React.FC<ActiveWorkoutPageProps> = ({
  onFinishWorkout,
  onCancel,
}) => {
  const { unit, restTimer } = useAuth();
  const [currentDayNum, setCurrentDayNum] = useState<number>(getCurrentRoutineDay());
  const routine: RoutineDay = WEEKLY_SPLIT_ROUTINE.find((r) => r.dayNumber === currentDayNum) || WEEKLY_SPLIT_ROUTINE[0];

  const [title, setTitle] = useState(routine.title);
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

  // Fetch available exercises without auto-injecting anything!
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await api.exercises.getAll();
        setAllExercises(data);
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

  const handleDaySelect = (dayNum: number) => {
    setCurrentDayNum(dayNum);
    setRoutineDay(dayNum);
    const selected = WEEKLY_SPLIT_ROUTINE.find((r) => r.dayNumber === dayNum);
    if (selected) {
      setTitle(selected.title);
    }
  };

  // Load recommended routine exercises for the selected day
  const handleLoadRoutine = () => {
    if (allExercises.length === 0) return;
    const routineExercises = routine.suggestedExerciseNames
      .map((name) => allExercises.find((e) => e.name.toLowerCase() === name.toLowerCase()))
      .filter((e): e is Exercise => !!e);

    const newExs: WorkoutExercise[] = routineExercises.map((ex) => ({
      exercise: ex._id,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscle,
      sets: [
        {
          setNumber: 1,
          type: 'normal',
          weight: unit === 'kg' ? 50 : 115,
          reps: 10,
          completed: false,
        },
        {
          setNumber: 2,
          type: 'normal',
          weight: unit === 'kg' ? 50 : 115,
          reps: 10,
          completed: false,
        },
        {
          setNumber: 3,
          type: 'normal',
          weight: unit === 'kg' ? 50 : 115,
          reps: 8,
          completed: false,
        },
      ],
    }));

    setExercises(newExs);
  };

  const handleAddExercise = async (ex: Exercise) => {
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
    const defaultWeight = previousSets[0]?.weight || (unit === 'kg' ? 40 : 95);
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
        restTimer.start(90);

        if (set.weight > 0 && set.reps > 0) {
          set.estimated1RM = Math.round(set.weight * (1 + set.reps / 30) * 10) / 10;
        }

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
      alert('Please add at least one exercise to your workout before finishing!');
      return;
    }

    setIsSaving(true);
    try {
      await api.workouts.create({
        title: title.trim() || routine.title,
        date: new Date().toISOString(),
        duration,
        exercises,
      });

      // Advance routine day to the next training day!
      advanceRoutineDay();

      // Victory celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      onFinishWorkout();
    } catch (err: any) {
      alert(`Error saving workout: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

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
    'Full Body',
    'Cardio',
  ];

  const filteredExercises = allExercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.targetMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Sticky Header */}
      <div className="sticky top-16 z-30 bg-zinc-950/95 backdrop-blur-md -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 border-b border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono font-bold text-sm">
            <Timer className="w-4 h-4 animate-spin text-emerald-400" style={{ animationDuration: '4s' }} />
            <span>{formatStopwatch(duration)}</span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-extrabold text-base sm:text-lg text-white border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none px-1 py-0.5 max-w-[160px] sm:max-w-xs transition-colors"
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

      {/* Weekly Plan Day Stepper Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 shadow-md">
              <Flame className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Weekly Split Plan
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">• Day {currentDayNum} of 7</span>
              </div>
              <h2 className="text-lg font-extrabold text-white">{routine.title}</h2>
            </div>
          </div>

          {/* Quick Action to load day's routine */}
          {exercises.length === 0 && routine.suggestedExerciseNames.length > 0 && (
            <button
              onClick={handleLoadRoutine}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Routine Exercises ({routine.suggestedExerciseNames.length})</span>
            </button>
          )}
        </div>

        {/* 7-Day Stepper selector */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {WEEKLY_SPLIT_ROUTINE.map((r) => {
            const isSelected = r.dayNumber === currentDayNum;
            return (
              <button
                key={r.dayNumber}
                onClick={() => handleDaySelect(r.dayNumber)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 font-bold scale-[1.02]'
                    : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                }`}
              >
                <span className="text-[10px] uppercase font-mono">D{r.dayNumber}</span>
                <span className="text-xs font-black truncate w-full text-center">
                  {r.focusMuscles[0] || 'Rest'}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-zinc-400 pt-1">
          <span className="text-zinc-300 font-semibold">Focus:</span> {routine.description}
        </p>
      </div>

      {/* Target Body Part Quick Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Target Body Part to Add</span>
          </span>
          <span className="text-[11px] text-zinc-500">Click a body part to pick exercises</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {muscleGroups.map((muscle) => (
            <button
              key={muscle}
              onClick={() => {
                setSelectedMuscle(muscle);
                setIsExerciseModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 rounded-xl text-xs font-bold text-zinc-300 hover:text-emerald-400 whitespace-nowrap transition-all flex items-center gap-1.5"
            >
              <span>{muscle}</span>
              <Plus className="w-3 h-3 text-zinc-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Exercises In Active Session */}
      <div className="space-y-4">
        {exercises.length === 0 ? (
          <div className="bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-3xl p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 mx-auto flex items-center justify-center text-zinc-500">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Workout is Empty</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                Choose a body part above, load the Day {currentDayNum} routine, or click "Add Exercise" to start logging sets.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {routine.suggestedExerciseNames.length > 0 && (
                <button
                  onClick={handleLoadRoutine}
                  className="px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                >
                  Load {routine.title} ({routine.suggestedExerciseNames.length} Exercises)
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedMuscle('All');
                  setIsExerciseModalOpen(true);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs transition-all"
              >
                Browse All Exercises
              </button>
            </div>
          </div>
        ) : (
          exercises.map((workoutEx, exIdx) => {
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
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-xs text-zinc-400">
                              {set.setNumber}
                            </td>

                            <td className="py-2.5 px-3 text-xs text-zinc-500 font-mono">
                              {ghost ? (
                                <span>
                                  {ghost.weight} {unit} × {ghost.reps}
                                </span>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
                            </td>

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
          })
        )}

        {/* Add Exercise Trigger Button */}
        {exercises.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedMuscle('All');
              setIsExerciseModalOpen(true);
            }}
            className="w-full py-4 border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-2xl text-sm font-bold text-zinc-400 hover:text-emerald-400 flex items-center justify-center gap-2 transition-all cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/60"
          >
            <Plus className="w-5 h-5 text-emerald-400" />
            <span>Add Another Exercise</span>
          </button>
        )}
      </div>

      {/* Exercise Picker Modal */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Select Exercise</h3>
                <span className="text-[11px] text-zinc-400">
                  Filter by body part or search by movement name
                </span>
              </div>
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
                        ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
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
                  No matching exercises found for "{selectedMuscle}".
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
                    <Plus className="w-4 h-4 text-emerald-400" />
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
