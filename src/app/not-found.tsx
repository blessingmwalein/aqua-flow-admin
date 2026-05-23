import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center bg-white dark:bg-gray-950">
      {/* 404 number */}
      <p className="text-[120px] font-extrabold leading-none tracking-tight text-gray-100 dark:text-gray-800 select-none sm:text-[160px]">
        404
      </p>

      {/* Content — overlaid on the number with negative margin */}
      <div className="-mt-8 flex flex-col items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
          Page Not Found
        </h1>
        <p className="max-w-md text-base text-gray-500 dark:text-gray-400">
          The page you are looking for does not exist or may have been moved. Double-check the URL
          or navigate back to the dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-3 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
