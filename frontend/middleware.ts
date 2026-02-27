import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/src/constants/routes';

export function middleware(request: NextRequest) {
    // 1. On récupère le cookie du JWT
    const token = request.cookies.get('access_token');
    const { pathname } = request.nextUrl;

    // 2. Si l'utilisateur n'est pas connecté et essaie d'aller sur la dashboard ou le profile
    if (!token && (pathname === ROUTES.DASHBOARD.ROOT || pathname === ROUTES.DASHBOARD.USER_PROFILE)) {
        return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }

    // 3. Si l'utilisateur est DÉJÀ connecté et essaie d'aller sur mot de passe oublié
    if (token && (pathname === ROUTES.AUTH.FORGOT_PASSWORD || pathname === ROUTES.AUTH.RESET_PASSWORD)) {
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD.USER_PROFILE, request.url));
    }

    // 4. Si l'utilisateur est DÉJÀ connecté et essaie d'aller sur login ou register
    if (token && (pathname === ROUTES.AUTH.LOGIN || pathname === ROUTES.AUTH.REGISTER)) {
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD.ROOT, request.url));
    }

    return NextResponse.next();
}

// On définit les routes à surveiller
export const config = {
    matcher: ['/dashboard', '/dashboard/profile', '/auth/login', '/auth/register', '/auth/reset-password', '/auth/forgot-password' ],
};