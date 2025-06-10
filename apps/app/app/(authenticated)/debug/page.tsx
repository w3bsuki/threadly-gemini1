export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Debug Page - Static Route</h1>
      <div className="space-y-2">
        <p>This is a simple static page with no client components.</p>
        <p>If you can see this, authenticated routes are working.</p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="text-sm">
            Route: /debug
            Group: (authenticated)
            Type: Server Component
          </pre>
        </div>
      </div>
    </div>
  );
}