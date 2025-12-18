import { useState } from 'react';
import { useAuth } from './hooks';
import AuthPage from './components/AuthPage';
import AuthenticatedHome from './components/AuthenticatedHome';
import ExerciseLogForm from './components/ExerciseLogForm';

type Screen = 'home' | 'log';

function App() {
  const { isAuthenticated, user, loading, login, register, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const navigateToLog = () => setCurrentScreen('log');
  const navigateToHome = () => setCurrentScreen('home');

  const handleLogout = async () => {
    await logout();
    setCurrentScreen('home');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication page if not logged in
  if (!isAuthenticated) {
    return (
      <div className="App">
        <AuthPage onLogin={login} onRegister={register} loading={loading} />
      </div>
    );
  }

  // Show authenticated screens
  return (
    <div className="App">
      {currentScreen === 'home' ? (
        <AuthenticatedHome
          user={user!}
          onNavigateToLog={navigateToLog}
          onLogout={handleLogout}
        />
      ) : (
        <ExerciseLogForm
          user={user!}
          onNavigateBack={navigateToHome}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
