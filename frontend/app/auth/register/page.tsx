'use client'
import { ROUTES } from '@/src/constants/routes'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      await axios.post('/api/register', data);

      const email = formData.get('email') as string;
      const action = 'inscription';
      router.push(`${ROUTES.AUTH.EMAIL_SEND}?email=${encodeURIComponent(email)}&action=${action}`);
      router.refresh();
    } catch (err: any) {
      if (err?.response?.status === 400) {
        if(err?.response?.data?.email && err?.response?.data?.email == "user with this email already exists."){
          toast.error("Cet email est déjà utilisé");
        } else if(err?.response?.data?.email) {
          toast.error(err?.response?.data?.email);
        }else{
          toast.error(err?.response?.data?.error);
        }
      } else {
        toast.error("Problème de connexion au serveur");
      }
    } finally {
      setLoading(false);
    }
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
        className="absolute w-150 h-150 rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
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
          {/* Header */}
          <div className="mb-7">
            <h1 className="font-['Syne',sans-serif] font-extrabold text-2xl text-[#f0f0f5] mb-1">
              Créer un compte
            </h1>
            <p className="text-[#8888a0] text-sm font-light">
              Rejoignez DepenseFlow en quelques clics.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Nom */}
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                <input
                  name="name"
                  type="text"
                  placeholder="MALONGA Jean"
                  required
                  className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                             focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                <input
                  name="email"
                  type="email"
                  placeholder="email@domaine.com"
                  required
                  className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                             focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                <input
                  name="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                             focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                />
              </div>
              <span className="text-[#8888a0] text-xs pl-1">Minimum 8 caractères.</span>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
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
                  Inscription…
                </>
              ) : (
                <>
                  S'inscrire
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-[#8888a0] mt-6">
            Déjà un compte ?{' '}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="text-[#f5a623] font-semibold hover:text-[#ffc85c] transition-colors duration-150 no-underline"
            >
              Se connecter
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}