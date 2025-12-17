/* src/components/ExerciseLogForm.tsx */
import React from 'react';
import type { ExerciseLogEntry } from '../domain/models';
import ExerciseEntryForm from './ExerciseEntryForm';
import { Save, Copy, X } from 'lucide-react';
import { useExerciseService } from '../hooks/useExerciseService';
import { useExerciseForm } from '../hooks/useExerciseForm';
import { useNotification } from '../hooks/useNotification';

interface ExerciseLogFormProps {
  onNavigateBack?: () => void;
}

const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({ onNavigateBack }) => {
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
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50 py-3">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Log Exercise</h1>
            <div className="flex items-center gap-2">
              {onNavigateBack && (
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy JSON"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                title="Save"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            {errors.map((error, idx) => (
              <p key={idx} className="text-red-600 text-sm">{error}</p>
            ))}
          </div>
        )}

        {/* Exercise Entry */}
        <div>
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
          <div className="text-center text-gray-600 py-4">
            <p>Saving...</p>
          </div>
        )}
      </div>
    </form>
  );
};

export default ExerciseLogForm;