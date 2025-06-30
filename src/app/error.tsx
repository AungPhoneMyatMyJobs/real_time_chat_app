'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h2 className="text-2xl font-semibold mt-4">Something went wrong!</h2>
      <p className="mt-2 text-lg">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-8 px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-300"
      >
        Try again
      </button>
    </div>
  );
}
