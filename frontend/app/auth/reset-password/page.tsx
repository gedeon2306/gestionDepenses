'use client'
import { useState } from 'react';
import toast from 'react-hot-toast';
import { permanentRedirect } from 'next/navigation';
import { Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);

  const traitement = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('Mot de passe réinitialisé');
      setTimeout(() => {
        permanentRedirect('/');
      }, 1500);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden font-['Syne',sans-serif]">

      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Background glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)' }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <span className="font-['Syne',sans-serif] font-extrabold text-2xl text-[#f5a623] tracking-tight">
            Depense<span className="text-[#f0f0f5]">Flow</span>
          </span>
        </motion.div>

        <motion.div
          className="bg-[#111118] border border-[rgba(245,166,35,0.12)] rounded-2xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Icon + Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center mb-5">
              <ShieldCheck className="w-8 h-8 text-[#f5a623]" />
            </div>
            <h1 className="font-['Syne',sans-serif] font-extrabold text-2xl text-[#f0f0f5] mb-2">
              Réinitialisation
            </h1>
            <p className="text-[#8888a0] text-sm font-light max-w-[300px]">
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Nouveau mot de passe */}
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                             focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                             focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              disabled={loading}
              onClick={traitement}
              className="flex items-center justify-center gap-2 w-full py-3 mt-1 rounded-xl bg-[#f5a623] text-black font-['DM_Sans',sans-serif] font-semibold text-sm
                         hover:bg-[#ffc85c] hover:shadow-[0_6px_24px_rgba(245,166,35,0.35)] transition-all duration-200 disabled:opacity-60"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-black border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  />
                  Mise à jour…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Mettre à jour le mot de passe
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}