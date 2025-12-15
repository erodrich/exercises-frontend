import { useState } from 'react';
import Home from './components/Home';
import ExerciseLogForm from './components/ExerciseLogForm';

type Screen = 'home' | 'log';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const navigateToLog = () => setCurrentScreen('log');
  const navigateToHome = () => setCurrentScreen('home');

  return (
    <div className="App">
      {currentScreen === 'home' ? (
        <Home onNavigateToLog={navigateToLog} />
      ) : (
        <ExerciseLogForm onNavigateBack={navigateToHome} />
      )}
    </div>
  )
}

export default App
