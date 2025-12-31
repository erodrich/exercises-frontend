/**
 * Workout Plan Target Display Component
 * Shows the target sets and reps from the active workout plan for the selected exercise
 */

import React from 'react';
import {AlertCircle, Calendar, Dumbbell, Target} from 'lucide-react';
import type {ExerciseTarget} from '../domain';

interface ExerciseTargetWithDay extends ExerciseTarget {
    dayDescription: string;
}

interface WorkoutPlanTargetDisplayProps {
    targets: ExerciseTargetWithDay[];
    isLoading: boolean;
}

const WorkoutPlanTargetDisplay: React.FC<WorkoutPlanTargetDisplayProps> = ({
                                                                               targets,
                                                                               isLoading
                                                                           }) => {
    // Loading state
    if (isLoading) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <p className="text-sm text-green-700">Loading workout plan...</p>
                </div>
            </div>
        );
    }

    // No targets state
    if (targets.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400"/>
                    <p className="text-sm text-gray-600">No workout plan target for this exercise</p>
                </div>
            </div>
        );
    }

    // Display targets
    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-600 rounded-lg">
                        <Target className="w-4 h-4 text-white"/>
                    </div>
                    <h4 className="font-semibold text-gray-900">Workout Plan Target</h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5"/>
                    <span>Active Plan</span>
                </div>
            </div>

            {/* Targets */}
            <div className="space-y-2">
                {targets.map((target, index) => (
                    <div
                        key={target.id || index}
                        className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-green-100"
                    >
                        <div
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            {index + 1}
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-green-700">{target.dayDescription}:</span>
                                <Dumbbell className="w-4 h-4 text-green-600"/>
                                <span className="font-medium text-gray-900">{target.sets} sets</span>
                                <span className="text-gray-400">×</span>
                                <span className="font-medium text-gray-900">
                  {target.minReps === target.maxReps
                      ? `${target.minReps} reps`
                      : `${target.minReps}-${target.maxReps} reps`
                  }
                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info note */}
            {targets.length > 1 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-gray-600">
                        This exercise appears <span className="font-semibold">{targets.length} times</span> in your active plan
                    </p>
                </div>
            )}
        </div>
    );
};

export default WorkoutPlanTargetDisplay;
