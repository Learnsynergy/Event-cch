# EventPro - Plateforme de Gestion d'Événements

Une application web complète permettant à toute personne ou agence de créer, gérer et vendre des billets pour des événements en ligne.

## 🚀 Fonctionnalités

### 👤 Rôles Utilisateurs
- **Organisateur** : Toute personne qui s'inscrit pour proposer des événements
- **Administrateur** : Gère la validation et la modération (créé manuellement en base)

### 🔐 Authentification
- Inscription/Connexion sécurisée pour les organisateurs
- Système de rôles avec protection des routes
- Authentification via Supabase Auth

### 📅 Gestion d'Événements
- Création d'événements avec informations complètes
- Système de validation par l'administrateur
- Publication automatique après approbation
- Interface publique pour consulter les événements

### 💳 Système de Paiement
- Vente de billets numériques
- Support des paiements par carte bancaire (Visa)
- Support MTN Mobile Money (à configurer)
- Génération de billets avec QR codes uniques

### 📊 Tableaux de Bord
- Dashboard organisateur : gestion des événements créés
- Dashboard utilisateur : historique des billets achetés
- Interface d'administration pour validation des événements

## 🛠️ Technologies Utilisées

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : TailwindCSS
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Paiement** : Intégration Stripe (à configurer)
- **QR Codes** : qrcode library
- **Formulaires** : React Hook Form
- **Notifications** : React Hot Toast
- **Routing** : React Router DOM
- **Dates** : date-fns

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd eventpro
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**
   - Créez un projet sur [Supabase](https://supabase.com)
   - Cliquez sur "Connect to Supabase" dans l'interface Bolt
   - Ou copiez `.env.example` vers `.env` et ajoutez vos clés

4. **Lancer le projet**
```bash
npm run dev
```

## 🗄️ Structure de la Base de Données

L'application utilise Supabase avec les tables suivantes :

### `profiles`
- Profils utilisateurs avec rôles (organizer/admin)
- Lié automatiquement à Supabase Auth

### `events`
- Événements créés par les organisateurs
- Statuts : pending, approved, rejected
- Informations complètes (titre, description, lieu, date, prix, etc.)

### `tickets`
- Billets achetés par les utilisateurs
- QR codes pour validation
- Statuts de paiement

## 🎯 Utilisation

### Pour les Organisateurs
1. S'inscrire sur la plateforme
2. Créer un événement via le dashboard
3. Attendre la validation par l'administrateur
4. L'événement devient visible publiquement une fois approuvé

### Pour les Visiteurs
1. Consulter les événements sur la page d'accueil
2. Voir les détails d'un événement
3. Acheter des billets (avec ou sans compte)
4. Recevoir un billet numérique avec QR code

### Pour l'Administrateur
1. Accéder à l'interface d'administration
2. Valider ou rejeter les événements soumis
3. Surveiller l'activité de la plateforme

## 💳 Configuration des Paiements

### Stripe (Cartes Bancaires)
Pour configurer les paiements par carte bancaire, vous devez :

1. Créer un compte Stripe
2. Obtenir vos clés API
3. Configurer les webhooks pour la confirmation des paiements

https://bolt.new/setup/stripe

### MTN Mobile Money
L'intégration MTN MoMo nécessite :
1. Un compte développeur MTN
2. Configuration des APIs de paiement mobile
3. Implémentation des callbacks de confirmation

## 🚦 Variables d'Environnement

```env
# Supabase
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase

# Stripe (optionnel)
VITE_STRIPE_PUBLISHABLE_KEY=votre_cle_publique_stripe
```

## 🔧 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Vérifie le code avec ESLint

## 📱 Fonctionnalités Avancées

### QR Codes
- Génération automatique pour chaque billet
- Contient les informations de l'événement et de l'acheteur
- Utilisable pour validation à l'entrée

### Responsive Design
- Interface adaptée mobile, tablette et desktop
- Navigation optimisée pour tous les appareils

### Sécurité
- Row Level Security (RLS) sur toutes les tables
- Validation des rôles côté serveur
- Protection des routes sensibles

## 🎨 Design System

- **Couleurs principales** : Violet (#8B5CF6), Indigo (#6366F1)
- **Couleur d'accent** : Orange (#F97316)
- **Système d'espacement** : 8px
- **Typographie** : Optimisée pour la lisibilité
- **Animations** : Transitions fluides et micro-interactions

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation Supabase
2. Vérifiez les issues GitHub
3. Créez une nouvelle issue si nécessaire

---

**EventPro** - Votre plateforme complète pour la gestion d'événements 🎉