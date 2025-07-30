'use client';

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

    const businessId = session.user.id;

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, businessId }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(data.message);
        setMessage('');
      } else {
        setError(data.message || 'An error occurred.');
      }
    } catch (fetchError) {
      setError('An unexpected error occurred.');
    }
  };

    if (sessionStatus === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (sessionStatus === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Send a Message to Your Subscribers</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Send Message
          </button>
        </form>
        {status && <p className="mt-4 text-green-600">{status}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default DashboardPage;
