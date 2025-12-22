import React from 'react';
import type { ExerciseLogEntry } from '../domain/models';
import { format, formatDistanceToNow, parse } from 'date-fns';
import { Clock, Dumbbell, TrendingUp, AlertCircle } from 'lucide-react';

interface LatestLogDisplayProps {
  latestLog: ExerciseLogEntry | null;
  isLoading: boolean;
}

const LatestLogDisplay: React.FC<LatestLogDisplayProps> = ({ latestLog, isLoading }) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-700">Loading latest log...</p>
        </div>
      </div>
    );
  }

  // No logs state
  if (!latestLog) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-gray-400" />
          <p className="text-sm text-gray-600">No previous logs for this exercise</p>
        </div>
      </div>
    );
  }

  // Display log data
  // Parse timestamp - backend sends in "dd/MM/yyyy HH:mm:ss" format
  let logDate: Date;
  let relativeTime: string;
  let absoluteDate: string;
  
  try {
    // Try parsing as dd/MM/yyyy HH:mm:ss format from backend
    if (latestLog.timestamp.includes('/')) {
      logDate = parse(latestLog.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
    } else {
      // Fallback to ISO format
      logDate = new Date(latestLog.timestamp);
    }
    
    // Validate date
    if (isNaN(logDate.getTime())) {
      throw new Error('Invalid date');
    }
    
    relativeTime = formatDistanceToNow(logDate, { addSuffix: true });
    absoluteDate = format(logDate, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Failed to parse timestamp:', latestLog.timestamp, error);
    // Fallback to showing raw timestamp
    relativeTime = 'recently';
    absoluteDate = latestLog.timestamp;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">Latest Log</h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock className="w-3.5 h-3.5" />
          <span>{relativeTime}</span>
        </div>
      </div>

      {/* Date */}
      <p className="text-xs text-gray-500 mb-3">{absoluteDate}</p>

      {/* Sets */}
      <div className="space-y-2 mb-3">
        {latestLog.sets.map((set, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-blue-100"
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {index + 1}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{set.weight} kg</span>
              <span className="text-gray-400">×</span>
              <span className="font-medium text-gray-900">{set.reps} reps</span>
            </div>
          </div>
        ))}
      </div>

      {/* Failure indicator */}
      {latestLog.failure && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <Dumbbell className="w-4 h-4 text-red-600" />
          <span className="text-xs font-medium text-red-700">Trained to failure</span>
        </div>
      )}
    </div>
  );
};

export default LatestLogDisplay;
