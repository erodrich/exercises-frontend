/* src/data/exerciseGroups.ts */
export const EXERCISE_GROUPS = {
  Chest: [
    'Incline Dumbbell Press',
    'Dumbbell Flat Press',
    'Decline Press',
    'Cable Fly',
    'Pec Deck',
    'Push Up'
  ],
  Back: [
    'Pull Up',
    'Lat Pulldown',
    'Barbell Row',
    'Seated Row',
    'Face Pull'
  ],
  Legs: [
    'Squat',
    'Leg Press',
    'Leg Extension',
    'Leg Curl',
    'Calf Raise'
  ],
  Shoulders: [
    'Overhead Press',
    'Lateral Raise',
    'Front Raise',
    'Rear Delt Fly'
  ],
  Arms: [
    'Bicep Curl',
    'Tricep Pushdown',
    'Hammer Curl',
    'Skull Crusher'
  ]
} as const;

export type MuscleGroup = keyof typeof EXERCISE_GROUPS;