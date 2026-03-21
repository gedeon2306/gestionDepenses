'use client'
import { ROUTES } from '@/src/constants/routes'
import Link from 'next/link'
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion'; // Correction : framer-motion ou motion/react selon votre config
import { useState, Suspense } from 'react'; // Ajout de Suspense
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

// 1. On isole la logique dans un composant enfant
function EmailSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const action = searchParams.get('action') || '';

  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (resent || resending) return;

    if (!email || !action) {
      toast.error("Impossible de renvoyer : email ou données manquant.");
      return;
    }

    setResending(true);
    try {
      if (action === 'inscription' || action === 'forgot-password') {
        await axios.post('/api/resend-confirmation', { email, action });
        setResent(true);
        toast.success('Email renvoyé !');
      } else {
        toast.error('Données invalides')
        return
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erreur lors du renvoi de l'email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      className="bg-[#111118] border border-[rgba(245,166,35,0.12)] rounded-2xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="flex flex-col items-center text-center mb-7">
        <div className="relative mb-6">
          <motion.div
            className="absolute inset-0 rounded-full bg-[rgba(245,166,35,0.08)]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative w-20 h-20 rounded-full bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.25)] flex items-center justify-center">
            <Mail className="w-9 h-9 text-[#f5a623]" />
          </div>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#f5a623]"
              style={{ top: '10%', left: '50%' }}
              animate={{
                y: [0, -28 - i * 10],
                x: [(i - 1) * 18],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        <h1 className="font-['Syne',sans-serif] font-extrabold text-2xl text-[#f0f0f5] mb-3">
          Email envoyé !
        </h1>
        <p className="text-[#8888a0] text-sm font-light leading-relaxed max-w-75">
          Un lien de confirmation a été envoyé à <span className="text-[#f5a623] font-bold">{email}</span>.
          Vérifiez votre boîte de réception.
        </p>
      </div>

      <motion.div
        className="bg-[#17171f] border border-[rgba(245,166,35,0.1)] rounded-xl p-4 mb-6 flex gap-3 items-start"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#f5a623] mt-1.5 shrink-0" />
        <p className="text-[#8888a0] text-xs leading-relaxed">
          Le lien est valable <span className="text-[#f0f0f5] font-medium">10 minutes</span>.
          Pensez à vérifier vos <span className="text-[#f0f0f5] font-medium">spams</span> si vous ne le trouvez pas.
        </p>
      </motion.div>

      <motion.button
        onClick={handleResend}
        disabled={resent || resending}
        className="flex items-center justify-center gap-2 w-full py-3 mb-4 rounded-xl border border-[rgba(245,166,35,0.15)] bg-[rgba(245,166,35,0.05)] text-[#f5a623] font-['DM_Sans',sans-serif] font-medium text-sm
                   hover:bg-[rgba(245,166,35,0.1)] hover:border-[rgba(245,166,35,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={!resent && !resending ? { y: -1 } : {}}
        whileTap={!resent && !resending ? { scale: 0.98 } : {}}
      >
        {resending ? (
          <>
            <motion.div
              className="w-4 h-4 rounded-full border-2 border-[#f5a623] border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
            />
            Envoi en cours…
          </>
        ) : resent ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              ✓
            </motion.div>
            Email renvoyé !
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Renvoyer l&apos;email
          </>
        )}
      </motion.button>

      <div className="flex justify-center">
        <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.15 }}>
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="flex items-center gap-2 text-[#8888a0] text-sm hover:text-[#f0f0f5] transition-colors duration-150 no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

// 2. Le composant principal enveloppe le tout
export default function EmailSentPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden font-['Syne',sans-serif]">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="absolute w-150 h-150 rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Link href={ROUTES.HOME} className="inline-block font-['Syne',sans-serif] font-extrabold text-2xl text-[#f5a623] no-underline tracking-tight">
            Depense<span className="text-[#f0f0f5]">Flow</span>
          </Link>
        </motion.div>

        {/* Le Suspense est ici */}
        <Suspense fallback={<div className="text-center text-[#f0f0f5]">Chargement...</div>}>
          <EmailSentContent />
        </Suspense>
      </div>
    </main>
  );
}