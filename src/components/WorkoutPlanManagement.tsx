/**
 * Workout Plan Management Component
 * Interface for managing workout plans (user-scoped)
 */

import {useEffect, useState} from 'react';
import {ArrowLeft, Calendar, ChevronDown, ChevronUp, Pencil, Plus, Trash2} from 'lucide-react';
import {useWorkoutPlanService} from '../hooks';
import WorkoutPlanForm from './WorkoutPlanForm';
import type {User, WorkoutPlan} from '../domain/models';

interface WorkoutPlanManagementProps {
    user: User;
    onNavigateBack: () => void;
}

export default function WorkoutPlanManagement({user, onNavigateBack}: WorkoutPlanManagementProps) {
    const workoutPlanService = useWorkoutPlanService();
    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<WorkoutPlan | undefined>(undefined);

    useEffect(() => {
        loadWorkoutPlans();
    }, []);

    const loadWorkoutPlans = async () => {
        setLoading(true);
        setError(null);

        const result = await workoutPlanService.getAllWorkoutPlans(user.id);
        if (result.success) {
            setWorkoutPlans(result.data);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const togglePlanDetails = (planId: string) => {
        setExpandedPlanId(expandedPlanId === planId ? null : planId);
    };

    const handleCreate = () => {
        setEditingPlan(undefined);
        setShowForm(true);
    };

    const handleEdit = (plan: WorkoutPlan, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPlan(plan);
        setShowForm(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this workout plan?')) {
            return;
        }

        const result = await workoutPlanService.deleteWorkoutPlan(user.id, id);
        if (result.success) {
            setWorkoutPlans(workoutPlans.filter((p) => p.id !== id));
        } else {
            setError(result.error);
        }
    };

    const handleFormSubmit = async (planData: Omit<WorkoutPlan, 'id'>) => {
        if (editingPlan && editingPlan.id) {
            // Update existing
            const result = await workoutPlanService.updateWorkoutPlan(user.id, editingPlan.id, {
                ...planData,
                id: editingPlan.id,
            });
            if (result.success) {
                setWorkoutPlans(workoutPlans.map((p) => (p.id === editingPlan.id ? result.data : p)));
                setShowForm(false);
            } else {
                throw new Error(result.error);
            }
        } else {
            // Create new
            const result = await workoutPlanService.createWorkoutPlan(user.id, planData as WorkoutPlan);
            if (result.success) {
                setWorkoutPlans([...workoutPlans, result.data]);
                setShowForm(false);
            } else {
                throw new Error(result.error);
            }
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingPlan(undefined);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading workout plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onNavigateBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Back to home"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-700"/>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <Calendar className="w-6 h-6 text-white" strokeWidth={2.5}/>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">My Workout Plans</h1>
                            </div>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20}/>
                            Create Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {workoutPlans.length === 0 && !error && (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Workout Plans Yet</h3>
                        <p className="text-gray-500">
                            You don't have any workout plans yet. Create one to get started!
                        </p>
                    </div>
                )}

                {/* Workout Plans List */}
                {workoutPlans.length > 0 && (
                    <div className="space-y-4">
                        {workoutPlans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Plan Header */}
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => plan.id && togglePlanDetails(plan.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                                {plan.isActive && (
                                                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            Active
                          </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4"/>
                            {plan.duration} {plan.durationUnit.toLowerCase()}
                        </span>
                                                <span>
                          {plan.workoutDays?.length || 0} workout{' '}
                                                    {(plan.workoutDays?.length || 0) === 1 ? 'day' : 'days'}
                        </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => handleEdit(plan, e)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit plan"
                                            >
                                                <Pencil size={18}/>
                                            </button>
                                            <button
                                                onClick={(e) => plan.id && handleDelete(plan.id, e)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete plan"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                            {expandedPlanId === plan.id ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400"/>
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400"/>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Plan Details (Expanded) */}
                                {expandedPlanId === plan.id && plan.workoutDays && plan.workoutDays.length > 0 && (
                                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">Workout Days:</h4>
                                        <div className="space-y-4">
                                            {plan.workoutDays.map((day, dayIndex) => (
                                                <div key={day.id || dayIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                                    <h5 className="font-medium text-gray-900 mb-3">{day.description}</h5>
                                                    {day.exercises && day.exercises.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {day.exercises.map((target, exIndex) => {
                                                                // Skip if exercise is null or undefined
                                                                if (!target.exercise) {
                                                                    return null;
                                                                }
                                                                return (
                                                                    <div
                                                                        key={target.id || exIndex}
                                                                        className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-b-0"
                                                                    >
                                                                        <div className="flex-1">
                                      <span className="font-medium text-gray-900">
                                        {target.exercise.name}
                                      </span>
                                                                            <span className="text-gray-500 ml-2">
                                        ({target.exercise.group})
                                      </span>
                                                                        </div>
                                                                        <div className="text-gray-600">
                                                                            {target.sets} sets × {target.minReps}-{target.maxReps} reps
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 italic">No exercises added</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <WorkoutPlanForm
                    plan={editingPlan}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}
        </div>
    );
}
