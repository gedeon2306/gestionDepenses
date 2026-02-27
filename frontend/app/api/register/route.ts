// app/api/register/route.ts
import { NextResponse } from 'next/server';
import api from '@/src/constants/api';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Création de l'utilisateur dans Django
        await api.post('register/', body);

        // 2. Connexion automatique après inscription
        const loginRes = await api.post('login/', {
            email: body.email,
            password: body.password
        });

        // 👇 On récupère les DEUX tokens
        const { access, refresh } = loginRes.data;

        const response = NextResponse.json({ success: true }, { status: 201 });

        // Cookie access token
        response.cookies.set('access_token', access, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 // 24h
        });

        // 👇 Cookie refresh token
        response.cookies.set('refresh_token', refresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24
        });

        return response;

    } catch (error: any) {
        const errorData = error.response?.data || { error: "Échec de l'inscription" };
        return NextResponse.json(errorData, { status: 400 });
    }
}