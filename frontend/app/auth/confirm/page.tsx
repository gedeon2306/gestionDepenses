'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react'; // Ajout de Suspense
import axios from 'axios';
import { ROUTES } from '@/src/constants/routes';
import toast from 'react-hot-toast';

// 1. On crée un composant interne qui gère la logique
function ConfirmContent() {
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
        if (action === 'inscription') {
          const confirmRes = await axios.post('/api/confirm-email', { uid, token, action });
          const { access, refresh } = confirmRes.data;
          await axios.post('/api/confirm-login', { access, refresh });
          router.replace(ROUTES.DASHBOARD.ROOT);
        } else if (action === 'forgot-password') {
          await axios.post('/api/confirm-email', { uid, token, action });
          router.replace(`${ROUTES.AUTH.RESET_PASSWORD}?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`);
        } else {
          toast.error('Données invalides');
          router.replace(ROUTES.HOME);
        }
        router.refresh();
      } catch (error: any) {
        if (error?.response?.status === 400) {
          const email = error?.response?.data?.email || '';
          toast.error(error?.response?.data.error);
          router.replace(`${ROUTES.AUTH.EMAIL_SEND}${email ? `?email=${encodeURIComponent(email)}&action=${encodeURIComponent(action)}` : ''}`);
        } else {
          toast.error('Erreur lors de la confirmation, veuillez réessayer');
          router.replace(ROUTES.AUTH.EMAIL_SEND);
        }
        router.refresh();
      }
    };

    saveTokensAndRedirect();
  }, [router, searchParams]);

  return (
    <div className="text-center text-[#f0f0f5]">
      <p className="text-lg font-semibold mb-2">Confirmation en cours...</p>
      <p className="text-sm text-[#8888a0]">
        Merci de patienter pendant que nous finalisons votre connexion.
      </p>
    </div>
  );
}

// 2. Le composant principal exporté utilise Suspense
export default function ConfirmPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 font-['Syne',sans-serif]">
      <Suspense fallback={<p className="text-[#f0f0f5]">Chargement...</p>}>
        <ConfirmContent />
      </Suspense>
    </main>
  );
}