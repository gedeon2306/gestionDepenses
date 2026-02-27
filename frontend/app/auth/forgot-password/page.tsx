'use client'
import { ROUTES } from '@/src/constants/routes'
import { ArrowLeft, KeyRound, Link2 } from 'lucide-react';
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">

          {/* Logo Placeholder */}
          <div className="mb-6 w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center">
            <KeyRound className="w-10 h-10 text-warning" />
          </div>

          <h2 className="card-title text-2xl font-bold">Mot de passe oublié ?</h2>
          <p className="text-sm opacity-70 mt-2 mb-6">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>

          <form className="w-full text-left">
            {/* Email Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold mb-2">Votre Email</span>
              </label>
              <input
                type="email"
                placeholder="nom@exemple.com"
                className="input input-bordered w-full focus:input-warning"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="form-control mt-8">
              <Link href={ROUTES.AUTH.RESET_PASSWORD} className="btn btn-warning w-full">
                Envoyer le lien
                <Link2 />
              </Link>
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <Link href={ROUTES.AUTH.LOGIN} className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}