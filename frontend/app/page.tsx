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
import '@/app/styles/landing.css';


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