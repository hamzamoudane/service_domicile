# Guide Complet — Service Domicile

## 📍 URLs

### Environnement Local
| Service | URL | Accès |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | Navigateur |
| **Backend API** | http://localhost:8000 | API |
| **Docs API (Swagger)** | http://localhost:8000/docs | Navigateur |
| **Mongo-Express (DB)** | http://localhost:8081 | `admin` / `admin` |

### Production (en ligne)
| Service | URL | Hébergement |
|---------|-----|-------------|
| **Frontend** | https://servicedomicile.vercel.app | Vercel (gratuit) |
| **Backend API** | https://service-domicile-backend.onrender.com | Render (gratuit) |
| **MongoDB** | `mongodb+srv://admin:wanamali@cluster0.jaw8iti.mongodb.net/` | MongoDB Atlas (gratuit) |

---

## 🔐 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Administrateur** | `admin@sos-depannage.fr` | `adminpassword` |
| **Client 1** | `client1@gmail.com` | `client1password` |
| **Client 2** | `client2@gmail.com` | `client2password` |

---

## 🗄️ Base de Données (MongoDB)

### Accès via Mongo-Express (local)
- **URL** : http://localhost:8081
- **Login** : `admin` / `admin`

### Collections
| Collection | Description |
|------------|-------------|
| `users` | Utilisateurs (admin + clients) |
| `services` | Prestations (plomberie, électricité...) |
| `products` | Produits de la boutique |
| `orders` | Commandes clients |
| `interventions` | Demandes d'intervention urgente |
| `reviews` | Avis clients |
| `contact_messages` | Messages du formulaire contact |

### MongoDB Atlas (Production)
- **URI** : `mongodb+srv://admin:wanamali@cluster0.jaw8iti.mongodb.net/?appName=Cluster0`
- **Accès Web** : https://cloud.mongodb.com → Cluster0 → Collections

---

## 🧑‍💼 Gestion en tant qu'Admin

### 1. Se connecter
- Aller sur https://servicedomicile.vercel.app (ou http://localhost:3000)
- Cliquer **Connexion**
- Email : `admin@sos-depannage.fr` / Mot de passe : `adminpassword`

### 2. Dashboard Admin
Une fois connecté en admin, tu peux voir :
- **Statistiques** : nombre de commandes, interventions, clients
- **Commandes** : liste + changement de statut (pending → confirmed → processing → completed)
- **Interventions** : demandes urgentes des clients
- **Utilisateurs** : lister / activer / désactiver / supprimer
- **Services** : ajouter / modifier / supprimer des prestations
- **Produits** : gérer le stock et les prix

### 3. Gérer les commandes
```bash
# Voir toutes les commandes
curl https://servicedomicile.vercel.app/api/admin/orders \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN"

# Changer le statut
curl -X PATCH https://servicedomicile.vercel.app/api/admin/orders/ID_COMMANDE \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

### 4. Gérer les utilisateurs
```bash
# Lister les utilisateurs
curl https://servicedomicile.vercel.app/api/admin/users \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN"
```

---

## 📱 WhatsApp

Le numéro WhatsApp du commerce est dans `frontend/src/pages/Cart.jsx:50` :
```js
const phoneNum = "+33659874502"; // Ton numéro
```

Quand un client commande via WhatsApp :
1. La commande est enregistrée en base
2. Un onglet WhatsApp s'ouvre vers `wa.me/+33659874502`
3. Le message pré-rempli contient les détails de la commande
4. Le client envoie manuellement le message

---

## 🚀 Déploiement (pour mettre en ligne)

### Étape 1 : MongoDB Atlas ✅ (déjà fait)
- Cluster créé sur https://cloud.mongodb.com
- URI : `mongodb+srv://admin:wanamali@cluster0.jaw8iti.mongodb.net/?appName=Cluster0`

### Étape 2 : Backend sur Render
1. Va sur https://dashboard.render.com
2. Clique **"New +" → "Web Service"**
3. Connecte ton GitHub (`hamzamoudane/service_domicile`)
4. Configure :
   - **Name** : `service-domicile-backend`
   - **Root Directory** : `backend`
   - **Runtime** : `Python 3`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan** : Free
5. Ajoute les variables d'environnement (copie depuis `render.yaml`)
6. Clique **"Create Web Service"**
7. Une fois déployé, note l'URL (ex: `https://service-domicile-backend.onrender.com`)

### Étape 3 : Mettre à jour le Frontend Vercel
1. Va sur https://vercel.com/hamza-moudane-s-projects/service_domicile
2. Va dans **Settings → Environment Variables**
3. Mets à jour `REACT_APP_BACKEND_URL` avec l'URL Render (ex: `https://service-domicile-backend.onrender.com`)
4. Va dans **Deployments**, clique "..." sur le dernier déploiement → **Redeploy**

### Étape 4 : Vérifier
- Ouvre https://servicedomicile.vercel.app
- Connecte-toi avec `admin@sos-depannage.fr` / `adminpassword`
- Vérifie que les services, produits et commandes s'affichent

---

## 🧪 Tester l'API

```bash
# Login admin
curl -X POST https://servicedomicile.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sos-depannage.fr","password":"adminpassword"}'

# Voir les services
curl https://servicedomicile.vercel.app/api/services

# Voir les commandes (admin)
curl https://servicedomicile.vercel.app/api/admin/orders \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 🛠️ Développement Local

```bash
git clone https://github.com/hamzamoudane/service_domicile.git
cd service_domicile

# MongoDB
docker run -d --name mongo -p 27017:27017 mongo:6.0

# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000

# Frontend
cd frontend
npm install --legacy-peer-deps
npm start
```
