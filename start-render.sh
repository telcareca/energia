#!/usr/bin/env bash
set -euo pipefail

echo "=== Render Start Script: Conta de Luz ==="

# Respeita DATABASE_URL definida na Render; se não existir, usa SQLite local.
export DATABASE_URL="${DATABASE_URL:-file:./data/custom.db}"
export NODE_ENV="production"
export HOSTNAME="0.0.0.0"

if [[ "$DATABASE_URL" == file:* ]]; then
  DB_PATH="${DATABASE_URL#file:}"
  mkdir -p "$(dirname "$DB_PATH")"
fi

echo "Garantindo schema do banco antes de iniciar..."
npx prisma db push

echo "Iniciando aplicação na porta ${PORT:-3000}..."
exec node .next/standalone/server.js
