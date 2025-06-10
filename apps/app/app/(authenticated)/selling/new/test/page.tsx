'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { createProductSimple } from '../actions/create-product-simple';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await createProductSimple({ test: 'data' });
      setResult(res);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Server Action</h1>
      
      <Button onClick={handleTest} disabled={loading}>
        {loading ? 'Testing...' : 'Test Server Action'}
      </Button>

      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}