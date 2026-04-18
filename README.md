# Gabes bin ydik — ڤَابس بين يديك

Application web **Next.js** pour une **Smart City** orientée **Gabès** (Tunisie) : portail citoyen bilingue **français / arabe** (RTL), authentification **Firebase**, données **Firestore**, et assistant agricole **Gemini** sécurisé côté serveur.

Ce dépôt correspond à la branche **`appweb`** du projet [AIMKEY](https://github.com/ezzeddine-cloud/AIMKEY).

---

## Sommaire

1. [Vue d’ensemble](#vue-densemble)
2. [Fonctionnalités par rôle](#fonctionnalités-par-rôle)
3. [Stack technique](#stack-technique)
4. [Architecture & dossiers](#architecture--dossiers)
5. [Prérequis & installation](#prérequis--installation)
6. [Variables d’environnement](#variables-denvironnement)
7. [Firebase & Firestore](#firebase--firestore)
8. [API chat (Gemini)](#api-chat-gemini)
9. [Sécurité](#sécurité)
10. [Scripts npm](#scripts-npm)
11. [Déploiement](#déploiement)

---

## Vue d’ensemble

**Gabes bin ydik** est une plateforme qui regroupe :

- un **espace citoyen** (forum, réclamations, actualités, qualité de l’air, dons, profil) ;
- un **espace agriculteur** (capteur sol, modèle eau / déchet, marketplace producteur, réclamations, forum, actualités) ;
- un **espace administrateur** (réclamations, modération forum, **signalements / notifications admin**, événements ville, statistiques, gestion des news, projets de dons).

L’interface s’adapte au **rôle** (`CITIZEN`, `FARMER`, `ADMIN`) stocké dans le document Firestore `users/{uid}`.

---

## Fonctionnalités par rôle

### Citoyen (`CITIZEN`)

| Module | Description |
|--------|-------------|
| **Forum** | Publications Firestore, likes / dislikes, réponses, signalement avec **notification admin**. |
| **Réclamation** | Dépôt de tickets visibles par l’admin. |
| **Expert IA — اسألني** | Chatbot agricole (tunisien / français) via `/api/chat`. |
| **News** | Fil d’articles gérés en base. |
| **Pollution** | Vue alerte & heatmap qualité de l’air (données exposées dans l’UI). |
| **Donations** | Projets de dons ; contribution au compteur selon règles Firestore. |
| **Profil** | Langue, informations compte. |

### Agriculteur (`FARMER`)

| Module | Description |
|--------|-------------|
| **Capteur sol** | Visualisation / scénario capteur lié à l’agriculture locale. |
| **Eau & gaspillage** | Modèle / vue ressource eau. |
| **Marketplace** | Annonces producteurs, **messages** liés aux produits (Firestore). |
| **Réclamation**, **Forum**, **News**, **Profil** | Même socle que le citoyen (adapté au parcours fermier). |

### Administrateur (`ADMIN`)

| Module | Description |
|--------|-------------|
| **Réclamations** | File des tickets citoyens. |
| **Forum (modération)** | Supervision du contenu. |
| **Signalements & notifications** | Écoute de la collection `adminNotifications` (ex. signalement forum), marquage lu / suppression. |
| **Événements** | Calendrier **city events** (création / édition / suppression). |
| **Statistiques** | Tableaux de bord agrégés dans l’UI. |
| **Gérer news** | CRUD articles. |
| **Projets dons** | Gestion des campagnes. |
| **Profil** | Compte admin. |

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | **Next.js 15** (App Router) |
| UI | **React 19**, **Tailwind CSS 4**, **Motion**, **Lucide React** |
| Auth & données | **Firebase 11** (Auth, Firestore client SDK) |
| Chat LLM | **@google/genai** (Gemini), appel **uniquement** depuis la route API Next |
| Auth API | Vérification **JWT Firebase** (`jose`) sur `/api/chat` |
| Typage | **TypeScript 5.8** |

---

## Architecture & dossiers

```
app/                    # Routes Next (layout, page, API)
  api/chat/route.ts     # Proxy Gemini + vérif token + rate limit serveur
src/
  controllers/          # Hooks (ex. useDimaApp)
  views/                # Écrans (DimaAppView, Chatbot, Forum, Admin…)
  lib/firebase/         # Init Firebase, collections, repositories Firestore
  lib/server/           # Utilitaires serveur (JWT, rate limit mémoire)
  models/               # Types & données initiales
middleware.ts           # Rate limiting Edge sur préfixes /api/*
firestore.rules         # Règles de sécurité Firestore (à déployer)
firebase.json           # Config CLI Firebase
```

Les **noms de collections** centralisés sont dans `src/lib/firebase/collections.ts` (`users`, `news`, `adminNotifications`, `donationProjects`, `forumPosts`, `forumVotes`, `forumReplyVotes`, `forumReplies`, `reclamations`, `marketplaceProducts`, `marketplaceMessages`, `cityEvents`, etc.).

---

## Prérequis & installation

- **Node.js** (LTS recommandé, ex. 22.x)
- Compte **Firebase** (mode production) *ou* **émulateurs** locaux

```bash
npm install
```

Copier la configuration d’exemple :

```bash
cp .env.example .env.local
# Renseigner les clés (voir section suivante)
```

Lancer le serveur de développement (port **3030** par défaut) :

```bash
npm run dev
```

---

## Variables d’environnement

Les clés **Firebase côté client** sont préfixées `NEXT_PUBLIC_*` (visibles dans le navigateur — la sécurité repose sur **Firestore Rules** + domaines autorisés dans la console Firebase).

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_FIREBASE_*` | Config SDK web (apiKey, authDomain, projectId, etc.) |
| `NEXT_PUBLIC_FIREBASE_USE_EMULATOR` | `true` pour pointer Auth/Firestore vers les émulateurs |
| `GEMINI_API_KEY` | Clé **serveur** pour `/api/chat` (ne jamais exposer en `NEXT_PUBLIC_`) |
| `GEMINI_API_MODEL` | Optionnel (ex. `gemini-2.5-flash`) |
| `APP_URL` | URL publique de l’app (liens, callbacks si besoin) |

Voir les commentaires détaillés dans **`.env.example`** et **`env.emulator.local.example`** pour le flux **émulateur**.

---

## Firebase & Firestore

1. Créer un projet Firebase, activer **Authentication** (e-mail / mot de passe) et **Firestore**.
2. Déployer les règles :

   ```bash
   npx firebase-tools@latest deploy --only firestore:rules
   ```

3. Créer un utilisateur admin : document `users/{uid}` avec le champ `role: "ADMIN"` (chaîne exacte attendue par les règles).

**Émulateurs locaux** (Auth + Firestore) :

```bash
npm run prepare:local   # prépare .env.local pour émulateur (voir scripts)
npm run dev:stack       # émulateurs + Next en parallèle
```

Console émulateurs : `http://localhost:4000` (selon config).

---

## API chat (Gemini)

- **Route** : `POST /api/chat`
- Le client envoie l’**ID token** Firebase (en-tête type Bearer) ; le serveur vérifie le JWT puis appelle Gemini.
- **Système prompt** : assistant agricole « اسألني », priorité **arabe tunisien**, contexte **Gabès / agriculture oasienne**.

---

## Sécurité (résumé)

- Règles **Firestore** : accès par rôle, messages marketplace limités acheteur / vendeur, création contrôlée des **admin notifications**, mises à jour des dons sans IDOR sur les métadonnées, etc.
- **Middleware** Next : limitation de débit sur les routes `/api/*` (Edge, par IP).
- **Chat** : pas de clé Gemini dans le bundle client ; quota côté serveur.

---

## Scripts npm

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js en dev (port 3030) |
| `npm run dev:clean` | Nettoie `.next` puis `dev` |
| `npm run dev:stack` | Émulateurs Firebase + Next |
| `npm run emulators` | Auth + Firestore uniquement |
| `npm run build` | Build production |
| `npm run start` | Serveur Next production (port 3030) |
| `npm run lint` | `tsc --noEmit` |
| `npm run clean` | Suppression cache `.next` |
| `npm run prepare:local` | Aide à l’env local émulateur |

---

## Déploiement

- Build : `npm run build` puis héberger sur toute plateforme compatible **Next.js** (Node).
- Définir les **variables d’environnement** sur l’hébergeur (même schéma que `.env.example`).
- Déployer **Firestore rules** depuis la machine de CI ou en local avec la CLI Firebase.

---

## Licence & crédits

Contenu du dépôt **AIMKEY** / branche **appweb** — usage selon la licence du dépôt parent. Gabes bin ydik / ڤَابس بين يديك désigne la marque produit de cette application Smart City.
