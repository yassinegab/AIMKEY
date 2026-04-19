# Gabes bin ydik — ڤَابس بين يديك

Application web **Next.js** pour une **Smart City** orientée **Gabès** (Tunisie) : portail bilingue **français / arabe** (RTL) pour les **agriculteurs**, authentification **Firebase**, données **Firestore**, et assistant agricole **Gemini** (ou **OpenRouter**) sécurisé côté serveur.

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
8. [API chat (Gemini / OpenRouter)](#api-chat-gemini--openrouter)
9. [Sécurité](#sécurité)
10. [Scripts npm](#scripts-npm)
11. [Déploiement](#déploiement)

---

## Vue d’ensemble

**Gabes bin ydik** regroupe aujourd’hui :

- un **espace agriculteur** : capteur sol, modèle eau / gaspillage, **alerte qualité de l’air et heatmap**, réclamations, expert IA (chat), profil ;
- un **espace administrateur** : réclamations, événements ville, statistiques agrégées Firestore, profil.

L’inscription publique crée des comptes **agriculteur** (`FARMER`). Les anciens documents Firestore avec le rôle `CITIZEN` sont **lus comme agriculteur** pour compatibilité. Le rôle **`ADMIN`** est attribué via les e-mails admin configurés (`NEXT_PUBLIC_ADMIN_EMAILS` / liste interne) et le document `users/{uid}`.

Les modules **marketplace**, **forum**, **actualités (news)** et **donations** ne sont **plus exposés** dans l’interface (le schéma Firestore ou les règles peuvent encore mentionner d’anciennes collections selon votre déploiement).

---

## Fonctionnalités par rôle

### Agriculteur (`FARMER`)

| Module | Description |
|--------|-------------|
| **Capteur sol** | Visualisation / scénario capteur lié à l’agriculture locale. |
| **Eau & gaspillage** | Modèle / vue ressource eau. |
| **Alerte & heatmap pollution** | Qualité de l’air (PM2.5, zones sensibles) et carte **EnvironmentalMap**. |
| **Réclamation** | Dépôt de tickets visibles par l’admin. |
| **Expert IA — اسألني** | Chatbot agricole via `POST /api/chat` (JWT Firebase). |
| **Profil** | Langue, informations compte. |

### Administrateur (`ADMIN`)

| Module | Description |
|--------|-------------|
| **Réclamations** | File des tickets. |
| **Événements** | Calendrier **city events** (création / édition / suppression). |
| **Statistiques** | Agrégations Firestore (utilisateurs, news, réclamations, forum, marketplace — compteurs selon les données présentes en base). |
| **Profil** | Compte admin. |

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | **Next.js 15** (App Router) |
| UI | **React 19**, **Tailwind CSS 4**, **Motion**, **Lucide React** |
| Auth & données | **Firebase 11** (Auth, Firestore client SDK) |
| Chat LLM | **@google/genai** (Gemini) ou **OpenRouter**, appel **uniquement** depuis la route API Next |
| Auth API | Vérification **JWT Firebase** (`jose`) sur `/api/chat` |
| Typage | **TypeScript 5.8** |

---

## Architecture & dossiers

```
app/                    # Routes Next (layout, page, API)
  api/chat/route.ts     # Proxy LLM + vérif token + rate limit serveur
src/
  controllers/          # Hooks (ex. useDimaApp)
  views/                # Écrans (DimaAppView, Chatbot, Admin…)
  lib/firebase/         # Init Firebase, collections, repositories Firestore
  lib/server/           # Utilitaires serveur (JWT, rate limit mémoire)
  models/               # Types & données initiales
middleware.ts           # Rate limiting Edge sur préfixes /api/*
firestore.rules         # Règles de sécurité Firestore (à déployer)
firebase.json           # Config CLI Firebase
```

Les **noms de collections** centralisés sont dans `src/lib/firebase/collections.ts` (`users`, `news`, `adminNotifications`, `forumPosts`, `forumVotes`, `forumReplyVotes`, `forumReplies`, `reclamations`, `marketplaceProducts`, `marketplaceMessages`, `cityEvents`, etc.). Certaines collections peuvent exister historiquement dans Firestore sans être utilisées par l’UI actuelle.

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
| `OPENROUTER_API_KEY` | Optionnel : clé **OpenRouter** (`sk-or-v1-…`) — si définie, **prioritaire** sur Gemini pour `/api/chat` |
| `OPENROUTER_MODEL` | Optionnel (ex. `openai/gpt-4o-mini`) — [modèles OpenRouter](https://openrouter.ai/models) |
| `GEMINI_API_KEY` | Clé **serveur** Gemini si OpenRouter n’est pas utilisé |
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

3. Créer un utilisateur admin : document `users/{uid}` avec le champ `role: "ADMIN"` (chaîne exacte attendue par les règles), ou utiliser un e-mail présent dans la liste admin côté app.

**Émulateurs locaux** (Auth + Firestore) :

```bash
npm run prepare:local   # prépare .env.local pour émulateur (voir scripts)
npm run dev:stack       # émulateurs + Next en parallèle
```

Console émulateurs : `http://localhost:4000` (selon config).

---

## API chat (Gemini / OpenRouter)

- **Route** : `POST /api/chat`
- Le client envoie l’**ID token** Firebase (en-tête type Bearer) ; le serveur vérifie le JWT puis appelle **OpenRouter** si `OPENROUTER_API_KEY` est défini, sinon **Gemini**.
- **Système prompt** : assistant agricole « اسألني », réponses **en arabe tunisien (tounsi)** même si l’utilisateur écrit en français, contexte **Gabès / agriculture oasienne**.

---

## Sécurité (résumé)

- Règles **Firestore** : accès par rôle ; selon votre version des règles, des collections historiques (marketplace, forum, etc.) peuvent encore être décrites.
- **Middleware** Next : limitation de débit sur les routes `/api/*` (Edge, par IP).
- **Chat** : `OPENROUTER_API_KEY` et `GEMINI_API_KEY` sont lus **uniquement** dans `app/api/chat/route.ts` (serveur). Elles ne doivent **pas** être préfixées `NEXT_PUBLIC_` ni importées dans du code client (`"use client"`).

### Secrets et variables d’environnement

| Type | Où ? | Règle |
|------|------|--------|
| **Clés LLM** (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`) | Serveur / CI / Netlify « env » | Jamais dans le dépôt ; jamais `NEXT_PUBLIC_*`. |
| **Jeton utilisateur** (Firebase ID token) | Envoyé par le client en `Authorization: Bearer` vers `/api/chat` | Jeton court terme ; vérifié côté serveur avec les JWKS Google (`firebaseIdToken.ts`). |
| **Config Firebase Web** (`NEXT_PUBLIC_FIREBASE_*`) | Bundle client par conception Next | Ce ne sont pas des « secrets » au sens Google, mais la sécurité repose sur **Firestore Rules** + domaines autorisés. Ne commitez pas de `.env.local` rempli. |
| **E-mails admin bootstrap** (`NEXT_PUBLIC_ADMIN_EMAILS`) | Bundle client si défini | Uniquement des adresses ; aucune clé. Liste vide = pas d’e-mail admin codé en dur dans le code. |

Commande de contrôle basique des fuites accidentelles : `npm run security:scan`.

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
| `npm run security:scan` | Recherche de motifs type clés API dans le code versionné |

---

## Déploiement

- Build : `npm run build` puis héberger sur toute plateforme compatible **Next.js** (Node).
- Définir les **variables d’environnement** sur l’hébergeur (même schéma que `.env.example`).
- Déployer **Firestore rules** depuis la machine de CI ou en local avec la CLI Firebase.

### Netlify

1. **Site** → **Site configuration** → **Environment variables** (ou *Build & deploy* → *Environment*).
2. Ajouter **toutes** les clés listées dans `.env.example` :
   - `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` (et optionnellement `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`).
   - `OPENROUTER_API_KEY` et/ou `GEMINI_API_KEY` pour le chat (`/api/chat`) — **sans** préfixe `NEXT_PUBLIC_`.
   - Optionnel : `NEXT_PUBLIC_ADMIN_EMAILS` (e-mails admin, virgules) si vous utilisez ce mécanisme.
   - Ne **pas** définir `NEXT_PUBLIC_FIREBASE_USE_EMULATOR` en production (réservé au dev local).
3. Enregistrer, puis **Deploys** → **Trigger deploy** → **Clear cache and deploy site** (important : les `NEXT_PUBLIC_*` sont figées au **build**).
4. **Firebase** → *Authentication* → *Settings* → **Authorized domains** : ajouter ton domaine Netlify, par ex. `ton-site.netlify.app` (et ton domaine personnalisé si tu en as un).

Le fichier **`netlify.toml`** fixe la commande de build et **Node 22** pour coller au projet.

---

## Licence & crédits

Contenu du dépôt **AIMKEY** / branche **appweb** — usage selon la licence du dépôt parent. Gabes bin ydik / ڤَابس بين يديك désigne la marque produit de cette application Smart City.
