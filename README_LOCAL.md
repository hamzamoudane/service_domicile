# SOS Dépannage France - Guide d'Installation Locale

## 📋 Pré-requis

- **Docker** (pour MongoDB)
- **Node.js v20+** (pour le Frontend)
- **Python 3.11+** (pour le Backend)

---

## 🚀 Installation étape par étape

### 1. Cloner le projet
```bash
git clone https://github.com/hamzamoudane/service_domicile.git
cd service_domicile
```

### 2. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet (ou copiez celui existant) :

```env
# Backend config
MONGO_URL=mongodb://localhost:27017
DB_NAME=service_domicile
JWT_SECRET=supersecretjwtkey123
CORS_ORIGINS=http://localhost:3000

# Seed users
ADMIN_EMAIL=admin@sos-depannage.fr
ADMIN_PASSWORD=adminpassword
CLIENT1_EMAIL=client1@gmail.com
CLIENT1_PASSWORD=client1password
CLIENT2_EMAIL=client2@gmail.com
CLIENT2_PASSWORD=client2password

# Frontend config
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 3. Lancer la base de données (MongoDB)
```bash
docker run -d --name service-domicile-mongo -p 27017:27017 mongo:6.0
```

**(Optionnel) Interface DB** — Mongo-Express :
```bash
docker run -d --name mongo-express -p 8081:8081 \
  -e ME_CONFIG_MONGODB_URL=mongodb://localhost:27017 \
  -e ME_CONFIG_BASICAUTH_USERNAME=admin \
  -e ME_CONFIG_BASICAUTH_PASSWORD=admin \
  mongo-express:latest
```
👉 http://localhost:8081 (login: `admin` / `admin`)

### 4. Lancer le Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```
👉 http://localhost:8000 — API
👉 http://localhost:8000/docs — Documentation Swagger

### 5. Lancer le Frontend (React)
Ouvrez un **second terminal** :
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
👉 http://localhost:3000 — Site web

---

## 🐳 Alternative : Docker Compose (tout-en-un)
```bash
docker compose up --build
```
Cela lance MongoDB + Backend automatiquement.

---

## 🔐 Comptes de test (créés automatiquement au démarrage)

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Admin** | `admin@sos-depannage.fr` | `adminpassword` |
| **Client 1** | `client1@gmail.com` | `client1password` |
| **Client 2** | `client2@gmail.com` | `client2password` |

---

## 🌐 URLs récapitulatives

| Service | URL | Identifiants |
|---------|-----|-------------|
| **Site web** | http://localhost:3000 | — |
| **API Backend** | http://localhost:8000 | — |
| **Docs API (Swagger)** | http://localhost:8000/docs | — |
| **Mongo-Express (DB)** | http://localhost:8081 | `admin` / `admin` |

---

## 📱 WhatsApp

Le numéro de téléphone pour recevoir les commandes WhatsApp est dans :
`frontend/src/pages/Cart.jsx` — ligne ~50 :
```js
const phoneNum = "+33659874502"; // Modifiez par votre numéro
```

---

## 🧪 Tester rapidement

```bash
# Login admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sos-depannage.fr", "password": "adminpassword"}'

# Voir les utilisateurs (admin)
curl http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer <VOTRE_TOKEN>"

# Voir les services disponibles
curl http://localhost:8000/api/services
```

---

## 📁 Structure du projet
```
service_domicile/
├── backend/
│   ├── server.py           # API FastAPI (toute la logique)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # Pages React (Accueil, Services, Panier, Admin...)
│   │   ├── components/     # Composants UI réutilisables
│   │   ├── contexts/       # AuthContext, CartContext, LanguageContext
│   │   └── lib/            # api.js (axios), utils
│   └── package.json
├── docker-compose.yml      # Lance MongoDB + Backend
├── vercel.json             # Déploiement Vercel
└── .env                    # Variables d'environnement
```
