'use client';

import React, { useState, useEffect } from 'react';

interface BusinessData {
  businessName: string;
  headline: string;
  subHeadline: string;
  complianceText: string;
}

interface SignUpClientProps {
  businessId: string;
}

// This is the Client Component with all the state and logic
function SignUpClient({ businessId }: SignUpClientProps) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetch(`/api/business/${businessId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Business not found');
          }
          return res.json();
        })
        .then((data: BusinessData) => {
          setBusinessData(data);
          setLoading(false);
        })
        .catch((fetchError) => {
          console.error('Failed to fetch business data:', fetchError);
          setError('Business not found or error fetching data.');
          setLoading(false);
        });
    }
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, businessId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setPhone('');
      } else {
        setError(data.message || 'An error occurred.');
      }
    } catch {
      setError('An unexpected error occurred.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Error: Business not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-900">{businessData.headline}</h1>
        <p className="text-gray-600">{businessData.subHeadline}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Subscribe
          </button>
        </form>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
        <p className="text-xs text-gray-500">{businessData.complianceText}</p>
      </div>
    </div>
  );
}

// This is the Page (Server Component)
export default async function Page({ params }: { params: Promise<{ businessId: string }> }) {
  // We pass the businessId from the server component to the client component
  return <SignUpClient businessId={(await params).businessId} />;
}
