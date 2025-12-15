/* src/components/ExerciseLogForm.tsx */
import React, { useState } from 'react';
import type { ExerciseLogEntry } from '../types/exercise';
import ExerciseEntryForm from './ExerciseEntryForm';
import { Save, Copy, X } from 'lucide-react';

interface ExerciseLogFormProps {
  onNavigateBack?: () => void;
}

const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({ onNavigateBack }) => {
  const [entry, setEntry] = useState<ExerciseLogEntry>({
    timestamp: new Date().toISOString(),
    exercise: { group: 'Chest', name: '' },
    sets: [{ weight: 0, reps: 0 }],
    failure: false
  });

  const updateEntry = (updates: Partial<ExerciseLogEntry>) => {
    setEntry({ ...entry, ...updates });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const isValid = 
      entry.exercise.group &&
      entry.exercise.name &&
      entry.sets.every(set => set.weight > 0 && set.reps > 0);

    if (!isValid) {
      alert('Please fill in all required fields');
      return;
    }

    // Format data
    const formattedData = {
      ...entry,
      timestamp: new Date(entry.timestamp).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', '')
    };

    console.log('Submitted data:', formattedData);
    alert('Exercise saved successfully!');
    
    // Navigate back to home after saving
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const copyToClipboard = () => {
    const jsonString = JSON.stringify(entry, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert('JSON copied to clipboard!');
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
      </div>
    </form>
  );
};

export default ExerciseLogForm;