'use client'
import { useState } from 'react';
import toast from 'react-hot-toast';
import { permanentRedirect } from 'next/navigation'

export default function ResetPasswordPage() {

    const [loading, setLoading] = useState(false)

    const traitement = () => {
        setLoading(true)

        setTimeout(() =>{
            toast.success('Mot de passe reinitialisé')

            setTimeout(() =>{
                permanentRedirect('/')
            }, 1500)
        }, 3000)

    }

    return (
        <main className="flex justify-center items-center min-h-screen bg-base-200 p-4">
            {/* Container identique à la page forgot-password pour la cohérence */}
            <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
                <div className="card-body items-center text-center">

                    {/* Logo Placeholder - Même style que précédemment */}
                    <div className="mb-6 w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-warning">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>

                    <h2 className="card-title text-2xl font-bold">Réinitialisation</h2>
                    <p className="text-sm opacity-70 mt-2 mb-6">
                        Choisissez un nouveau mot de passe sécurisé pour votre compte.
                    </p>

                    <div className="w-full text-left">
                        {/* New Password Field */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-semibold mb-2">Nouveau mot de passe</span>
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full focus:input-warning"
                                required
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="form-control w-full mt-4">
                            <label className="label">
                                <span className="label-text font-semibold mb-2">Confirmer le mot de passe</span>
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full focus:input-warning"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="form-control mt-8">
                            <button disabled={loading} onClick={traitement} className="btn btn-warning w-full">
                                {loading ? <span className="loading loading-dots loading-sm text-warning"></span> : 'Mettre à jour le mot de passe'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}