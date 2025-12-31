import type {Exercise, ExerciseLogEntry, ExerciseSet} from '../domain';

/**
 * Test data factories for creating test fixtures
 */

export const createExercise = (overrides?: Partial<Exercise>): Exercise => ({
    group: 'Chest',
    name: 'Bench Press',
    ...overrides,
});

export const createExerciseSet = (overrides?: Partial<ExerciseSet>): ExerciseSet => ({
    weight: 100,
    reps: 10,
    ...overrides,
});

export const createExerciseLogEntry = (
    overrides?: Partial<ExerciseLogEntry>
): ExerciseLogEntry => ({
    timestamp: new Date('2025-12-15T10:00:00Z').toISOString(),
    exercise: createExercise(),
    sets: [createExerciseSet()],
    failure: false,
    ...overrides,
});

export const createEmptyExerciseLogEntry = (): ExerciseLogEntry => ({
    timestamp: new Date().toISOString(),
    exercise: {group: '', name: ''},
    sets: [{weight: 0, reps: 0}],
    failure: false,
});
