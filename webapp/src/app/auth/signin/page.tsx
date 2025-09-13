"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email,
        password: password,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        // On successful login, redirect to the dashboard.
        router.push('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center p-8"
      style={{ backgroundImage: "url('/torre-valley.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 text-white">
          <h1 className="text-4xl font-bold">Business Login</h1>
          <p className="mt-2 text-lg">Sign in to manage your account.</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="bg-transparent border border-gray-300 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400"
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="bg-transparent border border-gray-300 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              type="submit"
            >
              Sign In
            </button>
          </div>
          {error && <p className="mt-4 text-center text-red-400 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
}
