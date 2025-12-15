import React from 'react';
import { Dumbbell, Plus } from 'lucide-react';

interface HomeProps {
  onNavigateToLog: () => void;
}

const Home: React.FC<HomeProps> = ({ onNavigateToLog }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="bg-blue-600 p-6 rounded-full shadow-lg">
            <Dumbbell className="w-16 h-16 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Exercise Tracker</h1>
          <p className="text-lg text-gray-600">
            Track your workouts, monitor progress, and achieve your fitness goals
          </p>
        </div>

        {/* Main CTA Button */}
        <div className="pt-4">
          <button
            onClick={onNavigateToLog}
            className="w-full max-w-sm mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <Plus className="w-6 h-6" />
            Log New Workout
          </button>
        </div>

        {/* Quick Stats or Info Cards */}
        <div className="grid grid-cols-3 gap-4 pt-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-xs text-gray-600 mt-1">Workouts</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-xs text-gray-600 mt-1">Exercises</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-xs text-gray-600 mt-1">Total Sets</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
