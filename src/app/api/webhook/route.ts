import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Webhook received:', JSON.stringify(body, null, 2));

    const transactionId = body.id || body.transaction_id || '';
    const status = body.status || '';

    if (
      (status === 'paid' || status === 'approved' || status === 'completed') &&
      transactionId
    ) {
      const customer = await db.customer.findFirst({
        where: { hubpagueTransactionId: transactionId },
      });

      if (customer && customer.paymentStatus !== 'paid') {
        await db.customer.update({
          where: { id: customer.id },
          data: {
            paymentStatus: 'paid',
            paidAt: new Date(),
            status: 'active',
          },
        });

        console.log(`Payment confirmed for customer: ${customer.nome} (${customer.id})`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}
