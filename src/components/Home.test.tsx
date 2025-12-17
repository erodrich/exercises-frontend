import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import Home from './Home';

describe('Home Component', () => {
  it('should render the home page', () => {
    render(<Home onNavigateToLog={() => {}} />);
    
    expect(screen.getByText('Exercise Tracker')).toBeInTheDocument();
    expect(screen.getByText(/track your workouts/i)).toBeInTheDocument();
  });

  it('should display the dumbbell icon', () => {
    render(<Home onNavigateToLog={() => {}} />);
    
    // Lucide icons render as SVGs
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should display Log New Workout button', () => {
    render(<Home onNavigateToLog={() => {}} />);
    
    const button = screen.getByRole('button', { name: /log new workout/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onNavigateToLog when button clicked', async () => {
    const user = userEvent.setup();
    const onNavigateToLog = vi.fn();
    
    render(<Home onNavigateToLog={onNavigateToLog} />);
    
    const button = screen.getByRole('button', { name: /log new workout/i });
    await user.click(button);
    
    expect(onNavigateToLog).toHaveBeenCalledTimes(1);
  });

  it('should display stat cards with zero values', () => {
    render(<Home onNavigateToLog={() => {}} />);
    
    // Should show 3 stat cards with 0 values
    const statValues = screen.getAllByText('0');
    expect(statValues).toHaveLength(3);
    
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Exercises')).toBeInTheDocument();
    expect(screen.getByText('Total Sets')).toBeInTheDocument();
  });

  it('should have responsive layout classes', () => {
    const { container } = render(<Home onNavigateToLog={() => {}} />);
    
    // Check for responsive container
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });
});
