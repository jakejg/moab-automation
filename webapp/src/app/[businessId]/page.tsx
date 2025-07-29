'use client';

import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';

interface SignUpPageProps {
  params: {
    businessId: string;
  };
}

const SignUpPage: NextPage<SignUpPageProps> = ({ params }) => {
  const { businessId } = params;
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [businessData, setBusinessData] = useState<any>(null);
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
        .then((data) => {
          setBusinessData(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/signup', {
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
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error || !businessData) {
    return <div className="flex justify-center items-center h-screen">Error: {error || 'Business not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{businessData.headline}</h1>
        <p className="text-gray-600 mb-6">{businessData.subHeadline}</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="sr-only">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </button>
        </form>
        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        <p className="mt-4 text-xs text-gray-500">{businessData.complianceText}</p>
      </div>
    </div>
  );
};

export default SignUpPage;
