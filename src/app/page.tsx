export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          BusBee API
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Backend API server for BusBee mobile application
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            API Status
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">API Server:</span>
              <span className="text-green-600 font-medium">Running</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Authentication:</span>
              <span className="text-green-600 font-medium">JWT Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Use the BusBee mobile app to access all features
        </p>
      </div>
    </div>
  );
}
