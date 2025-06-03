export const GET = async () => {
  // Simple keep-alive endpoint to prevent API from sleeping
  return new Response(JSON.stringify({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'API is alive'
  }), { 
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
