'use client';

import { stats } from "@/src/app/actions/actions";
import NavBar from "@/src/components/NavBar";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarRange,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
} from "lucide-react";
import { useState, useRef } from 'react';
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

const currentYear = new Date().getFullYear();

const months = [
  { value: 1, label: "Janvier" }, { value: 2, label: "Février" },
  { value: 3, label: "Mars" },    { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },     { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" }, { value: 8, label: "Août" },
  { value: 9, label: "Septembre"},{ value: 10, label: "Octobre" },
  { value: 11, label: "Novembre"},{ value: 12, label: "Décembre" },
];

const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

type MonthlySummary = {
  month: number;
  year: number;
  total_count: number;
  total_income: string;
  total_expenses: string;
  balance: string;
  income_transactions: Array<{
    id: string;
    text: string;
    amount: string;
    created_at: string;
  }>;
  expense_transactions: Array<{
    id: string;
    text: string;
    amount: string;
    created_at: string;
  }>;
};

export default function RapportPage() {
  const [report, setReport] = useState<MonthlySummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statFormRef = useRef<HTMLFormElement>(null);

  const handleStats = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const year = statFormRef.current?.elements.namedItem('year') as HTMLSelectElement | null;
    const month = statFormRef.current?.elements.namedItem('month') as HTMLSelectElement | null;

    if (!year?.value.trim() || !month?.value.trim()) {
      toast.error('Remplissez tous les champs');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await stats(formData);
    setIsSubmitting(false);

    if (result) {
      setReport(result as MonthlySummary);
      toast.success('Statistiques chargées avec succès');
    } else {
      toast.error("Erreur. Veuillez réessayer.");
    }
  };

  const getMonthLabel = (value: number | undefined) => {
    if (!value) return '';
    return months.find((m) => m.value === value)?.label || '';
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-['Syne',sans-serif]">
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      <NavBar />
      <motion.main
        className="relative z-10 px-4 md:px-8 pt-28 pb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto space-y-8">

          {/* En-tête */}
          <motion.section
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-[#ffc85c]">
                Statistiques mensuelles
              </h1>
              <p className="text-sm md:text-base text-[#8888a0]">
                Analysez vos revenus et dépenses par mois.
              </p>
            </div>

            <motion.div
              className="flex items-center gap-2 text-xs md:text-sm text-[#8888a0]"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <CalendarRange className="w-4 h-4 text-[#f5a623]" />
              <span>
                {report
                  ? `Période : ${getMonthLabel(report.month)} ${report.year}`
                  : "Sélectionnez un mois et une année"}
              </span>
            </motion.div>
          </motion.section>

          {/* Filtres période */}
          <motion.section
            className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <form
              ref={statFormRef}
              onSubmit={handleStats}
              className="flex flex-col md:flex-row md:items-end md:justify-start gap-4"
            >
              <div className="flex-1">
                <label className="label text-xs font-semibold text-[#8888a0] uppercase tracking-widest mb-2">Mois</label>
                <select
                  name="month"
                  defaultValue={''}
                  className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                             focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                >
                  <option disabled value={''}>
                    Sélectionnez un mois
                  </option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="label text-xs font-semibold text-[#8888a0] uppercase tracking-widest mb-2">Année</label>
                <select
                  name="year"
                  defaultValue={''}
                  className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                             focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                >
                  <option disabled value={''}>
                    Sélectionnez une année
                  </option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#f5a623] text-black font-semibold text-sm
                           hover:bg-[#ffc85c] hover:shadow-[0_6px_24px_rgba(245,166,35,0.3)] transition-all duration-200 disabled:opacity-60"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 rounded-full border-2 border-black border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    />
                    Traitement…
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Appliquer
                  </>
                )}
              </motion.button>
            </form>
          </motion.section>

          {/* Résumé & statistiques */}
          <AnimatePresence>
            {report ? (
              <motion.div
                key="report-content"
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Cartes de résumé */}
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Revenus */}
                  <motion.div
                    className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6 hover:border-[rgba(245,166,35,0.25)] transition-all duration-300"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#8888a0] uppercase tracking-widest">Total revenus</span>
                        <div className="rounded-full p-2.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                          <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#22c55e]">
                        +{formatCurrency(report.total_income)} FCFA
                      </p>
                      <p className="text-xs text-[#8888a0]">
                        Somme totale des revenus.
                      </p>
                    </div>
                  </motion.div>

                  {/* Dépenses */}
                  <motion.div
                    className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6 hover:border-[rgba(245,166,35,0.25)] transition-all duration-300"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#8888a0] uppercase tracking-widest">Total dépenses</span>
                        <div className="rounded-full p-2.5 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                          <TrendingDown className="w-4 h-4 text-[#ef4444]" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#ef4444]">
                        {formatCurrency(report.total_expenses)} FCFA
                      </p>
                      <p className="text-xs text-[#8888a0]">
                        Somme totale des dépenses.
                      </p>
                    </div>
                  </motion.div>

                  {/* Bilan net */}
                  <motion.div
                    className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6 hover:border-[rgba(245,166,35,0.25)] transition-all duration-300"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#8888a0] uppercase tracking-widest">Bilan net</span>
                        <div className="rounded-full p-2.5 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)]">
                          <BarChart3 className="w-4 h-4 text-[#f5a623]" />
                        </div>
                      </div>
                      <p className={`text-3xl font-bold ${parseFloat(report.balance as string) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {parseFloat(report.balance as string) >= 0 ? '+' : ''}{formatCurrency(report.balance)} FCFA
                      </p>
                      <p className="text-xs text-[#8888a0]">
                        Différence revenus - dépenses.
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Transactions Revenus */}
                {report.income_transactions.length > 0 && (
                  <motion.section
                    className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl p-2.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                          <ArrowUpRight className="w-4 h-4 text-[#22c55e]" />
                        </div>
                        <div>
                          <h2 className="font-['Syne',sans-serif] font-bold text-lg md:text-xl text-[#f0f0f5]">
                            Revenus
                          </h2>
                          <p className="text-xs md:text-sm text-[#8888a0]">
                            Transactions entrantes positives.
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#22c55e] text-xs font-medium">
                        {report.income_transactions.length} entrée(s)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs uppercase text-[#8888a0] border-b border-[rgba(245,166,35,0.08)]">
                            <th className="text-left py-3 px-0">Description</th>
                            <th className="text-right py-3 px-0">Montant</th>
                            <th className="text-right py-3 px-0">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.income_transactions.map((t, idx) => (
                            <motion.tr
                              key={t.id}
                              className="border-b border-[rgba(245,166,35,0.08)] hover:bg-[rgba(34,197,94,0.04)] transition-colors"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 + (idx * 0.05) }}
                            >
                              <td className="py-3 px-0 text-[#f0f0f5]">{t.text}</td>
                              <td className="text-right py-3 px-0 font-semibold text-[#22c55e] whitespace-nowrap">
                                +{formatCurrency(t.amount)} FCFA
                              </td>
                              <td className="text-right py-3 px-0 text-xs text-[#8888a0] whitespace-nowrap">
                                {formatDate(t.created_at)}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.section>
                )}

                {/* Transactions Dépenses */}
                {report.expense_transactions.length > 0 && (
                  <motion.section
                    className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                  >
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl p-2.5 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                          <ArrowDownLeft className="w-4 h-4 text-[#ef4444]" />
                        </div>
                        <div>
                          <h2 className="font-['Syne',sans-serif] font-bold text-lg md:text-xl text-[#f0f0f5]">
                            Dépenses
                          </h2>
                          <p className="text-xs md:text-sm text-[#8888a0]">
                            Transactions sortantes négatives.
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-xs font-medium">
                        {report.expense_transactions.length} sortie(s)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs uppercase text-[#8888a0] border-b border-[rgba(245,166,35,0.08)]">
                            <th className="text-left py-3 px-0">Description</th>
                            <th className="text-right py-3 px-0">Montant</th>
                            <th className="text-right py-3 px-0">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.expense_transactions.map((t, idx) => (
                            <motion.tr
                              key={t.id}
                              className="border-b border-[rgba(245,166,35,0.08)] hover:bg-[rgba(239,68,68,0.04)] transition-colors"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.35 + (idx * 0.05) }}
                            >
                              <td className="py-3 px-0 text-[#f0f0f5]">{t.text}</td>
                              <td className="text-right py-3 px-0 font-semibold text-[#ef4444] whitespace-nowrap">
                                {formatCurrency(t.amount)} FCFA
                              </td>
                              <td className="text-right py-3 px-0 text-xs text-[#8888a0] whitespace-nowrap">
                                {formatDate(t.created_at)}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.section>
                )}

                {/* État vide si pas de transactions */}
                {report.income_transactions.length === 0 && report.expense_transactions.length === 0 && (
                  <motion.section
                    className="rounded-2xl border border-dashed border-[rgba(245,166,35,0.12)] bg-[rgba(245,166,35,0.04)] p-8"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="text-center">
                      <h2 className="font-['Syne',sans-serif] font-bold text-lg md:text-xl text-[#f0f0f5] mb-2">
                        Aucune transaction
                      </h2>
                      <p className="text-xs md:text-sm text-[#8888a0] max-w-xl mx-auto">
                        Aucune transaction n&apos;a été enregistrée pour cette période. Ajoutez des transactions pour voir les statistiques.
                      </p>
                    </div>
                  </motion.section>
                )}
              </motion.div>
            ) : (
              // État vide avant recherche
              <motion.section
                key="empty-state"
                className="rounded-2xl border border-dashed border-[rgba(245,166,35,0.12)] bg-[rgba(245,166,35,0.04)] p-8"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="text-center">
                  <h2 className="font-['Syne',sans-serif] font-bold text-lg md:text-xl text-[#f0f0f5] mb-3">
                    Choisissez une période pour voir les statistiques
                  </h2>
                  <p className="text-xs md:text-sm text-[#8888a0] max-w-xl mx-auto">
                    Sélectionnez un mois et une année, puis cliquez sur &quot;Appliquer&quot; pour afficher votre synthèse financière avec tous les revenus et dépenses.
                  </p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </div>
      </motion.main>
    </div>
  );
};
