/**
 * Admin Dashboard Component
 * Main admin interface with navigation
 */

import { useState } from 'react';
import { ArrowLeft, Database, Dumbbell } from 'lucide-react';
import type { User } from '../domain/models';
import ExerciseManagement from './ExerciseManagement';
import MuscleGroupManagement from './MuscleGroupManagement';

interface AdminDashboardProps {
  user: User;
  onNavigateBack: () => void;
  onLogout: () => void;
}

type AdminTab = 'exercises' | 'muscle-groups';

export default function AdminDashboard({
  user,
  onNavigateBack,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('exercises');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateBack}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Back to Home"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Logged in as {user.username} ({user.email})
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('exercises')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'exercises'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database size={20} />
              Exercises
            </button>
            <button
              onClick={() => setActiveTab('muscle-groups')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'muscle-groups'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Dumbbell size={20} />
              Muscle Groups
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'exercises' && <ExerciseManagement />}
        {activeTab === 'muscle-groups' && <MuscleGroupManagement />}
      </div>
    </div>
  );
}
