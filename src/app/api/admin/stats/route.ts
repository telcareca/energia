import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Customer stats
    const totalCustomers = await db.customer.count();
    const paidCustomers = await db.customer.count({ where: { paymentStatus: 'paid' } });
    const pendingCustomers = await db.customer.count({ where: { paymentStatus: 'unpaid' } });
    const pendingPixCustomers = await db.customer.count({ where: { paymentStatus: 'pending_pix' } });

    const todayCustomers = await db.customer.count({
      where: { createdAt: { gte: todayStart } },
    });
    const weekCustomers = await db.customer.count({
      where: { createdAt: { gte: weekStart } },
    });
    const monthCustomers = await db.customer.count({
      where: { createdAt: { gte: monthStart } },
    });

    // Revenue
    const paidCustomersData = await db.customer.findMany({
      where: { paymentStatus: 'paid' },
      select: { valorConta: true },
    });
    const totalRevenue = paidCustomersData.reduce((sum, c) => sum + c.valorConta * 0.5, 0);

    // Visit stats
    const totalVisits = await db.visit.count();
    const todayVisits = await db.visit.count({
      where: { createdAt: { gte: todayStart } },
    });
    const weekVisits = await db.visit.count({
      where: { createdAt: { gte: weekStart } },
    });
    const monthVisits = await db.visit.count({
      where: { createdAt: { gte: monthStart } },
    });

    // Visits per day (last 7 days)
    const visitDays: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = await db.visit.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });
      visitDays.push({
        date: dayStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        count,
      });
    }

    return NextResponse.json({
      customers: {
        total: totalCustomers,
        paid: paidCustomers,
        unpaid: pendingCustomers,
        pendingPix: pendingPixCustomers,
        today: todayCustomers,
        week: weekCustomers,
        month: monthCustomers,
      },
      revenue: {
        total: totalRevenue,
      },
      visits: {
        total: totalVisits,
        today: todayVisits,
        week: weekVisits,
        month: monthVisits,
        perDay: visitDays,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar estatísticas.' }, { status: 500 });
  }
}
