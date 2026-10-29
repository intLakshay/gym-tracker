import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight?: number;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWeight = 100,
}) => {
  const { unit } = useAuth();
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight);
  const [barWeight, setBarWeight] = useState<number>(unit === 'kg' ? 20 : 45);

  if (!isOpen) return null;

  // Plate definitions with standard IWF/IPF powerlifting colors
  const kgPlates = [
    { weight: 25, color: 'bg-red-600 text-white border-red-500', height: 'h-24' },
    { weight: 20, color: 'bg-blue-600 text-white border-blue-500', height: 'h-22' },
    { weight: 15, color: 'bg-yellow-500 text-zinc-950 border-yellow-400', height: 'h-20' },
    { weight: 10, color: 'bg-emerald-600 text-white border-emerald-500', height: 'h-18' },
    { weight: 5, color: 'bg-zinc-200 text-zinc-950 border-zinc-300', height: 'h-14' },
    { weight: 2.5, color: 'bg-zinc-800 text-zinc-200 border-zinc-700', height: 'h-11' },
    { weight: 1.25, color: 'bg-zinc-500 text-white border-zinc-400', height: 'h-8' },
  ];

  const lbPlates = [
    { weight: 45, color: 'bg-blue-600 text-white border-blue-500', height: 'h-24' },
    { weight: 35, color: 'bg-yellow-500 text-zinc-950 border-yellow-400', height: 'h-20' },
    { weight: 25, color: 'bg-emerald-600 text-white border-emerald-500', height: 'h-18' },
    { weight: 10, color: 'bg-zinc-200 text-zinc-950 border-zinc-300', height: 'h-14' },
    { weight: 5, color: 'bg-zinc-800 text-zinc-200 border-zinc-700', height: 'h-11' },
    { weight: 2.5, color: 'bg-zinc-500 text-white border-zinc-400', height: 'h-8' },
  ];

  const platesConfig = unit === 'kg' ? kgPlates : lbPlates;

  // Calculate plates required per side
  let remainingPerSide = Math.max(0, (targetWeight - barWeight) / 2);
  const calculatedPlates: { weight: number; count: number; color: string; height: string }[] = [];

  for (const plate of platesConfig) {
    if (remainingPerSide >= plate.weight) {
      const count = Math.floor(remainingPerSide / plate.weight);
      calculatedPlates.push({
        weight: plate.weight,
        count,
        color: plate.color,
        height: plate.height,
      });
      remainingPerSide = Math.round((remainingPerSide - count * plate.weight) * 100) / 100;
    }
  }

  const actualTotal =
    barWeight +
    calculatedPlates.reduce((acc, p) => acc + p.weight * p.count, 0) * 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Barbell Plate Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Target Total Weight ({unit})
            </label>
            <div className="relative">
              <input
                type="number"
                step="2.5"
                min={barWeight}
                value={targetWeight || ''}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-lg font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-4 top-3 text-zinc-500 font-semibold uppercase text-sm">
                {unit}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Barbell Weight:</span>
            <div className="flex gap-2">
              {(unit === 'kg' ? [20, 15] : [45, 35]).map((weight) => (
                <button
                  key={weight}
                  onClick={() => setBarWeight(weight)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    barWeight === weight
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {weight} {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Barbell Sleeve Rendering */}
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 flex flex-col items-center justify-center min-h-[140px] overflow-x-auto">
            <span className="text-[11px] text-zinc-500 mb-2 font-mono">
              Visual Bar Sleeve (Per Side)
            </span>

            <div className="flex items-center justify-center gap-1.5 h-28 px-4">
              {/* Collar stop */}
              <div className="w-3 h-20 bg-zinc-600 rounded-sm border border-zinc-500" title="Barbell Collar" />

              {/* Plates */}
              {calculatedPlates.length === 0 ? (
                <span className="text-xs text-zinc-500 italic">No plates needed (Bar weight only)</span>
              ) : (
                calculatedPlates.flatMap((plate) =>
                  Array.from({ length: plate.count }).map((_, idx) => (
                    <div
                      key={`${plate.weight}-${idx}`}
                      className={`w-4 sm:w-5 rounded-md border flex items-center justify-center font-mono font-bold text-[9px] shadow-lg transition-transform hover:scale-105 ${plate.color} ${plate.height}`}
                      title={`${plate.weight} ${unit}`}
                    >
                      <span className="transform -rotate-90 whitespace-nowrap">
                        {plate.weight}
                      </span>
                    </div>
                  ))
                )
              )}

              {/* Sleeve shaft */}
              <div className="w-12 h-6 bg-zinc-700 border-t border-b border-zinc-600 rounded-r-md" />
            </div>
          </div>

          {/* Plate Breakdown Summary List */}
          <div className="bg-zinc-800/40 rounded-xl p-3 border border-zinc-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-zinc-400">Plates to Load Per Side:</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Total: {actualTotal} {unit}
              </span>
            </div>

            {calculatedPlates.length === 0 ? (
              <p className="text-xs text-zinc-500">Just lift the empty bar!</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {calculatedPlates.map((p) => (
                  <div
                    key={p.weight}
                    className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800/60"
                  >
                    <span className="text-xs font-medium text-zinc-300">
                      {p.weight} {unit} plate:
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      × {p.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950/50 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
