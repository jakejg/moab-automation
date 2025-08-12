import SignUpClient from './SignUpClient';

interface Business {
  id: string;
  name: string;
  logoUrl?: string;
  headline?: string;
  subHeadline?: string;
  businessName?: string;
  complianceText?: string;
}

async function getBusiness(businessId: string): Promise<Business | null> {
  try {
    const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/business/${businessId}`, {
    cache: 'no-store',
  });

    if (!res.ok) {
      console.error(`Failed to fetch business: ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Failed to fetch business', error);
    return null;
  }
}

export default async function SignUpPage({ params }: { params: Promise<{ businessId: string }> }) {
  const business = await getBusiness((await params).businessId);

  if (!business) {
    return <div>Business not found</div>;
  }

  return <SignUpClient business={business} />;
}