#!/bin/bash

echo "🚀 Starting Threadly Development Environment"
echo "=========================================="

# Export DATABASE_URL for all processes
export DATABASE_URL="postgresql://threadly_owner:npg_qwPJ5Ziazf4O@ep-soft-art-a2tlilgq-pooler.eu-central-1.aws.neon.tech/threadly?sslmode=require"

# Kill any existing processes on our ports
echo "🧹 Cleaning up old processes..."
fuser -k 3000/tcp 2>/dev/null
fuser -k 3001/tcp 2>/dev/null
fuser -k 3002/tcp 2>/dev/null

echo "✅ Ports cleared"
echo ""

# Start services
echo "📦 Starting services..."
echo "API: http://localhost:3002"
echo "App: http://localhost:3000"
echo "Web: http://localhost:3001"
echo ""

# Start API server
cd apps/api && pnpm dev