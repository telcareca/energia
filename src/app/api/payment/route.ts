import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const HUBPAGUE_API_URL = 'https://app.hubpague.io/api';
const HUBPAGUE_TOKEN = process.env.HUBPAGUE_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, paymentMethod } = body;

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
      return NextResponse.json(
        { error: 'Pagamento já foi realizado.' },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(customer.valorConta * 0.5 * 100);

    const cpfDigits = customer.cpf.replace(/\D/g, '');
    let formattedCpf = cpfDigits;
    if (cpfDigits.length === 11) {
      formattedCpf = `${cpfDigits.slice(0, 3)}.${cpfDigits.slice(3, 6)}.${cpfDigits.slice(6, 9)}-${cpfDigits.slice(9)}`;
    }

    const hubpaguePayload = {
      amount: amountInCents,
      method: 'pix',
      customer: {
        name: customer.nome,
        email: customer.email,
        phone: customer.telefone,
        document: {
          type: 'CPF',
          value: formattedCpf,
        },
      },
      delivery: {
        street: 'Não informado',
        number: '0',
        neighborhood: 'Não informado',
        city: 'Não informado',
        state: 'SP',
        zipcode: '00000-000',
      },
      products: [
        {
          name: 'Taxa de Consultoria - Economia Energy',
          price: amountInCents,
          quantity: '1',
          type: 'digital',
        },
      ],
    };

    const hubpagueResponse = await fetch(`${HUBPAGUE_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBPAGUE_TOKEN}`,
      },
      body: JSON.stringify(hubpaguePayload),
    });

    const hubpagueData = await hubpagueResponse.json();

    if (!hubpagueResponse.ok) {
      console.error('HubPague API error:', hubpagueData);
      return NextResponse.json(
        { error: 'Erro ao criar transação de pagamento. Tente novamente.' },
        { status: 500 }
      );
    }

    const transactionId = hubpagueData.id || '';
    const pixCopypaste = hubpagueData.pix?.copypaste || '';
    const pixQrCode = hubpagueData.pix?.qrcode || '';

    await db.customer.update({
      where: { id: customerId },
      data: {
        hubpagueTransactionId: transactionId,
        hubpaguePixCode: pixCopypaste,
        hubpaguePixQrCode: pixQrCode,
        paymentStatus: 'pending_pix',
        status: 'awaiting_payment',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Transação Pix criada com sucesso!',
      data: {
        customerId: customer.id,
        transactionId,
        pixCode: pixCopypaste,
        pixQrCode,
        amount: amountInCents,
        status: 'pending_pix',
      },
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento. Tente novamente.' },
      { status: 500 }
    );
  }
}
