import React, { useState } from 'react';
import { Timer, X, Plus, RotateCcw, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RestTimer: React.FC = () => {
  const { restTimer } = useAuth();
  const [minimized, setMinimized] = useState(false);

  if (!restTimer.isActive && restTimer.secondsLeft === 0) {
    return null;
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = restTimer.initialSeconds > 0
    ? ((restTimer.initialSeconds - restTimer.secondsLeft) / restTimer.initialSeconds) * 100
    : 0;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 transition-all duration-300">
      <div className="bg-zinc-900/95 border border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden w-72 sm:w-80">
        {/* Progress Bar along the top */}
        <div className="w-full bg-zinc-800 h-1.5">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {/* Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Rest Timer
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(!minimized)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={restTimer.stop}
              className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body (Collapsible) */}
        {!minimized && (
          <div className="p-4 flex flex-col items-center">
            {/* Countdown Display */}
            <div className="text-4xl font-black font-mono tracking-tight text-white my-1 flex items-baseline gap-1">
              {formatTime(restTimer.secondsLeft)}
              <span className="text-xs font-sans text-zinc-500 font-normal">sec</span>
            </div>

            <div className="text-[11px] text-zinc-400 flex items-center gap-1 mb-3">
              <Bell className="w-3 h-3 text-emerald-400" />
              <span>Chimes automatically when ready</span>
            </div>

            {/* Quick Adjustment Buttons */}
            <div className="grid grid-cols-4 gap-1.5 w-full mb-3">
              {[30, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => restTimer.start(sec)}
                  className={`py-1 rounded-lg text-xs font-bold transition-all ${
                    restTimer.initialSeconds === sec
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => restTimer.addSeconds(30)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+30s</span>
              </button>

              <button
                onClick={() => restTimer.start(restTimer.initialSeconds || 90)}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={restTimer.stop}
                className="py-1.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-xs font-semibold transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

