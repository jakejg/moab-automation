import SignUpClient from './SignUpClient';

// This is the Page (Server Component)
// It can be async and handle promises, like the params for a dynamic route.
export default async function Page({ params }: { params: Promise<{ businessId: string }> }) {
  // In Server Components, you can directly access the params without awaiting.
  // The 'await' was part of the problem in older Next.js versions or with client components.
  const { businessId } = await params;

  return <SignUpClient businessId={businessId} />;
}