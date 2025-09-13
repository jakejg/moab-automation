"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!businessName || !ownerName || !email || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      const res = await fetch('/api/business/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessName, ownerName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess('Business registered successfully! You can now log in.');
      // Clear form
      setBusinessName('');
      setOwnerName('');
      setEmail('');
      setPassword('');

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
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
          <h1 className="text-4xl font-bold">Register Your Business</h1>
          <p className="mt-2 text-lg">Create an account to start sending SMS notifications.</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="businessName">
              Business Name
            </label>
            <input
              className="bg-transparent border border-gray-300 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400"
              id="businessName"
              type="text"
              placeholder="Your Company LLC"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="ownerName">
              Your Name
            </label>
            <input
              className="bg-transparent border border-gray-300 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400"
              id="ownerName"
              type="text"
              placeholder="Jane Doe"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>
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
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              type="submit"
            >
              Create Account
            </button>
          </div>
          {error && <p className="mt-4 text-center text-red-400 text-sm">{error}</p>}
          {success && (
            <div>
              <p className="mt-4 text-center text-green-400 text-sm">{success}</p>
              <div className="text-center mt-4">
                <Link href="/auth/signin" className="font-bold text-blue-400 hover:text-blue-300">
                  Go to Login Page
                </Link>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
