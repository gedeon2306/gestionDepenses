import { NextRequest, NextResponse } from 'next/server';
import api from '@/src/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { uid, token, password, password_confirm } = await request.json();

    if (!uid || !token || !password || !password_confirm) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires.' },
        { status: 400 }
      );
    }

    if (password !== password_confirm) {
      return NextResponse.json(
        { error: 'Les mots de passe ne correspondent pas.' },
        { status: 400 }
      );
    }

    // if (password.length < 8) {
    //   return NextResponse.json(
    //     { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
    //     { status: 400 }
    //   );
    // }

    const res = await api.post('reset-password/', {
      uid,
      token,
      password,
      password_confirm,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error: any) {
    const errorData = error.response?.data || { error: 'Erreur lors de la réinitialisation du mot de passe.' };
    return NextResponse.json(errorData, { status: 400 });
  }
}
