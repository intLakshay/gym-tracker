import type { MuscleGroup } from '../types';

export interface RoutineDay {
  dayNumber: number;
  title: string;
  focusMuscles: MuscleGroup[];
  badgeColor: string;
  description: string;
  suggestedExerciseNames: string[];
}

export const WEEKLY_SPLIT_ROUTINE: RoutineDay[] = [
  {
    dayNumber: 1,
    title: 'Day 1 — Chest & Triceps',
    focusMuscles: ['Chest', 'Triceps'],
    badgeColor: 'from-emerald-500 to-teal-400',
    description: 'Push power: Horizontal pressing, upper chest incline work, and tricep extension overload.',
    suggestedExerciseNames: [
      'Barbell Bench Press',
      'Incline Dumbbell Press',
      'Cable Chest Fly',
      'Tricep Rope Pushdown',
    ],
  },
  {
    dayNumber: 2,
    title: 'Day 2 — Back & Biceps',
    focusMuscles: ['Back', 'Biceps'],
    badgeColor: 'from-cyan-500 to-blue-500',
    description: 'Pull strength: Heavy hinges, vertical lat pulldowns, rowing rows, and peak bicep curls.',
    suggestedExerciseNames: [
      'Barbell Deadlift',
      'Lat Pulldown',
      'Barbell Bent Over Row',
      'Barbell Bicep Curl',
    ],
  },
  {
    dayNumber: 3,
    title: 'Day 3 — Legs & Calves',
    focusMuscles: ['Legs', 'Glutes'],
    badgeColor: 'from-purple-500 to-indigo-500',
    description: 'Lower body foundation: Squat depth, posterior chain hamstring Romanian deadlifts, and quads.',
    suggestedExerciseNames: [
      'Barbell Back Squat',
      'Leg Press',
      'Romanian Deadlift (RDL)',
      'Standing Calf Raise',
    ],
  },
  {
    dayNumber: 4,
    title: 'Day 4 — Shoulders & Traps',
    focusMuscles: ['Shoulders'],
    badgeColor: 'from-amber-500 to-orange-500',
    description: 'Deltoid hypertrophy: Overhead pressing, lateral raises for 3D shoulders, and face pulls.',
    suggestedExerciseNames: [
      'Overhead Barbell Press',
      'Dumbbell Lateral Raise',
      'Face Pull',
      'Seated Dumbbell Shoulder Press',
    ],
  },
  {
    dayNumber: 5,
    title: 'Day 5 — Arms & Core',
    focusMuscles: ['Biceps', 'Triceps', 'Abs'],
    badgeColor: 'from-pink-500 to-rose-500',
    description: 'Direct arm supersets and core stability for a complete physique finish.',
    suggestedExerciseNames: [
      'Hammer Curl',
      'Skull Crusher',
      'Hanging Leg Raise',
      'Plank',
    ],
  },
  {
    dayNumber: 6,
    title: 'Day 6 — Full Body / Functional',
    focusMuscles: ['Full Body', 'Abs', 'Cardio'],
    badgeColor: 'from-teal-500 to-emerald-400',
    description: 'Full body metabolic conditioning or weak-point specialization session.',
    suggestedExerciseNames: [
      'Push Ups',
      'Pull-Up',
      'Bulgarian Split Squat',
      'Cable Woodchopper',
    ],
  },
  {
    dayNumber: 7,
    title: 'Day 7 — Active Recovery & Rest',
    focusMuscles: ['Cardio', 'Other'],
    badgeColor: 'from-zinc-500 to-zinc-400',
    description: 'Rest, muscle protein synthesis, light walking or mobility stretching.',
    suggestedExerciseNames: [],
  },
];

const ROUTINE_DAY_KEY = 'gym_tracker_current_routine_day';

export const getCurrentRoutineDay = (): number => {
  const saved = localStorage.getItem(ROUTINE_DAY_KEY);
  const parsed = saved ? parseInt(saved, 10) : 1;
  return isNaN(parsed) || parsed < 1 || parsed > 7 ? 1 : parsed;
};

export const setRoutineDay = (day: number): void => {
  const validDay = Math.max(1, Math.min(7, day));
  localStorage.setItem(ROUTINE_DAY_KEY, validDay.toString());
};

export const advanceRoutineDay = (): number => {
  const current = getCurrentRoutineDay();
  const next = current >= 7 ? 1 : current + 1;
  setRoutineDay(next);
  return next;
};
