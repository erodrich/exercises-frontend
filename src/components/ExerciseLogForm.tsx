/* src/components/ExerciseLogForm.tsx */
import React from 'react';
import type { ExerciseLogEntry, User } from '../domain/models';
import ExerciseEntryForm from './ExerciseEntryForm';
import { Save, Copy, ArrowLeft, Dumbbell, User as UserIcon, LogOut } from 'lucide-react';
import { useExerciseService } from '../hooks/useExerciseService';
import { useExerciseForm } from '../hooks/useExerciseForm';
import { useNotification } from '../hooks/useNotification';

interface ExerciseLogFormProps {
  user: User;
  onNavigateBack?: () => void;
  onLogout?: () => void;
}

const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({ user, onNavigateBack, onLogout }) => {
  const service = useExerciseService();
  const notifier = useNotification();

  const initialEntry: ExerciseLogEntry = {
    timestamp: new Date().toISOString(),
    exercise: { group: 'Chest', name: '' },
    sets: [{ weight: 0, reps: 0 }],
    failure: false
  };

  const { entry, updateEntry, handleSubmit: submitForm, isSubmitting, errors } = useExerciseForm(
    service,
    initialEntry,
    () => {
      notifier.success('Exercise saved successfully!');
      if (onNavigateBack) {
        onNavigateBack();
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  const copyToClipboard = () => {
    const jsonString = JSON.stringify(entry, null, 2);
    navigator.clipboard.writeText(jsonString);
    notifier.info('JSON copied to clipboard!');
  };



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
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">{user.username}</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Page Header with Back Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onNavigateBack && (
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="p-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900">Log Exercise</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-2.5 text-gray-700 hover:bg-white rounded-lg transition-colors shadow-sm"
                title="Copy JSON"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors shadow-lg"
                title="Save Exercise"
              >
                <Save className="w-5 h-5" />
                <span className="font-medium">Save</span>
              </button>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
              {errors.map((error, idx) => (
                <p key={idx} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Exercise Entry Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ExerciseEntryForm
              entry={entry}
              index={0}
              totalEntries={1}
              onUpdate={updateEntry}
              onRemove={() => {}}
              onMoveUp={() => {}}
              onMoveDown={() => {}}
            />
          </div>

          {/* Loading State */}
          {isSubmitting && (
            <div className="text-center text-gray-700 py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="font-medium">Saving exercise...</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExerciseLogForm;