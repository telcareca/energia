#!/bin/bash
set -e

echo "=== Render Build Script ==="

# Create data directory for SQLite
mkdir -p /opt/render/project/src/data

# Generate Prisma client
npx prisma generate

# Push database schema (creates the SQLite file)
npx prisma db push

# Build Next.js
npm run build

echo "=== Build Complete ==="
