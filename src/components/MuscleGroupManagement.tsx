/**
 * Muscle Group Management Component
 * CRUD interface for managing muscle groups (admin only)
 */

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, AlertCircle } from 'lucide-react';
import { useAdminMuscleGroupService } from '../hooks';
import type { MuscleGroup } from '../types/exercise';
import type { CreateMuscleGroupRequest } from '../services/adminMuscleGroupService';

interface FormData {
  name: string;
  description: string;
}

export default function MuscleGroupManagement() {
  const adminService = useAdminMuscleGroupService();
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadMuscleGroups();
  }, []);

  const loadMuscleGroups = async () => {
    setLoading(true);
    setError(null);
    const result = await adminService.getAllMuscleGroups();
    if (result.success) {
      setMuscleGroups(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  const handleEdit = (muscleGroup: MuscleGroup) => {
    setEditingId(muscleGroup.id);
    setFormData({
      name: muscleGroup.name,
      description: muscleGroup.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete muscle group "${name}"?\n\nNote: You cannot delete muscle groups that are referenced by exercises.`)) {
      return;
    }

    const result = await adminService.deleteMuscleGroup(id);
    if (result.success) {
      setMuscleGroups(muscleGroups.filter((mg) => mg.id !== id));
      setError(null);
    } else {
      setError(result.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data: CreateMuscleGroupRequest = {
      name: formData.name.trim().toUpperCase(),
      description: formData.description.trim() || undefined,
    };

    if (editingId) {
      // Update existing
      const result = await adminService.updateMuscleGroup(editingId, data);
      if (result.success) {
        setMuscleGroups(
          muscleGroups.map((mg) => (mg.id === editingId ? result.data : mg))
        );
        setShowForm(false);
      } else {
        setError(result.error);
      }
    } else {
      // Create new
      const result = await adminService.createMuscleGroup(data);
      if (result.success) {
        setMuscleGroups([...muscleGroups, result.data]);
        setShowForm(false);
      } else {
        setError(result.error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Muscle Group Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage muscle group categories for exercise organization
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Muscle Group
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
        <strong>Note:</strong> Muscle groups that are referenced by exercises cannot be deleted. 
        You must first delete or reassign all exercises in that group.
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingId ? 'Edit Muscle Group' : 'Add Muscle Group'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., CHEST, BACK, CORE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={2}
                  maxLength={50}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name will be automatically converted to uppercase
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this muscle group"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/255 characters
                </p>
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

      {/* Muscle Groups Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {muscleGroups.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No muscle groups found. Click "Add Muscle Group" to create one.
                </td>
              </tr>
            ) : (
              muscleGroups.map((muscleGroup) => (
                <tr key={muscleGroup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {muscleGroup.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {muscleGroup.description || (
                        <span className="italic text-gray-400">No description</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(muscleGroup)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(muscleGroup.id, muscleGroup.name)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          <strong>Total Muscle Groups:</strong> {muscleGroups.length}
        </div>
      </div>
    </div>
  );
}
