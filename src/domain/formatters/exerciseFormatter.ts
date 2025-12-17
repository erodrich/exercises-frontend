import type { ExerciseLogEntry } from '../models';

/**
 * Exercise Formatters
 * Pure functions for formatting exercise data for different contexts
 */

/**
 * Formats a date/timestamp in GB locale format: DD/MM/YYYY HH:mm:ss
 */
export function formatTimestamp(date: Date): string {
  try {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(',', '');
  } catch (error) {
    // Fallback for invalid dates
    return new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(',', '');
  }
}

/**
 * Formats volume (weight x reps) with 1 decimal place
 */
export function formatVolume(volume: number, includeUnit: boolean = false): string {
  const formatted = volume.toFixed(1);
  return includeUnit ? `${formatted} kg` : formatted;
}

/**
 * Formats an exercise log entry for storage (e.g., database, localStorage)
 */
export function formatExerciseForStorage(entry: ExerciseLogEntry): ExerciseLogEntry {
  return {
    ...entry,
    timestamp: formatTimestamp(new Date(entry.timestamp)),
  };
}

/**
 * Display information for an exercise entry
 */
export interface ExerciseDisplay {
  exerciseSummary: string;
  formattedTimestamp: string;
  setCount: number;
  totalReps: number;
  totalVolume: string;
  averageWeight: string;
  maxWeight: string;
  failure: boolean;
}

/**
 * Formats an exercise log entry for display (UI)
 */
export function formatExerciseForDisplay(entry: ExerciseLogEntry): ExerciseDisplay {
  const totalVolume = entry.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const totalReps = entry.sets.reduce((sum, set) => sum + set.reps, 0);
  const averageWeight = entry.sets.reduce((sum, set) => sum + set.weight, 0) / entry.sets.length;
  const maxWeight = Math.max(...entry.sets.map(set => set.weight));

  return {
    exerciseSummary: `${entry.exercise.group} - ${entry.exercise.name}`,
    formattedTimestamp: formatTimestamp(new Date(entry.timestamp)),
    setCount: entry.sets.length,
    totalReps,
    totalVolume: formatVolume(totalVolume, true),
    averageWeight: formatVolume(averageWeight, true),
    maxWeight: formatVolume(maxWeight, true),
    failure: entry.failure,
  };
}
