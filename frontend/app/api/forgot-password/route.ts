import { NextRequest, NextResponse } from 'next/server';
import api from '@/src/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'L\'adresse email est obligatoire.' },
        { status: 400 }
      );
    }

    const res = await api.post('forgot-password/', { email });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error: any) {
    const errorData = error.response?.data || { error: 'Erreur lors de la demande de réinitialisation.' };
    return NextResponse.json(errorData, { status: 400 });
  }
}
