'use client'
import { ROUTES } from '@/src/constants/routes'
import { ArrowLeft, KeyRound, Link2, Mail } from 'lucide-react';
import Link from 'next/link'
import { motion } from 'motion/react';

export default function ForgotPasswordPage() {
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
          <Link href={ROUTES.HOME} className="inline-block font-['Syne',sans-serif] font-extrabold text-2xl text-[#f5a623] no-underline tracking-tight">
            Depense<span className="text-[#f0f0f5]">Flow</span>
          </Link>
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
              <KeyRound className="w-8 h-8 text-[#f5a623]" />
            </div>
            <h1 className="font-['Syne',sans-serif] font-extrabold text-2xl text-[#f0f0f5] mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-[#8888a0] text-sm font-light max-w-[320px]">
              Entrez votre adresse email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          <form className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">
                Votre email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                <input
                  type="email"
                  placeholder="nom@exemple.com"
                  required
                  className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                             focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={ROUTES.AUTH.RESET_PASSWORD}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#f5a623] text-black font-['DM_Sans',sans-serif] font-semibold text-sm
                           hover:bg-[#ffc85c] hover:shadow-[0_6px_24px_rgba(245,166,35,0.35)] transition-all duration-200 no-underline"
              >
                Envoyer le lien
                <Link2 className="w-4 h-4" />
              </Link>
            </motion.div>
          </form>

          {/* Back to login */}
          <div className="flex justify-center mt-6">
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
      </motion.div>
    </main>
  );
}