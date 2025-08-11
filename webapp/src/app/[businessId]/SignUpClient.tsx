'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Business {
  id: string;
  name: string;
  logoUrl?: string;
  headline?: string;
  subHeadline?: string;
  businessName?: string;
  complianceText?: string;
}

interface SignUpClientProps {
  business: Business;
}

export default function SignUpClient({ business }: SignUpClientProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, businessId: business.id }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push(`/thank-you?businessId=${business.id}`);
      } else {
        setError(result.error || 'An unknown error occurred');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
        {business.logoUrl && (
          <img src={business.logoUrl} alt={`${business.businessName || business.name} Logo`} className="h-24 mx-auto mb-4" />
        )}
        <h1 className="text-3xl font-bold text-gray-900">{business?.headline || 'Join Our VIP List!'}</h1>
        <p className="text-gray-600">{business?.subHeadline || `Get texts from ${business?.businessName || business.name || 'us'} with daily specials.`}</p>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Join Now
          </button>
        </form>
        {error && <p className="text-red-600 mt-4">{error}</p>}
        <p className="text-xs text-gray-500 mt-4">{business?.complianceText || 'By signing up, you agree to receive marketing messages from us. By submitting, you consent to receive text messages. Message & data rates may apply. Reply HELP for help, STOP to cancel anytime. View our Privacy Policy [link to your privacy policy page]'}</p>
      </div>
    </div>
  );
}
