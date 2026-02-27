'use client';
// src/components/NavBar.tsx
import { ROUTES } from '@/src/constants/routes'
import Link from 'next/link'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import icon from '@/public/icon.png'
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/src/app/actions/actions';

export default function Nav() {
  
  const router = useRouter();

  // On stocke le nom de l'utilisateur dans un état
  const [userName, setUserName] = useState<string | null>(null);

  // Au chargement du composant, on récupère le profil depuis Django
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setUserName(profile.name); // On stocke le nom
      }
    };
    loadProfile();
  }, []); // [] = exécuté une seule fois au montage du composant

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      router.push(ROUTES.HOME);
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="navbar-start">
        <Link href={ROUTES.HOME} className="nav-logo">Depense<span className='text-warning'>Flow</span></Link>
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border border-base-300">
            <div className="w-10 rounded-full">
              <img alt="Profil utilisateur" src={icon.src} />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow-lg border border-base-200">

            {/* Affiche le nom si chargé, sinon un texte de chargement */}
            <li className="menu-title px-4 py-2">
              {userName ?? 'Chargement...'}
            </li>

            <li><Link href={ROUTES.DASHBOARD.ROOT}>Dashboard</Link></li>
            <li>
              <Link href={ROUTES.DASHBOARD.USER_PROFILE} className="justify-between">
                Profil
                <span className="badge badge-primary badge-sm p-1">Nouveau</span>
              </Link>
            </li>
            <div className="divider my-1"></div>
            <li>
              <button onClick={handleLogout} className="text-error">
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}