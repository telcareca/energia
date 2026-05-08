import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const HUBPAGUE_API_URL = 'https://app.hubpague.io/api';
const HUBPAGUE_TOKEN = process.env.HUBPAGUE_TOKEN || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório.' },
        { status: 400 }
      );
    }

    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado.' },
        { status: 404 }
      );
    }

    if (customer.paymentStatus === 'paid') {
      const economiaMensal = customer.valorConta * 0.5;
      const economiaAnual = economiaMensal * 12;

      return NextResponse.json({
        status: 'paid',
        paymentStatus: 'paid',
        data: {
          customerId: customer.id,
          nome: customer.nome,
          status: 'active',
          paymentStatus: 'paid',
          valorOriginal: customer.valorConta,
          valorComDesconto: customer.valorConta * 0.5,
          economiaMensal,
          economiaAnual,
          validadeMeses: 12,
          dataAtivacao: customer.paidAt?.toISOString() || new Date().toISOString(),
          dataExpiracao: new Date(
            new Date(customer.paidAt || new Date()).setMonth(
              new Date(customer.paidAt || new Date()).getMonth() + 12
            )
          ).toISOString(),
        },
      });
    }

    if (!customer.hubpagueTransactionId) {
      return NextResponse.json({
        status: 'no_transaction',
        paymentStatus: customer.paymentStatus,
      });
    }

    const hubpagueResponse = await fetch(
      `${HUBPAGUE_API_URL}/transactions/${customer.hubpagueTransactionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${HUBPAGUE_TOKEN}`,
        },
      }
    );

    if (!hubpagueResponse.ok) {
      return NextResponse.json({
        status: 'pending',
        paymentStatus: customer.paymentStatus,
      });
    }

    const hubpagueData = await hubpagueResponse.json();
    const transactionData = hubpagueData.data || hubpagueData;
    const transactionStatus = transactionData.status || 'pending';

    if (transactionStatus === 'paid' || transactionStatus === 'approved' || transactionStatus === 'completed') {
      const updatedCustomer = await db.customer.update({
        where: { id: customerId },
        data: {
          paymentStatus: 'paid',
          paidAt: new Date(),
          status: 'active',
        },
      });

      const economiaMensal = customer.valorConta * 0.5;
      const economiaAnual = economiaMensal * 12;

      return NextResponse.json({
        status: 'paid',
        paymentStatus: 'paid',
        data: {
          customerId: updatedCustomer.id,
          nome: updatedCustomer.nome,
          status: 'active',
          paymentStatus: 'paid',
          valorOriginal: customer.valorConta,
          valorComDesconto: customer.valorConta * 0.5,
          economiaMensal,
          economiaAnual,
          validadeMeses: 12,
          dataAtivacao: updatedCustomer.paidAt?.toISOString() || new Date().toISOString(),
          dataExpiracao: new Date(
            new Date(updatedCustomer.paidAt || new Date()).setMonth(
              new Date(updatedCustomer.paidAt || new Date()).getMonth() + 12
            )
          ).toISOString(),
        },
      });
    }

    return NextResponse.json({
      status: 'pending',
      paymentStatus: customer.paymentStatus,
      transactionStatus,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento.' },
      { status: 500 }
    );
  }
}
