# PRD — Home Help

## Original Problem Statement
Plateforme nationale de dépannage et services à domicile 24h/24 et 7j/7 ("Home Help"). Hybride : plateforme de services + e-commerce + gestion d'interventions. Cinq métiers (plomberie, électricité, serrurerie, chauffage, assainissement). Couverture France entière. Rôles client + admin. Mode clair/sombre. Bilingue FR/EN. UI premium.

## Architecture
- **Backend**: FastAPI single-file (`/app/backend/server.py`), MongoDB (motor async), JWT auth (cookies httpOnly + Bearer header), bcrypt, UUID ids.
- **Frontend**: React 19 + React Router + Tailwind + shadcn/ui + Framer Motion. Path alias `@/`. Sonner toasts. Lucide icons. Fonts: Outfit (display) + Manrope (body).
- **State**: AuthContext (JWT), ThemeContext (light/dark, localStorage), LanguageContext (FR/EN, localStorage), CartContext (client-side localStorage).
- **Data**: Auto-seeded on startup: 3 demo users, 28 services, 12 products, 6 reviews.

## Demo Credentials
- Admin: `admin@store.com` / `Admin123!`
- Client 1: `client1@store.com` / `Client123!`
- Client 2: `client2@store.com` / `Client123!`

## What's been implemented (2026-02-08)
### Public site
- Home (hero animé, 5 catégories, "Pourquoi nous choisir", témoignages, CTA final)
- Catalogue prestations (28 prestations, filtres catégorie, recherche)
- Boutique (12 produits, filtres, recherche)
- Panier client-side (ajout/suppression/quantité, total)
- Formulaire demande d'intervention multi-étapes (guest + auth)
- Pages À propos, FAQ accordion, Avis (lecture + soumission), Contact (avec carte OSM)

### Auth & espace client
- Inscription / connexion email-password JWT
- Espace personnel : profil, changement de mot de passe, historique commandes, historique interventions
- Routes protégées + redirection role-based

### Dashboard admin complet
- Statistiques (CA, commandes, interventions, clients, top catégories, activité récente)
- CRUD prestations + produits (FR/EN, prix, stock, images, actif/populaire)
- Gestion commandes (changement de statut)
- Gestion interventions (statut + notes internes, badge urgent)
- Gestion utilisateurs (activer/désactiver/supprimer)

### Transverse
- Mode clair/sombre (toggle header, persistant)
- Multilingue FR/EN (toggle header, persistant)
- Header sticky en glass-morphism, footer riche
- Animations (Framer Motion + reveal-on-scroll + micro-interactions hover)
- Responsive mobile/tablette/desktop
- data-testid sur tous les éléments interactifs

## Backlog (P0/P1/P2)
### P1 (next iteration)
- Connexion Google OAuth (Emergent Auth) — playbook prêt, intégration différée
- Upload d'images admin via Emergent Object Storage (actuellement URL only)
- Paiement Stripe (test keys disponibles)
- Reset password : envoi d'email réel (actuellement log console)
- Brute-force lockout sur /api/auth/login
- Inverser la précédence : Bearer > cookie pour éviter le shadowing

### P2 (polish)
- Refactor server.py en routers séparés (auth/services/products/orders/admin)
- Migration FastAPI lifespan (au lieu de on_event deprecated)
- Pagination admin pour grandes listes
- Filtres avancés boutique (prix, dispo)
- Suivi statut intervention en temps réel (WebSocket)
- SEO meta tags + sitemap + structured data
- Tests E2E automatisés CI

## Test Coverage
- Backend: 28/28 tests pytest (100%)
- Frontend: ~92% flows critiques validés (Home, theme, langue, services, shop, cart, login admin/client, account, admin tabs)
