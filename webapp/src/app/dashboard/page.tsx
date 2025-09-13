'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const DashboardPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [sentMessageCount, setSentMessageCount] = useState<number | null>(null);
  const [receivedMessageCount, setReceivedMessageCount] = useState<number | null>(null);
  const [range, setRange] = useState('month');

  useEffect(() => {
    const fetchMessageCounts = async () => {
      setSentMessageCount(null);
      setReceivedMessageCount(null);

      try {
        const [sentRes, receivedRes] = await Promise.all([
          fetch(`/api/analytics/messages?range=${range}&direction=outgoing`),
          fetch(`/api/analytics/messages?range=${range}&direction=incoming`)
        ]);

        const sentData = await sentRes.json();
        const receivedData = await receivedRes.json();

        setSentMessageCount(sentData.messageCount || 0);
        setReceivedMessageCount(receivedData.messageCount || 0);

      } catch (err) {
        console.error('Failed to fetch message counts:', err);
        setSentMessageCount(0);
        setReceivedMessageCount(0);
      }
    };

    fetchMessageCounts();
  }, [range]);

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
      <div className="relative z-10 max-w-6xl w-full bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl">
        {session?.user?.logoUrl && (
          <div className="flex justify-center mb-6">
            <Image
              src={session.user.logoUrl}
              alt="Business Logo"
              width={120}
              height={120}
              className="rounded-full"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:space-x-12">
          {/* Left Column: Send Message */}
          <div className="w-full sm:w-1/2">
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
              >
                Send Message
              </button>
            </form>
            {status && <p className="mt-6 text-center text-green-400">{status}</p>}
            {error && <p className="mt-6 text-center text-red-400">{error}</p>}
          </div>

          {/* Right Column: Analytics */}
          <div className="w-full sm:w-1/2 mt-8 sm:mt-0">
            <h2 className="text-2xl font-bold text-white text-center mb-4">Analytics</h2>
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <div className="flex justify-center space-x-2 mb-4">
                <button
                  onClick={() => setRange('day')}
                  className={`py-1 px-3 rounded-lg transition-colors cursor-pointer ${range === 'day' ? 'bg-blue-600 text-white font-semibold' : 'bg-white/20 text-gray-300 hover:bg-white/30'}`}>
                  Day
                </button>
                <button
                  onClick={() => setRange('week')}
                  className={`py-1 px-3 rounded-lg transition-colors cursor-pointer ${range === 'week' ? 'bg-blue-600 text-white font-semibold' : 'bg-white/20 text-gray-300 hover:bg-white/30'}`}>
                  Week
                </button>
                <button
                  onClick={() => setRange('month')}
                  className={`py-1 px-3 rounded-lg transition-colors cursor-pointer ${range === 'month' ? 'bg-blue-600 text-white font-semibold' : 'bg-white/20 text-gray-300 hover:bg-white/30'}`}>
                  Month
                </button>
              </div>
              <div className="flex justify-around items-start space-x-4">
                <div className="flex-1">
                  <p className="text-lg text-gray-300">Messages Sent</p>
                  <p className="text-5xl font-bold text-white mt-2">
                    {sentMessageCount !== null ? sentMessageCount : '...'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-300">Messages Received</p>
                  <p className="text-5xl font-bold text-white mt-2">
                    {receivedMessageCount !== null ? receivedMessageCount : '...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
