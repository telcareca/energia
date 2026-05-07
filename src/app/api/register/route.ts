import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const nome = formData.get('nome') as string;
    const cpf = formData.get('cpf') as string;
    const email = formData.get('email') as string;
    const telefone = formData.get('telefone') as string;
    const valorConta = parseFloat(formData.get('valorConta') as string);
    const nomeTitular = formData.get('nomeTitular') as string;
    const unidade = formData.get('unidade') as string | null;
    const billFile = formData.get('billFile') as File | null;

    if (!nome || !cpf || !email || !telefone || !valorConta || !nomeTitular) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos.' },
        { status: 400 }
      );
    }

    const cpfClean = cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      return NextResponse.json(
        { error: 'CPF deve conter 11 dígitos.' },
        { status: 400 }
      );
    }

    const existingCustomer = await db.customer.findUnique({
      where: { cpf: cpfClean },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'CPF já cadastrado no sistema.' },
        { status: 409 }
      );
    }

    let billFileData: string | null = null;
    let billFileName: string | null = null;

    if (billFile) {
      billFileName = billFile.name;
      const bytes = await billFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      billFileData = buffer.toString('base64');
    }

    const customer = await db.customer.create({
      data: {
        nome,
        cpf: cpfClean,
        email,
        telefone,
        valorConta,
        nomeTitular,
        unidade: unidade || null,
        billFileName,
        billFileData,
        status: 'registered',
        paymentStatus: 'unpaid',
      },
    });

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      message: 'Cadastro realizado com sucesso!',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}
