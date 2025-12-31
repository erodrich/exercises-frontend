/**
 * Muscle Group Service
 * Handles public operations for fetching muscle groups
 * These endpoints do not require authentication
 */

import type {MuscleGroup, Result} from '../domain/models';
import API_CONFIG from '../config/api';

export interface MuscleGroupService {
    getAllMuscleGroups(): Promise<Result<MuscleGroup[]>>;

    getMuscleGroupById(id: number): Promise<Result<MuscleGroup>>;

    getMuscleGroupByName(name: string): Promise<Result<MuscleGroup>>;
}

/**
 * HTTP-based muscle group service (public endpoints, no auth required)
 */
export class HttpMuscleGroupService implements MuscleGroupService {
    private readonly baseUrl: string;

    constructor(baseUrl: string = API_CONFIG.baseURL) {
        this.baseUrl = baseUrl;
    }

    private async fetchPublic<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<Result<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return {success: false, error: 'Muscle group not found'};
                }
                return {success: false, error: `Server error: ${response.status}`};
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
        return this.fetchPublic<MuscleGroup[]>('/api/v1/muscle-groups');
    }

    async getMuscleGroupById(id: number): Promise<Result<MuscleGroup>> {
        return this.fetchPublic<MuscleGroup>(`/api/v1/muscle-groups/${id}`);
    }

    async getMuscleGroupByName(name: string): Promise<Result<MuscleGroup>> {
        return this.fetchPublic<MuscleGroup>(`/api/v1/muscle-groups/by-name/${name}`);
    }
}

/**
 * Mock muscle group service for development/testing
 */
export class MockMuscleGroupService implements MuscleGroupService {
    private muscleGroups: MuscleGroup[] = [
        {id: 1, name: 'CHEST', description: 'Chest exercises for pectoral muscles'},
        {id: 2, name: 'BACK', description: 'Back exercises for latissimus dorsi'},
        {id: 3, name: 'SHOULDERS', description: 'Shoulder exercises for deltoid muscles'},
        {id: 4, name: 'LEGS', description: 'Leg exercises for quadriceps and hamstrings'},
        {id: 5, name: 'BICEPS', description: 'Bicep exercises for biceps brachii'},
        {id: 6, name: 'TRICEPS', description: 'Tricep exercises for triceps brachii'},
    ];

    async getAllMuscleGroups(): Promise<Result<MuscleGroup[]>> {
        // Simulate network delay
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

    async getMuscleGroupByName(name: string): Promise<Result<MuscleGroup>> {
        await new Promise(resolve => setTimeout(resolve, 100));
        const muscleGroup = this.muscleGroups.find(
            (mg) => mg.name.toUpperCase() === name.toUpperCase()
        );
        if (!muscleGroup) {
            return {success: false, error: 'Muscle group not found'};
        }
        return {success: true, data: muscleGroup};
    }
}
