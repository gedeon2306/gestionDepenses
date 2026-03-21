'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import axios from 'axios';
import { ROUTES } from '@/src/constants/routes';
import toast from 'react-hot-toast';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!uid || !token || !action) {
      toast.error('Page non trouvée');
      router.replace(ROUTES.HOME);
      return;
    }

    const saveTokensAndRedirect = async () => {
      try {
        if (action == 'inscription'){
          const confirmRes = await axios.post('/api/confirm-email', { uid, token, action });
          const { access, refresh } = confirmRes.data;
          
          await axios.post('/api/confirm-login', { access, refresh });
          
          router.replace(ROUTES.DASHBOARD.ROOT);
          router.refresh();
        } else if (action == 'forgot-password'){
          await axios.post('/api/confirm-email', { uid, token, action });
          router.replace(`${ROUTES.AUTH.RESET_PASSWORD}${uid ? `?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}` : ''}`);
          router.refresh();
        } else {
          toast.error('Données invalides')
          router.replace(ROUTES.HOME);
          router.refresh();
          return
        }
      } catch (error: any) {
        console.log(error?.response)
        if (error?.response?.status === 400) {
          const email = error?.response?.data?.email || '';
          toast.error(error?.response?.data.error);
          router.replace(`${ROUTES.AUTH.EMAIL_SEND}${email ? `?email=${encodeURIComponent(email)}&action=${encodeURIComponent(action)}` : ''}`);
          router.refresh();
          return;
        }
        toast.error('Erreur lors de la confirmation de votre email, veuillez réessayer');
        router.replace(ROUTES.AUTH.EMAIL_SEND);
        router.refresh();
        return;
      }
    };

    saveTokensAndRedirect();
  }, [router, searchParams]);

  // Petit écran de chargement pendant le traitement
  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 font-['Syne',sans-serif]">
      <div className="text-center text-[#f0f0f5]">
        <p className="text-lg font-semibold mb-2">Confirmation en cours...</p>
        <p className="text-sm text-[#8888a0]">
          Merci de patienter pendant que nous finalisons votre connexion.
        </p>
      </div>
    </main>
  );
}

