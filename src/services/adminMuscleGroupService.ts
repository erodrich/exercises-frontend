/**
 * Admin Muscle Group Service
 * Handles admin operations for managing muscle groups (CRUD)
 * Requires ADMIN role authentication
 */

import type {MuscleGroup, Result} from '../domain/models';
import API_CONFIG from '../config/api';

export interface CreateMuscleGroupRequest {
    name: string;
    description?: string;
}

export interface UpdateMuscleGroupRequest {
    name: string;
    description?: string;
}

export interface AdminMuscleGroupService {
    getAllMuscleGroups(): Promise<Result<MuscleGroup[]>>;

    getMuscleGroupById(id: number): Promise<Result<MuscleGroup>>;

    createMuscleGroup(data: CreateMuscleGroupRequest): Promise<Result<MuscleGroup>>;

    updateMuscleGroup(id: number, data: UpdateMuscleGroupRequest): Promise<Result<MuscleGroup>>;

    deleteMuscleGroup(id: number): Promise<Result<void>>;
}

/**
 * HTTP-based admin muscle group service
 */
export class HttpAdminMuscleGroupService implements AdminMuscleGroupService {
    private readonly baseUrl: string;
    private readonly getToken: () => string | null;

    constructor(baseUrl: string = API_CONFIG.baseURL, getToken: () => string | null) {
        this.baseUrl = baseUrl;
        this.getToken = getToken;
    }

    private async fetchWithAuth<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<Result<T>> {
        const token = this.getToken();
        if (!token) {
            return {success: false, error: 'No authentication token'};
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    return {success: false, error: 'Access denied. Admin role required.'};
                }
                if (response.status === 404) {
                    return {success: false, error: 'Muscle group not found'};
                }
                if (response.status === 409) {
                    // Parse error message from response
                    try {
                        const errorData = await response.json();
                        return {success: false, error: errorData.error || 'Conflict error'};
                    } catch {
                        return {success: false, error: 'Conflict: Muscle group already exists or cannot be deleted'};
                    }
                }
                return {success: false, error: `Server error: ${response.status}`};
            }

            // For DELETE operations, return void
            if (response.status === 204) {
                return {success: true, data: undefined as T};
            }

            const data = await response.json();
            return {success: true, data};
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    async getAllMuscleGroups(): Promise<Result<MuscleGroup[]>> {
        return this.fetchWithAuth<MuscleGroup[]>('/api/v1/admin/muscle-groups');
    }

    async getMuscleGroupById(id: number): Promise<Result<MuscleGroup>> {
        return this.fetchWithAuth<MuscleGroup>(`/api/v1/admin/muscle-groups/${id}`);
    }

    async createMuscleGroup(data: CreateMuscleGroupRequest): Promise<Result<MuscleGroup>> {
        return this.fetchWithAuth<MuscleGroup>('/api/v1/admin/muscle-groups', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateMuscleGroup(
        id: number,
        data: UpdateMuscleGroupRequest
    ): Promise<Result<MuscleGroup>> {
        return this.fetchWithAuth<MuscleGroup>(`/api/v1/admin/muscle-groups/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteMuscleGroup(id: number): Promise<Result<void>> {
        return this.fetchWithAuth<void>(`/api/v1/admin/muscle-groups/${id}`, {
            method: 'DELETE',
        });
    }
}

/**
 * Mock admin muscle group service for development/testing
 */
export class MockAdminMuscleGroupService implements AdminMuscleGroupService {
    private muscleGroups: MuscleGroup[] = [
        {id: 1, name: 'CHEST', description: 'Chest exercises for pectoral muscles'},
        {id: 2, name: 'BACK', description: 'Back exercises for latissimus dorsi'},
        {id: 3, name: 'SHOULDERS', description: 'Shoulder exercises for deltoid muscles'},
        {id: 4, name: 'LEGS', description: 'Leg exercises for quadriceps and hamstrings'},
        {id: 5, name: 'BICEPS', description: 'Bicep exercises for biceps brachii'},
        {id: 6, name: 'TRICEPS', description: 'Tricep exercises for triceps brachii'},
    ];
    private nextId = 7;

    async getAllMuscleGroups(): Promise<Result<MuscleGroup[]>> {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {success: true, data: [...this.muscleGroups]};
    }

    async getMuscleGroupById(id: number): Promise<Result<MuscleGroup>> {
        await new Promise(resolve => setTimeout(resolve, 100));
        const muscleGroup = this.muscleGroups.find((mg) => mg.id === id);
        if (!muscleGroup) {
            return {success: false, error: 'Muscle group not found'};
        }
        return {success: true, data: muscleGroup};
    }

    async createMuscleGroup(data: CreateMuscleGroupRequest): Promise<Result<MuscleGroup>> {
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check for duplicate name
        const exists = this.muscleGroups.some(
            (mg) => mg.name.toUpperCase() === data.name.toUpperCase()
        );
        if (exists) {
            return {success: false, error: 'Muscle group with this name already exists'};
        }

        const newMuscleGroup: MuscleGroup = {
            id: this.nextId++,
            name: data.name.toUpperCase(),
            description: data.description,
        };
        this.muscleGroups.push(newMuscleGroup);
        return {success: true, data: newMuscleGroup};
    }

    async updateMuscleGroup(
        id: number,
        data: UpdateMuscleGroupRequest
    ): Promise<Result<MuscleGroup>> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const index = this.muscleGroups.findIndex((mg) => mg.id === id);
        if (index === -1) {
            return {success: false, error: 'Muscle group not found'};
        }

        // Check for duplicate name (excluding current)
        const exists = this.muscleGroups.some(
            (mg) => mg.id !== id && mg.name.toUpperCase() === data.name.toUpperCase()
        );
        if (exists) {
            return {success: false, error: 'Muscle group with this name already exists'};
        }

        const updated: MuscleGroup = {
            id,
            name: data.name.toUpperCase(),
            description: data.description,
        };
        this.muscleGroups[index] = updated;
        return {success: true, data: updated};
    }

    async deleteMuscleGroup(id: number): Promise<Result<void>> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const index = this.muscleGroups.findIndex((mg) => mg.id === id);
        if (index === -1) {
            return {success: false, error: 'Muscle group not found'};
        }

        // Simulate referential integrity check (don't allow deleting first 3)
        if (id <= 3) {
            return {
                success: false,
                error: 'Cannot delete muscle group because it is referenced by exercises',
            };
        }

        this.muscleGroups.splice(index, 1);
        return {success: true, data: undefined};
    }
}
