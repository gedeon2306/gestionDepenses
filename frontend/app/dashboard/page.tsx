'use client'
// app/page.tsx
import Nav from '@/src/components/NavBar';
import { Activity, CircleArrowDown, CircleArrowUp, Plus, SquarePen, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '@/src/app/actions/actions';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idDeleting, setIdDeleting] = useState('');

  // Set des ids cochés (Set permet de vérifier/ajouter/supprimer en O(1))
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // true pendant une suppression en masse (sélection ou tout supprimer)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const addModalRef = useRef<HTMLDialogElement>(null);
  const addFormRef = useRef<HTMLFormElement>(null);
  const editModalRef = useRef<HTMLDialogElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Ref pour la checkbox "tout sélectionner" (état indeterminate)
  const selectAllRef = useRef<HTMLInputElement>(null);

  const loadTransactions = async () => {
    const data = await getTransactions();
    setTransactions(data);
    setLoading(false);
    setSelected(new Set()); // On vide la sélection à chaque rechargement
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

  // ── SÉLECTION ──

  // Cocher / décocher une ligne
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Cocher / décocher toutes les lignes
  const toggleSelectAll = () => {
    if (selected.size === transactions.length) {
      setSelected(new Set()); // tout décocher
    } else {
      setSelected(new Set(transactions.map(t => t.id))); // tout cocher
    }
  };

  const allSelected = transactions.length > 0 && selected.size === transactions.length;
  const someSelected = selected.size > 0 && selected.size < transactions.length;

  // Met à jour l'état "indeterminate" de la checkbox (tiret = sélection partielle)
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  // ── SUPPRESSION ──

  const handleDelete = async (id: string) => {
    setIdDeleting(id);
    if (!confirm('Supprimer cette transaction ?')) { setIdDeleting(''); return; }
    const success = await deleteTransaction(id);
    if (success) { toast.success('Transaction supprimée !'); await loadTransactions(); }
    else toast.error('Erreur lors de la suppression.');
    setIdDeleting('');
  };

  // Supprimer uniquement les lignes cochées
  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Supprimer les ${selected.size} transaction(s) sélectionnée(s) ?`)) return;
    setIsDeletingBulk(true);
    // Promise.all envoie toutes les requêtes DELETE en parallèle (plus rapide)
    const results = await Promise.all([...selected].map(id => deleteTransaction(id)));
    setIsDeletingBulk(false);
    const failures = results.filter(r => !r).length;
    if (failures === 0) toast.success(`${selected.size} transaction(s) supprimée(s) !`);
    else toast.error(`${failures} suppression(s) ont échoué.`);
    await loadTransactions();
  };

  // Supprimer absolument toutes les transactions
  const handleDeleteAll = async () => {
    if (transactions.length === 0) return;
    if (!confirm(`Supprimer TOUTES les ${transactions.length} transactions ? Cette action est irréversible.`)) return;
    setIsDeletingBulk(true);
    const results = await Promise.all(transactions.map(t => deleteTransaction(t.id)));
    setIsDeletingBulk(false);
    const failures = results.filter(r => !r).length;
    if (failures === 0) toast.success('Toutes les transactions ont été supprimées !');
    else toast.error(`${failures} suppression(s) ont échoué.`);
    await loadTransactions();
  };

  // ── AJOUT ──

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

  // ── MODIFICATION ──

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
    <div className="">
      <Nav />
      {loading ?
        <div className="flex items-center justify-center min-h-screen">
          <span className="loading loading-spinner loading-xl"></span>
        </div> :
        <div className="flex justify-center p-4 sm:my-5">
          <div className="w-full lg:w-2/3 flex flex-col gap-4">

            {/* ── SOLDE / REVENUS / DÉPENSES ── */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-6 sm:p-8">
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="badge badge-soft"><Wallet className="w-4 h-4 mr-1" />Votre solde</div>
                <div className="text-2xl md:text-3xl font-bold">{balance.toFixed(2)} f</div>
              </div>
              <div className="divider sm:hidden my-0 opacity-20"></div>
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="badge badge-soft badge-success"><CircleArrowUp className="w-4 h-4 mr-1" />Revenus</div>
                <div className="text-2xl md:text-3xl font-bold text-success">{income.toFixed(2)} f</div>
              </div>
              <div className="divider sm:hidden my-0 opacity-20"></div>
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="badge badge-soft badge-error"><CircleArrowDown className="w-4 h-4 mr-1" />Dépenses</div>
                <div className="text-2xl md:text-3xl font-bold text-error">{expense.toFixed(2)} f</div>
              </div>
            </div>

            {/* ── BARRE DE PROGRESSION ── */}
            <div className="rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-5">
              <div className="flex justify-between items-center mb-1">
                <div className="badge badge-soft badge-warning gap-1">
                  <Activity className="w-4 h-4" />Dépenses par rapport aux Revenus
                </div>
                <div>{ratio.toFixed(0)}%</div>
              </div>
              <div className="progress progress-warning w-full">
                <div
                  className="h-full transition-all duration-1000 ease-in-out bg-warning"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>

            {/* ── BOUTONS D'ACTION ── */}
            <div className="flex flex-wrap gap-2">

              {/* Ajouter une transaction */}
              <button
                className="btn btn-warning flex-1 min-w-fit"
                onClick={() => addModalRef.current?.showModal()}
              >
                <Plus className="w-4 h-4" /> Ajouter une transaction
              </button>

              {/* Supprimer la sélection — apparaît seulement quand au moins 1 ligne est cochée */}
              {selected.size > 0 && (
                <button
                  className="btn btn-error btn-soft"
                  onClick={handleDeleteSelected}
                  disabled={isDeletingBulk}
                >
                  {isDeletingBulk
                    ? <span className="loading loading-spinner loading-sm" />
                    : <Trash2 className="w-4 h-4" />}
                  Supprimer la sélection ({selected.size})
                </button>
              )}

              {/* Tout supprimer — apparaît seulement s'il y a des transactions */}
              {transactions.length > 0 && (
                <button
                  className="btn btn-error"
                  onClick={handleDeleteAll}
                  disabled={isDeletingBulk}
                >
                  {isDeletingBulk
                    ? <span className="loading loading-spinner loading-sm" />
                    : <Trash2 className="w-4 h-4" />}
                  Tout supprimer
                </button>
              )}
            </div>

            {/* ── TABLEAU DES TRANSACTIONS ── */}
            <div className="overflow-x-auto rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5">
              <table className="table">
                <thead>
                  <tr>
                    {/* Checkbox en-tête : coche/décoche tout, état indeterminate si sélection partielle */}
                    <th>
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        className="checkbox checkbox-warning checkbox-sm"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>#</th>
                    <th>Description</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length !== 0 ? (
                    transactions.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        className={selected.has(transaction.id) ? 'bg-warning/5' : ''}
                      >
                        {/* Checkbox individuelle par ligne */}
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-warning checkbox-sm"
                            checked={selected.has(transaction.id)}
                            onChange={() => toggleSelect(transaction.id)}
                          />
                        </td>
                        <th>{index + 1}</th>
                        <td>{transaction.text}</td>
                        <td>
                          <div className="flex items-center gap-1 font-semibold">
                            {transaction.amount > 0
                              ? <TrendingUp className="text-success w-6 h-6" />
                              : <TrendingDown className="text-error w-6 h-6" />}
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </div>
                        </td>
                        <td>{formatDate(transaction.created_at)}</td>
                        <td>
                          <button
                            className="btn btn-warning btn-sm btn-soft mr-2"
                            onClick={() => handleOpenEdit(transaction)}
                          >
                            <SquarePen className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-error btn-sm btn-soft"
                            onClick={() => handleDelete(transaction.id)}
                            disabled={transaction.id === idDeleting}
                          >
                            {transaction.id === idDeleting
                              ? <span className="loading loading-spinner loading-sm" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-center text-sm">
                      <td colSpan={6}>Aucune transaction trouvée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── MODAL AJOUT ── */}
            <dialog ref={addModalRef} className="modal backdrop-blur">
              <div className="modal-box">
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg">Nouvelle transaction</h3>
                <form ref={addFormRef} onSubmit={handleAddTransaction} className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="label">Description</label>
                    <input type="text" name="text" className="input input-bordered w-full focus:input-warning" placeholder="Entrez la description" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label">Montant</label>
                    <input type="number" step="0.01" name="amount" className="input input-bordered w-full focus:input-warning" placeholder="Ex: -6500 (pour une depense)" required />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn btn-soft btn-warning w-full">
                    {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : <Plus className="w-4 h-4" />}
                    {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
                  </button>
                </form>
              </div>
            </dialog>

            {/* ── MODAL MODIFICATION ── */}
            <dialog ref={editModalRef} className="modal backdrop-blur">
              <div className="modal-box">
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg">Modifier : {editingTransaction?.text}</h3>
                <form ref={editFormRef} onSubmit={handleUpdateTransaction} className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="label">Description</label>
                    <input
                      type="text" name="text" className="input input-bordered w-full focus:input-warning"
                      defaultValue={editingTransaction?.text}
                      key={editingTransaction?.id + '-text'} required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label">Montant</label>
                    <input
                      type="number" step="0.01" name="amount" className="input input-bordered w-full focus:input-warning"
                      defaultValue={editingTransaction?.amount}
                      key={editingTransaction?.id + '-amount'} required
                    />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn btn-soft btn-warning w-full">
                    {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : <SquarePen className="w-4 h-4" />}
                    {isSubmitting ? 'Modification en cours...' : 'Modifier'}
                  </button>
                </form>
              </div>
            </dialog>

          </div>
        </div>
      }
    </div>
  );
}