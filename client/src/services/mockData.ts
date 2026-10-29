import type { Exercise, Workout } from '../types';

export const INITIAL_EXERCISES: Exercise[] = [
  { _id: 'ex-1', name: 'Barbell Bench Press', targetMuscle: 'Chest', category: 'Barbell', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { _id: 'ex-2', name: 'Incline Dumbbell Press', targetMuscle: 'Chest', category: 'Dumbbell', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { _id: 'ex-3', name: 'Cable Chest Fly', targetMuscle: 'Chest', category: 'Cable', secondaryMuscles: ['Shoulders'] },
  { _id: 'ex-4', name: 'Dips (Chest Focus)', targetMuscle: 'Chest', category: 'Bodyweight', secondaryMuscles: ['Triceps'] },
  { _id: 'ex-5', name: 'Push Ups', targetMuscle: 'Chest', category: 'Bodyweight', secondaryMuscles: ['Triceps', 'Core'] },

  { _id: 'ex-6', name: 'Barbell Deadlift', targetMuscle: 'Back', category: 'Barbell', secondaryMuscles: ['Legs', 'Glutes', 'Core'] },
  { _id: 'ex-7', name: 'Pull-Up', targetMuscle: 'Back', category: 'Bodyweight', secondaryMuscles: ['Biceps'] },
  { _id: 'ex-8', name: 'Lat Pulldown', targetMuscle: 'Back', category: 'Cable', secondaryMuscles: ['Biceps'] },
  { _id: 'ex-9', name: 'Barbell Bent Over Row', targetMuscle: 'Back', category: 'Barbell', secondaryMuscles: ['Biceps'] },
  { _id: 'ex-10', name: 'Seated Cable Row', targetMuscle: 'Back', category: 'Cable', secondaryMuscles: ['Biceps'] },
  { _id: 'ex-11', name: 'Dumbbell Row', targetMuscle: 'Back', category: 'Dumbbell', secondaryMuscles: ['Biceps'] },

  { _id: 'ex-12', name: 'Barbell Back Squat', targetMuscle: 'Legs', category: 'Barbell', secondaryMuscles: ['Glutes', 'Core'] },
  { _id: 'ex-13', name: 'Leg Press', targetMuscle: 'Legs', category: 'Machine', secondaryMuscles: ['Glutes'] },
  { _id: 'ex-14', name: 'Romanian Deadlift (RDL)', targetMuscle: 'Legs', category: 'Barbell', secondaryMuscles: ['Glutes', 'Back'] },
  { _id: 'ex-15', name: 'Leg Extension', targetMuscle: 'Legs', category: 'Machine' },
  { _id: 'ex-16', name: 'Seated Leg Curl', targetMuscle: 'Legs', category: 'Machine' },
  { _id: 'ex-17', name: 'Bulgarian Split Squat', targetMuscle: 'Legs', category: 'Dumbbell', secondaryMuscles: ['Glutes'] },
  { _id: 'ex-18', name: 'Standing Calf Raise', targetMuscle: 'Legs', category: 'Machine' },

  { _id: 'ex-19', name: 'Overhead Barbell Press', targetMuscle: 'Shoulders', category: 'Barbell', secondaryMuscles: ['Triceps'] },
  { _id: 'ex-20', name: 'Seated Dumbbell Shoulder Press', targetMuscle: 'Shoulders', category: 'Dumbbell', secondaryMuscles: ['Triceps'] },
  { _id: 'ex-21', name: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', category: 'Dumbbell' },
  { _id: 'ex-22', name: 'Cable Lateral Raise', targetMuscle: 'Shoulders', category: 'Cable' },
  { _id: 'ex-23', name: 'Face Pull', targetMuscle: 'Shoulders', category: 'Cable', secondaryMuscles: ['Back'] },

  { _id: 'ex-24', name: 'Barbell Bicep Curl', targetMuscle: 'Biceps', category: 'Barbell' },
  { _id: 'ex-25', name: 'Incline Dumbbell Curl', targetMuscle: 'Biceps', category: 'Dumbbell' },
  { _id: 'ex-26', name: 'Hammer Curl', targetMuscle: 'Biceps', category: 'Dumbbell' },

  { _id: 'ex-27', name: 'Tricep Rope Pushdown', targetMuscle: 'Triceps', category: 'Cable' },
  { _id: 'ex-28', name: 'Skull Crusher', targetMuscle: 'Triceps', category: 'Barbell' },
  { _id: 'ex-29', name: 'Overhead Cable Tricep Extension', targetMuscle: 'Triceps', category: 'Cable' },

  { _id: 'ex-30', name: 'Hanging Leg Raise', targetMuscle: 'Abs', category: 'Bodyweight' },
  { _id: 'ex-31', name: 'Barbell Hip Thrust', targetMuscle: 'Glutes', category: 'Barbell', secondaryMuscles: ['Legs'] }
];

export const INITIAL_WORKOUTS: Workout[] = [
  {
    _id: 'w-1',
    title: 'Push Day A (Chest & Triceps)',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    duration: 3420,
    totalVolume: 5120,
    prsAchieved: [{ exerciseName: 'Barbell Bench Press', type: 'Max Weight', value: 85 }],
    exercises: [
      {
        exercise: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, type: 'warmup', weight: 40, reps: 10, completed: true, estimated1RM: 53.3 },
          { setNumber: 2, type: 'normal', weight: 70, reps: 8, completed: true, estimated1RM: 88.7 },
          { setNumber: 3, type: 'normal', weight: 80, reps: 6, completed: true, estimated1RM: 96.0 },
          { setNumber: 4, type: 'normal', weight: 85, reps: 4, completed: true, estimated1RM: 96.3 },
        ],
      },
      {
        exercise: 'ex-2',
        exerciseName: 'Incline Dumbbell Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, type: 'normal', weight: 26, reps: 10, completed: true, estimated1RM: 34.7 },
          { setNumber: 2, type: 'normal', weight: 28, reps: 8, completed: true, estimated1RM: 35.5 },
          { setNumber: 3, type: 'normal', weight: 28, reps: 8, completed: true, estimated1RM: 35.5 },
        ],
      },
      {
        exercise: 'ex-27',
        exerciseName: 'Tricep Rope Pushdown',
        targetMuscle: 'Triceps',
        sets: [
          { setNumber: 1, type: 'normal', weight: 25, reps: 12, completed: true, estimated1RM: 35.0 },
          { setNumber: 2, type: 'normal', weight: 30, reps: 10, completed: true, estimated1RM: 40.0 },
          { setNumber: 3, type: 'normal', weight: 30, reps: 9, completed: true, estimated1RM: 39.0 },
        ],
      },
    ],
  },
  {
    _id: 'w-2',
    title: 'Pull Day (Back & Biceps)',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    duration: 3780,
    totalVolume: 6450,
    prsAchieved: [{ exerciseName: 'Barbell Deadlift', type: 'Max Weight', value: 140 }],
    exercises: [
      {
        exercise: 'ex-6',
        exerciseName: 'Barbell Deadlift',
        targetMuscle: 'Back',
        sets: [
          { setNumber: 1, type: 'warmup', weight: 60, reps: 8, completed: true, estimated1RM: 76 },
          { setNumber: 2, type: 'normal', weight: 100, reps: 5, completed: true, estimated1RM: 116.7 },
          { setNumber: 3, type: 'normal', weight: 125, reps: 5, completed: true, estimated1RM: 145.8 },
          { setNumber: 4, type: 'normal', weight: 140, reps: 3, completed: true, estimated1RM: 154.0 },
        ],
      },
      {
        exercise: 'ex-7',
        exerciseName: 'Pull-Up',
        targetMuscle: 'Back',
        sets: [
          { setNumber: 1, type: 'normal', weight: 0, reps: 10, completed: true, estimated1RM: 0 },
          { setNumber: 2, type: 'normal', weight: 0, reps: 8, completed: true, estimated1RM: 0 },
          { setNumber: 3, type: 'normal', weight: 0, reps: 7, completed: true, estimated1RM: 0 },
        ],
      },
      {
        exercise: 'ex-24',
        exerciseName: 'Barbell Bicep Curl',
        targetMuscle: 'Biceps',
        sets: [
          { setNumber: 1, type: 'normal', weight: 30, reps: 10, completed: true, estimated1RM: 40 },
          { setNumber: 2, type: 'normal', weight: 35, reps: 8, completed: true, estimated1RM: 44.3 },
        ],
      },
    ],
  },
  {
    _id: 'w-3',
    title: 'Leg Day & Core',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    duration: 4100,
    totalVolume: 7200,
    prsAchieved: [{ exerciseName: 'Barbell Back Squat', type: 'Max Weight', value: 115 }],
    exercises: [
      {
        exercise: 'ex-12',
        exerciseName: 'Barbell Back Squat',
        targetMuscle: 'Legs',
        sets: [
          { setNumber: 1, type: 'warmup', weight: 50, reps: 10, completed: true, estimated1RM: 66.7 },
          { setNumber: 2, type: 'normal', weight: 90, reps: 8, completed: true, estimated1RM: 114.0 },
          { setNumber: 3, type: 'normal', weight: 105, reps: 6, completed: true, estimated1RM: 126.0 },
          { setNumber: 4, type: 'normal', weight: 115, reps: 5, completed: true, estimated1RM: 134.2 },
        ],
      },
      {
        exercise: 'ex-14',
        exerciseName: 'Romanian Deadlift (RDL)',
        targetMuscle: 'Legs',
        sets: [
          { setNumber: 1, type: 'normal', weight: 70, reps: 10, completed: true, estimated1RM: 93.3 },
          { setNumber: 2, type: 'normal', weight: 80, reps: 8, completed: true, estimated1RM: 101.3 },
          { setNumber: 3, type: 'normal', weight: 80, reps: 8, completed: true, estimated1RM: 101.3 },
        ],
      },
    ],
  },
  {
    _id: 'w-4',
    title: 'Push Day B (Shoulders & Chest)',
    date: new Date().toISOString(),
    duration: 3300,
    totalVolume: 5800,
    prsAchieved: [{ exerciseName: 'Barbell Bench Press', type: 'Max Weight', value: 90 }],
    exercises: [
      {
        exercise: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, type: 'normal', weight: 75, reps: 8, completed: true, estimated1RM: 95.0 },
          { setNumber: 2, type: 'normal', weight: 85, reps: 6, completed: true, estimated1RM: 102.0 },
          { setNumber: 3, type: 'normal', weight: 90, reps: 4, completed: true, estimated1RM: 102.0 },
        ],
      },
      {
        exercise: 'ex-19',
        exerciseName: 'Overhead Barbell Press',
        targetMuscle: 'Shoulders',
        sets: [
          { setNumber: 1, type: 'normal', weight: 45, reps: 8, completed: true, estimated1RM: 57.0 },
          { setNumber: 2, type: 'normal', weight: 50, reps: 6, completed: true, estimated1RM: 60.0 },
          { setNumber: 3, type: 'normal', weight: 52.5, reps: 5, completed: true, estimated1RM: 61.3 },
        ],
      },
      {
        exercise: 'ex-21',
        exerciseName: 'Dumbbell Lateral Raise',
        targetMuscle: 'Shoulders',
        sets: [
          { setNumber: 1, type: 'normal', weight: 12, reps: 15, completed: true, estimated1RM: 18.0 },
          { setNumber: 2, type: 'normal', weight: 14, reps: 12, completed: true, estimated1RM: 19.6 },
          { setNumber: 3, type: 'normal', weight: 14, reps: 10, completed: true, estimated1RM: 18.7 },
        ],
      },
    ],
  },
];
