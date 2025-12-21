/* src/components/ExerciseEntryForm.tsx */
import React, { useState, useEffect } from 'react';
import type { ExerciseLogEntry } from '../domain/models';
import type { MuscleGroup } from '../types/exercise';
import ExerciseSetForm from './ExerciseSetForm';
import { Plus, Trash2, ChevronUp, ChevronDown, Dumbbell, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { HttpMuscleGroupService } from '../services/muscleGroupService';
import { HttpPublicExerciseService } from '../services/publicExerciseService';
import API_CONFIG from '../config/api';

interface ExerciseEntryFormProps {
  entry: ExerciseLogEntry;
  index: number;
  totalEntries: number;
  onUpdate: (updates: Partial<ExerciseLogEntry>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ExerciseEntryForm: React.FC<ExerciseEntryFormProps> = ({
  entry,
  index,
  totalEntries,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [highlightedSetIndex, setHighlightedSetIndex] = useState<number | null>(null);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [exercises, setExercises] = useState<{id: number, name: string, group: string}[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Fetch muscle groups on mount
  useEffect(() => {
    const fetchMuscleGroups = async () => {
      setLoadingGroups(true);
      const service = new HttpMuscleGroupService(API_CONFIG.baseURL);
      const result = await service.getAllMuscleGroups();
      if (result.success) {
        setMuscleGroups(result.data);
      }
      setLoadingGroups(false);
    };
    fetchMuscleGroups();
  }, []);

  // Fetch exercises when muscle group changes
  useEffect(() => {
    const fetchExercises = async () => {
      if (!entry.exercise.group) {
        setExercises([]);
        return;
      }

      setLoadingExercises(true);
      const service = new HttpPublicExerciseService(API_CONFIG.baseURL);
      const result = await service.getAllExercises();
      
      if (result.success) {
        // Filter exercises by selected muscle group
        const filtered = result.data.filter(
          (ex) => ex.group.toUpperCase() === entry.exercise.group.toUpperCase()
        );
        setExercises(filtered);
      }
      setLoadingExercises(false);
    };
    fetchExercises();
  }, [entry.exercise.group]);

  const addSet = () => {
    const lastSet = entry.sets[entry.sets.length - 1];
    const newSet = {
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0
    };
    const newSetIndex = entry.sets.length;
    onUpdate({ sets: [...entry.sets, newSet] });
    
    // Highlight the newly added set
    setHighlightedSetIndex(newSetIndex);
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
      setHighlightedSetIndex(null);
    }, 2000);
  };

  const updateSet = (setIndex: number, updates: Partial<ExerciseLogEntry['sets'][0]>) => {
    const newSets = [...entry.sets];
    newSets[setIndex] = { ...newSets[setIndex], ...updates };
    onUpdate({ sets: newSets });
  };

  const removeSet = (setIndex: number) => {
    if (entry.sets.length <= 1) return;
    const newSets = entry.sets.filter((_, i) => i !== setIndex);
    onUpdate({ sets: newSets });
  };

  const calculateVolume = () => {
    return entry.sets.reduce((total, set) => total + (set.weight * set.reps), 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Dumbbell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {entry.exercise.name || 'New Exercise'}
            </h3>
            <p className="text-sm text-gray-500">
              {entry.sets.length} sets • {calculateVolume().toFixed(1)} kg total
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={index === totalEntries - 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Exercise Selection */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Muscle Group
              </label>
              <select
                value={entry.exercise.group}
                onChange={(e) => onUpdate({
                  exercise: { ...entry.exercise, group: e.target.value, name: '' }
                })}
                disabled={loadingGroups}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">{loadingGroups ? 'Loading...' : 'Select group'}</option>
                {muscleGroups.map((group) => (
                  <option key={group.id} value={group.name}>{group.name}</option>
                ))}
              </select>
            </div>

            {entry.exercise.group && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Exercise
                </label>
                <select
                  value={entry.exercise.name}
                  onChange={(e) => onUpdate({
                    exercise: { ...entry.exercise, name: e.target.value }
                  })}
                  disabled={loadingExercises}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">{loadingExercises ? 'Loading...' : 'Select exercise'}</option>
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.name}>{exercise.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Failure Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Failure</p>
              <p className="text-xs text-gray-500">Train to failure?</p>
            </div>
            <button
              type="button"
              onClick={() => onUpdate({ failure: !entry.failure })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                entry.failure ? 'bg-red-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  entry.failure ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sets */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Sets</h4>
              <button
                type="button"
                onClick={addSet}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 font-medium rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Set
              </button>
            </div>
            
            <div className="space-y-2">
              {entry.sets.map((set, setIndex) => (
                <ExerciseSetForm
                  key={setIndex}
                  set={set}
                  index={setIndex}
                  onUpdate={(updates) => updateSet(setIndex, updates)}
                  onRemove={() => removeSet(setIndex)}
                  isRemovable={entry.sets.length > 1}
                  isHighlighted={highlightedSetIndex === setIndex}
                />
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Time
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={format(new Date(entry.timestamp), "dd/MM/yyyy HH:mm:ss")}
                onChange={(e) => {
                  // Parse DD/MM/YYYY HH:mm:ss format
                  const match = e.target.value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
                  if (match) {
                    const [, day, month, year, hour, minute, second] = match;
                    const date = new Date(
                      parseInt(year),
                      parseInt(month) - 1,
                      parseInt(day),
                      parseInt(hour),
                      parseInt(minute),
                      parseInt(second)
                    );
                    if (!isNaN(date.getTime())) {
                      onUpdate({ timestamp: date.toISOString() });
                    }
                  }
                }}
                placeholder="DD/MM/YYYY HH:mm:ss"
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => onUpdate({ timestamp: new Date().toISOString() })}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                title="Set to current time"
              >
                <Clock className="w-4 h-4" />
                Now
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Format: DD/MM/YYYY HH:mm:ss (e.g., 19/12/2025 14:30:00)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseEntryForm;