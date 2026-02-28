'use client'
// app/landing/page.tsx  (ou app/page.tsx si c'est ta page d'accueil publique)
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Plus,
  PenLine,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  TrendingDown,
  Wallet,
  Activity,
} from 'lucide-react';
import { ROUTES } from '@/src/constants/routes';


// ── Données des fonctionnalités avec icônes Lucide ──
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
];

// ── Données des stats ──
const stats = [
  { target: 2400, suffix: '+', label: 'Transactions suivies' },
  { target: 98,   suffix: '%', label: 'de satisfaction' },
  { target: 150,  suffix: '+', label: 'Utilisateurs actifs' },
  { target: 100,  suffix: '%', label: 'Gratuit' },
];

// ── Données des étapes ──
const steps = [
  { num: '1', title: 'Créez votre compte', desc: 'Inscrivez-vous avec votre nom et email. Votre espace sécurisé est créé instantanément.' },
  { num: '2', title: 'Ajoutez vos transactions', desc: 'Saisissez vos revenus (montant positif) et dépenses (montant négatif) avec une description.' },
  { num: '3', title: 'Suivez vos finances', desc: 'Consultez votre solde, analysez vos habitudes et gardez le contrôle de votre budget en temps réel.' },
];

// ── Données du tableau mockup ──
const mockRows = [
  { label: 'Salaire mensuel',    amount: '+3 500,00 f', date: '26 fév. 2026', type: 'income' },
  { label: 'Loyer appartement', amount: '-950,00 f',   date: '25 fév. 2026', type: 'expense' },
  { label: 'Freelance design',  amount: '+1 700,00 f', date: '22 fév. 2026', type: 'income' },
  { label: 'Courses alimentaires', amount: '-287,00 f', date: '20 fév. 2026', type: 'expense' },
  { label: 'Abonnements divers', amount: '-350,00 f',  date: '18 fév. 2026', type: 'expense' },
];

// ── Hook pour animer les compteurs ──
function useCounter(target: number, suffix: string, triggerRef: React.RefObject<HTMLDivElement>) {
  const [value, setValue] = useState('0' + suffix);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      const duration = 1800;
      let start: number | null = null;

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(eased * target) + suffix);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, triggerRef]);

  return value;
}

// ── Composant compteur individuel ──
function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null!);
  const value = useCounter(target, suffix, ref);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '3rem', fontWeight: 800, color: '#f5a623', lineHeight: 1, marginBottom: '0.4rem' }}>{value}</div>
      <div style={{ color: '#8888a0', fontSize: '0.9rem' }}>{label}</div>
    </div>
  );
}

// ── Composant carte feature avec scroll reveal ──
function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="feature-card" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s, transform 0.5s' }}>
      <div className="feature-icon">{icon}</div>
      <div className="feature-title">{title}</div>
      <div className="feature-desc">{desc}</div>
    </div>
  );
}

// ── Composant étape avec scroll reveal ──
function Step({ num, title, desc, isLast, delay }: { num: string; title: string; desc: string; isLast: boolean; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="step" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-20px)', transition: 'opacity 0.5s, transform 0.5s' }}>
      <div className="step-left">
        <div className="step-num">{num}</div>
        {!isLast && <div className="step-line" />}
      </div>
      <div className="step-content">
        <div className="step-title">{title}</div>
        <div className="step-desc">{desc}</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  // Nav scroll effect
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* STYLES */}
      <style>{`
        *,
        *::before,
        *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Syne', sans-serif;
            background: var(--bg);
            color: var(--text);
            overflow-x: hidden;
            line-height: 1.6;
        }

        body::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
            pointer-events: none;
            z-index: 0;
            opacity: 0.5;
        }

        /* NAV */
        .lp-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            padding: 1.2rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
            transition: background 0.3s;
        }

        .nav-logo {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 1.3rem;
            color: var(--gold);
            letter-spacing: -0.02em;
            text-decoration: none;
        }

        .nav-logo span {
            color: var(--text);
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 2rem;
            list-style: none;
        }

        .nav-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.2s;
        }

        .nav-links a:hover {
            color: var(--text);
        }

        .btn-nav {
            background: var(--gold);
            color: #000;
            border: none;
            padding: 0.55rem 1.3rem;
            border-radius: 100px;
            font-family: 'DM Sans', sans-serif;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            display: inline-block;
        }

        .btn-nav:hover {
            background: var(--gold-light);
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(245, 166, 35, 0.35);
        }

        /* HERO */
        .hero {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 8rem 1.5rem 4rem;
            position: relative;
        }

        .hero::after {
            content: '';
            position: absolute;
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, rgba(245, 166, 35, 0.12) 0%, transparent 70%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: pulse-blob 6s ease-in-out infinite;
        }

        @keyframes pulse-blob {

            0%,
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1
            }

            50% {
                transform: translate(-50%, -50%) scale(1.15);
                opacity: 0.7
            }
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(245, 166, 35, 0.1);
            border: 1px solid rgba(245, 166, 35, 0.25);
            color: var(--gold-light);
            padding: 0.4rem 1rem;
            border-radius: 100px;
            font-size: 0.8rem;
            font-weight: 500;
            margin-bottom: 2rem;
            animation: fade-up 0.6s ease both;
            position: relative;
            z-index: 1;
        }

        .hero-badge .dot {
            width: 6px;
            height: 6px;
            background: var(--gold);
            border-radius: 50%;
            animation: blink 1.5s infinite;
        }

        @keyframes blink {

            0%,
            100% {
                opacity: 1
            }

            50% {
                opacity: 0.3
            }
        }

        .hero h1 {
            font-family: 'Syne', sans-serif;
            font-size: clamp(2.2rem, 5.5vw, 4.5rem);
            font-weight: 800;
            line-height: 1.08;
            letter-spacing: -0.03em;
            margin-bottom: 1.3rem;
            animation: fade-up 0.6s 0.1s ease both;
            position: relative;
            z-index: 1;
        }

        .accent {
            color: var(--gold);
            position: relative;
        }

        .accent::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--gold), transparent);
            border-radius: 2px;
        }

        .hero-sub {
            font-size: clamp(1rem, 2.5vw, 1.2rem);
            color: var(--text-muted);
            max-width: 520px;
            margin: 0 auto 2.5rem;
            font-weight: 300;
            animation: fade-up 0.6s 0.2s ease both;
            position: relative;
            z-index: 1;
        }

        .hero-cta {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            animation: fade-up 0.6s 0.3s ease both;
            position: relative;
            z-index: 1;
        }

        .btn-primary {
            background: var(--gold);
            color: #000;
            border: none;
            padding: 0.85rem 2rem;
            border-radius: 100px;
            font-family: 'DM Sans', sans-serif;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.25s;
        }

        .btn-primary:hover {
            background: var(--gold-light);
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(245, 166, 35, 0.4);
        }

        .btn-ghost {
            background: transparent;
            color: var(--text);
            border: 1px solid var(--surface2);
            padding: 0.85rem 2rem;
            border-radius: 100px;
            font-family: 'DM Sans', sans-serif;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.25s;
        }

        .btn-ghost:hover {
            border-color: var(--gold);
            color: var(--gold);
            transform: translateY(-2px);
        }

        /* MOCKUP */
        .mockup-wrapper {
            margin-top: 5rem;
            padding: 0 2rem;
            position: relative;
            z-index: 1;
            animation: fade-up 0.8s 0.4s ease both;
        }

        .mockup-wrapper::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 100px;
            background: radial-gradient(ellipse, rgba(245, 166, 35, 0.2) 0%, transparent 70%);
            pointer-events: none;
        }

        .mockup {
            max-width: 820px;
            margin: 0 auto;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04), 0 40px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(245, 166, 35, 0.08);
        }

        .mockup-bar {
            background: var(--bg3);
            padding: 0.9rem 1.2rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            border-bottom: 1px solid var(--border);
        }

        .dot-r {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ef4444;
        }

        .dot-y {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #f59e0b;
        }

        .dot-g {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #22c55e;
        }

        .mockup-url {
            flex: 1;
            background: var(--bg2);
            border-radius: 6px;
            padding: 0.3rem 0.8rem;
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-left: 0.5rem;
        }

        .mockup-body {
            padding: 1.5rem;
        }

        .mock-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.8rem;
            margin-bottom: 1rem;
        }

        .mock-stat {
            background: var(--bg3);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1rem;
        }

        .mock-stat-label {
            font-size: 0.65rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 0.3rem;
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }

        .mock-stat-val {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 1.2rem;
        }

        .mock-stat-val.green {
            color: var(--success)
        }

        .mock-stat-val.red {
            color: var(--error)
        }

        .mock-stat-val.gold {
            color: var(--gold)
        }

        .mock-progress-wrap {
            background: var(--bg3);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .mock-progress-header {
            display: flex;
            justify-content: space-between;
            font-size: 0.7rem;
            color: var(--text-muted);
            margin-bottom: 0.6rem;
        }

        .mock-bar-bg {
            height: 6px;
            background: var(--surface2);
            border-radius: 3px;
            overflow: hidden;
        }

        .mock-bar-fill {
            height: 100%;
            width: 68%;
            background: linear-gradient(90deg, var(--gold-dark), var(--gold));
            border-radius: 3px;
            animation: grow-bar 2s 1s ease both;
        }

        @keyframes grow-bar {
            from {
                width: 0
            }

            to {
                width: 68%
            }
        }

        .mock-table {
            background: var(--bg3);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
        }

        .mock-table-head {
            display: grid;
            grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
            padding: 0.6rem 1rem;
            border-bottom: 1px solid var(--border);
            font-size: 0.65rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        .mock-row {
            display: grid;
            grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
            padding: 0.7rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            font-size: 0.78rem;
            align-items: center;
            transition: background 0.15s;
        }

        .mock-row:last-child {
            border-bottom: none
        }

        .mock-row:hover {
            background: var(--surface2)
        }

        .mock-amount.pos {
            color: var(--success);
            font-weight: 600
        }

        .mock-amount.neg {
            color: var(--error);
            font-weight: 600
        }

        .mock-badge {
            display: inline-block;
            padding: 0.15rem 0.5rem;
            border-radius: 100px;
            font-size: 0.62rem;
            font-weight: 600;
        }

        .mock-badge.income {
            background: rgba(34, 197, 94, 0.15);
            color: var(--success)
        }

        .mock-badge.expense {
            background: rgba(239, 68, 68, 0.15);
            color: var(--error)
        }

        /* SECTIONS */
        .lp-section {
            padding: 7rem 2rem;
            position: relative;
        }

        .section-inner {
            max-width: 1100px;
            margin: 0 auto;
        }

        .section-tag {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--gold);
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 1rem;
        }

        .section-title {
            font-family: 'Syne', sans-serif;
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1.1;
            margin-bottom: 1.2rem;
        }

        .section-sub {
            color: var(--text-muted);
            font-size: 1.05rem;
            font-weight: 300;
            max-width: 480px;
        }

        /* STATS */
        .stats-section {
            background: var(--bg2);
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            padding: 5rem 2rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 3rem;
            text-align: center;
        }

        /* FEATURES */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.2rem;
            margin-top: 4rem;
        }

        .feature-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 2rem;
            position: relative;
            overflow: hidden;
            transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .feature-card:hover {
            border-color: rgba(245, 166, 35, 0.25);
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(245, 166, 35, 0.05);
        }

        .feature-card:hover::before {
            opacity: 1;
        }

        .feature-icon {
            width: 48px;
            height: 48px;
            background: rgba(245, 166, 35, 0.1);
            border: 1px solid rgba(245, 166, 35, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.2rem;
        }

        .feature-title {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 0.6rem;
        }

        .feature-desc {
            color: var(--text-muted);
            font-size: 0.9rem;
            line-height: 1.65;
            font-weight: 300;
        }

        /* HOW IT WORKS */
        .how-section {
            background: var(--bg2);
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            padding: 7rem 2rem;
        }

        .how-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            max-width: 1100px;
            margin: 0 auto;
        }

        .steps {
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        .step {
            display: flex;
            gap: 2rem;
            align-items: flex-start;
        }

        .step-left {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .step-num {
            width: 44px;
            height: 44px;
            background: var(--gold);
            color: #000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 1rem;
            flex-shrink: 0;
        }

        .step-line {
            width: 2px;
            flex: 1;
            min-height: 40px;
            background: linear-gradient(180deg, var(--gold), transparent);
            margin: 4px 0;
        }

        .step-content {
            padding-bottom: 2.5rem;
        }

        .step-title {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 1.05rem;
            margin-bottom: 0.4rem;
        }

        .step-desc {
            color: var(--text-muted);
            font-size: 0.9rem;
            font-weight: 300;
            line-height: 1.65;
        }

        /* CTA */
        .cta-section {
            padding: 7rem 2rem;
            text-align: center;
        }

        .cta-box {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 5rem 2rem;
            position: relative;
            overflow: hidden;
            max-width: 1100px;
            margin: 0 auto;
        }

        .cta-box::before {
            content: '';
            position: absolute;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(245, 166, 35, 0.15) 0%, transparent 70%);
            pointer-events: none;
        }

        .cta-box h2 {
            font-family: 'Syne', sans-serif;
            font-size: clamp(2rem, 4vw, 3.2rem);
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
            position: relative;
        }

        .cta-box p {
            color: var(--text-muted);
            margin-bottom: 2.5rem;
            font-size: 1.05rem;
            font-weight: 300;
            position: relative;
        }

        .cta-btns {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            position: relative;
        }

        /* FOOTER */
        .lp-footer {
            padding: 2.5rem 2rem;
            border-top: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .footer-logo {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            color: var(--gold);
            font-size: 1.1rem;
        }

        .footer-copy {
            color: var(--text-muted);
            font-size: 0.8rem;
        }

        /* ANIMATIONS */
        @keyframes fade-up {
            from {
                opacity: 0;
                transform: translateY(24px)
            }

            to {
                opacity: 1;
                transform: translateY(0)
            }
        }

        /* SCROLLBAR */
        ::-webkit-scrollbar {
            width: 6px
        }

        ::-webkit-scrollbar-track {
            background: var(--bg)
        }

        ::-webkit-scrollbar-thumb {
            background: var(--surface2);
            border-radius: 3px
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--gold-dark)
        }

        /* RESPONSIVE */
        @media (max-width: 920px) {
            .nav-links {
                display: none;
            }

            .btn-nav {
                display: none;
            }
        }

        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }

            .hero {
                padding: 7rem 1.25rem 3.5rem;
            }

            .hero h1 {
                font-size: 2.4rem;
                line-height: 1.1;
            }

            .hero-cta {
                flex-direction: column;
                align-items: stretch;
                gap: 0.75rem;
            }

            .btn-primary,
            .btn-ghost {
                width: 100%;
                justify-content: center;
            }

            .mock-table-head,
            .mock-row {
                grid-template-columns: 2fr 1.5fr 1fr;
            }

            .mock-row .mock-date,
            .mock-table-head .mock-col-date {
                display: none;
            }

            .mock-stats {
                grid-template-columns: 1fr 1fr;
            }

            .how-grid {
                grid-template-columns: 1fr;
                gap: 2.5rem;
            }

            .lp-footer {
                flex-direction: column;
                text-align: center;
            }
        }

        @media (max-width: 514px) {
            .hero-cta {
                flex-direction: column;
                align-items: stretch;
                gap: 0.75rem;
            }

            .btn-primary,
            .btn-ghost {
                width: 100%;
                justify-content: center;
            }
        }

        @media (max-width: 480px) {
            .hero {
                padding: 6.5rem 1.1rem 3rem;
            }

            .hero h1 {
                font-size: 2.1rem;
            }

            .mock-stats {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="lp-nav" style={{ background: scrolled ? 'rgba(10,10,15,0.95)' : 'rgba(10,10,15,0.7)' }}>
        <Link href={ROUTES.HOME} className="nav-logo">Depense<span>Flow</span></Link>
        <ul className="nav-links">
          <li><a href="#fonctionnalites">Fonctionnalités</a></li>
          <li><a href="#comment">Comment ça marche</a></li>
          <li><a href="#cta">Commencer</a></li>
        </ul>
        <Link href={ROUTES.AUTH.REGISTER} className="btn-nav">Essayer gratuitement</Link>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-badge">
          <span className="dot" />
          Gestion financière personnelle
        </div>

        <h1>
          Reprenez le contrôle<br />
          de vos <span className="accent">finances</span>
        </h1>

        <p className="hero-sub">
          Suivez vos revenus et dépenses en temps réel. Des tableaux de bord clairs, des analyses pertinentes, une interface intuitive.
        </p>

        <div className="hero-cta">
          <Link href={ROUTES.AUTH.REGISTER} className="btn-primary">
            Commencer gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href={ROUTES.AUTH.LOGIN}className="btn-ghost">Se connecter</Link>
        </div>

        {/* DASHBOARD MOCKUP */}
        <div className="mockup-wrapper">
          <div className="mockup">
            <div className="mockup-bar">
              <div className="dot-r" /><div className="dot-y" /><div className="dot-g" />
              <div className="mockup-url">localhost:3000 — Tableau de bord</div>
            </div>
            <div className="mockup-body">
              {/* Stats */}
              <div className="mock-stats">
                <div className="mock-stat">
                  <div className="mock-stat-label">
                    <Wallet className="w-3 h-3" /> Votre solde
                  </div>
                  <div className="mock-stat-val gold">+3 613,00 f</div>
                </div>
                <div className="mock-stat">
                  <div className="mock-stat-label">
                    <TrendingUp className="w-3 h-3" /> Revenus
                  </div>
                  <div className="mock-stat-val green">+5 200,00 f</div>
                </div>
                <div className="mock-stat">
                  <div className="mock-stat-label">
                    <TrendingDown className="w-3 h-3" /> Dépenses
                  </div>
                  <div className="mock-stat-val red">-1 587,00 f</div>
                </div>
              </div>

              {/* Progress */}
              <div className="mock-progress-wrap">
                <div className="mock-progress-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Activity className="w-3 h-3" /> Dépenses par rapport aux Revenus
                  </span>
                  <span style={{ color: '#f5a623' }}>68%</span>
                </div>
                <div className="mock-bar-bg"><div className="mock-bar-fill" /></div>
              </div>

              {/* Table */}
              <div className="mock-table">
                <div className="mock-table-head">
                  <span>Description</span><span>Montant</span>
                  <span className="mock-col-date">Date</span><span>Type</span>
                </div>
                {mockRows.map((row, i) => (
                  <div key={i} className="mock-row">
                    <span>{row.label}</span>
                    <span className={`mock-amount ${row.type === 'income' ? 'pos' : 'neg'}`}>{row.amount}</span>
                    <span className="mock-date" style={{ color: '#8888a0', fontSize: '0.7rem' }}>{row.date}</span>
                    <span><span className={`mock-badge ${row.type}`}>{row.type === 'income' ? 'Revenu' : 'Dépense'}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section">
        <div className="section-inner">
          <div className="stats-grid">
            {stats.map((s) => <StatCounter key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalites" className="lp-section">
        <div className="section-inner">
          <span className="section-tag">Fonctionnalités</span>
          <h2 className="section-title">Tout ce dont vous<br />avez besoin</h2>
          <p className="section-sub">Un outil simple et puissant pour garder le contrôle de votre argent au quotidien.</p>
          <div className="features-grid">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 80} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="comment" className="how-section">
        <div className="how-grid">
          <div>
            <span className="section-tag">Comment ça marche</span>
            <h2 className="section-title">Démarrez en<br />3 étapes</h2>
            <p className="section-sub">Aucune configuration complexe. En moins de 2 minutes vous avez accès à votre espace personnel.</p>
          </div>
          <div className="steps">
            {steps.map((s, i) => <Step key={s.num} {...s} isLast={i === steps.length - 1} delay={i * 150} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="cta-section">
        <div className="cta-box">
          <h2>Prêt à maîtriser<br />vos finances ?</h2>
          <p>Rejoignez des centaines d&apos;utilisateurs qui font confiance à DepenseFlow pour gérer leur argent.</p>
          <div className="cta-btns">
            <Link href={ROUTES.AUTH.REGISTER} className="btn-primary">
              Créer un compte gratuit <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={ROUTES.AUTH.LOGIN} className="btn-ghost">Se connecter</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="footer-logo">DepenseFlow</div>
        <div className="footer-copy">Copyright © {new Date().getFullYear()} DepenseFlow — Tous droits réservés</div>
      </footer>
    </>
  );
}