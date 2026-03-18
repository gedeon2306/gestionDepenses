'use client'
// app/profile/page.tsx
import Nav from '@/src/components/NavBar';
import { getUserProfile, updateUserProfile, deleteUserProfile, updatePassword } from '@/src/app/actions/actions';
import { useEffect, useState, useRef } from 'react';
import { User, Mail, Save, Trash2, ShieldAlert, Key, CheckLine, UserKey } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import axios from 'axios';
import { ROUTES } from '@/src/constants/routes';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletting, setIsDeletting] = useState(false);
  const [isUpdatting, setIsUpdatting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await getUserProfile();
      setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateUserProfile(formData);
    setIsSubmitting(false);
    if (result) {
      toast.success('Profil mis à jour avec succès !');
      setProfile(result);
    } else {
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  const openDeleteModal = () => {
    deleteModalRef.current?.showModal();
  };

  const handleDeleteAccount = async () => {

    setIsDeletting(true);
    const success = await deleteUserProfile();
    setIsDeletting(false);
    // setDeleteConfirm('');
    deleteModalRef.current?.close();

    if (success) {
      toast.success('Compte supprimé avec succès.');
      setLoading(true)
      try {
        await axios.post('/api/logout');
        router.push(ROUTES.AUTH.LOGIN);
        router.refresh();
      } catch {
        toast.error("Erreur lors de la déconnexion");
      } finally {
        setLoading(false)
      }
    } else {
      toast.error('Erreur lors de la suppression du compte.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Remplissez tous les champs')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Le confirmez le bon mot de passe')
      return
    }

    setIsUpdatting(true)
    const result = await updatePassword(formData);
    setIsUpdatting(false);

    if (result) {
      toast.success('Mot de passe mis à jour avec succès !');
    } else {
      toast.error('Erreur lors de la mise à jour.');
    }
  }

  // Initiales à partir du nom
  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

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
        <div className="flex items-center justify-center min-h-[80vh]">
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
          className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 py-10 flex flex-col gap-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >

          {/* ── AVATAR CARD ── */}
          <motion.div
            className="rounded-2xl border border-[rgba(245,166,35,0.15)] bg-[rgba(245,166,35,0.04)] p-8 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            {/* Avatar cercle avec initiales */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[rgba(245,166,35,0.15)] border-2 border-[rgba(245,166,35,0.35)] flex items-center justify-center">
                <span className="font-['Syne',sans-serif] font-extrabold text-3xl text-[#f5a623]">
                  {initials}
                </span>
              </div>
              {/* Badge actif */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] border-2 border-[#0a0a0f]" />
            </div>

            <div className="text-center">
              <div className="font-['Syne',sans-serif] font-extrabold text-xl text-[#f0f0f5]">
                {profile?.name}
              </div>
              <div className="text-[#8888a0] text-sm mt-0.5">{profile?.email}</div>
            </div>

            {/* Infos pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              <span className="text-[#22c55e] text-xs font-medium">Compte actif</span>
            </div>
          </motion.div>

          {/* ── FORMS CARD ── */}
          <motion.div
            className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center">
                <User className="w-4 h-4 text-[#f5a623]" />
              </div>
              <div>
                <h2 className="font-['Syne',sans-serif] font-bold text-base text-[#f0f0f5]">
                  Mes informations
                </h2>
                <p className="text-[#8888a0] text-xs">Modifiez votre nom et votre adresse email</p>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Nom */}
              <div className="flex flex-col gap-2">
                <label className="text-[#8888a0] text-xs uppercase tracking-widest">Nom</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    defaultValue={profile?.name}
                    placeholder="Votre nom"
                    required
                    className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                               focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[#8888a0] text-xs uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    defaultValue={profile?.email}
                    placeholder="Votre email"
                    required
                    className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                               focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#f5a623] text-black font-['DM_Sans',sans-serif] font-semibold text-sm
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
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-[rgba(245,166,35,0.12)] bg-[#111118] p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center">
                <Key className="w-4 h-4 text-[#f5a623]" />
              </div>
              <div>
                <h2 className="font-['Syne',sans-serif] font-bold text-base text-[#f0f0f5]">
                  Mot de passe
                </h2>
                <p className="text-[#8888a0] text-xs">Modifiez votre mot de passe</p>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleUpdatePassword} className="flex flex-col gap-5">

              {/* currentPassword */}
              <div className="flex flex-col gap-2">
                <label className="text-[#8888a0] text-xs uppercase tracking-widest">Mot de passe actuel</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                               focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                  />
                </div>
              </div>

              {/* newPassword */}
              <div className="flex flex-col gap-2">
                <label className="text-[#8888a0] text-xs uppercase tracking-widest">Nouveau mot de passe</label>
                <div className="relative">
                  <UserKey className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                               focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                  />
                </div>
              </div>

              {/* confirmPassword */}
              <div className="flex flex-col gap-2">
                <label className="text-[#8888a0] text-xs uppercase tracking-widest">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <CheckLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0] pointer-events-none" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#17171f] border border-[rgba(245,166,35,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#8888a0]
                               focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[rgba(245,166,35,0.3)] transition-all duration-200"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isUpdatting}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#f5a623] text-black font-['DM_Sans',sans-serif] font-semibold text-sm
                           hover:bg-[#ffc85c] hover:shadow-[0_6px_24px_rgba(245,166,35,0.3)] transition-all duration-200 disabled:opacity-60"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {isUpdatting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 rounded-full border-2 border-black border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Mettre à jour le mot de passe
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* ── DANGER ZONE ── */}
          <motion.div
            className="rounded-2xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.03)] p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
              </div>
              <div>
                <h2 className="font-['Syne',sans-serif] font-bold text-base text-[#f0f0f5]">
                  Zone dangereuse
                </h2>
                <p className="text-[#8888a0] text-xs">Actions irréversibles sur votre compte</p>
              </div>
            </div>

            <p className="text-[#8888a0] text-sm leading-relaxed mb-5 pl-12">
              La suppression de votre compte effacera définitivement toutes vos transactions et données personnelles.
              <span className="text-[#f0f0f5]"> Cette action est irréversible.</span>
            </p>

            <motion.button
              type="button"
              onClick={()=>openDeleteModal()}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] text-[#ef4444] font-['DM_Sans',sans-serif] font-semibold text-sm
                         hover:bg-[rgba(239,68,68,0.16)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.2)] transition-all duration-200 disabled:opacity-50"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-[#ef4444] border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  />
                  Suppression…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement mon compte
                </>
              )}
            </motion.button>
          </motion.div>

        </motion.div>
      )}

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
              Attention
            </h3>
          </div>

          <p className="text-[#8888a0] text-sm leading-relaxed mb-6 pl-[52px]">
            Vous êtes sur le point de supprimer{' '}
            <span className="text-[#f0f0f5] font-medium">Votre compte ?</span>.{' '}
            Cette action est irréversible.
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
              onClick={() => handleDeleteAccount()}
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