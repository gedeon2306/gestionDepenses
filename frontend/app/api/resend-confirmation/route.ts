import { NextRequest, NextResponse } from 'next/server';
import api from '@/src/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();

    const res = await api.post('resend-confirmation/', { email, action });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error: any) {
    const errorData = error.response?.data || { error: "Échec de l'envoi." };
    const status = error.response?.status || 500;
    return NextResponse.json(errorData, { status });
  }
}
