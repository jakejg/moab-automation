'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('');
    setError('');

    if (!session?.user?.id) {
      setError('You must be logged in to send messages.');
      return;
    }

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(data.message);
        setMessage('');
      } else {
        setError(data.message || 'An error occurred.');
      }
    } catch {
      setError('An unexpected error occurred.');
    }
  };

  if (sessionStatus === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (sessionStatus === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center p-8"
      style={{ backgroundImage: "url('/torre-valley.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 max-w-2xl w-full bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Send a Message to Your Subscribers</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                Your Message
              </label>
              <span className="text-sm text-gray-400">
                {message.length}/160
              </span>
            </div>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              maxLength={160}
              className="block w-full rounded-lg border-gray-600 bg-transparent p-4 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-base transition duration-150 ease-in-out placeholder-gray-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Send Message
          </button>
        </form>
        {status && <p className="mt-6 text-center text-green-400">{status}</p>}
        {error && <p className="mt-6 text-center text-red-400">{error}</p>}
      </div>
    </div>
  );
};

export default DashboardPage;
