import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900">Moab Automation</h1>
        <p className="mt-4 text-lg text-gray-600">
          The simplest way to send automated SMS notifications to your customers.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/register" className="inline-block rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Register Your Business
          </Link>
          <Link href="/api/auth/signin" className="inline-block rounded-md bg-white px-6 py-3 text-lg font-semibold text-gray-800 shadow-md ring-1 ring-inset ring-gray-300 hover:bg-gray-100">
            Business Login
          </Link>
        </div>
      </div>
    </main>
  );
}
