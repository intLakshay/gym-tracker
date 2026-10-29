import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { RestTimer } from './components/RestTimer';
import { PlateCalculatorModal } from './components/PlateCalculatorModal';
import { AuthModal } from './components/AuthModal';

import { DashboardPage } from './pages/DashboardPage';
import { ActiveWorkoutPage } from './pages/ActiveWorkoutPage';
import { HistoryPage } from './pages/HistoryPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [progressionTargetExercise, setProgressionTargetExercise] = useState('Barbell Bench Press');

  const handleSelectForProgression = (exerciseName: string) => {
    setProgressionTargetExercise(exerciseName);
    setCurrentTab('analytics');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top and Mobile Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openPlateCalc={() => setIsPlateCalcOpen(true)}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {currentTab === 'dashboard' && (
          <DashboardPage
            onStartWorkout={() => setCurrentTab('workout')}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'workout' && (
          <ActiveWorkoutPage
            onFinishWorkout={() => setCurrentTab('history')}
            onCancel={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'history' && <HistoryPage />}

        {currentTab === 'exercises' && (
          <ExercisesPage onSelectForProgression={handleSelectForProgression} />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsPage initialExerciseName={progressionTargetExercise} />
        )}
      </main>

      {/* Persistent Background Rest Timer */}
      <RestTimer />

      {/* Modals */}
      <PlateCalculatorModal
        isOpen={isPlateCalcOpen}
        onClose={() => setIsPlateCalcOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
