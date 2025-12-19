export interface MuscleGroup {
  id: number;
  name: string;
  description?: string;
}

export interface Exercise {
  group: string;
  name: string;
}

export interface ExerciseSet {
  weight: number;
  reps: number;
}

export interface ExerciseLogEntry {
  timestamp: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  failure: boolean;
}