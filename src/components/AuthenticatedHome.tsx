import React from 'react';
import { Dumbbell, Plus, LogOut, User } from 'lucide-react';
import type { User as UserType } from '../domain/models';

interface AuthenticatedHomeProps {
  user: UserType;
  onNavigateToLog: () => void;
  onLogout: () => void;
}

const AuthenticatedHome: React.FC<AuthenticatedHomeProps> = ({
  user,
  onNavigateToLog,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with User Info */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-full">
              <Dumbbell className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Exercise Tracker</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-5 h-5" />
              <span className="font-medium">{user.username}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 72px)' }}>
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Welcome Message */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.username}!
            </h2>
            <p className="text-lg text-gray-600">
              Ready to log your next workout?
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

          {/* Quick Stats */}
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
    </div>
  );
};

export default AuthenticatedHome;
