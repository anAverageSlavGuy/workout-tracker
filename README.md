# Workout Tracker

PWA per tracciare allenamenti e progressione dei carichi. Costruita con Expo + Supabase.

## Setup

### 1. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto.
2. Vai in **SQL Editor** ed esegui in ordine:
   - `sql/schema.sql` — crea tabelle, RLS, seed esercizi base
   - `sql/seed_muscles.sql` — mappa esercizi → gruppi muscolari
3. Copia URL e anon key dal pannello **Settings → API**.

### 2. Configura l'ambiente

```bash
cp .env.example .env
```

Apri `.env` e incolla URL e anon key di Supabase:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Installa e avvia

```bash
npm install
npm run web       # sviluppo locale
```

### 4. Deploy PWA

```bash
npm run build:web
# poi carica la cartella dist/ su Vercel, Netlify o Cloudflare Pages
```

**Installazione su iPhone:** apri il sito in Safari → Condividi → Aggiungi alla schermata Home.

## Stack

- **Expo + React Native Web + expo-router** — unico codebase web/mobile
- **Supabase** — Postgres + Auth + Row Level Security
- **TanStack Query** — cache e sincronizzazione dati
- **victory-native** — grafici progressione, frequenza, volume
- **NativeWind** — styling con Tailwind

## Struttura

```
app/
  (auth)/       login + registrazione
  (tabs)/       dashboard, template, storico, statistiche, profilo
  session/[id]  sessione attiva (inserimento set)
components/     SetRow, ExercisePicker
hooks/          useExercises, useSessions, useTemplates
lib/            supabase client, types, auth context
sql/            schema e seed per Supabase
```
