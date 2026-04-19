# Gabes bin ydik ÔÇö ┌ñ┘ÄÏºÏ¿Ï│ Ï¿┘è┘å ┘èÏ»┘è┘â

Application web **Next.js** pour une **Smart City** orient├®e **Gab├¿s** (Tunisie) : portail bilingue **fran├ºais / arabe** (RTL) pour les **agriculteurs**, authentification **Firebase**, donn├®es **Firestore**, et assistant agricole **Gemini** (ou **OpenRouter**) s├®curis├® c├┤t├® serveur.

Ce d├®p├┤t correspond ├á la branche **`appweb`** du projet [AIMKEY](https://github.com/ezzeddine-cloud/AIMKEY).

---

## Sommaire

1. [Vue dÔÇÖensemble](#vue-densemble)
2. [Fonctionnalit├®s par r├┤le](#fonctionnalit├®s-par-r├┤le)
3. [Stack technique](#stack-technique)
4. [Architecture & dossiers](#architecture--dossiers)
5. [Pr├®requis & installation](#pr├®requis--installation)
6. [Variables dÔÇÖenvironnement](#variables-denvironnement)
7. [Firebase & Firestore](#firebase--firestore)
8. [API chat (Gemini / OpenRouter)](#api-chat-gemini--openrouter)
9. [S├®curit├®](#s├®curit├®)
10. [Scripts npm](#scripts-npm)
11. [D├®ploiement](#d├®ploiement)

---

## Vue dÔÇÖensemble

**Gabes bin ydik** regroupe aujourdÔÇÖhui :

- un **espace agriculteur** : capteur sol, mod├¿le eau / gaspillage, **alerte qualit├® de lÔÇÖair et heatmap**, r├®clamations, expert IA (chat), profil ;
- un **espace administrateur** : r├®clamations, ├®v├®nements ville, statistiques agr├®g├®es Firestore, profil.

LÔÇÖinscription publique cr├®e des comptes **agriculteur** (`FARMER`). Les anciens documents Firestore avec le r├┤le `CITIZEN` sont **lus comme agriculteur** pour compatibilit├®. Le r├┤le **`ADMIN`** est attribu├® via les e-mails admin configur├®s (`NEXT_PUBLIC_ADMIN_EMAILS` / liste interne) et le document `users/{uid}`.

Les modules **marketplace**, **forum**, **actualit├®s (news)** et **donations** ne sont **plus expos├®s** dans lÔÇÖinterface (le sch├®ma Firestore ou les r├¿gles peuvent encore mentionner dÔÇÖanciennes collections selon votre d├®ploiement).

---

## Fonctionnalit├®s par r├┤le

### Agriculteur (`FARMER`)

| Module | Description |
|--------|-------------|
| **Capteur sol** | Visualisation / sc├®nario capteur li├® ├á lÔÇÖagriculture locale. |
| **Eau & gaspillage** | Mod├¿le / vue ressource eau. |
| **Alerte & heatmap pollution** | Qualit├® de lÔÇÖair (PM2.5, zones sensibles) et carte **EnvironmentalMap**. |
| **R├®clamation** | D├®p├┤t de tickets visibles par lÔÇÖadmin. |
| **Expert IA ÔÇö ÏºÏ│Ïú┘ä┘å┘è** | Chatbot agricole via `POST /api/chat` (JWT Firebase). |
| **Profil** | Langue, informations compte. |

### Administrateur (`ADMIN`)

| Module | Description |
|--------|-------------|
| **R├®clamations** | File des tickets. |
| **├ëv├®nements** | Calendrier **city events** (cr├®ation / ├®dition / suppression). |
| **Statistiques** | Agr├®gations Firestore (utilisateurs, news, r├®clamations, forum, marketplace ÔÇö compteurs selon les donn├®es pr├®sentes en base). |
| **Profil** | Compte admin. |

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | **Next.js 15** (App Router) |
| UI | **React 19**, **Tailwind CSS 4**, **Motion**, **Lucide React** |
| Auth & donn├®es | **Firebase 11** (Auth, Firestore client SDK) |
| Chat LLM | **@google/genai** (Gemini) ou **OpenRouter**, appel **uniquement** depuis la route API Next |
| Auth API | V├®rification **JWT Firebase** (`jose`) sur `/api/chat` |
| Typage | **TypeScript 5.8** |

---

## Architecture & dossiers

```
app/                    # Routes Next (layout, page, API)
  api/chat/route.ts     # Proxy LLM + v├®rif token + rate limit serveur
src/
  controllers/          # Hooks (ex. useDimaApp)
  views/                # ├ëcrans (DimaAppView, Chatbot, AdminÔÇª)
  lib/firebase/         # Init Firebase, collections, repositories Firestore
  lib/server/           # Utilitaires serveur (JWT, rate limit m├®moire)
  models/               # Types & donn├®es initiales
middleware.ts           # Rate limiting Edge sur pr├®fixes /api/*
firestore.rules         # R├¿gles de s├®curit├® Firestore (├á d├®ployer)
firebase.json           # Config CLI Firebase
```

Les **noms de collections** centralis├®s sont dans `src/lib/firebase/collections.ts` (`users`, `news`, `adminNotifications`, `forumPosts`, `forumVotes`, `forumReplyVotes`, `forumReplies`, `reclamations`, `marketplaceProducts`, `marketplaceMessages`, `cityEvents`, etc.). Certaines collections peuvent exister historiquement dans Firestore sans ├¬tre utilis├®es par lÔÇÖUI actuelle.

---

## Pr├®requis & installation

- **Node.js** (LTS recommand├®, ex. 22.x)
- Compte **Firebase** (mode production) *ou* **├®mulateurs** locaux

```bash
npm install
```

Copier la configuration dÔÇÖexemple :

```bash
cp .env.example .env.local
# Renseigner les cl├®s (voir section suivante)
```

Lancer le serveur de d├®veloppement (port **3030** par d├®faut) :

```bash
npm run dev
```

---

## Variables dÔÇÖenvironnement

Les cl├®s **Firebase c├┤t├® client** sont pr├®fix├®es `NEXT_PUBLIC_*` (visibles dans le navigateur ÔÇö la s├®curit├® repose sur **Firestore Rules** + domaines autoris├®s dans la console Firebase).

| Variable | R├┤le |
|----------|------|
| `NEXT_PUBLIC_FIREBASE_*` | Config SDK web (apiKey, authDomain, projectId, etc.) |
| `NEXT_PUBLIC_FIREBASE_USE_EMULATOR` | `true` pour pointer Auth/Firestore vers les ├®mulateurs |
| `OPENROUTER_API_KEY` | Optionnel : cl├® **OpenRouter** (`sk-or-v1-ÔÇª`) ÔÇö si d├®finie, **prioritaire** sur Gemini pour `/api/chat` |
| `OPENROUTER_MODEL` | Optionnel (ex. `openai/gpt-4o-mini`) ÔÇö [mod├¿les OpenRouter](https://openrouter.ai/models) |
| `GEMINI_API_KEY` | Cl├® **serveur** Gemini si OpenRouter nÔÇÖest pas utilis├® |
| `GEMINI_API_MODEL` | Optionnel (ex. `gemini-2.5-flash`) |
| `APP_URL` | URL publique de lÔÇÖapp (liens, callbacks si besoin) |

Voir les commentaires d├®taill├®s dans **`.env.example`** et **`env.emulator.local.example`** pour le flux **├®mulateur**.

---

## Firebase & Firestore

1. Cr├®er un projet Firebase, activer **Authentication** (e-mail / mot de passe) et **Firestore**.
2. D├®ployer les r├¿gles :

   ```bash
   npx firebase-tools@latest deploy --only firestore:rules
   ```

3. Cr├®er un utilisateur admin : document `users/{uid}` avec le champ `role: "ADMIN"` (cha├«ne exacte attendue par les r├¿gles), ou utiliser un e-mail pr├®sent dans la liste admin c├┤t├® app.

**├ëmulateurs locaux** (Auth + Firestore) :

```bash
npm run prepare:local   # pr├®pare .env.local pour ├®mulateur (voir scripts)
npm run dev:stack       # ├®mulateurs + Next en parall├¿le
```

Console ├®mulateurs : `http://localhost:4000` (selon config).

---

## API chat (Gemini / OpenRouter)

- **Route** : `POST /api/chat`
- Le client envoie lÔÇÖ**ID token** Firebase (en-t├¬te type Bearer) ; le serveur v├®rifie le JWT puis appelle **OpenRouter** si `OPENROUTER_API_KEY` est d├®fini, sinon **Gemini**.
- **Syst├¿me prompt** : assistant agricole ┬½ ÏºÏ│Ïú┘ä┘å┘è ┬╗, r├®ponses **en arabe tunisien (tounsi)** m├¬me si lÔÇÖutilisateur ├®crit en fran├ºais, contexte **Gab├¿s / agriculture oasienne**.

---

## S├®curit├® (r├®sum├®)

- R├¿gles **Firestore** : acc├¿s par r├┤le ; selon votre version des r├¿gles, des collections historiques (marketplace, forum, etc.) peuvent encore ├¬tre d├®crites.
- **Middleware** Next : limitation de d├®bit sur les routes `/api/*` (Edge, par IP).
- **Chat** : `OPENROUTER_API_KEY` et `GEMINI_API_KEY` sont lus **uniquement** dans `app/api/chat/route.ts` (serveur). Elles ne doivent **pas** ├¬tre pr├®fix├®es `NEXT_PUBLIC_` ni import├®es dans du code client (`"use client"`).

### Secrets et variables dÔÇÖenvironnement

| Type | O├╣ ? | R├¿gle |
|------|------|--------|
| **Cl├®s LLM** (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`) | Serveur / CI / Netlify ┬½ env ┬╗ | Jamais dans le d├®p├┤t ; jamais `NEXT_PUBLIC_*`. |
| **Jeton utilisateur** (Firebase ID token) | Envoy├® par le client en `Authorization: Bearer` vers `/api/chat` | Jeton court terme ; v├®rifi├® c├┤t├® serveur avec les JWKS Google (`firebaseIdToken.ts`). |
| **Config Firebase Web** (`NEXT_PUBLIC_FIREBASE_*`) | Bundle client par conception Next | Ce ne sont pas des ┬½ secrets ┬╗ au sens Google, mais la s├®curit├® repose sur **Firestore Rules** + domaines autoris├®s. Ne commitez pas de `.env.local` rempli. |
| **E-mails admin bootstrap** (`NEXT_PUBLIC_ADMIN_EMAILS`) | Bundle client si d├®fini | Uniquement des adresses ; aucune cl├®. Liste vide = pas dÔÇÖe-mail admin cod├® en dur dans le code. |

Commande de contr├┤le basique des fuites accidentelles : `npm run security:scan`.

---

## Scripts npm

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js en dev (port 3030) |
| `npm run dev:clean` | Nettoie `.next` puis `dev` |
| `npm run dev:stack` | ├ëmulateurs Firebase + Next |
| `npm run emulators` | Auth + Firestore uniquement |
| `npm run build` | Build production |
| `npm run start` | Serveur Next production (port 3030) |
| `npm run lint` | `tsc --noEmit` |
| `npm run clean` | Suppression cache `.next` |
| `npm run prepare:local` | Aide ├á lÔÇÖenv local ├®mulateur |
| `npm run security:scan` | Recherche de motifs type cl├®s API dans le code versionn├® |

---

## D├®ploiement

- Build : `npm run build` puis h├®berger sur toute plateforme compatible **Next.js** (Node).
- D├®finir les **variables dÔÇÖenvironnement** sur lÔÇÖh├®bergeur (m├¬me sch├®ma que `.env.example`).
- D├®ployer **Firestore rules** depuis la machine de CI ou en local avec la CLI Firebase.

### Netlify

1. **Site** ÔåÆ **Site configuration** ÔåÆ **Environment variables** (ou *Build & deploy* ÔåÆ *Environment*).
2. Ajouter **toutes** les cl├®s list├®es dans `.env.example` :
   - `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` (et optionnellement `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`).
   - `OPENROUTER_API_KEY` et/ou `GEMINI_API_KEY` pour le chat (`/api/chat`) ÔÇö **sans** pr├®fixe `NEXT_PUBLIC_`.
   - Optionnel : `NEXT_PUBLIC_ADMIN_EMAILS` (e-mails admin, virgules) si vous utilisez ce m├®canisme.
   - Ne **pas** d├®finir `NEXT_PUBLIC_FIREBASE_USE_EMULATOR` en production (r├®serv├® au dev local).
3. Enregistrer, puis **Deploys** ÔåÆ **Trigger deploy** ÔåÆ **Clear cache and deploy site** (important : les `NEXT_PUBLIC_*` sont fig├®es au **build**).
4. **Firebase** ÔåÆ *Authentication* ÔåÆ *Settings* ÔåÆ **Authorized domains** : ajouter ton domaine Netlify, par ex. `ton-site.netlify.app` (et ton domaine personnalis├® si tu en as un).

Le fichier **`netlify.toml`** fixe la commande de build et **Node 22** pour coller au projet.

---

## Licence & cr├®dits

Contenu du d├®p├┤t **AIMKEY** / branche **appweb** ÔÇö usage selon la licence du d├®p├┤t parent. Gabes bin ydik / ┌ñ┘ÄÏºÏ¿Ï│ Ï¿┘è┘å ┘èÏ»┘è┘â d├®signe la marque produit de cette application Smart City.
