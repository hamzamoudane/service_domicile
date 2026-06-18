# SOS Dépannage France - Projet Service à Domicile

Ce projet est une plateforme complète de services à domicile (Plomberie, Électricité, etc.) avec une boutique intégrée et un système de commande via WhatsApp.

## 🚀 Installation Locale Rapide

### 1. Pré-requis
*   **Docker** (pour la base de données MongoDB)
*   **Node.js v20+** (pour le Frontend)
*   **Python 3.11+** (pour le Backend)

### 2. Lancer la Base de Données (MongoDB)
Utilisez Docker pour lancer une instance MongoDB stable :
```bash
docker run -d --name service-domicile-mongo -p 27017:27017 mongo:6.0
```

### 3. Configurer le Backend (FastAPI)
Ouvrez un terminal dans le dossier `backend` :
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```
*Le backend sera disponible sur : http://localhost:8000*

### 4. Configurer le Frontend (React)
Ouvrez un second terminal dans le dossier `frontend` :
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
*Le site sera disponible sur : http://localhost:3000*

---

## 📱 Fonctionnalité WhatsApp (Cash on Delivery)

Le système permet de passer commande directement via WhatsApp. 
Pour modifier le numéro de téléphone de réception des commandes :
1.  Ouvrez `frontend/src/pages/Cart.jsx`
2.  Modifiez la variable `phoneNum` (ligne ~50) :
    ```javascript
    const phoneNum = "33180888888"; // Remplacez par votre numéro
    ```

---

## 🛠️ Gestion avec GitHub

Pour sauvegarder vos modifications et les envoyer sur GitHub :
```bash
git add .
git commit -m "Description de vos changements"
git push origin main
```

---

## 🌐 Déploiement Cloud (Gratuit)

1.  **Frontend** : Connectez votre dépôt GitHub à [Vercel](https://vercel.com).
2.  **Base de données** : Utilisez [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Tier gratuit).
3.  **Variables d'environnement** : Copiez le contenu de votre `.env` dans les paramètres de votre projet Vercel.

---
**Chemin du projet :** `/home/lmorpho69/Documents/testGemini/service_domicile`
