import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getStoredUser, getToken, removeToken, setDemoMode } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  unit: 'kg' | 'lbs';
  setUnit: (u: 'kg' | 'lbs') => void;
  toggleUnit: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, unit?: 'kg' | 'lbs') => Promise<void>;
  loginDemo: () => void;
  logout: () => void;
  // Global rest timer state
  restTimer: {
    secondsLeft: number;
    initialSeconds: number;
    isActive: boolean;
    start: (seconds: number) => void;
    stop: () => void;
    addSeconds: (sec: number) => void;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unit, setUnitState] = useState<'kg' | 'lbs'>('kg');

  // Rest Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerInitial, setTimerInitial] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            // Play audio beep cue
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High A
              gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.35);
            } catch (e) {
              console.log('Audio cue unavailable');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const startRestTimer = (seconds: number) => {
    setTimerInitial(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  const stopRestTimer = () => {
    setTimerActive(false);
    setTimerSeconds(0);
  };

  const addRestTimerSeconds = (sec: number) => {
    setTimerSeconds((prev) => prev + sec);
  };

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const stored = getStoredUser();

      if (token && stored) {
        setUser(stored);
        setUnitState(stored.unitPreference || 'kg');
      } else if (!token && !stored) {
        // Automatically default to demo mode so the app works instantly out-of-the-box
        setDemoMode(true);
        const demo = getStoredUser();
        setUser(demo);
        setUnitState(demo?.unitPreference || 'kg');
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login(email, pass);
    setUser(res);
    setUnitState(res.unitPreference || 'kg');
  };

  const register = async (name: string, email: string, pass: string, unitPref: 'kg' | 'lbs' = 'kg') => {
    const res = await api.auth.register(name, email, pass, unitPref);
    setUser(res);
    setUnitState(res.unitPreference || 'kg');
  };

  const loginDemo = () => {
    setDemoMode(true);
    const demo = getStoredUser();
    setUser(demo);
    setUnitState('kg');
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const setUnit = async (newUnit: 'kg' | 'lbs') => {
    setUnitState(newUnit);
    if (user) {
      const updated = { ...user, unitPreference: newUnit };
      setUser(updated);
      await api.auth.updatePreferences({ unitPreference: newUnit });
    }
  };

  const toggleUnit = () => {
    const next = unit === 'kg' ? 'lbs' : 'kg';
    setUnit(next);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        unit,
        setUnit,
        toggleUnit,
        login,
        register,
        loginDemo,
        logout,
        restTimer: {
          secondsLeft: timerSeconds,
          initialSeconds: timerInitial,
          isActive: timerActive,
          start: startRestTimer,
          stop: stopRestTimer,
          addSeconds: addRestTimerSeconds,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
