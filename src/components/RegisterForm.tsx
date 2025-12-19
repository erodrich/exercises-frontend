import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { RegisterCredentials } from '../domain/models';

interface RegisterFormProps {
  onRegister: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, loading = false }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await onRegister({
        username,
        email,
        password,
        confirmPassword,
      });

      if (!result.success) {
        // Show error message
        setError(result.error || 'Registration failed. Please try again.');
      }
      // If success, the parent component will handle navigation
    } catch (err) {
      // Handle unexpected errors
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="johndoe"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="your@email.com"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          required
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <UserPlus className="w-5 h-5" />
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
