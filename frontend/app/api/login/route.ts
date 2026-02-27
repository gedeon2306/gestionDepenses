// app/api/login/route.ts
import { NextResponse } from 'next/server';
import api from '@/src/constants/api'

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await api.post('login/', body);

        // 👇 On récupère les DEUX tokens que Django renvoie
        const { access, refresh } = response.data;

        const nextResponse = NextResponse.json({
            message: "Connexion réussie"
        });

        // Cookie pour l'access token (courte durée côté cookie, mais le JWT lui-même expire selon Django)
        nextResponse.cookies.set('access_token', access, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24
        });

        // 👇 Cookie pour le refresh token (longue durée)
        nextResponse.cookies.set('refresh_token', refresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24
        });

        return nextResponse;

    } catch (error: any) {
        return NextResponse.json(
            { error: "Identifiants incorrects" },
            { status: 401 }
        );
    }
}