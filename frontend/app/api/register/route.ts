// app/api/register/route.ts
import { NextResponse } from 'next/server';
import api from '@/src/constants/api';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Création de l'utilisateur dans Django
        //    (il sera inactif tant qu'il n'aura pas cliqué sur le lien de confirmation)
        await api.post('register/', body);

        // 2. On ne connecte PAS l'utilisateur ici.
        //    Il devra cliquer sur le lien reçu par email pour finaliser
        //    l'inscription et être connecté automatiquement.
        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error: any) {
        const errorData = error.response?.data || { error: "Échec de l'inscription" };
        return NextResponse.json(errorData, { status: 400 });
    }
}