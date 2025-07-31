'use client';

import React, { useState, useEffect } from 'react';

interface BusinessData {
  businessName?: string;
  headline?: string;
  subHeadline?: string;
  complianceText?: string;
}

interface SignUpClientProps {
  businessId: string;
}

export default function SignUpClient({ businessId }: SignUpClientProps) {
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setError('No business ID found.');
      setLoading(false);
      return;
    }

    const fetchBusinessData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/business/${businessId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch business data.');
        }
        setBusiness(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setMessage('');
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, businessId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'An unknown error occurred.');
      setMessage('Success! You are on the list.');
      setPhone('');
    } catch (err: any) {
      setSubmitError(err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  if (!business) return <div className="flex justify-center items-center h-screen">Business not found.</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold text-gray-900">{business?.headline || 'Join Our VIP List!'}</h1>
        <p className="text-gray-600">{business?.subHeadline || `Get texts from ${business?.businessName || 'us'} with daily specials.`}</p>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Join Now
          </button>
        </form>
        {message && <p className="text-green-600 mt-4">{message}</p>}
        {submitError && <p className="text-red-600 mt-4">{submitError}</p>}
        <p className="text-xs text-gray-500 pt-4">{business?.complianceText || 'Standard message and data rates may apply.'}</p>
      </div>
    </div>
  );
}
