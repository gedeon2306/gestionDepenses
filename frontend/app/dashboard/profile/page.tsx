'use client'
// app/profile/page.tsx
import Nav from '@/src/components/NavBar';
import { getUserProfile, updateUserProfile } from '@/src/app/actions/actions';
import { useEffect, useState, useRef } from 'react';
import { User, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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

  return (
    <div>
      <Nav />

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      ) : (
        <div className="flex justify-center p-4 sm:my-5">
          <div className="w-full sm:w-96 flex flex-col gap-4">

            {/* ── EN-TÊTE AVATAR ── */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-8">
              <div className="w-20 h-20 rounded-full bg-warning flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold text-warning-content">
                  {profile?.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{profile?.name}</div>
                <div className="text-sm text-base-content/50">{profile?.email}</div>
              </div>
            </div>

            {/* ── FORMULAIRE DE MODIFICATION ── */}
            <div className="rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-6">
              <h2 className="font-bold text-lg mb-4">Modifier mes informations</h2>

              <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Champ Nom */}
                <div className="flex flex-col gap-2">
                  <label className="label">Nom</label>
                  <label className="input w-full flex items-center gap-2">
                    <User className="w-4 h-4 text-base-content/40 shrink-0" />
                    <input
                      type="text"
                      name="name"
                      className="grow"
                      defaultValue={profile?.name}
                      placeholder="Votre nom"
                      required
                    />
                  </label>
                </div>

                {/* Champ Email */}
                <div className="flex flex-col gap-2">
                  <label className="label">Email</label>
                  <label className="input w-full flex items-center gap-2">
                    <Mail className="w-4 h-4 text-base-content/40 shrink-0" />
                    <input
                      type="email"
                      name="email"
                      className="grow"
                      defaultValue={profile?.email}
                      placeholder="Votre email"
                      required
                    />
                  </label>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn btn-warning w-full">
                  {isSubmitting
                    ? <span className="loading loading-spinner loading-sm"></span>
                    : <Save className="w-4 h-4" />}
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>

              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}