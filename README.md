# DepenseFlow — Gestion de dépenses

Application fullstack moderne de gestion financière personnelle : suivi des revenus et dépenses en temps réel, authentification sécurisée (JWT), tableau de bord responsive avec animations fluides et design contemporain.

---

## Stack technique

| Couche   | Technologies |
|----------|--------------|
| **Backend** | Django 6, Django REST Framework, Simple JWT, django-cors-headers, django-environ, SQLite |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Motion React (Framer Motion), Axios, react-hot-toast, Lucide React |
| **Design** | Syne (typo), Motion React (animations fluides), Palette personnalisée (#0a0a0f, #f5a623, #ffc85c) |

---

## Fonctionnalités

### Backend (Django)

- **Authentification**
  - Inscription : `POST /api/register/` (nom, email, mot de passe)
  - Connexion : `POST /api/login/` → tokens JWT (access + refresh)
  - Rafraîchissement du token : `POST /api/token/refresh/`
- **Transactions**
  - Liste des transactions de l'utilisateur connecté : `GET /api/transactions/`
  - Création : `POST /api/transactions/` (text, amount)
  - Détail / modification / suppression : `GET`, `PUT`, `DELETE /api/transactions/<uuid>/`
- **Statistiques mensuelles**
  - Résumé mensuel : `GET /api/stats/` (paramètres : mois, année)
  - Revenus, dépenses, bilan net du mois + listes des transactions
- **Profil utilisateur**
  - Consultation : `GET /api/profile/`
  - Modification (nom, email) : `PUT /api/profile/`
  - Suppression du compte : `DELETE /api/profile/`
  - Modification du mot de passe : `PUT /api/password/`
- **Sécurité**
  - Authentification JWT sur toutes les routes protégées
  - Données filtrées par utilisateur (chaque user ne voit que ses données)
  - Variables sensibles dans `.env` via django-environ
- **Autres**
  - Page d'accueil publique : `/` (landing)
  - Interface d'administration Django : `/admin/`

### Frontend (Next.js)

- **Page d'accueil (landing)**
  - Hero avec gradient, présentation des fonctionnalités, mockup du tableau de bord, stats animées, CTA inscription/connexion

- **Authentification**
  - Connexion : formulaire email / mot de passe avec validation
  - Inscription : nom, email, mot de passe avec confirmation
  - Pages « Mot de passe oublié » et « Réinitialisation » (UI prêtes)

- **Tableau de bord**
  - **En-tête animée** avec titre gradient (#f5a623 → #ffc85c) et date actuelle
  - **Cartes de stats rapides** (solde, revenus, dépenses) avec icônes colorées
  - **Cartes de résumé détaillés** : revenus totaux, dépenses totales, bilan net (montants FCFA)
  - **Barre de progression** : dépenses par rapport aux revenus avec animation fluide
  - **Liste des transactions** : description, montant coloré selon type, date, actions (modifier, supprimer)
  - **Ajout** : modal avec formulaire (description, montant) et spinner animé
  - **Modification** : modal pré-rempli pour éditer une transaction
  - **Suppression** : une seule, sélection multiple, ou« tout supprimer »

- **Page Statistiques mensuelles (Rapport)**
  - **En-tête** avec titre gradient et description
  - **Filtres** : sélecteurs mois/année avec bouton "Appliquer" animé
  - **Cartes de résumé** : revenus, dépenses, bilan net du mois sélectionné
  - **Tableaux détaillés** : transactions entrantes (vertes) et sortantes (rouges)
  - **Animations en cascade** : chaque élément apparaît progressivement au chargement

- **Profil utilisateur**
  - **En-tête** avec titre gradient et description
  - **Avatar** avec initiales et badge actif vert
  - **Formulaires modernisés** : modification nom/email, gestion mot de passe
  - **Design** : cartes avec borders translucides et hover effects élégants

- **Design & UX moderne**
  - **Palette personnalisée**
    - Fond : #0a0a0f (noir très foncé)
    - Accent primaire : #f5a623 (doré)
    - Accent secondaire : #ffc85c (jaune clair)
    - Texte principal : #f0f0f5 (blanc)
    - Texte secondaire : #8888a0 (gris)
  - **Animations Motion React** : fade-ins, slides, hovers élégants, spinners
  - **Typo Syne** : police moderne pour tous les titres
  - **Noise overlay** SVG : texture subtile pour profondeur visuelle
  - **Navbar** : navigation principale stylisée et responsive
  - **Toasts** (react-hot-toast) : notifications succès/erreurs
  - **Responsive** : mobile-first, optimisé pour tous les écrans
  - **Auto-refresh token** : renouvellement automatique en cas de 401

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

Créer le fichier `.env` à la racine de `backend/` :

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

API disponible sur **http://127.0.0.1:8000**
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

Application sur **http://localhost:3000**

---

## Routes API (Backend)

| Méthode | URL | Description |
|--------|-----|-------------|
| POST | `/api/register/` | Inscription utilisateur |
| POST | `/api/login/` | Connexion (retourne access + refresh token) |
| POST | `/api/token/refresh/` | Renouvellement du token d'accès |
| GET / POST | `/api/transactions/` | Lister ou créer une transaction |
| GET / PUT / DELETE | `/api/transactions/<uuid>/` | Détail, édition, suppression transaction |
| GET | `/api/stats/` | Résumé mensuel (params: month, year) |
| GET / PUT | `/api/profile/` | Profil utilisateur |
| DELETE | `/api/profile/` | Suppression du compte |
| PUT | `/api/password/` | Modification du mot de passe |

Toutes les routes sauf `register`, `login` et `token/refresh` nécessitent l'en-tête :
```
Authorization: Bearer <access_token>
```

---

## Structure du projet

```
gestionDepensesV2/
├── backend/
│   ├── .env                        # Variables d'environnement (pas à commiter)
│   ├── db.sqlite3                  # Base de données
│   ├── manage.py
│   ├── requirements.txt
│   ├── backend/
│   │   ├── settings.py             # Config Django
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   └── api/
│       ├── models.py               # User (custom), Transaction
│       ├── views.py                # Endpoints (register, login, transactions, stats, profile)
│       ├── serializers.py          # Sérialisation des données
│       ├── urls.py
│       ├── admin.py
│       ├── apps.py
│       ├── migrations/
│       └── templates/
│           └── landing.html
│
├── frontend/
│   ├── .env.local                  # Config frontend (pas à commiter)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   ├── middleware.ts               # Auth middleware
│   ├── app/
│   │   ├── globals.css             # Styles globaux + Tailwind
│   │   ├── layout.tsx              # Layout principal
│   │   ├── page.tsx                # Landing page
│   │   ├── api/
│   │   │   ├── confirm-email/
│   │   │   ├── confirm-login/
│   │   │   ├── register/
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx            # Tableau de bord principal
│   │       ├── rapport/page.tsx    # Statistiques mensuelles
│   │       └── profile/page.tsx    # Profil utilisateur
│   │
│   ├── public/
│   │   └── manifest.json
│   │
│   └── src/
│       ├── app/actions/actions.ts  # Server Actions (API calls)
│       ├── components/
│       │   └── NavBar.tsx          # Navbar principale
│       ├── constants/
│       │   ├── routes.ts           # Routes frontend
│       │   └── api.ts              # Configuration API
│       ├── hooks/                  # Hooks personnalisés
│       └── services/               # Services utilitaires
│
└── README.md
```

---

## Points clés du code

### Frontend - Design System

- **Typo & Colors** : Définis dans Tailwind CSS avec coulors personnalisées
- **Animations** : Utilisation de Motion React pour des transitions fluides
- **Composants** : Réutilisables, modulaires, avec animations intégrées
- **Responsive** : Classes Tailwind (sm:, md:, lg:) pour tous les breakpoints

### Backend - Sécurité

- **JWT** : Simple JWT pour tokens avec expiration
- **CORS** : django-cors-headers pour requêtes cross-origin
- **Env** : django-environ pour variables sensibles
- **Filtrage** : Chaque utilisateur ne voit que ses propres transactions

---

## Développement futur

- [ ] Branche des transactions (catégories)
- [ ] Graphiques et visualisations (Chart.js)
- [ ] Export PDF/Excel des rapports
- [ ] Récurrences et budgets
- [ ] Notifications et alertes
- [ ] API de synchronization multi-appareils
- [ ] Mode sombre/clair (toggle)
- [ ] Partage des comptes familiaux

---

## Licence

Projet à usage personnel / éducatif.
EOF