'use client';
// src/components/NavBar.tsx
import { ROUTES } from '@/src/constants/routes'
import Link from 'next/link'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import icon from '@/public/icon.png'
import { useEffect, useState, useRef } from 'react';
import { getUserProfile } from '@/src/app/actions/actions';
import { LayoutDashboard, LogOut, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Nav() {
  const router = useRouter();
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      if (profile) setUserName(profile.name);
    };
    loadProfile();
  }, []);

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true)
    try {
      await axios.post('/api/logout');
      router.push(ROUTES.HOME);
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    } finally {
      setLoading(false)
    }
  };

  // Initiales de l'utilisateur pour l'avatar
  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '…';

  return (
    <motion.nav
      className="sticky top-0 z-50 w-full px-6 py-3.5 flex items-center justify-between backdrop-blur-xl border-b border-[rgba(245,166,35,0.12)] bg-[rgba(10,10,15,0.85)]"
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Logo */}
      <Link
        href={ROUTES.HOME}
        className="font-['Syne',sans-serif] font-extrabold text-xl tracking-tight no-underline text-[#f5a623]"
      >
        Depense<span className="text-[#f0f0f5]">Flow</span>
      </Link>

      {/* Avatar dropdown */}
      <div ref={dropdownRef} className="relative">
        <motion.button
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[rgba(245,166,35,0.15)] bg-[rgba(245,166,35,0.05)] hover:border-[rgba(245,166,35,0.3)] hover:bg-[rgba(245,166,35,0.09)] transition-all duration-200"
          onClick={() => setOpen(prev => !prev)}
          whileTap={{ scale: 0.97 }}
        >
          {/* Avatar cercle avec initiales ou image */}
          <div className="w-7 h-7 rounded-full bg-[rgba(245,166,35,0.18)] border border-[rgba(245,166,35,0.3)] flex items-center justify-center overflow-hidden shrink-0">
            <img
              alt="Profil"
              src={icon.src}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <span className="font-['DM_Sans',sans-serif] text-sm font-medium text-[#f0f0f5] max-w-30 truncate hidden sm:block">
            {userName ?? 'Chargement…'}
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-[#8888a0]" />
          </motion.div>
        </motion.button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute right-0 mt-2 w-56 bg-[#111118] border border-[rgba(245,166,35,0.12)] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {/* User info header */}
              <div className="px-4 py-3.5 border-b border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[rgba(245,166,35,0.15)] border border-[rgba(245,166,35,0.25)] flex items-center justify-center font-['Syne',sans-serif] font-bold text-[#f5a623] text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-['Syne',sans-serif] font-semibold text-sm text-[#f0f0f5] truncate">
                      {userName ?? 'Chargement…'}
                    </div>
                    <div className="text-[#8888a0] text-xs">Compte actif</div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <Link
                  href={ROUTES.DASHBOARD.ROOT}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8888a0] text-sm hover:text-[#f0f0f5] hover:bg-[#1e1e28] transition-all duration-150 no-underline"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  Dashboard
                </Link>

                <Link
                  href={ROUTES.DASHBOARD.USER_PROFILE}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[#8888a0] text-sm hover:text-[#f0f0f5] hover:bg-[#1e1e28] transition-all duration-150 no-underline"
                >
                  <span className="flex items-center gap-3">
                    <User className="w-4 h-4 shrink-0" />
                    Profil
                  </span>
                  <span className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(245,166,35,0.15)] text-[#f5a623] border border-[rgba(245,166,35,0.2)]">
                    Nouveau
                  </span>
                </Link>

                <Link
                  href={ROUTES.DASHBOARD.RAPPORT}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[#8888a0] text-sm hover:text-[#f0f0f5] hover:bg-[#1e1e28] transition-all duration-150 no-underline"
                >
                  <span className="flex items-center gap-3">
                    <User className="w-4 h-4 shrink-0" />
                    Rapports
                  </span>
                  <span className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(245,166,35,0.15)] text-[#f5a623] border border-[rgba(245,166,35,0.2)]">
                    Nouveau
                  </span>
                </Link>

                <div className="h-px bg-[rgba(255,255,255,0.05)] my-1 mx-2" />

                <motion.button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[#ef4444] text-sm hover:bg-[rgba(239,68,68,0.08)] transition-all duration-150 text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading 
                    ? <><motion.div className="w-4 h-4 rounded-full border-2 border-[#ef4444] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> Déconnexion…</>
                    : <><LogOut className="w-4 h-4" /> Déconnexion</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}