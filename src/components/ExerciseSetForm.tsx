/* src/components/ExerciseSetForm.tsx */
import React from 'react';
import type { ExerciseSet } from '../types/exercise';
import { Trash2 } from 'lucide-react';

interface ExerciseSetFormProps {
  set: ExerciseSet;
  index: number;
  onUpdate: (updates: Partial<ExerciseSet>) => void;
  onRemove: () => void;
  isRemovable: boolean;
}

const ExerciseSetForm: React.FC<ExerciseSetFormProps> = ({
  set,
  index,
  onUpdate,
  onRemove,
  isRemovable
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-medium rounded-full">
        {index + 1}
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={set.weight}
            onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Reps
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={set.reps}
            onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>
      
      {isRemovable && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ExerciseSetForm;