export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Legs'
  | 'Abs'
  | 'Glutes'
  | 'Full Body'
  | 'Cardio'
  | 'Other';

export type ExerciseCategory =
  | 'Barbell'
  | 'Dumbbell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Cardio'
  | 'Other';

export interface Exercise {
  _id: string;
  name: string;
  targetMuscle: MuscleGroup;
  category: ExerciseCategory;
  secondaryMuscles?: string[];
  notes?: string;
  isCustom?: boolean;
}

export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';

export interface WorkoutSet {
  setNumber: number;
  type: SetType;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  estimated1RM?: number;
}

export interface WorkoutExercise {
  exercise?: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  sets: WorkoutSet[];
  notes?: string;
}

export interface PRAchievement {
  exerciseName: string;
  type: string;
  value: number;
}

export interface Workout {
  _id: string;
  title: string;
  date: string;
  duration: number; // in seconds
  totalVolume: number;
  exercises: WorkoutExercise[];
  notes?: string;
  prsAchieved?: PRAchievement[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  unitPreference: 'kg' | 'lbs';
  defaultRestTime: number;
}

export interface AuthResponse extends User {
  token: string;
}

export interface DashboardStats {
  totalWorkouts: number;
  totalVolume: number;
  volumeThisWeek: number;
  totalPRs: number;
  currentStreak: number;
  averageDurationMinutes: number;
  recentWorkoutsChart: Array<{
    date: string;
    title: string;
    volume: number;
    durationMin: number;
  }>;
  muscleDistribution: Array<{
    name: string;
    value: number;
  }>;
}

export interface ExerciseProgressionPoint {
  date: string;
  rawDate: string;
  workoutTitle: string;
  maxWeight: number;
  estimated1RM: number;
  volume: number;
  setsCount: number;
}

