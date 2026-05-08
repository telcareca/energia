import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'economia2024';

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    return decoded.startsWith(ADMIN_PASSWORD);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
    }

    const customer = await db.customer.findUnique({
      where: { id },
      select: {
        billFileName: true,
        billFileData: true,
        nome: true,
      },
    });

    if (!customer || !customer.billFileData) {
      return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({
      fileName: customer.billFileName,
      fileData: customer.billFileData,
      nome: customer.nome,
    });
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
