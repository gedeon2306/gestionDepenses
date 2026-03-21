'use client'
import Link from 'next/link'
import { ROUTES } from '@/src/constants/routes'
import { ArrowLeft, Home } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect, useRef } from 'react'

export default function NotFoundPage() {
  // Parallax mouse tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8])
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    mouseX.set(e.clientX - cx)
    mouseY.set(e.clientY - cy)
  }

  const handleMouseLeave = () => {
    animate(mouseX, 0, { duration: 0.6 })
    animate(mouseY, 0, { duration: 0.6 })
  }

  return (
    <main
      className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 relative overflow-hidden font-['Syne',sans-serif]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Corner marks */}
      {['top-6 left-6 border-t border-l', 'top-6 right-6 border-t border-r', 'bottom-6 left-6 border-b border-l', 'bottom-6 right-6 border-b border-r'].map((cls, i) => (
        <div key={i} className={`fixed w-5 h-5 border-[rgba(245,166,35,0.2)] ${cls}`} />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* 404 with parallax */}
        <motion.div
          style={{ rotateX, rotateY, perspective: 800 }}
          className="relative mb-4 select-none"
        >
          {/* Shadow / ghost text */}
          <div
            className="absolute font-['Syne',sans-serif] font-extrabold leading-none tracking-tighter pointer-events-none"
            style={{
              fontSize: 'clamp(9rem, 28vw, 22rem)',
              top: '6px',
              left: '6px',
              WebkitTextStroke: '1px rgba(245,166,35,0.08)',
              color: 'transparent',
              whiteSpace: 'nowrap',
            }}
            aria-hidden
          >
            404
          </div>

          {/* Main 404 */}
          <motion.div
            className="font-['Syne',sans-serif] font-extrabold leading-none tracking-tighter relative z-10"
            style={{
              fontSize: 'clamp(9rem, 28vw, 22rem)',
              background: 'linear-gradient(160deg, #f0f0f5 20%, #f5a623 60%, #c47d0a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            404
          </motion.div>

          {/* Glow behind */}
          <div
            className="absolute inset-0 pointer-events-none -z-10 blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.6) 0%, transparent 65%)' }}
          />
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-12 h-px bg-linear-to-r from-transparent via-[#f5a623] to-transparent mb-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />

        {/* Message */}
        <motion.h1
          className="font-['Syne',sans-serif] font-extrabold text-2xl md:text-3xl text-[#f0f0f5] mb-3 tracking-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          Page introuvable
        </motion.h1>

        <motion.p
          className="text-[#8888a0] text-sm font-light leading-relaxed max-w-[320px] mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          La page que vous cherchez n'existe pas ou a été déplacée.
          Revenez à l'accueil pour continuer.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex items-center gap-3 flex-wrap justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={ROUTES.DASHBOARD.ROOT}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#f5a623] text-black font-['DM_Sans',sans-serif] font-semibold text-sm
                         hover:bg-[#ffc85c] hover:shadow-[0_6px_28px_rgba(245,166,35,0.38)] transition-all duration-200 no-underline"
            >
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </motion.div>

          <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.15 }}>
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-[rgba(255,255,255,0.08)] bg-transparent text-[#8888a0] font-['DM_Sans',sans-serif] font-medium text-sm
                         hover:text-[#f0f0f5] hover:border-[rgba(255,255,255,0.18)] transition-all duration-200 no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Landing page
            </Link>
          </motion.div>
        </motion.div>

        {/* Logo watermark */}
        <motion.div
          className="mt-16 font-['Syne',sans-serif] font-extrabold text-sm tracking-tight opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <span className="text-[#f5a623]">Depense</span>
          <span className="text-[#f0f0f5]">Flow</span>
        </motion.div>

      </div>
    </main>
  )
}