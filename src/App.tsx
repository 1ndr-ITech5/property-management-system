/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Next.js Project Skeleton Generated</h1>
        <div className="space-y-4 text-gray-600">
          <p className="text-lg">
            The requested Next.js 14 (App Router) files have been generated in the file system.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="font-medium text-yellow-800">Note: Preview Unavailable</p>
            <p className="text-sm text-yellow-700 mt-1">
              This environment is configured for Vite/React. The generated Next.js files cannot be run or previewed here directly.
            </p>
          </div>
          <p>Please copy the following files to your local Next.js project:</p>
          <ul className="list-disc pl-5 space-y-1 font-mono text-sm bg-gray-50 p-4 rounded-lg">
            <li>/lib/firebase.ts</li>
            <li>/context/AuthContext.tsx</li>
            <li>/app/login/page.tsx</li>
            <li>/app/signup/page.tsx</li>
            <li>/app/dashboard/layout.tsx</li>
            <li>/app/dashboard/page.tsx</li>
          </ul>
          <p className="text-sm">
            Don't forget to configure your <code>.env.local</code> with the Firebase credentials listed in <code>.env.example</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
