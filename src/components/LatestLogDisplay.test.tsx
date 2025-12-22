import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LatestLogDisplay from './LatestLogDisplay';
import type { ExerciseLogEntry } from '../domain/models';

describe('LatestLogDisplay', () => {
  it('should display loading state', () => {
    render(<LatestLogDisplay latestLog={null} isLoading={true} />);
    
    expect(screen.getByText('Loading latest log...')).toBeInTheDocument();
  });

  it('should display empty state when no logs exist', () => {
    render(<LatestLogDisplay latestLog={null} isLoading={false} />);
    
    expect(screen.getByText('No previous logs for this exercise')).toBeInTheDocument();
  });

  it('should display log data when log exists', () => {
    const log: ExerciseLogEntry = {
      timestamp: '22/12/2025 14:30:00',
      exercise: {
        group: 'CHEST',
        name: 'Bench Press',
      },
      sets: [
        { weight: 60, reps: 10 },
        { weight: 65, reps: 8 },
        { weight: 55, reps: 12 },
      ],
      failure: false,
    };

    render(<LatestLogDisplay latestLog={log} isLoading={false} />);
    
    expect(screen.getByText('Latest Log')).toBeInTheDocument();
    expect(screen.getByText('60 kg')).toBeInTheDocument();
    expect(screen.getByText('10 reps')).toBeInTheDocument();
    expect(screen.getByText('65 kg')).toBeInTheDocument();
    expect(screen.getByText('8 reps')).toBeInTheDocument();
    expect(screen.getByText('55 kg')).toBeInTheDocument();
    expect(screen.getByText('12 reps')).toBeInTheDocument();
  });

  it('should display all sets in order', () => {
    const log: ExerciseLogEntry = {
      timestamp: '22/12/2025 14:30:00',
      exercise: {
        group: 'CHEST',
        name: 'Bench Press',
      },
      sets: [
        { weight: 60, reps: 10 },
        { weight: 65, reps: 8 },
        { weight: 70, reps: 6 },
      ],
      failure: false,
    };

    render(<LatestLogDisplay latestLog={log} isLoading={false} />);
    
    // Check set numbers are displayed
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display failure indicator when failure is true', () => {
    const log: ExerciseLogEntry = {
      timestamp: '22/12/2025 14:30:00',
      exercise: {
        group: 'CHEST',
        name: 'Bench Press',
      },
      sets: [
        { weight: 60, reps: 10 },
      ],
      failure: true,
    };

    render(<LatestLogDisplay latestLog={log} isLoading={false} />);
    
    expect(screen.getByText('Trained to failure')).toBeInTheDocument();
  });

  it('should not display failure indicator when failure is false', () => {
    const log: ExerciseLogEntry = {
      timestamp: '22/12/2025 14:30:00',
      exercise: {
        group: 'CHEST',
        name: 'Bench Press',
      },
      sets: [
        { weight: 60, reps: 10 },
      ],
      failure: false,
    };

    render(<LatestLogDisplay latestLog={log} isLoading={false} />);
    
    expect(screen.queryByText('Trained to failure')).not.toBeInTheDocument();
  });

  it('should handle ISO format timestamps', () => {
    const log: ExerciseLogEntry = {
      timestamp: '2025-12-22T14:30:00.000Z',
      exercise: {
        group: 'CHEST',
        name: 'Bench Press',
      },
      sets: [
        { weight: 60, reps: 10 },
      ],
      failure: false,
    };

    render(<LatestLogDisplay latestLog={log} isLoading={false} />);
    
    expect(screen.getByText('Latest Log')).toBeInTheDocument();
    expect(screen.getByText('60 kg')).toBeInTheDocument();
  });

  it('should handle invalid timestamps gracefully', () => {
    const log: ExerciseLogEntry = {
      timestamp: 'invalid-date',
      exercise: {
        group: 'CHEST',
        name: 'Bench Press',
      },
      sets: [
        { weight: 60, reps: 10 },
      ],
      failure: false,
    };

    render(<LatestLogDisplay latestLog={log} isLoading={false} />);
    
    // Should still display the component
    expect(screen.getByText('Latest Log')).toBeInTheDocument();
    expect(screen.getByText('recently')).toBeInTheDocument();
  });

  it('should display empty log with no sets', () => {
    const log: ExerciseLogEntry = {
      timestamp: '22/12/2025 14:30:00',
      exercise: {
        group: 'CHEST',
        name: 'Bench Press',
      },
      sets: [],
      failure: false,
    };

    render(<LatestLogDisplay latestLog={log} isLoading={false} />);
    
    expect(screen.getByText('Latest Log')).toBeInTheDocument();
    // No sets should be displayed
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});
