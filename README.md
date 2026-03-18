# DepenseFlow — Gestion de dépenses

Application fullstack de gestion financière personnelle : suivi des revenus et dépenses en temps réel, authentification sécurisée (JWT), tableau de bord responsive.

---

## Stack technique

| Couche   | Technologies |
|----------|--------------|
| **Backend** | Django 6, Django REST Framework, Simple JWT, django-cors-headers, django-environ, SQLite |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, DaisyUI, Axios, react-hot-toast, Lucide React |

---

## Fonctionnalités

### Backend (Django)

- **Authentification**
  - Inscription : `POST /api/register/` (nom, email, mot de passe)
  - Connexion : `POST /api/login/` → tokens JWT (access + refresh)
  - Rafraîchissement du token : `POST /api/token/refresh/`
- **Transactions**
  - Liste des transactions de l’utilisateur connecté : `GET /api/transactions/`
  - Création : `POST /api/transactions/` (text, amount)
  - Détail / modification / suppression : `GET`, `PUT`, `DELETE /api/transactions/<uuid>/`
- **Profil utilisateur**
  - Consultation : `GET /api/profile/`
  - Modification (nom, email) : `PUT /api/profile/`
  - Suppression du compte (nom, email) : `DELETE /api/profile/`
  - Modification du mot de passe : `PUT /api/password/`
- **Sécurité**
  - Authentification JWT sur toutes les routes protégées
  - Données filtrées par utilisateur (chaque user ne voit que ses transactions)
  - Variables sensibles dans `.env` (SECRET_KEY, DEBUG, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS) via django-environ
- **Autres**
  - Page d’accueil publique : `/` (landing)
  - Interface d’administration Django : `/admin/`

### Frontend (Next.js)

- **Page d’accueil (landing)**
  - Hero, présentation des fonctionnalités, mockup du tableau de bord, stats animées, CTA inscription/connexion
- **Authentification**
  - Connexion : formulaire email / mot de passe, redirection vers le dashboard, cookies httpOnly pour les JWT
  - Inscription : nom, email, mot de passe, redirection vers le dashboard après création du compte
  - Pages « Mot de passe oublié » et « Réinitialisation » (UI prêtes, logique à brancher)
- **Tableau de bord**
  - **Solde, revenus et dépenses** : calcul en temps réel à partir des transactions (montants positifs = revenus, négatifs = dépenses)
  - **Barre de progression** : dépenses par rapport aux revenus (ratio en %)
  - **Liste des transactions** : description, montant, date, actions (modifier, supprimer)
  - **Ajout** : modal avec formulaire (description, montant)
  - **Modification** : modal pré-rempli pour éditer une transaction
  - **Suppression** : une transaction, sélection multiple (cases à cocher), ou « tout supprimer »
- **Profil utilisateur**
  - Affichage nom, email, avatar (initiale)
  - Formulaire de modification du nom et de l’email
- **UX / technique**
  - Navbar avec liens (Tableau de bord, Profil, Déconnexion)
  - Toasts (react-hot-toast) pour succès/erreurs
  - Renouvellement automatique du token (refresh) en cas de 401
  - Mise en page responsive (mobile, tablette, desktop)

---

## Installation et lancement

### Prérequis

- Python 3.10+
- Node.js 18+
- npm ou pnpm

### Backend

```bash
cd backend
python -m venv env
# Windows
env\Scripts\activate
# Linux / macOS
source env/bin/activate

pip install -r requirements.txt
```

Créer le fichier `.env` à la racine de `backend/` (à côté de `manage.py`) :

```env
SECRET_KEY=votre_cle_secrete_longue_et_aleatoire
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Puis :

```bash
python manage.py migrate
python manage.py runserver
```

API disponible sur **http://127.0.0.1:8000**.  
- Landing : http://127.0.0.1:8000/  
- API : http://127.0.0.1:8000/api/

### Frontend

```bash
cd frontend
npm install
```

Créer un fichier `.env.local` à la racine de `frontend/` :

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/
```

Puis :

```bash
npm run dev
```

Application sur **http://localhost:3000**.

---

## Résumé des routes API (Backend)

| Méthode | URL | Description |
|--------|-----|-------------|
| POST | `/api/register/` | Inscription |
| POST | `/api/login/` | Connexion (retourne access + refresh token) |
| POST | `/api/token/refresh/` | Nouveau access token |
| GET / POST | `/api/transactions/` | Liste ou création de transactions |
| GET / PUT / DELETE | `/api/transactions/<uuid>/` | Détail, modification, suppression |
| GET / PUT | `/api/profile/` | Profil utilisateur |

Toutes les routes sauf `register`, `login` et `token/refresh` nécessitent l’en-tête :  
`Authorization: Bearer <access_token>`.

---

## Structure du projet

```
gestionDepensesV2/
├── backend/
│   ├── .env                 # Variables d'environnement (ne pas commiter)
│   ├── backend/
│   │   ├── settings.py      # Config Django + django-environ
│   │   └── urls.py
│   ├── api/
│   │   ├── models.py        # User (custom), Transaction
│   │   ├── views.py         # register, login JWT, transactions CRUD, profile
│   │   ├── urls.py
│   │   └── serializers.py
│   ├── api/templates/       # landing.html
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Landing
│   │   ├── auth/login/      # Connexion
│   │   ├── auth/register/    # Inscription
│   │   ├── auth/forgot-password/
│   │   ├── auth/reset-password/
│   │   └── dashboard/
│   │       ├── page.tsx     # Tableau de bord (transactions)
│   │       └── profile/     # Profil utilisateur
│   ├── src/
│   │   ├── app/actions/     # Server Actions (API + refresh token)
│   │   ├── components/      # NavBar
│   │   └── constants/       # routes, api (baseURL)
│   └── package.json
└── README.md
```

---

## Licence

Projet à usage personnel / éducatif.
