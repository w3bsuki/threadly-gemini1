export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page - Static</h1>
      <p>If you can see this, the authenticated routes are working.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>This is a simple static page in the (authenticated) group.</p>
        <p>No client-side code, no database calls.</p>
      </div>
    </div>
  );
}