import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import type { LoginCredentials, RegisterCredentials } from '../domain/models';

interface AuthPageProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  onRegister: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

type AuthMode = 'login' | 'register';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister, loading = false }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg">
              <Dumbbell className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Exercise Tracker</h1>
          <p className="text-gray-600 mt-2">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          {mode === 'login' ? (
            <LoginForm onLogin={onLogin} loading={loading} />
          ) : (
            <RegisterForm onRegister={onRegister} loading={loading} />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
