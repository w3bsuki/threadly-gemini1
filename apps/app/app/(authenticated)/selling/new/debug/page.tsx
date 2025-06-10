'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    // Test 1: Check environment variables
    testResults.env = {
      API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
      CLERK_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
      UPLOADTHING_ID: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID ? 'SET' : 'NOT SET',
    };

    // Test 2: Check API connection
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/health`);
      testResults.apiHealth = {
        status: response.status,
        ok: response.ok,
        url: `${apiUrl}/health`
      };
    } catch (error) {
      testResults.apiHealth = {
        error: error instanceof Error ? error.message : 'Failed to connect'
      };
    }

    // Test 3: Seed categories
    try {
      const response = await fetch('/api/seed-categories', { method: 'POST' });
      const data = await response.json();
      testResults.categories = data;
    } catch (error) {
      testResults.categories = {
        error: error instanceof Error ? error.message : 'Failed to seed'
      };
    }

    // Test 4: Check database connection via simple API call
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      testResults.database = data;
    } catch (error) {
      testResults.database = {
        error: error instanceof Error ? error.message : 'Failed to test DB'
      };
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug Product Upload</h1>
      
      <Button onClick={runTests} disabled={loading}>
        {loading ? 'Running Tests...' : 'Run Debug Tests'}
      </Button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          {Object.entries(results).map(([key, value]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg">{key}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Manual Actions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Make sure NEXT_PUBLIC_API_URL is set to your API deployment URL in Vercel</li>
          <li>Make sure Clerk production keys are set (not dev keys)</li>
          <li>Seed categories by clicking the debug button above</li>
          <li>Check that UploadThing keys are set correctly</li>
        </ol>
      </div>
    </div>
  );
}