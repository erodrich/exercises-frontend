/**
 * Exercise Logs Page Component
 * Displays all exercise logs for the authenticated user
 */

import {useEffect, useState} from 'react';
import {ArrowLeft, Calendar, Dumbbell, Filter, RefreshCw} from 'lucide-react';
import type {ExerciseLogEntry, User} from '../domain/models';
import {useExerciseService} from '../hooks';

interface ExerciseLogsPageProps {
    user: User;
    onNavigateBack: () => void;
}

export default function ExerciseLogsPage({user, onNavigateBack}: ExerciseLogsPageProps) {
    const exerciseService = useExerciseService();
    const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterGroup, setFilterGroup] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        console.log('🔄 Loading exercise logs for user:', user);
        const exerciseLogs = await exerciseService.loadExercises();
        console.log('✅ Loaded exercise logs:', exerciseLogs);
        console.log('📊 Total logs:', exerciseLogs.length);
        if (exerciseLogs.length > 0) {
            console.log('🕐 First log timestamp:', exerciseLogs[0]?.timestamp);
            console.log('🏋️ First log exercise:', exerciseLogs[0]?.exercise?.name);
        }
        setLogs(exerciseLogs);
        setLoading(false);
    };

    /**
     * Parse timestamp handling multiple formats
     * - ISO 8601: 2025-12-18T20:40:22
     * - DD/MM/YYYY HH:mm:ss: 15/12/2025 20:40:22 (legacy format)
     * - MM/DD/YYYY HH:mm:ss: 12/15/2025 20:40:22
     */
    const parseTimestamp = (timestamp: string): Date => {
        if (!timestamp) {
            return new Date();
        }

        // Try ISO 8601 format first (e.g., 2025-12-18T20:40:22)
        let date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date;
        }

        // Try parsing DD/MM/YYYY HH:mm:ss format
        const ddmmyyyyMatch = timestamp.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
        if (ddmmyyyyMatch) {
            const [, day, month, year, hour, minute, second] = ddmmyyyyMatch;
            // JavaScript Date: month is 0-indexed
            date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hour),
                parseInt(minute),
                parseInt(second)
            );
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        // Try parsing MM/DD/YYYY HH:mm:ss format
        const mmddyyyyMatch = timestamp.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
        if (mmddyyyyMatch) {
            const [, month, day, year, hour, minute, second] = mmddyyyyMatch;
            date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hour),
                parseInt(minute),
                parseInt(second)
            );
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        console.error('Failed to parse timestamp:', timestamp);
        return new Date();
    };

    // Get unique muscle groups for filtering
    const uniqueGroups = logs.map(log => log.exercise.group);
    const muscleGroups = ['ALL', ...Array.from(new Set(uniqueGroups))];

    // Filter and sort logs
    const filteredLogs = logs
        .filter(log => filterGroup === 'ALL' || log.exercise.group === filterGroup)
        .sort((a, b) => {
            if (sortBy === 'date-desc') {
                return parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime();
            } else {
                return parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime();
            }
        });

    // Calculate statistics
    const totalWorkouts = logs.length;
    const totalSets = logs.reduce((sum, log) => sum + log.sets.length, 0);

    const formatDate = (timestamp: string) => {
        if (!timestamp) {
            console.warn('formatDate: timestamp is undefined or null');
            return 'No date';
        }
        const date = parseTimestamp(timestamp);
        if (isNaN(date.getTime())) {
            console.error('formatDate: Invalid date from timestamp:', timestamp);
            return 'Invalid date';
        }
        return date.toLocaleDateString('en-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timestamp: string) => {
        if (!timestamp) {
            console.warn('formatTime: timestamp is undefined or null');
            return 'No time';
        }
        const date = parseTimestamp(timestamp);
        if (isNaN(date.getTime())) {
            console.error('formatTime: Invalid date from timestamp:', timestamp);
            return 'Invalid time';
        }
        return date.toLocaleTimeString('en-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onNavigateBack}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                title="Back to Home"
                            >
                                <ArrowLeft size={24}/>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Exercise Logs</h1>
                                <p className="text-sm text-gray-600">{user.username}'s workout history (User ID: {user.id})</p>
                            </div>
                        </div>
                        <button
                            onClick={loadLogs}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh logs"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
                            <span className="text-sm font-medium">Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Calendar className="w-6 h-6 text-blue-600"/>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{totalWorkouts}</div>
                                <div className="text-sm text-gray-600">Total Workouts</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-3 rounded-full">
                                <Dumbbell className="w-6 h-6 text-green-600"/>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{totalSets}</div>
                                <div className="text-sm text-gray-600">Total Sets</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Sort */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500"/>
                            <span className="text-sm font-medium text-gray-700">Filter by:</span>
                            <select
                                value={filterGroup}
                                onChange={(e) => setFilterGroup(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {muscleGroups.map((group) => (
                                    <option key={group} value={group}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercise Logs List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {filteredLogs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No workouts yet</h3>
                        <p className="text-gray-600">
                            {logs.length === 0
                                ? "Start logging your workouts to see them here!"
                                : "No workouts found with the selected filter."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLogs.map((log, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                            >
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    {/* Exercise Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {log.exercise.group}
                      </span>
                                            {log.failure && (
                                                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          To Failure
                        </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {log.exercise.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {log.timestamp ? (
                                                <>
                                                    {formatDate(log.timestamp)} at {formatTime(log.timestamp)}
                                                </>
                                            ) : (
                                                <span className="text-red-500">No timestamp available</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Sets Info */}
                                    <div className="flex-1">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-700">
                                                Sets ({log.sets.length}):
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {log.sets.map((set, setIndex) => (
                                                    <span
                                                        key={setIndex}
                                                        className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-lg"
                                                    >
                            {set.weight} kg × {set.reps} reps
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
