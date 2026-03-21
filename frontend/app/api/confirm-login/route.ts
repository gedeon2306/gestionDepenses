import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1) On récupère le corps JSON envoyé depuis la page de confirmation
  const { access, refresh } = await request.json();

  // 2) On prépare la réponse JSON
  const response = NextResponse.json({ success: true }, { status: 200 });

  // 3) On enregistre le token d'accès dans un cookie HTTP-only
  response.cookies.set('access_token', access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  });

  // 4) On enregistre le refresh token dans un cookie HTTP-only
  response.cookies.set('refresh_token', refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  });

  return response;
}

