import { NextRequest, NextResponse } from 'next/server';
import api from '@/src/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { uid, token, action } = await request.json();

    if (action == "inscription") {
      const res = await api.get(`confirm-email/${uid}/${token}/`);
      return NextResponse.json({ access: res.data.access, refresh: res.data.refresh }, { status: 200 });
    } else if (action == "forgot-password") {
      const res = await api.get(`password-confirm/${uid}/${token}/`);
      return NextResponse.json({ uid: res.data.uid, token: res.data.token }, { status: 200 });
    }

  } catch (error: any) {
    const errorData = error.response?.data || { error: 'Lien invalide ou expiré.' };
    return NextResponse.json(errorData, { status: 400 });
  }
}

