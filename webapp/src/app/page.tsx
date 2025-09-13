import Link from 'next/link';

export default function Home() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center p-8"
      style={{ backgroundImage: "url('/torre-valley.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 w-full max-w-4xl text-center text-white">
        <h1 className="text-6xl font-bold">Moab Automation</h1>
        <p className="mt-4 text-2xl">
          The simplest way to send automated SMS notifications to your customers.
        </p>
        <div className="mt-10 flex justify-center gap-6">
          <Link
            href="/register"
            className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Register Your Business
          </Link>
          <Link
            href="/auth/signin"
            className="inline-block rounded-lg bg-white px-8 py-4 text-xl font-semibold text-gray-900 shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50"
          >
            Business Login
          </Link>
        </div>
      </div>
    </div>
  );
}
