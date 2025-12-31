/**
 * Exercise Management Component
 * CRUD interface for managing exercises (admin only)
 */

import {useEffect, useState} from 'react';
import {Pencil, Plus, Trash2, X} from 'lucide-react';
import type {ExerciseWithId} from '../hooks';
import {useAdminService, useMuscleGroupService} from '../hooks';
import type {Exercise, MuscleGroup} from '../domain';

interface ExerciseFormData {
    name: string;
    group: string;
}

export default function ExerciseManagement() {
    const adminService = useAdminService();
    const muscleGroupService = useMuscleGroupService();
    const [exercises, setExercises] = useState<ExerciseWithId[]>([]);
    const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ExerciseFormData>({
        name: '',
        group: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        // Load muscle groups first
        const mgResult = await muscleGroupService.getAllMuscleGroups();
        if (mgResult.success) {
            setMuscleGroups(mgResult.data);
            // Set default group to first muscle group
            if (mgResult.data.length > 0) {
                setFormData(prev => ({...prev, group: mgResult.data[0].name}));
            }
        } else {
            setError(mgResult.error);
        }

        // Load exercises
        const exResult = await adminService.getAllExercises();
        if (exResult.success) {
            setExercises(exResult.data);
        } else {
            setError(exResult.error);
        }

        setLoading(false);
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({name: '', group: muscleGroups.length > 0 ? muscleGroups[0].name : ''});
        setShowForm(true);
    };

    const handleEdit = (exercise: ExerciseWithId) => {
        setEditingId(exercise.id);
        setFormData({name: exercise.name, group: exercise.group});
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exercise?')) {
            return;
        }

        const result = await adminService.deleteExercise(id);
        if (result.success) {
            setExercises(exercises.filter((e) => e.id !== id));
        } else {
            setError(result.error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const exercise: Exercise = {
            name: formData.name.trim(),
            group: formData.group,
        };

        if (editingId) {
            // Update existing
            const result = await adminService.updateExercise(editingId, exercise);
            if (result.success) {
                setExercises(exercises.map((e) => (e.id === editingId ? result.data : e)));
                setShowForm(false);
            } else {
                setError(result.error);
            }
        } else {
            // Create new
            const result = await adminService.createExercise(exercise);
            if (result.success) {
                setExercises([...exercises, result.data]);
                setShowForm(false);
            } else {
                setError(result.error);
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({name: '', group: muscleGroups.length > 0 ? muscleGroups[0].name : ''});
        setError(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Exercise Management</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20}/>
                    Add Exercise
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {editingId ? 'Edit Exercise' : 'Add Exercise'}
                            </h3>
                            <button
                                onClick={handleCancel}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exercise Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({...formData, name: e.target.value})
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Muscle Group
                                </label>
                                <select
                                    value={formData.group}
                                    onChange={(e) =>
                                        setFormData({...formData, group: e.target.value})
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={muscleGroups.length === 0}
                                >
                                    {muscleGroups.length === 0 ? (
                                        <option value="">No muscle groups available</option>
                                    ) : (
                                        muscleGroups.map((group) => (
                                            <option key={group.id} value={group.name}>
                                                {group.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingId ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Exercise Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Exercise Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Muscle Group
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {exercises.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                No exercises found. Click "Add Exercise" to create one.
                            </td>
                        </tr>
                    ) : (
                        exercises.map((exercise) => (
                            <tr key={exercise.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {exercise.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {exercise.group}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(exercise)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                        title="Edit"
                                    >
                                        <Pencil size={18}/>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(exercise.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
