'use client'
import { ROUTES } from '@/src/constants/routes'
import Link from 'next/link'
import googleImg from '@/public/google.png'
import icon from '@/public/icon.png'
import toast from 'react-hot-toast'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'

export default function RegisterPage() {

  interface ToastCustomProps {
    visible: boolean;
    id: string;
  }

  const toastFunc = (): void => {
    toast.custom((t: ToastCustomProps) => (
      <div
        className={`${t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img
                className="h-10 w-10 rounded-full"
                src={icon.src}
                alt=""
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Admin
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Fonctionnalité en cours de développement
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Fermé
          </button>
        </div>
      </div>
    ))
  }

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);

      try {
          // On appelle notre API Next.js locale
          await axios.post('/api/register', data);
          
          // On redirige vers l'accueil
          router.push(ROUTES.DASHBOARD.ROOT);
          router.refresh(); // Important pour que le middleware voie le cookie
      } catch (err: any) {
          toast.error(err.response?.data?.email || "Une erreur est survenue");
      } finally {
          setLoading(false);
      }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      {/* Container adaptatif : plein écran sur mobile, max 450px sur desktop */}
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold mb-2 justify-center text-warning">Créer un compte</h2>
          <p className="text-center text-sm opacity-60 mb-6">Rejoignez notre communauté en quelques clics.</p>

          <form onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold mb-2">Nom complet</span>
              </label>
              <input 
                name="name"
                type="text" 
                placeholder="Jean Dupont" 
                className="input input-bordered w-full focus:input-warning" 
                required 
              />
            </div>

            {/* Email Field */}
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text font-semibold mb-2">Adresse email</span>
              </label>
              <input 
                name="email"
                type="email" 
                placeholder="Ex: email@domaine.com" 
                className="input input-bordered w-full focus:input-warning"
                required 
              />
            </div>

            {/* Password Field */}
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text font-semibold mb-2">Mot de passe</span>
              </label>
              <input 
                name="password"
                type="password" 
                placeholder="••••••••" 
                className="input input-bordered w-full focus:input-warning" 
                required 
              />
              <label className="label">
                <span className="label-text-alt opacity-70">Minimum 8 caractères.</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-8">
              <button type="submit" disabled={loading} className="btn btn-warning w-full">
                {loading ? <>Inscription <span className="loading loading-dots loading-sm text-warning"></span></> : "S'inscrire"}
              </button>
            </div>
          </form>

          {/* Divider & Social Login */}
          {/* <div className="divider">OU</div>

          <button onClick={toastFunc} className="btn btn-outline btn-ghost w-full">
            <img src={googleImg.src} className='w-5 h-5' alt="Google" />
            Continuer avec Google
          </button> */}

          {/* Footer Link */}
          <div className="text-center mt-6">
            <span className="text-sm">Déjà un compte ? </span>
            <Link href={ROUTES.AUTH.LOGIN} className="link link-warning text-sm font-bold hover:no-underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}