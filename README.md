# 🏠 Service Domicile — SOS Dépannage France

Application full-stack de gestion de services à domicile (Plomberie, Électricité, Serrurerie, Chauffage, Assainissement).

---

## 📍 URLs

### Environnement Local
| Service | URL |
|---------|-----|
| **Frontend (React)** | http://localhost:3000 |
| **Backend API (FastAPI)** | http://localhost:8000 |
| **Documentation API** | http://localhost:8000/docs |
| **Mongo-Express (DB Admin)** | http://localhost:8081 |

### Production (Vercel)
| Service | URL |
|---------|-----|
| **Site web** | https://service-domicile.vercel.app |
| **API** | https://service-domicile.vercel.app/api |
| **Docs API** | https://service-domicile.vercel.app/docs |

---

## 🔐 Comptes de test

### Administrateur
| Champ | Valeur |
|-------|--------|
| Email | `admin@sos-depannage.fr` |
| Mot de passe | `adminpassword` |
| Rôle | `admin` |

### Clients
| Nom | Email | Mot de passe |
|-----|-------|-------------|
| Jean Dupont | `client1@gmail.com` | `client1password` |
| Marie Martin | `client2@gmail.com` | `client2password` |

---

## 🗄️ Base de Données (MongoDB)

### Accès local (Mongo-Express)
- **URL** : http://localhost:8081
- **Utilisateur** : `admin`
- **Mot de passe** : `admin`

### Collections disponibles
| Collection | Description |
|------------|-------------|
| `users` | Utilisateurs (admin + clients) |
| `services` | Prestations de service (plomberie, etc.) |
| `products` | Produits boutique |
| `orders` | Commandes passées |
| `interventions` | Demandes d'intervention |
| `reviews` | Avis clients |
| `contact_messages` | Messages du formulaire contact |

### MongoDB Atlas (Production)
Créer un cluster gratuit sur https://www.mongodb.com/atlas puis copier la chaîne de connexion.

---

## 🚀 Déploiement

### Vercel
1. Aller sur https://vercel.com
2. Cliquer **"Add New → Project"**
3. Importer `hamzamoudane/service_domicile`
4. Framework : **Other**
5. Root Directory : **`/frontend`** (ou laisser le root du monorepo)
6. Variables d'environnement à configurer :

| Variable | Valeur |
|----------|--------|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net` |
| `DB_NAME` | `service_domicile` |
| `JWT_SECRET` | `supersecretjwtkey123` |
| `CORS_ORIGINS` | `https://ton-projet.vercel.app` |
| `ADMIN_EMAIL` | `admin@sos-depannage.fr` |
| `ADMIN_PASSWORD` | `adminpassword` |
| `CLIENT1_EMAIL` | `client1@gmail.com` |
| `CLIENT1_PASSWORD` | `client1password` |
| `CLIENT2_EMAIL` | `client2@gmail.com` |
| `CLIENT2_PASSWORD` | `client2password` |

---

## ⚙️ Installation Locale

### Pré-requis
- Docker (MongoDB)
- Node.js v20+
- Python 3.11+

### Base de données
```bash
docker run -d --name service-domicile-mongo -p 27017:27017 mongo:6.0
```

### Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

### Frontend (React)
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

---

## 📱 WhatsApp

Le numéro WhatsApp du commerce est codé dans `frontend/src/pages/Cart.jsx:50` :
```js
const phoneNum = "+33659874502";
```

Lorsqu'un client passe commande avec le mode de paiement **"Commander via WhatsApp"** :
1. La commande est créée dans l'API
2. Un nouvel onglet s'ouvre vers `https://wa.me/+33659874502`
3. Le message pré-rempli contient les détails de la commande
4. Le client doit **envoyer** lui-même le message

---

## 🧪 Tester les APIs

### Login admin
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sos-depannage.fr", "password": "adminpassword"}'
```

### Voir les commandes (admin)
```bash
curl http://localhost:8000/api/admin/orders \
  -H "Authorization: Bearer <TOKEN>"
```

### Voir les utilisateurs (admin)
```bash
curl http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer <TOKEN>"
```

### Créer une commande (client)
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"items":[{"item_type":"service","item_id":"ID_SERVICE","name":"Recherche de fuite","price":89,"quantity":1}],"address":"12 rue de Paris","city":"Paris","postal_code":"75001","phone":"+33659874502","payment_method":"cod"}'
```

---

## 📁 Structure du projet
```
service_domicile/
├── backend/
│   ├── server.py          # API FastAPI
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/         # Pages React
│   │   ├── components/    # Composants UI
│   │   ├── contexts/      # Contextes (Auth, Cart, Lang)
│   │   └── lib/           # Utilitaires (API)
│   └── package.json
├── docker-compose.yml     # Docker Compose (MongoDB + Backend)
├── vercel.json            # Configuration Vercel
└── .env                   # Variables d'environnement (local)
```
