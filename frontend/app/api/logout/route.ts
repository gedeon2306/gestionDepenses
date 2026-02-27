// app/api/logout/routes.ts
import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // On supprime le cookie en le réglant à une date passée
    response.cookies.set('access_token', '', {
        httpOnly: true,
        expires: new Date(0), // Expire immédiatement
        path: '/',            // Important pour supprimer le cookie sur tout le site
    });

    return response;
}