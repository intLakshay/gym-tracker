import type {
  AuthResponse,
  DashboardStats,
  Exercise,
  ExerciseProgressionPoint,
  User,
  Workout,
  WorkoutSet,
} from '../types';
import { INITIAL_EXERCISES, INITIAL_WORKOUTS } from './mockData';

const RAW_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const CLEAN_URL = RAW_URL.replace(/\/+$/, '');
const BASE_URL = CLEAN_URL.endsWith('/api') ? CLEAN_URL : `${CLEAN_URL}/api`;

// Storage Keys
const TOKEN_KEY = 'gym_tracker_token';
const USER_KEY = 'gym_tracker_user';
const OFFLINE_EXERCISES_KEY = 'gym_tracker_local_exercises';
const OFFLINE_WORKOUTS_KEY = 'gym_tracker_local_workouts';
const IS_DEMO_KEY = 'gym_tracker_is_demo';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(IS_DEMO_KEY);
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setStoredUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const isDemoMode = (): boolean => {
  return localStorage.getItem(IS_DEMO_KEY) === 'true';
};

export const setDemoMode = (enabled: boolean) => {
  if (enabled) {
    localStorage.setItem(IS_DEMO_KEY, 'true');
    const demoUser: User = {
      _id: 'demo-user-123',
      name: 'Alex Johnson',
      email: 'alex.fitness@example.com',
      unitPreference: 'kg',
      defaultRestTime: 90,
    };
    setStoredUser(demoUser);
    setToken('mock-demo-jwt-token');
    if (!localStorage.getItem(OFFLINE_EXERCISES_KEY)) {
      localStorage.setItem(OFFLINE_EXERCISES_KEY, JSON.stringify(INITIAL_EXERCISES));
    }
    if (!localStorage.getItem(OFFLINE_WORKOUTS_KEY)) {
      localStorage.setItem(OFFLINE_WORKOUTS_KEY, JSON.stringify(INITIAL_WORKOUTS));
    }
  } else {
    localStorage.removeItem(IS_DEMO_KEY);
  }
};

// Generic fetch with error handling and fallback
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
      throw new Error(
        'Cannot reach backend server. If using Render free tier, the server may take ~50s to wake up from sleep. If running locally, make sure server is running on port 5000.'
      );
    }
    throw err;
  }
}

// ---------------- LOCAL STORAGE FALLBACK HELPERS ----------------

function getLocalExercises(): Exercise[] {
  const stored = localStorage.getItem(OFFLINE_EXERCISES_KEY);
  if (!stored) {
    localStorage.setItem(OFFLINE_EXERCISES_KEY, JSON.stringify(INITIAL_EXERCISES));
    return INITIAL_EXERCISES;
  }
  return JSON.parse(stored);
}

function getLocalWorkouts(): Workout[] {
  const stored = localStorage.getItem(OFFLINE_WORKOUTS_KEY);
  if (!stored) {
    localStorage.setItem(OFFLINE_WORKOUTS_KEY, JSON.stringify(INITIAL_WORKOUTS));
    return INITIAL_WORKOUTS;
  }
  return JSON.parse(stored);
}

function saveLocalWorkouts(workouts: Workout[]) {
  localStorage.setItem(OFFLINE_WORKOUTS_KEY, JSON.stringify(workouts));
}

function saveLocalExercises(exercises: Exercise[]) {
  localStorage.setItem(OFFLINE_EXERCISES_KEY, JSON.stringify(exercises));
}

// ---------------- API SERVICES ----------------

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const data = await request<AuthResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        setStoredUser(data);
        localStorage.removeItem(IS_DEMO_KEY);
        return data;
      } catch (err) {
        // If server is not responding, fallback for local dev/demo
        if (email.toLowerCase().includes('demo') || isDemoMode()) {
          setDemoMode(true);
          return {
            _id: 'demo-user-123',
            name: 'Alex Johnson',
            email,
            unitPreference: 'kg',
            defaultRestTime: 90,
            token: 'mock-jwt-token',
          };
        }
        throw err;
      }
    },

    register: async (name: string, email: string, password: string, unitPreference: 'kg' | 'lbs' = 'kg'): Promise<AuthResponse> => {
      try {
        const data = await request<AuthResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, unitPreference }),
        });
        setToken(data.token);
        setStoredUser(data);
        localStorage.removeItem(IS_DEMO_KEY);
        return data;
      } catch (err) {
        throw err;
      }
    },

    getMe: async (): Promise<User> => {
      if (isDemoMode()) {
        const u = getStoredUser();
        if (u) return u;
      }
      return await request<User>('/auth/me');
    },

    updatePreferences: async (prefs: Partial<User>): Promise<User> => {
      const curUser = getStoredUser();
      const updated = { ...curUser, ...prefs } as User;
      setStoredUser(updated);

      if (!isDemoMode()) {
        try {
          return await request<User>('/auth/preferences', {
            method: 'PUT',
            body: JSON.stringify(prefs),
          });
        } catch (e) {
          console.warn('Backend update failed, saved locally');
        }
      }
      return updated;
    },
  },

  exercises: {
    getAll: async (): Promise<Exercise[]> => {
      if (isDemoMode()) {
        return getLocalExercises();
      }
      try {
        return await request<Exercise[]>('/exercises');
      } catch {
        return getLocalExercises();
      }
    },

    create: async (exerciseData: Omit<Exercise, '_id'>): Promise<Exercise> => {
      if (isDemoMode()) {
        const local = getLocalExercises();
        const newEx: Exercise = {
          ...exerciseData,
          _id: `custom-${Date.now()}`,
          isCustom: true,
        };
        saveLocalExercises([...local, newEx]);
        return newEx;
      }
      try {
        return await request<Exercise>('/exercises', {
          method: 'POST',
          body: JSON.stringify(exerciseData),
        });
      } catch (err) {
        const local = getLocalExercises();
        const newEx: Exercise = {
          ...exerciseData,
          _id: `custom-${Date.now()}`,
          isCustom: true,
        };
        saveLocalExercises([...local, newEx]);
        return newEx;
      }
    },

    delete: async (id: string): Promise<void> => {
      if (isDemoMode()) {
        const local = getLocalExercises().filter((e) => e._id !== id);
        saveLocalExercises(local);
        return;
      }
      try {
        await request(`/exercises/${id}`, { method: 'DELETE' });
      } catch {
        const local = getLocalExercises().filter((e) => e._id !== id);
        saveLocalExercises(local);
      }
    },
  },

  workouts: {
    getAll: async (): Promise<Workout[]> => {
      if (isDemoMode()) {
        return getLocalWorkouts();
      }
      try {
        const remote = await request<Workout[]>('/workouts');
        if (Array.isArray(remote)) {
          saveLocalWorkouts(remote);
          return remote;
        }
        return getLocalWorkouts();
      } catch (err) {
        console.warn('Backend fetch failed, using local cache:', err);
        return getLocalWorkouts();
      }
    },

    create: async (workoutData: Omit<Workout, '_id' | 'totalVolume'>): Promise<Workout> => {
      // Calculate total volume locally
      let volume = 0;
      workoutData.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (s.completed && s.type !== 'warmup') {
            volume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          }
          if (s.reps > 0 && s.weight > 0) {
            s.estimated1RM = Math.round(Number(s.weight) * (1 + Number(s.reps) / 30) * 10) / 10;
          }
        });
      });

      // Demo mode handling
      if (isDemoMode()) {
        const workouts = getLocalWorkouts();
        const prs: { exerciseName: string; type: string; value: number }[] = [];
        workoutData.exercises.forEach((ex) => {
          let currentMaxWeight = 0;
          ex.sets.forEach((s) => {
            if (s.completed && s.weight > currentMaxWeight) currentMaxWeight = s.weight;
          });

          let pastMax = 0;
          workouts.forEach((w) => {
            w.exercises?.forEach((pastEx) => {
              if (pastEx.exerciseName.toLowerCase() === ex.exerciseName.toLowerCase()) {
                pastEx.sets?.forEach((ps) => {
                  if (ps.completed && ps.weight > pastMax) pastMax = ps.weight;
                });
              }
            });
          });

          if (pastMax > 0 && currentMaxWeight > pastMax) {
            prs.push({
              exerciseName: ex.exerciseName,
              type: 'Max Weight',
              value: currentMaxWeight,
            });
          }
        });

        const newWorkout: Workout = {
          ...workoutData,
          _id: `w-${Date.now()}`,
          totalVolume: volume,
          prsAchieved: prs,
        };

        saveLocalWorkouts([newWorkout, ...workouts]);
        return newWorkout;
      }

      // Live Backend handling
      try {
        const saved = await request<Workout>('/workouts', {
          method: 'POST',
          body: JSON.stringify(workoutData),
        });
        const currentLocal = getLocalWorkouts();
        saveLocalWorkouts([saved, ...currentLocal.filter(w => w._id !== saved._id)]);
        return saved;
      } catch (err: any) {
        console.warn('Backend save failed, saving to local cache:', err);
        const currentLocal = getLocalWorkouts();
        const fallbackWorkout: Workout = {
          ...workoutData,
          _id: `w-${Date.now()}`,
          totalVolume: volume,
        };
        saveLocalWorkouts([fallbackWorkout, ...currentLocal]);
        return fallbackWorkout;
      }
    },

    delete: async (id: string): Promise<void> => {
      if (isDemoMode()) {
        const workouts = getLocalWorkouts().filter((w) => w._id !== id);
        saveLocalWorkouts(workouts);
        return;
      }
      try {
        await request(`/workouts/${id}`, { method: 'DELETE' });
      } catch {
        const workouts = getLocalWorkouts().filter((w) => w._id !== id);
        saveLocalWorkouts(workouts);
      }
    },

    getLastPerformance: async (exerciseName: string): Promise<{ found: boolean; sets: WorkoutSet[] }> => {
      const workouts = isDemoMode() ? getLocalWorkouts() : await api.workouts.getAll();
      for (const w of workouts) {
        const match = w.exercises.find((e) => e.exerciseName.toLowerCase() === exerciseName.toLowerCase());
        if (match) {
          return { found: true, sets: match.sets };
        }
      }
      return { found: false, sets: [] };
    },
  },

  stats: {
    getDashboard: async (): Promise<DashboardStats> => {
      const workouts = isDemoMode() ? getLocalWorkouts() : await api.workouts.getAll().catch(() => getLocalWorkouts());

      const totalWorkouts = workouts.length;
      let totalVolume = 0;
      let totalPRs = 0;
      let totalDuration = 0;
      const muscleMap: Record<string, number> = {};
      const recentWorkoutsChart: DashboardStats['recentWorkoutsChart'] = [];

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      let volumeThisWeek = 0;

      // Chronological order for calculations
      const chronological = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      chronological.forEach((w) => {
        totalVolume += w.totalVolume || 0;
        totalDuration += w.duration || 0;
        if (w.prsAchieved) totalPRs += w.prsAchieved.length;

        if (new Date(w.date) >= oneWeekAgo) {
          volumeThisWeek += w.totalVolume || 0;
        }

        w.exercises?.forEach((ex) => {
          const muscle = ex.targetMuscle || 'Other';
          muscleMap[muscle] = (muscleMap[muscle] || 0) + 1;
        });
      });

      chronological.slice(-8).forEach((w) => {
        recentWorkoutsChart.push({
          date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          title: w.title,
          volume: w.totalVolume,
          durationMin: Math.round((w.duration || 0) / 60),
        });
      });

      const muscleDistribution = Object.keys(muscleMap).map((name) => ({
        name,
        value: muscleMap[name],
      }));

      // Calculate streak
      let currentStreak = 0;
      if (chronological.length > 0) {
        const dates = [
          ...new Set(chronological.map((w) => new Date(w.date).toISOString().split('T')[0])),
        ].reverse();

        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dates[0] === todayStr || dates[0] === yesterdayStr) {
          currentStreak = 1;
          let checkDate = new Date(dates[0]);
          for (let i = 1; i < dates.length; i++) {
            checkDate.setDate(checkDate.getDate() - 1);
            const expected = checkDate.toISOString().split('T')[0];
            if (dates[i] === expected) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

      return {
        totalWorkouts,
        totalVolume,
        volumeThisWeek,
        totalPRs,
        currentStreak,
        averageDurationMinutes: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0,
        recentWorkoutsChart,
        muscleDistribution,
      };
    },

    getProgression: async (exerciseName: string): Promise<ExerciseProgressionPoint[]> => {
      const workouts = isDemoMode() ? getLocalWorkouts() : await api.workouts.getAll().catch(() => getLocalWorkouts());
      const chronological = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const points: ExerciseProgressionPoint[] = [];

      chronological.forEach((w) => {
        const match = w.exercises?.find((e) => e.exerciseName.toLowerCase() === exerciseName.toLowerCase());
        if (match && match.sets?.length > 0) {
          let maxWeight = 0;
          let max1RM = 0;
          let exerciseVolume = 0;

          match.sets.forEach((s) => {
            if (s.completed && s.type !== 'warmup') {
              if (s.weight > maxWeight) maxWeight = s.weight;
              const e1rm = s.estimated1RM || Math.round(s.weight * (1 + s.reps / 30) * 10) / 10;
              if (e1rm > max1RM) max1RM = e1rm;
              exerciseVolume += (s.weight || 0) * (s.reps || 0);
            }
          });

          if (maxWeight > 0) {
            points.push({
              date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              rawDate: w.date,
              workoutTitle: w.title,
              maxWeight,
              estimated1RM: max1RM,
              volume: exerciseVolume,
              setsCount: match.sets.filter((s) => s.completed).length,
            });
          }
        }
      });

      return points;
    },
  },
};
