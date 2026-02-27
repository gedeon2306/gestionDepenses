'use server'
// src/app/actions/actions.ts
import api from '@/src/constants/api';
import { cookies } from 'next/headers';

// ─────────────────────────────────────────────
// Fonction utilitaire : renouvelle l'access token
// si Django répond 401 (token expiré)
// ─────────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) return null;

  try {
    const response = await api.post('token/refresh/', { refresh: refreshToken });
    const newAccessToken = response.data.access;

    cookieStore.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return newAccessToken;
  } catch (error) {
    console.error('Échec du renouvellement du token:', error);
    return null;
  }
}

// ─────────────────────────────────────────────
// Récupérer toutes les transactions
// ─────────────────────────────────────────────
export async function getTransactions() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return [];

  try {
    const response = await api.get('transactions/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return [];
      try {
        const response = await api.get('transactions/', {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        return response.data;
      } catch { return []; }
    }
    console.error('Erreur transactions:', error);
    return [];
  }
}

// ─────────────────────────────────────────────
// Ajouter une transaction
// ─────────────────────────────────────────────
export async function addTransaction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  const data = {
    text: formData.get('text'),
    amount: parseFloat(formData.get('amount') as string)
  };

  try {
    const response = await api.post('transactions/', data, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.post('transactions/', data, {
          headers: { Authorization: `Bearer ${newToken}`, 'Content-Type': 'application/json' }
        });
        return response.data;
      } catch { return null; }
    }
    console.error('Erreur ajout transaction:', error);
    return null;
  }
}

// ─────────────────────────────────────────────
// Supprimer une transaction
// On passe l'id de la transaction à supprimer
// ─────────────────────────────────────────────
export async function deleteTransaction(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return false;

  const baseURL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseURL}api/transactions/${id}/`;

  try {
    // On utilise fetch natif au lieu d'Axios
    // Axios a un bug avec les réponses 204 (No Content) dans les Server Actions Next.js
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    // 204 = supprimé avec succès (pas de contenu dans la réponse)
    // 200 = succès aussi (certaines configs Django)
    if (response.status === 204 || response.status === 200) {
      return true;
    }

    // Si 401 → token expiré → on renouvelle et on réessaie
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return false;

      const retryResponse = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${newToken}` }
      });

      return retryResponse.status === 204 || retryResponse.status === 200;
    }

    console.error('Erreur suppression, status:', response.status);
    return false;

  } catch (error) {
    console.error('Erreur suppression transaction:', error);
    return false;
  }
}

// ─────────────────────────────────────────────
// Modifier une transaction
// On passe l'id + les nouvelles données du formulaire
// ─────────────────────────────────────────────
export async function updateTransaction(id: string, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  const data = {
    text: formData.get('text'),
    amount: parseFloat(formData.get('amount') as string)
  };

  try {
    // PUT sur /transactions/<id>/
    const response = await api.put(`transactions/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.put(`transactions/${id}/`, data, {
          headers: { Authorization: `Bearer ${newToken}`, 'Content-Type': 'application/json' }
        });
        return response.data;
      } catch { return null; }
    }
    console.error('Erreur modification transaction:', error);
    return null;
  }
}

// ─────────────────────────────────────────────
// Récupérer le profil de l'utilisateur connecté
// ─────────────────────────────────────────────
export async function getUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  try {
    const response = await api.get('profile/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // { id, name, email }
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.get('profile/', {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        return response.data;
      } catch { return null; }
    }
    console.error('Erreur profil utilisateur:', error);
    return null;
  }
}

// ─────────────────────────────────────────────
// Modifier le profil de l'utilisateur connecté
// ─────────────────────────────────────────────
export async function updateUserProfile(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
  };

  try {
    const response = await api.put('profile/', data, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.put('profile/', data, {
          headers: { Authorization: `Bearer ${newToken}`, 'Content-Type': 'application/json' }
        });
        return response.data;
      } catch { return null; }
    }
    console.error('Erreur modification profil:', error);
    return null;
  }
}