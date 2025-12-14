/* src/components/ExerciseLogForm.tsx */
import React, { useState } from 'react';
import type { ExerciseLogEntry } from '../types/exercise';
import ExerciseEntryForm from './ExerciseEntryForm';
import { Plus, Save, Copy } from 'lucide-react';

const ExerciseLogForm: React.FC = () => {
  const [entries, setEntries] = useState<ExerciseLogEntry[]>([
    {
      timestamp: new Date().toISOString(),
      exercise: { group: 'Chest', name: 'Incline Dumbbell Press' },
      sets: [
        { weight: 30, reps: 11 },
        { weight: 30, reps: 10 },
        { weight: 30, reps: 9 }
      ],
      failure: false
    },
    {
      timestamp: new Date().toISOString(),
      exercise: { group: 'Chest', name: 'Dumbbell Flat Press' },
      sets: [
        { weight: 32, reps: 10 },
        { weight: 32, reps: 9 },
        { weight: 28, reps: 10 },
        { weight: 28, reps: 8 }
      ],
      failure: false
    }
  ]);

  const addExercise = () => {
    const lastEntry = entries[entries.length - 1];
    const newEntry: ExerciseLogEntry = {
      timestamp: new Date().toISOString(),
      exercise: { group: 'Chest', name: '' },
      sets: lastEntry?.sets?.length > 0 
        ? [{ ...lastEntry.sets[0], weight: 0, reps: 0 }]
        : [{ weight: 0, reps: 0 }],
      failure: false
    };
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (index: number, updates: Partial<ExerciseLogEntry>) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], ...updates };
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    if (entries.length <= 1) return;
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const moveEntry = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === entries.length - 1)
    ) return;

    const newEntries = [...entries];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newEntries[index], newEntries[newIndex]] = [newEntries[newIndex], newEntries[index]];
    setEntries(newEntries);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const isValid = entries.every(entry => 
      entry.exercise.group &&
      entry.exercise.name &&
      entry.sets.every(set => set.weight > 0 && set.reps > 0)
    );

    if (!isValid) {
      alert('Please fill in all required fields');
      return;
    }

    // Format data
    const formattedData = entries.map(entry => ({
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
    }));

    console.log('Submitted data:', formattedData);
    alert('Workout saved successfully!');
  };

  const copyToClipboard = () => {
    const jsonString = JSON.stringify(entries, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert('JSON copied to clipboard!');
  };

  const calculateTotalVolume = () => {
    return entries.reduce((total, entry) => {
      return total + entry.sets.reduce((setTotal, set) => 
        setTotal + (set.weight * set.reps), 0);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50 py-3">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Exercise Log</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                title="Copy JSON"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center justify-between text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
            <div>
              <div className="font-medium">{entries.length} exercises</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="font-medium">
                {entries.reduce((total, entry) => total + entry.sets.length, 0)} sets
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="font-medium text-blue-600">
                {calculateTotalVolume().toFixed(1)} kg
              </div>
              <div className="text-xs text-gray-500">Volume</div>
            </div>
          </div>
        </div>

        {/* Exercise Entries */}
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <ExerciseEntryForm
              key={index}
              entry={entry}
              index={index}
              totalEntries={entries.length}
              onUpdate={(updates) => updateEntry(index, updates)}
              onRemove={() => removeEntry(index)}
              onMoveUp={() => moveEntry(index, 'up')}
              onMoveDown={() => moveEntry(index, 'down')}
            />
          ))}
        </div>

        {/* Add Exercise Button */}
        <button
          type="button"
          onClick={addExercise}
          className="w-full py-3 bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 rounded-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Exercise
        </button>
      </div>
    </form>
  );
};

export default ExerciseLogForm;