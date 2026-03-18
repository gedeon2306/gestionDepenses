'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, Plus, PenLine, TrendingUp, ShieldCheck,
  Smartphone, ArrowRight, TrendingDown, Wallet, Activity,
} from 'lucide-react'
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from 'motion/react'
import { ROUTES } from '@/src/constants/routes'

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const features = [
  {
    icon: <LayoutDashboard className="w-6 h-6 text-[#f5a623]" />,
    title: 'Tableau de bord en temps réel',
    desc: 'Visualisez instantanément votre solde, vos revenus et dépenses avec des indicateurs clairs et des graphiques intuitifs.',
  },
  {
    icon: <Plus className="w-6 h-6 text-[#f5a623]" />,
    title: 'Ajout rapide de transactions',
    desc: 'Enregistrez une dépense ou un revenu en quelques secondes. Montant positif ou négatif, description, tout est simple.',
  },
  {
    icon: <PenLine className="w-6 h-6 text-[#f5a623]" />,
    title: 'Modification & suppression',
    desc: 'Corrigez une erreur ou supprimez une transaction en un clic. Vos données sont toujours à jour et exactes.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-[#f5a623]" />,
    title: 'Suivi revenus / dépenses',
    desc: 'Comparez visuellement vos revenus et dépenses grâce à une barre de progression qui vous alerte quand vous dépensez trop.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#f5a623]" />,
    title: 'Sécurisé avec JWT',
    desc: 'Vos données financières sont protégées par une authentification JWT. Chaque utilisateur ne voit que ses propres transactions.',
  },
  {
    icon: <Smartphone className="w-6 h-6 text-[#f5a623]" />,
    title: '100% responsive',
    desc: "Accédez à votre tableau de bord depuis n'importe quel appareil — mobile, tablette ou desktop — avec une expérience optimale.",
  },
]

const stats = [
  { target: 2400, suffix: '+', label: 'Transactions suivies' },
  { target: 98,   suffix: '%', label: 'de satisfaction' },
  { target: 150,  suffix: '+', label: 'Utilisateurs actifs' },
  { target: 100,  suffix: '%', label: 'Gratuit' },
]

const steps = [
  { num: '1', title: 'Créez votre compte',        desc: 'Inscrivez-vous avec votre nom et email. Votre espace sécurisé est créé instantanément.' },
  { num: '2', title: 'Ajoutez vos transactions',  desc: 'Saisissez vos revenus (montant positif) et dépenses (montant négatif) avec une description.' },
  { num: '3', title: 'Suivez vos finances',       desc: 'Consultez votre solde, analysez vos habitudes et gardez le contrôle de votre budget en temps réel.' },
]

const mockRows = [
  { label: 'Salaire mensuel',       amount: '+3 500,00 f', date: '26 fév. 2026', type: 'income'  },
  { label: 'Loyer appartement',     amount: '-950,00 f',   date: '25 fév. 2026', type: 'expense' },
  { label: 'Freelance design',      amount: '+1 700,00 f', date: '22 fév. 2026', type: 'income'  },
  { label: 'Courses alimentaires',  amount: '-287,00 f',   date: '20 fév. 2026', type: 'expense' },
  { label: 'Abonnements divers',    amount: '-350,00 f',   date: '18 fév. 2026', type: 'expense' },
]

// ─────────────────────────────────────────────
// Animated counter — Motion only
// ─────────────────────────────────────────────
function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.floor(v) + suffix)

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, target, { duration: 1.8, ease: [0, 0, 0.2, 1] })
    return controls.stop
  }, [inView, count, target])

  return (
    <div ref={ref} className="text-center">
      <motion.div className="font-['Syne',sans-serif] text-5xl font-extrabold text-[#f5a623] leading-none mb-1.5">
        {rounded}
      </motion.div>
      <div className="text-[#8888a0] text-sm">{label}</div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Feature card — scroll reveal via Motion
// ─────────────────────────────────────────────
function FeatureCard({ icon, title, desc, index }: { icon: React.ReactNode; title: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="card bg-[#1e1e28] border border-[rgba(245,166,35,0.12)] rounded-[18px] p-8 relative overflow-hidden
                 hover:border-[rgba(245,166,35,0.25)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_20px_rgba(245,166,35,0.05)]
                 transition-[border-color,box-shadow] duration-300"
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#f5a623] to-transparent"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="w-12 h-12 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] rounded-xl flex items-center justify-center mb-5">
        {icon}
      </div>
      <div className="font-['Syne',sans-serif] font-bold text-lg text-[#f0f0f5] mb-2">{title}</div>
      <div className="text-[#8888a0] text-sm leading-relaxed font-light">{desc}</div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Step — slide in from left via Motion
// ─────────────────────────────────────────────
function Step({ num, title, desc, isLast, index }: { num: string; title: string; desc: string; isLast: boolean; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
      className="flex gap-8 items-start"
    >
      <div className="flex flex-col items-center">
        <div className="w-11 h-11 bg-[#f5a623] text-black rounded-full flex items-center justify-center font-['Syne',sans-serif] font-extrabold text-base shrink-0">
          {num}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 min-h-10 bg-linear-to-b from-[#f5a623] to-transparent my-1" />
        )}
      </div>
      <div className="pb-10">
        <div className="font-['Syne',sans-serif] font-bold text-[1.05rem] text-[#f0f0f5] mb-1.5">{title}</div>
        <div className="text-[#8888a0] text-sm font-light leading-relaxed">{desc}</div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Progress bar — Motion animate on inView
// ─────────────────────────────────────────────
function AnimatedProgressBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="h-1.5 bg-[#25252f] rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-linear-to-r from-[#c47d0a] to-[#f5a623] rounded-full"
        initial={{ width: 0 }}
        animate={inView ? { width: '68%' } : {}}
        transition={{ duration: 2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Blinking dot — Motion keyframes
// ─────────────────────────────────────────────
function BlinkDot() {
  return (
    <motion.span
      className="w-1.5 h-1.5 bg-[#f5a623] rounded-full"
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Hero blob pulse via Motion
  const blobScale = useMotionValue(1)
  useEffect(() => {
    let cancelled = false
    const loop = async () => {
      while (!cancelled) {
        await animate(blobScale, 1.15, { duration: 3, ease: 'easeInOut' })
        await animate(blobScale, 1,    { duration: 3, ease: 'easeInOut' })
      }
    }
    loop()
    return () => { cancelled = true }
  }, [blobScale])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-['Syne',sans-serif] overflow-x-hidden">

      {/* Noise texture overlay — inline style only for the SVG data URI, no CSS class */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── NAV ── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-100 px-8 py-5 flex items-center justify-between backdrop-blur-xl border-b border-[rgba(245,166,35,0.12)] transition-[background] duration-300"
        style={{ background: scrolled ? 'rgba(10,10,15,0.95)' : 'rgba(10,10,15,0.7)' }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Link href={ROUTES.HOME} className="font-['Syne',sans-serif] font-extrabold text-xl text-[#f5a623] tracking-tight no-underline">
          Depense<span className="text-[#f0f0f5]">Flow</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
          {[['#fonctionnalites', 'Fonctionnalités'], ['#comment', 'Comment ça marche'], ['#cta', 'Commencer']].map(([href, label]) => (
            <li key={href}>
              <a href={href} className="text-[#8888a0] no-underline text-sm font-medium hover:text-[#f0f0f5] transition-colors duration-200">
                {label}
              </a>
            </li>
          ))}
        </ul>

        <Link
          href={ROUTES.AUTH.REGISTER}
          className="hidden lg:inline-flex btn btn-sm bg-[#f5a623] text-black border-none rounded-full font-['DM_Sans',sans-serif] font-semibold text-sm
                     hover:bg-[#ffc85c] hover:shadow-[0_4px_20px_rgba(245,166,35,0.35)] transition-all duration-200 no-underline"
        >
          Essayer gratuitement
        </Link>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 relative">

        {/* Pulsing blob */}
        <motion.div
          className="absolute w-175 h-175 rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)',
            scale: blobScale,
          }}
        />

        {/* Badge */}
        <motion.div
          className="relative z-10 inline-flex items-center gap-2 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.25)] text-[#ffc85c] px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <BlinkDot />
          Gestion financière personnelle
        </motion.div>

        <motion.h1
          className="relative z-10 font-['Syne',sans-serif] font-extrabold leading-[1.08] tracking-tight mb-5 text-[clamp(2.2rem,5.5vw,4.5rem)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Reprenez le contrôle<br />
          de vos{' '}
          <span className="text-[#f5a623] relative after:content-[''] after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.75 after:bg-linear-to-r after:from-[#f5a623] after:to-transparent after:rounded-sm">
            finances
          </span>
        </motion.h1>

        <motion.p
          className="relative z-10 text-[#8888a0] max-w-130 mx-auto mb-10 font-light text-[clamp(1rem,2.5vw,1.2rem)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          Suivez vos revenus et dépenses en temps réel. Des tableaux de bord clairs, des analyses pertinentes, une interface intuitive.
        </motion.p>

        <motion.div
          className="relative z-10 flex gap-4 justify-center flex-wrap max-sm:flex-col max-sm:items-stretch"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="btn bg-[#f5a623] text-black border-none rounded-full font-['DM_Sans',sans-serif] font-semibold text-base px-8 py-3 inline-flex items-center gap-2
                         hover:bg-[#ffc85c] hover:shadow-[0_8px_30px_rgba(245,166,35,0.4)] transition-all duration-200 no-underline max-sm:w-full max-sm:justify-center"
            >
              Commencer gratuitement <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="btn bg-transparent text-[#f0f0f5] border border-[#25252f] rounded-full font-['DM_Sans',sans-serif] font-medium text-base px-8 py-3 inline-flex items-center gap-2
                         hover:border-[#f5a623] hover:text-[#f5a623] transition-all duration-200 no-underline max-sm:w-full max-sm:justify-center"
            >
              Se connecter
            </Link>
          </motion.div>
        </motion.div>

        {/* DASHBOARD MOCKUP */}
        <motion.div
          className="relative z-10 mt-20 w-full max-w-205 mx-auto px-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-24 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(245,166,35,0.2) 0%, transparent 70%)' }}
          />
          {/* Outer wrapper: rounded corners, NO overflow-hidden so inner scroll works */}
          <div className="card bg-[#1e1e28] border border-[rgba(245,166,35,0.12)] rounded-[20px] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(245,166,35,0.08)]">
            {/* Window bar */}
            <div className="bg-[#17171f] px-5 py-3.5 flex items-center gap-2 border-b border-[rgba(245,166,35,0.12)] rounded-t-[20px]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              <div className="flex-1 bg-[#111118] rounded-md px-3 py-1 text-xs text-[#8888a0] ml-2">
                Depenseflow - Tableau de bord
              </div>
            </div>
            {/* Scrollable body on mobile — min-w forces layout to never collapse */}
            <div className="overflow-x-auto">
              <div className="p-6 min-w-140">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { icon: <Wallet className="w-3 h-3" />,      label: 'Votre solde', value: '+3 613,00 f', color: 'text-[#f5a623]' },
                    { icon: <TrendingUp className="w-3 h-3" />,   label: 'Revenus',     value: '+5 200,00 f', color: 'text-[#22c55e]' },
                    { icon: <TrendingDown className="w-3 h-3" />, label: 'Dépenses',    value: '-1 587,00 f', color: 'text-[#ef4444]' },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl p-4">
                      <div className="flex items-center gap-1.5 text-[#8888a0] text-[0.65rem] uppercase tracking-widest mb-1">
                        {s.icon} {s.label}
                      </div>
                      <div className={`font-['Syne',sans-serif] font-bold text-xl ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {/* Progress */}
                <div className="bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl p-4 mb-4">
                  <div className="flex justify-between text-[0.7rem] text-[#8888a0] mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3" /> Dépenses par rapport aux Revenus
                    </span>
                    <span className="text-[#f5a623]">68%</span>
                  </div>
                  <AnimatedProgressBar />
                </div>
                {/* Table */}
                <div className="bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] px-4 py-2.5 border-b border-[rgba(245,166,35,0.12)] text-[0.65rem] text-[#8888a0] uppercase tracking-widest">
                    <span>Description</span><span>Montant</span>
                    <span>Date</span><span>Type</span>
                  </div>
                  {mockRows.map((row, i) => (
                    <motion.div
                      key={i}
                      className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] px-4 py-3 border-b border-[rgba(255,255,255,0.03)] last:border-b-0 text-[0.78rem] items-center"
                      whileHover={{ backgroundColor: '#25252f' }}
                      transition={{ duration: 0.15 }}
                    >
                      <span>{row.label}</span>
                      <span className={`font-semibold ${row.type === 'income' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{row.amount}</span>
                      <span className="text-[#8888a0] text-[0.7rem]">{row.date}</span>
                      <span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[0.62rem] font-semibold ${
                          row.type === 'income'
                            ? 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]'
                            : 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]'
                        }`}>
                          {row.type === 'income' ? 'Revenu' : 'Dépense'}
                        </span>
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#111118] border-t border-b border-[rgba(245,166,35,0.12)] py-20 px-8">
        <div className="max-w-275 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((s) => <StatCounter key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalites" className="py-28 px-8">
        <div className="max-w-275 mx-auto">
          <motion.span
            className="inline-block text-[0.75rem] font-semibold text-[#f5a623] uppercase tracking-[0.12em] mb-4"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Fonctionnalités
          </motion.span>
          <motion.h2
            className="font-['Syne',sans-serif] font-extrabold tracking-tight leading-[1.1] mb-5 text-[clamp(2rem,4vw,3rem)]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Tout ce dont vous<br />avez besoin
          </motion.h2>
          <motion.p
            className="text-[#8888a0] text-[1.05rem] font-light max-w-120"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Un outil simple et puissant pour garder le contrôle de votre argent au quotidien.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="comment" className="bg-[#111118] border-t border-b border-[rgba(245,166,35,0.12)] py-28 px-8">
        <div className="max-w-275 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span
              className="inline-block text-[0.75rem] font-semibold text-[#f5a623] uppercase tracking-[0.12em] mb-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              Comment ça marche
            </motion.span>
            <motion.h2
              className="font-['Syne',sans-serif] font-extrabold tracking-tight leading-[1.1] mb-5 text-[clamp(2rem,4vw,3rem)]"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              Démarrez en<br />3 étapes
            </motion.h2>
            <motion.p
              className="text-[#8888a0] text-[1.05rem] font-light max-w-120"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Aucune configuration complexe. En moins de 2 minutes vous avez accès à votre espace personnel.
            </motion.p>
          </div>
          <div className="flex flex-col">
            {steps.map((s, i) => (
              <Step key={s.num} {...s} isLast={i === steps.length - 1} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="py-28 px-8 text-center">
        <div className="card bg-[#1e1e28] border border-[rgba(245,166,35,0.12)] rounded-3xl p-16 max-sm:p-10 relative overflow-hidden max-w-275 mx-auto">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-100 h-100 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)' }}
          />
          <motion.h2
            className="relative font-['Syne',sans-serif] font-extrabold tracking-tight leading-[1.1] mb-4 text-[clamp(2rem,4vw,3.2rem)]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Prêt à maîtriser<br />vos finances ?
          </motion.h2>
          <motion.p
            className="relative text-[#8888a0] mb-10 text-[1.05rem] font-light"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            Rejoignez des centaines d&apos;utilisateurs qui font confiance à DepenseFlow pour gérer leur argent.
          </motion.p>
          <motion.div
            className="relative flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="btn bg-[#f5a623] text-black border-none rounded-full font-['DM_Sans',sans-serif] font-semibold text-base px-8 py-3 inline-flex items-center gap-2
                           hover:bg-[#ffc85c] hover:shadow-[0_8px_30px_rgba(245,166,35,0.4)] transition-all duration-200 no-underline"
              >
                Créer un compte gratuit <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="btn bg-transparent text-[#f0f0f5] border border-[#25252f] rounded-full font-['DM_Sans',sans-serif] font-medium text-base px-8 py-3 inline-flex items-center gap-2
                           hover:border-[#f5a623] hover:text-[#f5a623] transition-all duration-200 no-underline"
              >
                Se connecter
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-8 py-10 border-t border-[rgba(245,166,35,0.12)] flex items-center justify-between flex-wrap gap-4 max-sm:flex-col max-sm:text-center">
        <div className="font-['Syne',sans-serif] font-extrabold text-[#f5a623] text-lg">DepenseFlow</div>
        <div className="text-[#8888a0] text-xs">
          Copyright © {new Date().getFullYear()} DepenseFlow — Tous droits réservés
        </div>
      </footer>
    </div>
  )
}