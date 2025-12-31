/**
 * Workout Plan Form Component
 * Form for creating and editing workout plans
 */

import {useEffect, useState} from 'react';
import {ChevronDown, ChevronUp, Plus, Trash2, X} from 'lucide-react';
import {useMuscleGroupService, usePublicExerciseService} from '../hooks';
import type {DurationUnit, ExerciseTarget, MuscleGroup, WorkoutDay, WorkoutPlan} from '../domain';
import type {ExerciseDTO} from '../services/publicExerciseService';

interface WorkoutPlanFormProps {
    plan?: WorkoutPlan;
    onSubmit: (plan: Omit<WorkoutPlan, 'id'>) => Promise<void>;
    onCancel: () => void;
}

export default function WorkoutPlanForm({plan, onSubmit, onCancel}: WorkoutPlanFormProps) {
    const publicExerciseService = usePublicExerciseService();
    const muscleGroupService = useMuscleGroupService();
    const [loading, setLoading] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<ExerciseDTO[]>([]);
    const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
    const [selectedMuscleGroupsByDay, setSelectedMuscleGroupsByDay] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0);

    const [formData, setFormData] = useState<Omit<WorkoutPlan, 'id'>>({
        name: plan?.name || '',
        duration: plan?.duration || 1,
        durationUnit: plan?.durationUnit || 'WEEKS',
        active: plan?.active || false,
        workoutDays: plan?.workoutDays || [],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Load muscle groups
        const mgResult = await muscleGroupService.getAllMuscleGroups();
        if (mgResult.success) {
            setMuscleGroups(mgResult.data);
        } else {
            setError(mgResult.error);
        }

        // Load all exercises
        const exResult = await publicExerciseService.getAllExercises();
        if (exResult.success) {
            setAvailableExercises(exResult.data);
        } else {
            setError(exResult.error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save workout plan');
        } finally {
            setLoading(false);
        }
    };

    const addWorkoutDay = () => {
        const newDay: WorkoutDay = {
            description: `Day ${formData.workoutDays.length + 1}`,
            exercises: [],
        };
        setFormData({
            ...formData,
            workoutDays: [...formData.workoutDays, newDay],
        });
        setExpandedDayIndex(formData.workoutDays.length);
    };

    const removeWorkoutDay = (index: number) => {
        setFormData({
            ...formData,
            workoutDays: formData.workoutDays.filter((_, i) => i !== index),
        });
        if (expandedDayIndex === index) {
            setExpandedDayIndex(null);
        }
    };

    const updateWorkoutDay = (index: number, field: keyof WorkoutDay, value: any) => {
        const updatedDays = [...formData.workoutDays];
        updatedDays[index] = {...updatedDays[index], [field]: value};
        setFormData({...formData, workoutDays: updatedDays});
    };

    const addExerciseTarget = (dayIndex: number) => {
        if (availableExercises.length === 0) {
            setError('No exercises available. Please add exercises first.');
            return;
        }

        // Initialize with first muscle group if not set
        const dayKey = `${dayIndex}`;
        if (!selectedMuscleGroupsByDay[dayKey] && muscleGroups.length > 0) {
            setSelectedMuscleGroupsByDay({
                ...selectedMuscleGroupsByDay,
                [dayKey]: muscleGroups[0].name
            });
        }

        const firstExercise = availableExercises[0];
        const newTarget: ExerciseTarget = {
            exercise: {
                id: String(firstExercise.id),
                name: firstExercise.name,
                group: firstExercise.group,
            },
            sets: 3,
            minReps: 8,
            maxReps: 12,
        };

        const updatedDays = [...formData.workoutDays];
        updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            exercises: [...(updatedDays[dayIndex].exercises || []), newTarget],
        };
        setFormData({...formData, workoutDays: updatedDays});
    };

    const getFilteredExercises = (dayIndex: number, exerciseIndex: number): ExerciseDTO[] => {
        const dayKey = `${dayIndex}-${exerciseIndex}`;
        const selectedGroup = selectedMuscleGroupsByDay[dayKey];

        if (!selectedGroup) {
            return availableExercises;
        }

        return availableExercises.filter(ex => ex.group === selectedGroup);
    };

    const handleMuscleGroupChange = (dayIndex: number, exerciseIndex: number, muscleGroup: string) => {
        const dayKey = `${dayIndex}-${exerciseIndex}`;
        setSelectedMuscleGroupsByDay({
            ...selectedMuscleGroupsByDay,
            [dayKey]: muscleGroup
        });

        // Auto-select first exercise of that muscle group
        const filteredExercises = availableExercises.filter(ex => ex.group === muscleGroup);
        if (filteredExercises.length > 0) {
            const firstExercise = filteredExercises[0];
            updateExerciseTarget(dayIndex, exerciseIndex, 'exercise', {
                id: String(firstExercise.id),
                name: firstExercise.name,
                group: firstExercise.group,
            });
        }
    };

    const removeExerciseTarget = (dayIndex: number, exerciseIndex: number) => {
        const updatedDays = [...formData.workoutDays];
        updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            exercises: updatedDays[dayIndex].exercises?.filter((_, i) => i !== exerciseIndex) || [],
        };
        setFormData({...formData, workoutDays: updatedDays});
    };

    const updateExerciseTarget = (
        dayIndex: number,
        exerciseIndex: number,
        field: keyof ExerciseTarget,
        value: any
    ) => {
        const updatedDays = [...formData.workoutDays];
        const exercises = [...(updatedDays[dayIndex].exercises || [])];

        if (field === 'exercise') {
            exercises[exerciseIndex] = {...exercises[exerciseIndex], exercise: value};
        } else {
            exercises[exerciseIndex] = {...exercises[exerciseIndex], [field]: value};
        }

        updatedDays[dayIndex] = {...updatedDays[dayIndex], exercises};
        setFormData({...formData, workoutDays: updatedDays});
    };

    const toggleDayExpansion = (index: number) => {
        setExpandedDayIndex(expandedDayIndex === index ? null : index);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">
                        {plan ? 'Edit Workout Plan' : 'Create Workout Plan'}
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X size={24}/>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Plan Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 1})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration Unit *
                            </label>
                            <select
                                value={formData.durationUnit}
                                onChange={(e) => setFormData({...formData, durationUnit: e.target.value as DurationUnit})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="WEEKS">Weeks</option>
                                <option value="MONTHS">Months</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Set as Active Plan</span>
                            </label>
                        </div>
                    </div>

                    {/* Workout Days */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">Workout Days</h4>
                            <button
                                type="button"
                                onClick={addWorkoutDay}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                <Plus size={16}/>
                                Add Day
                            </button>
                        </div>

                        {formData.workoutDays.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No workout days yet. Click "Add Day" to create one.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.workoutDays.map((day, dayIndex) => (
                                    <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Day Header */}
                                        <div
                                            className="bg-gray-50 p-4 cursor-pointer flex items-center justify-between"
                                            onClick={() => toggleDayExpansion(dayIndex)}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="font-medium text-gray-900">Day {dayIndex + 1}</span>
                                                <input
                                                    type="text"
                                                    value={day.description}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        updateWorkoutDay(dayIndex, 'description', e.target.value);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Day description"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeWorkoutDay(dayIndex);
                                                    }}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={18}/>
                                                </button>
                                                {expandedDayIndex === dayIndex ? (
                                                    <ChevronUp size={20} className="text-gray-400"/>
                                                ) : (
                                                    <ChevronDown size={20} className="text-gray-400"/>
                                                )}
                                            </div>
                                        </div>

                                        {/* Day Exercises (Expanded) */}
                                        {expandedDayIndex === dayIndex && (
                                            <div className="p-4 bg-white space-y-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Exercises</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => addExerciseTarget(dayIndex)}
                                                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                                    >
                                                        <Plus size={14}/>
                                                        Add Exercise
                                                    </button>
                                                </div>

                                                {!day.exercises || day.exercises.length === 0 ? (
                                                    <div className="text-center py-4 text-gray-500 text-sm">
                                                        No exercises yet. Click "Add Exercise" to add one.
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {day.exercises.map((target, exerciseIndex) => {
                                                            // Skip exercises with null exercise data
                                                            if (!target.exercise || !target.exercise.id) {
                                                                return null;
                                                            }

                                                            const dayKey = `${dayIndex}-${exerciseIndex}`;
                                                            const selectedGroup = selectedMuscleGroupsByDay[dayKey] || target.exercise.group;
                                                            const filteredExercises = getFilteredExercises(dayIndex, exerciseIndex);

                                                            // Initialize muscle group if not set
                                                            if (!selectedMuscleGroupsByDay[dayKey]) {
                                                                selectedMuscleGroupsByDay[dayKey] = target.exercise.group;
                                                            }

                                                            return (
                                                                <div
                                                                    key={exerciseIndex}
                                                                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                                                                >
                                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                                        <div className="md:col-span-3">
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                Muscle Group
                                                                            </label>
                                                                            <select
                                                                                value={selectedGroup}
                                                                                onChange={(e) => handleMuscleGroupChange(dayIndex, exerciseIndex, e.target.value)}
                                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            >
                                                                                {muscleGroups.map((mg) => (
                                                                                    <option key={mg.id} value={mg.name}>
                                                                                        {mg.name}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </div>

                                                                        <div className="md:col-span-3">
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                Exercise
                                                                            </label>
                                                                            <select
                                                                                value={target.exercise.id || ''}
                                                                                onChange={(e) => {
                                                                                    const selectedExercise = filteredExercises.find(
                                                                                        ex => String(ex.id) === e.target.value
                                                                                    );
                                                                                    if (selectedExercise) {
                                                                                        updateExerciseTarget(dayIndex, exerciseIndex, 'exercise', {
                                                                                            id: String(selectedExercise.id),
                                                                                            name: selectedExercise.name,
                                                                                            group: selectedExercise.group,
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            >
                                                                                {filteredExercises.length === 0 ? (
                                                                                    <option value="">No exercises available</option>
                                                                                ) : (
                                                                                    filteredExercises.map((ex) => (
                                                                                        <option key={ex.id} value={String(ex.id)}>
                                                                                            {ex.name}
                                                                                        </option>
                                                                                    ))
                                                                                )}
                                                                            </select>
                                                                        </div>

                                                                        <div className="md:col-span-2">
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                Sets
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                value={target.sets}
                                                                                onChange={(e) =>
                                                                                    updateExerciseTarget(
                                                                                        dayIndex,
                                                                                        exerciseIndex,
                                                                                        'sets',
                                                                                        parseInt(e.target.value) || 1
                                                                                    )
                                                                                }
                                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        </div>

                                                                        <div className="md:col-span-2">
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                Min Reps
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                value={target.minReps}
                                                                                onChange={(e) =>
                                                                                    updateExerciseTarget(
                                                                                        dayIndex,
                                                                                        exerciseIndex,
                                                                                        'minReps',
                                                                                        parseInt(e.target.value) || 1
                                                                                    )
                                                                                }
                                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        </div>

                                                                        <div className="md:col-span-2">
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                Max Reps
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                value={target.maxReps}
                                                                                onChange={(e) =>
                                                                                    updateExerciseTarget(
                                                                                        dayIndex,
                                                                                        exerciseIndex,
                                                                                        'maxReps',
                                                                                        parseInt(e.target.value) || 1
                                                                                    )
                                                                                }
                                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        </div>

                                                                        <div className="flex items-end">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeExerciseTarget(dayIndex, exerciseIndex)}
                                                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                                            >
                                                                                <Trash2 size={16}/>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading || formData.workoutDays.length === 0}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
