#!/usr/bin/env bash
set -euo pipefail

echo "=== Render Build Script: Conta de Luz ==="

# A Render precisa de DATABASE_URL durante os comandos do Prisma.
# Se você configurar uma variável DATABASE_URL na Render, ela será respeitada.
# Caso contrário, será usado um SQLite local dentro do projeto.
export DATABASE_URL="${DATABASE_URL:-file:./data/custom.db}"

if [[ "$DATABASE_URL" == file:* ]]; then
  DB_PATH="${DATABASE_URL#file:}"
  mkdir -p "$(dirname "$DB_PATH")"
fi

echo "Gerando Prisma Client..."
npx prisma generate

echo "Sincronizando schema do banco..."
npx prisma db push

echo "Compilando Next.js em modo standalone..."
npm run build:next

echo "=== Build concluído com sucesso ==="
