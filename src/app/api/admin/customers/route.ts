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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { cpf: { contains: search } },
        { email: { contains: search } },
        { telefone: { contains: search } },
        { nomeTitular: { contains: search } },
      ];
    }

    if (status !== 'all') {
      where.paymentStatus = status;
    }

    const customers = await db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nome: true,
        cpf: true,
        email: true,
        telefone: true,
        valorConta: true,
        nomeTitular: true,
        unidade: true,
        billFileName: true,
        status: true,
        paymentStatus: true,
        paidAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar clientes.' }, { status: 500 });
  }
}
