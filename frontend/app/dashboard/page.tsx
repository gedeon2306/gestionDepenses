'use client'
// app/page.tsx
import Nav from '@/src/components/NavBar';
import { Activity, Plus, SquarePen, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '@/src/app/actions/actions';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idDeleting, setIdDeleting] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const addModalRef = useRef<HTMLDialogElement>(null);
  const addFormRef = useRef<HTMLFormElement>(null);
  const editModalRef = useRef<HTMLDialogElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);
  const deleteModalRef = useRef<HTMLDialogElement>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  type DeleteMode = 'single' | 'selected' | 'all';
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('single');
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);

  const openDeleteModal = (mode: DeleteMode, transaction?: any) => {
    setDeleteMode(mode);
    setDeletingTransaction(transaction ?? null);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    deleteModalRef.current?.close();
    if (deleteMode === 'single' && deletingTransaction) {
      setIdDeleting(deletingTransaction.id);
      const success = await deleteTransaction(deletingTransaction.id);
      if (success) { toast.success('Transaction supprimée !'); await loadTransactions(); }
      else toast.error('Erreur lors de la suppression.');
      setIdDeleting('');
    } else if (deleteMode === 'selected') {
      setIsDeletingBulk(true);
      const results = await Promise.all([...selected].map(id => deleteTransaction(id)));
      setIsDeletingBulk(false);
      const failures = results.filter(r => !r).length;
      if (failures === 0) toast.success(`${selected.size} transaction(s) supprimée(s) !`);
      else toast.error(`${failures} suppression(s) ont échoué.`);
      await loadTransactions();
    } else if (deleteMode === 'all') {
      setIsDeletingBulk(true);
      const results = await Promise.all(transactions.map(t => deleteTransaction(t.id)));
      setIsDeletingBulk(false);
      const failures = results.filter(r => !r).length;
      if (failures === 0) toast.success('Toutes les transactions ont été supprimées !');
      else toast.error(`${failures} suppression(s) ont échoué.`);
      await loadTransactions();
    }
  };

  const loadTransactions = async () => {
    const data = await getTransactions();
    setTransactions(data);
    setLoading(false);
    setSelected(new Set());
  };

  useEffect(() => { loadTransactions(); }, []);

  const { income, expense } = transactions.reduce(
    (acc: { income: number; expense: number }, t: { amount: any }) => {
      const amount = Number(t.amount) || 0;
      if (amount > 0) acc.income += amount;
      else acc.expense += amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );

  const balance = income + expense;
  const ratio = income > 0 ? Math.min((Math.abs(expense) / income) * 100, 100) : 0;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === transactions.length) setSelected(new Set());
    else setSelected(new Set(transactions.map(t => t.id)));
  };

  const allSelected = transactions.length > 0 && selected.size === transactions.length;
  const someSelected = selected.size > 0 && selected.size < transactions.length;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  // Ces handlers ouvrent maintenant le modal au lieu de confirm()
  const handleDelete = (transaction: any) => openDeleteModal('single', transaction);
  const handleDeleteSelected = () => { if (selected.size > 0) openDeleteModal('selected'); };
  const handleDeleteAll = () => { if (transactions.length > 0) openDeleteModal('all'); };

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await addTransaction(formData);
    setIsSubmitting(false);
    if (result) {
      toast.success('Transaction ajoutée avec succès !');
      addFormRef.current?.reset();
      addModalRef.current?.close();
      await loadTransactions();
    } else {
      toast.error("Erreur lors de l'ajout. Veuillez réessayer.");
    }
  };

  const handleOpenEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    editModalRef.current?.showModal();
  };

  const handleUpdateTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateTransaction(editingTransaction.id, formData);
    setIsSubmitting(false);
    if (result) {
      toast.success('Transaction modifiée avec succès !');
      editFormRef.current?.reset();
      editModalRef.current?.close();
      setEditingTransaction(null);
      await loadTransactions();
    } else {
      toast.error('Erreur lors de la modification.');
    }
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

      <Nav />

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="w-10 h-10 rounded-full border-2 border-[#f5a623] border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <span className="text-[#8888a0] text-sm tracking-widest uppercase">Chargement…</span>
          </div>
        </div>
      ) : (
        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >

          {/* EN-TÊTE */}
          <motion.section
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-[#f5a623] to-[#ffc85c]">
                Tableau de bord
              </h1>
              <p className="text-sm md:text-base text-[#8888a0]">
                Suivez vos revenus et dépenses en temps réel.
              </p>
            </div>

            <motion.div
              className="flex items-center gap-2 text-xs md:text-sm text-[#8888a0]"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Activity className="w-4 h-4 text-[#f5a623]" />
              <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </motion.div>
          </motion.section>

          {/* STATS */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Solde */}
            <motion.div
              className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6 hover:border-[rgba(245,166,35,0.25)] transition-all duration-300"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#8888a0] uppercase tracking-widest">Votre solde</span>
                  <div className="rounded-full p-2.5 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)]">
                    <Wallet className="w-4 h-4 text-[#f5a623]" />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${balance >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {balance >= 0 ? '+' : ''}{balance.toFixed(2)} FCFA
                </p>
                <p className="text-xs text-[#8888a0]">
                  Différence revenus - dépenses
                </p>
              </div>
            </motion.div>

            {/* Revenus */}
            <motion.div
              className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6 hover:border-[rgba(245,166,35,0.25)] transition-all duration-300"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
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
                  +{income.toFixed(2)} FCFA
                </p>
                <p className="text-xs text-[#8888a0]">
                  Somme de tous vos revenus
                </p>
              </div>
            </motion.div>

            {/* Dépenses */}
            <motion.div
              className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6 hover:border-[rgba(245,166,35,0.25)] transition-all duration-300"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
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
                  {Math.abs(expense).toFixed(2)} FCFA
                </p>
                <p className="text-xs text-[#8888a0]">
                  Somme de toutes vos dépenses
                </p>
              </div>
            </motion.div>
          </div>

          {/* TABLEAU STATS */}

          {/* PROGRESS BAR */}
          <motion.div
            className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[rgba(245,166,35,0.04)] p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-[#8888a0] text-xs uppercase tracking-widest">
                <Activity className="w-4 h-4 text-[#f5a623]" />
                Dépenses par rapport aux Revenus
              </div>
              <div className="font-['Syne',sans-serif] font-bold text-[#f5a623] text-sm">{ratio.toFixed(0)}%</div>
            </div>
            <div className="h-2 bg-[#1e1e28] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-[#c47d0a] to-[#f5a623] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${ratio}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>

          {/* ACTION BUTTONS */}
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <motion.button
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f5a623] text-black font-['DM_Sans',sans-serif] font-semibold text-sm
                         hover:bg-[#ffc85c] hover:shadow-[0_6px_24px_rgba(245,166,35,0.35)] transition-all duration-200"
              onClick={() => addModalRef.current?.showModal()}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus className="w-4 h-4" /> Ajouter une transaction
            </motion.button>

            <AnimatePresence>
              {selected.size > 0 && (
                <motion.button
                  key="delete-selected"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] text-[#ef4444] font-['DM_Sans',sans-serif] font-semibold text-sm
                             hover:bg-[rgba(239,68,68,0.16)] transition-all duration-200"
                  onClick={handleDeleteSelected}
                  disabled={isDeletingBulk}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isDeletingBulk
                    ? <motion.div className="w-4 h-4 rounded-full border-2 border-[#ef4444] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                    : <Trash2 className="w-4 h-4" />}
                  Supprimer la sélection ({selected.size})
                </motion.button>
              )}
            </AnimatePresence>

            {transactions.length > 0 && (
              <motion.button
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)] text-[#ef4444] font-['DM_Sans',sans-serif] font-medium text-sm
                           hover:bg-[rgba(239,68,68,0.12)] transition-all duration-200"
                onClick={handleDeleteAll}
                disabled={isDeletingBulk}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                {isDeletingBulk
                  ? <motion.div className="w-4 h-4 rounded-full border-2 border-[#ef4444] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                  : <Trash2 className="w-4 h-4" />}
                Tout supprimer
              </motion.button>
            )}
          </motion.div>

          {/* TABLE */}
          <motion.div
            className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] overflow-x-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38 }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[rgba(245,166,35,0.1)] bg-[#0d0d14]">
                  <th className="px-5 py-3.5 text-left w-10">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      className="w-4 h-4 rounded accent-[#f5a623] cursor-pointer"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-3 py-3.5 text-left text-[#8888a0] text-[0.65rem] uppercase tracking-widest font-medium w-10">#</th>
                  <th className="px-3 py-3.5 text-left text-[#8888a0] text-[0.65rem] uppercase tracking-widest font-medium">Description</th>
                  <th className="px-3 py-3.5 text-left text-[#8888a0] text-[0.65rem] uppercase tracking-widest font-medium whitespace-nowrap">Montant</th>
                  <th className="px-3 py-3.5 text-left text-[#8888a0] text-[0.65rem] uppercase tracking-widest font-medium whitespace-nowrap">Date</th>
                  <th className="px-5 py-3.5 text-left text-[#8888a0] text-[0.65rem] uppercase tracking-widest font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Wallet className="w-10 h-10 text-[#25252f]" />
                        <span className="text-[#8888a0] text-sm">Aucune transaction trouvée.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      className={`border-b border-[rgba(255,255,255,0.03)] last:border-b-0 transition-colors duration-150
                        ${selected.has(transaction.id) ? 'bg-[rgba(245,166,35,0.04)]' : 'hover:bg-[#17171f]'}`}
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-4 w-10">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-[#f5a623] cursor-pointer"
                          checked={selected.has(transaction.id)}
                          onChange={() => toggleSelect(transaction.id)}
                        />
                      </td>

                      {/* Index */}
                      <td className="px-3 py-4 text-[#8888a0] text-xs font-mono w-10">
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      {/* Description */}
                      <td className="px-3 py-4 text-[#f0f0f5] text-sm font-medium max-w-50 truncate">
                        {transaction.text}
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-['Syne',sans-serif] font-bold text-sm">
                          {transaction.amount > 0
                            ? <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                            : <TrendingDown className="w-4 h-4 text-[#ef4444]" />}
                          <span className={transaction.amount > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-4 text-[#8888a0] text-xs whitespace-nowrap">
                        {formatDate(transaction.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <motion.button
                            className="w-8 h-8 rounded-lg bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center text-[#f5a623]
                                       hover:bg-[rgba(245,166,35,0.2)] transition-colors duration-150"
                            onClick={() => handleOpenEdit(transaction)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                          >
                            <SquarePen className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center text-[#ef4444]
                                       hover:bg-[rgba(239,68,68,0.18)] transition-colors duration-150 disabled:opacity-40"
                            onClick={() => handleDelete(transaction)}
                            disabled={transaction.id === idDeleting}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                          >
                            {transaction.id === idDeleting
                              ? <motion.div className="w-3.5 h-3.5 rounded-full border-2 border-[#ef4444] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      )}

      {/* MODAL AJOUT */}
      <dialog ref={addModalRef} className="modal backdrop-blur-md">
        <motion.div
          className="modal-box bg-[#111118] border border-[rgba(245,166,35,0.15)] rounded-2xl p-8 max-w-md w-full shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <form method="dialog">
            <button className="absolute right-5 top-5 w-8 h-8 rounded-lg bg-[#1e1e28] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#8888a0] hover:text-[#f0f0f5] transition-colors text-base leading-none">
              ✕
            </button>
          </form>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(245,166,35,0.12)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#f5a623]" />
            </div>
            <h3 className="font-['Syne',sans-serif] font-bold text-lg text-[#f0f0f5]">Nouvelle transaction</h3>
          </div>

          <form ref={addFormRef} onSubmit={handleAddTransaction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">Description</label>
              <input
                type="text" name="text" list="desc"
                className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                           focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                placeholder="Ex : Salaire, Loyer…"
                required
              />
              <datalist id="desc">
                <option value="Salaire">Salaire</option>
                <option value="Loyer">Loyer</option>
                <option value="Courses">Courses</option>
                <option value="Abonnement">Abonnement</option>
              </datalist>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">Montant</label>
              <input
                type="number" step="0.01" name="amount"
                className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                           focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                placeholder="Ex : -6500 (dépense) ou 3500 (revenu)"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#f5a623] text-black font-['DM_Sans',sans-serif] font-semibold text-sm
                         hover:bg-[#ffc85c] hover:shadow-[0_6px_24px_rgba(245,166,35,0.3)] transition-all duration-200 disabled:opacity-60"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting
                ? <><motion.div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> Ajout en cours…</>
                : <><Plus className="w-4 h-4" /> Ajouter</>}
            </motion.button>
          </form>
        </motion.div>
        <form method="dialog" className="modal-backdrop"><button>Fermer</button></form>
      </dialog>

      {/* MODAL MODIFICATION */}
      <dialog ref={editModalRef} className="modal backdrop-blur-md">
        <motion.div
          className="modal-box bg-[#111118] border border-[rgba(245,166,35,0.15)] rounded-2xl p-8 max-w-md w-full shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <form method="dialog">
            <button className="absolute right-5 top-5 w-8 h-8 rounded-lg bg-[#1e1e28] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#8888a0] hover:text-[#f0f0f5] transition-colors text-base leading-none">
              ✕
            </button>
          </form>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(245,166,35,0.12)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center">
              <SquarePen className="w-5 h-5 text-[#f5a623]" />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] font-bold text-lg text-[#f0f0f5]">Modifier</h3>
              {editingTransaction?.text && (
                <p className="text-[#8888a0] text-xs truncate max-w-55">{editingTransaction.text}</p>
              )}
            </div>
          </div>

          <form ref={editFormRef} onSubmit={handleUpdateTransaction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">Description</label>
              <input
                type="text" name="text" list="desc"
                className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                           focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                defaultValue={editingTransaction?.text}
                key={editingTransaction?.id + '-text'}
                required
              />
              <datalist id="desc">
                <option value="Salaire">Salaire</option>
                <option value="Loyer">Loyer</option>
                <option value="Cours">Courses</option>
                <option value="Abonnement">Abonnement</option>
              </datalist>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#8888a0] text-xs uppercase tracking-widest">Montant</label>
              <input
                type="number" step="0.01" name="amount"
                className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                           focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                defaultValue={editingTransaction?.amount}
                key={editingTransaction?.id + '-amount'}
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#f5a623] text-black font-['DM_Sans',sans-serif] font-semibold text-sm
                         hover:bg-[#ffc85c] hover:shadow-[0_6px_24px_rgba(245,166,35,0.3)] transition-all duration-200 disabled:opacity-60"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting
                ? <><motion.div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> Modification en cours…</>
                : <><SquarePen className="w-4 h-4" /> Modifier</>}
            </motion.button>
          </form>
        </motion.div>
        <form method="dialog" className="modal-backdrop"><button>Fermer</button></form>
      </dialog>

      {/* MODAL SUPPRESSION */}
      <dialog ref={deleteModalRef} className="modal backdrop-blur-md">
        <motion.div
          className="modal-box bg-[#111118] border border-[rgba(239,68,68,0.2)] rounded-2xl p-8 max-w-md w-full shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <form method="dialog">
            <button className="absolute right-5 top-5 w-8 h-8 rounded-lg bg-[#1e1e28] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#8888a0] hover:text-[#f0f0f5] transition-colors text-base leading-none">
              ✕
            </button>
          </form>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.25)] flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-[#ef4444]" />
            </div>
            <h3 className="font-['Syne',sans-serif] font-bold text-lg text-[#f0f0f5]">
              {deleteMode === 'single' && 'Supprimer la transaction'}
              {deleteMode === 'selected' && 'Supprimer la sélection'}
              {deleteMode === 'all' && 'Tout supprimer'}
            </h3>
          </div>

          <p className="text-[#8888a0] text-sm leading-relaxed mb-6 pl-13">
            {deleteMode === 'single' && deletingTransaction && (
              <>
                Vous êtes sur le point de supprimer{' '}
                <span className="text-[#f0f0f5] font-medium">« {deletingTransaction.text} »</span>.{' '}
                Cette action est irréversible.
              </>
            )}
            {deleteMode === 'selected' && (
              <>
                Vous êtes sur le point de supprimer{' '}
                <span className="text-[#f0f0f5] font-medium">{selected.size} transaction(s) sélectionnée(s)</span>.{' '}
                Cette action est irréversible.
              </>
            )}
            {deleteMode === 'all' && (
              <>
                Vous êtes sur le point de supprimer{' '}
                <span className="text-[#f0f0f5] font-medium">toutes les {transactions.length} transactions</span>.{' '}
                Cette action est irréversible.
              </>
            )}
          </p>

          <div className="flex gap-3">
            <form method="dialog" className="flex-1">
              <motion.button
                type="submit"
                className="w-full py-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1e1e28] text-[#8888a0] font-['DM_Sans',sans-serif] font-medium text-sm hover:text-[#f0f0f5] hover:border-[rgba(255,255,255,0.16)] transition-all duration-200"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Annuler
              </motion.button>
            </form>
            <motion.button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ef4444] text-white font-['DM_Sans',sans-serif] font-semibold text-sm hover:bg-[#f87171] hover:shadow-[0_6px_24px_rgba(239,68,68,0.35)] transition-all duration-200"
              onClick={handleConfirmDelete}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </motion.button>
          </div>
        </motion.div>
        <form method="dialog" className="modal-backdrop"><button>Fermer</button></form>
      </dialog>
    </div>
  );
}