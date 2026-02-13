# 🚀 Guide de Démarrage Rapide - Premunia CRM

## 📊 Architecture de Base de Données

### ⚠️ IMPORTANT : Structure KV Store

Votre plateforme Premunia utilise **Supabase KV Store** - un système de base de données clé-valeur pré-configuré et entièrement opérationnel.

**Vous n'avez AUCUNE migration à effectuer !** 

La table `kv_store_07afcff5` est déjà créée et gère automatiquement :
- ✅ Les leads et prospects
- ✅ Les utilisateurs et leurs rôles
- ✅ Les paramètres du site
- ✅ La configuration SMTP
- ✅ Toutes les données de l'application

Cette approche est flexible, rapide et parfaite pour le prototypage et la production légère.

---

## 🎯 Étapes de Configuration Initiales

### 1. Tester le Système
Accédez à la page de diagnostic : **`/system-test`**

Cette page effectue automatiquement 10 tests pour vérifier :
- ✓ Santé du backend
- ✓ Connexion à la base de données
- ✓ API endpoints
- ✓ Authentification
- ✓ Gestion des leads

### 2. Créer Votre Compte Admin

#### Étape A : Inscription
1. Allez sur **`/signup`**
2. Remplissez le formulaire :
   - **Nom complet** : Votre nom
   - **Email** : admin@premunia.fr (ou votre email)
   - **Mot de passe** : Choisissez un mot de passe fort
3. Cliquez sur "Créer mon compte"

#### Étape B : Promouvoir en Admin
1. Vous serez redirigé automatiquement vers **`/promote-admin`**
2. Cliquez sur "Promouvoir en Admin"
3. Vous avez maintenant accès complet au CRM !

### 3. Accéder au Dashboard
- URL : **`/admin`**
- Vous y trouverez :
  - 📊 Statistiques en temps réel
  - 📋 Gestion des leads
  - ⚙️ Paramètres du site
  - 📧 Automatisation email
  - 🧪 Tests système

---

## 🛠️ Endpoints API Disponibles

### Publics (sans authentification)
```
GET  /make-server-07afcff5/health          # Health check
GET  /make-server-07afcff5/settings        # Récupérer les paramètres
POST /make-server-07afcff5/leads           # Créer un lead
POST /make-server-07afcff5/signup          # Créer un utilisateur
```

### Protégés (authentification requise)
```
GET    /make-server-07afcff5/leads            # Liste des leads
PUT    /make-server-07afcff5/leads/:id        # Modifier un lead
DELETE /make-server-07afcff5/leads/:id        # Supprimer un lead
PUT    /make-server-07afcff5/settings         # Modifier les paramètres
GET    /make-server-07afcff5/user/role        # Rôle utilisateur
POST   /make-server-07afcff5/promote-admin    # Promouvoir admin
GET    /make-server-07afcff5/smtp-config      # Config SMTP
PUT    /make-server-07afcff5/smtp-config      # Modifier config SMTP
```

---

## 🧪 Tests et Debugging

### Page de Test Système
**URL : `/system-test`**

Fonctionnalités :
- ✅ 10 tests automatiques complets
- 📊 Statistiques de réussite/échec
- 🔍 Détails JSON de chaque test
- ⏱️ Mesure de performance (ms)
- 🎨 Interface visuelle claire

### Utilisation
1. Accédez à `/system-test`
2. Cliquez sur "Lancer tous les tests"
3. Observez les résultats en temps réel
4. Cliquez sur "Voir les détails" pour inspecter chaque test

### Tests Effectués
1. 🏥 Health Check Backend
2. ⚙️ Récupération Settings
3. 📝 Création Lead Test
4. 🔐 Vérification Session Auth
5. 🎫 Récupération Access Token
6. 📊 Récupération Leads (Auth)
7. 👤 Vérification Rôle Utilisateur
8. 📧 Récupération Config SMTP
9. 💾 Test Connexion BDD
10. 🎨 Vérification Build Frontend

---

## 📁 Structure du Projet

```
/src/app/
├── App.tsx                      # Point d'entrée
├── routes.ts                    # Configuration routes
├── pages/
│   ├── LandingPage.tsx         # Page publique
│   ├── SignIn.tsx              # Connexion
│   ├── SignUp.tsx              # Inscription
│   ├── PromoteAdmin.tsx        # Promotion admin
│   ├── Admin.tsx               # Dashboard
│   ├── AdminLeads.tsx          # Gestion leads
│   ├── AdminSettings.tsx       # Paramètres
│   ├── AdminAutomation.tsx     # Emails
│   └── SystemTest.tsx          # Tests (NOUVEAU)
└── components/                  # Composants UI

/supabase/functions/server/
├── index.tsx                    # Serveur API
└── kv_store.tsx                # Utilitaires BDD
```

---

## 🎨 Charte Graphique Premunia

```css
Rouge Coral : #EE3B33
Orange      : #F79E1B
Violet      : #880E4F
Magenta     : #E91E63
```

Ces couleurs sont appliquées dans toute l'application.

---

## 🔒 Sécurité

### Bonnes Pratiques Implémentées
- ✅ JWT pour l'authentification
- ✅ Tokens stockés de manière sécurisée
- ✅ CORS configuré correctement
- ✅ Validation des données côté serveur
- ✅ Pas de mot de passe SMTP dans les réponses
- ✅ Service Role Key protégée (backend uniquement)

### Variables d'Environnement Protégées
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

---

## 📧 Configuration Email (Optionnel)

Pour activer l'automatisation email :

1. Allez dans **`/admin/automation`**
2. Configurez vos paramètres SMTP :
   - Hôte SMTP (ex: smtp.gmail.com)
   - Port (465 ou 587)
   - Email expéditeur
   - Mot de passe
3. Enregistrez

---

## 🐛 Résolution de Problèmes

### Le backend ne répond pas
1. Vérifiez `/system-test` - Test #1
2. Consultez les logs Supabase
3. Vérifiez les variables d'environnement

### Impossible de se connecter
1. Vérifiez que le compte existe
2. Utilisez `/system-test` - Test #4
3. Vérifiez la session dans DevTools

### Les leads ne s'affichent pas
1. Vérifiez l'authentification
2. Utilisez `/system-test` - Test #6
3. Vérifiez les permissions

### Erreur 401 Unauthorized
- Vous devez être connecté
- Votre session a peut-être expiré
- Reconnectez-vous via `/signin`

---

## 📊 Flux de Données

```
Landing Page (/):
  User remplit formulaire → POST /leads → KV Store → Confirmation

Dashboard Admin (/admin):
  Connexion → GET /leads → Affichage tableau → Actions CRUD

Gestion Leads (/admin/leads):
  GET /leads → Liste complète → PUT/DELETE /leads/:id

Paramètres (/admin/settings):
  GET /settings → Formulaire → PUT /settings → Mise à jour

Tests Système (/system-test):
  10 tests automatiques → Résultats visuels → Debug
```

---

## 🚀 Prochaines Étapes Recommandées

### Court Terme
1. ✅ Créer votre compte admin
2. ✅ Tester avec `/system-test`
3. ✅ Personnaliser les textes via `/admin/settings`
4. ✅ Tester le formulaire de lead sur `/`

### Moyen Terme
1. Configurer SMTP pour les emails
2. Créer des templates d'email
3. Importer vos premiers leads
4. Personnaliser la landing page

### Long Terme
1. Intégration avec outils externes
2. Analytics avancés
3. Automatisation complexe
4. Export de données

---

## 💡 Conseils

### Performance
- Le KV Store est optimisé pour la lecture rapide
- Utilisez `getByPrefix` pour les requêtes filtrées
- Les tokens sont mis en cache

### Debug
- Toujours consulter `/system-test` en premier
- Activer la console navigateur (F12)
- Les logs backend sont dans Supabase Functions

### Développement
- Testez toujours localement avant déploiement
- Utilisez la page de test après chaque modification
- Documentez vos changements

---

## 📞 Support

### Ressources
- 📖 Documentation complète : `/README_ARCHITECTURE.md`
- 🎯 Fonctionnalités : `/FEATURES.md`
- 🚀 Déploiement : `/DEPLOYMENT_SUCCESS.md`

### Contact
Pour toute question sur l'architecture ou les fonctionnalités, consultez la documentation détaillée dans les fichiers `.md` du projet.

---

## ✅ Checklist de Démarrage

- [ ] Accéder à `/system-test` et lancer tous les tests
- [ ] Créer un compte sur `/signup`
- [ ] Se promouvoir admin sur `/promote-admin`
- [ ] Se connecter sur `/signin`
- [ ] Accéder au dashboard `/admin`
- [ ] Tester la création d'un lead sur `/`
- [ ] Vérifier le lead dans `/admin/leads`
- [ ] Personnaliser les paramètres `/admin/settings`
- [ ] Relancer les tests système
- [ ] Configurer SMTP (optionnel)

---

**Félicitations ! Votre plateforme Premunia CRM est prête à l'emploi ! 🎉**

Toutes les fonctionnalités sont opérationnelles et la base de données KV Store fonctionne automatiquement. Aucune migration n'est nécessaire.
