import type { ExerciseSet } from '../models';

/**
 * Volume & Exercise Calculators
 * Pure functions for calculating exercise metrics
 */

/**
 * Calculates volume (weight x reps) for a single set
 */
export function calculateSetVolume(set: ExerciseSet): number {
  return set.weight * set.reps;
}

/**
 * Calculates total volume across all sets
 */
export function calculateTotalVolume(sets: ExerciseSet[]): number {
  if (!sets || sets.length === 0) return 0;
  return sets.reduce((total, set) => total + calculateSetVolume(set), 0);
}

/**
 * Calculates total reps across all sets
 */
export function calculateTotalReps(sets: ExerciseSet[]): number {
  if (!sets || sets.length === 0) return 0;
  return sets.reduce((total, set) => total + set.reps, 0);
}

/**
 * Calculates average weight across all sets
 */
export function calculateAverageWeight(sets: ExerciseSet[]): number {
  if (!sets || sets.length === 0) return 0;
  const totalWeight = sets.reduce((sum, set) => sum + set.weight, 0);
  return Math.round((totalWeight / sets.length) * 100) / 100; // Round to 2 decimal places
}

/**
 * Finds the maximum weight used across all sets
 */
export function calculateMaxWeight(sets: ExerciseSet[]): number {
  if (!sets || sets.length === 0) return 0;
  return Math.max(...sets.map(set => set.weight));
}

/**
 * Estimates one-rep max (1RM) using the Epley formula
 * Formula: weight * (1 + reps/30)
 * 
 * Note: This is most accurate for reps between 1-10
 */
export function calculateOneRepMax(set: ExerciseSet): number {
  if (set.weight === 0 || set.reps === 0) return 0;
  if (set.reps === 1) return set.weight;
  
  const oneRepMax = set.weight * (1 + set.reps / 30);
  return Math.round(oneRepMax * 10) / 10; // Round to 1 decimal place
}
