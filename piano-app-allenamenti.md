# Piano progetto — App tracking allenamenti (home gym)

App minimal ed estetica per tracciare carichi, set e ripetizioni per ogni allenamento, con account personale in cloud, filtri e grafici di progressione.

**Approccio: PWA-first.** Si parte come **web app / PWA con Expo web**, installabile sull'icona Home di iPhone e Android senza passare dagli store e senza costi. Stesso codebase riutilizzabile in futuro per la build nativa iOS/Android, se si vorrà pubblicare sugli store.

**Stack:** Expo (React Native + React Native Web) + Supabase (Postgres, Auth, RLS) — tutto gratuito nel volume previsto.
**Autenticazione:** email + password.

---

## 1. Obiettivi

- Tracciare per ogni allenamento: esercizio, set, ripetizioni, carico (e RPE opzionale).
- Allenamenti preimpostati (template) + possibilità di aggiungere nuovi esercizi.
- Account personale, dati in cloud, sincronizzati tra dispositivi.
- Analisi filtrabile e grafici: progressione carico, frequenza per gruppo muscolare, volume.
- Installabile sull'icona Home (PWA) su iPhone e Android, senza store e senza costi.

### Domande a cui l'app deve rispondere
- Quanti allenamenti di petto (o altro gruppo) ho fatto in un periodo → filtro sul muscolo **primario**.
- Come è evoluto il carico per un tot di ripetizioni su un dato esercizio → grafico peso/1RM nel tempo.
- Cadenza degli allenamenti (frequenza settimanale/mensile).
- Volume totale per gruppo muscolare.

---

## 2. Stack tecnologico

| Ambito | Scelta | Note |
|---|---|---|
| App | Expo + React Native Web + `expo-router` | Un solo codebase: web/PWA ora, nativo in futuro |
| Dati/cache | TanStack Query (React Query) | Gestione fetch, cache, refetch |
| UI | NativeWind (Tailwind per RN) o react-native-paper | Estetica minimal e coerente |
| Backend/cloud | Supabase | Postgres + Auth + Row Level Security |
| Auth | Supabase Auth — email + password | Reset password via email |
| Grafici | `react-native-gifted-charts` o `victory-native` | Linee, barre, curve |
| Build web | `expo export --platform web` | Genera sito statico |
| Hosting | Vercel / Netlify / Cloudflare Pages | Piano gratuito, deploy automatico |

**Costi:** completamente gratuiti (Supabase, Expo, hosting). Nessuna tassa store finché resti in PWA. Solo se in futuro vorrai pubblicare le app native: Apple Developer 99 $/anno, Google Play 25 $ una tantum.

---

## 3. Modello dati (Postgres / Supabase)

Il cuore del progetto. Schema relazionale che permette i join richiesti per filtri e grafici.

### Tabelle

- **muscle_groups** — valori fissi (seed una tantum)
  - `id, name`
  - Es.: petto, dorso, quadricipiti, femorali, spalle, bicipiti, tricipiti, core, glutei, polpacci, avambracci.

- **exercises** — esercizi (default + creati dall'utente)
  - `id, user_id (null = default globale), name, equipment, notes, created_at`
  - Precaricati: panca piana, panca inclinata, squat, stacco, trazioni, rematore, military press, curl, ecc.

- **exercise_muscles** — tabella ponte esercizio ↔ muscolo, con ruolo
  - `exercise_id, muscle_group_id, role ('primary' | 'secondary')`
  - Impostati alla creazione dell'esercizio. 1 primario + N secondari. **È qui che si fanno i join dei filtri.**

- **workout_templates** — allenamenti preimpostati
  - `id, user_id, name` (es. "Push", "Pull", "Gambe")

- **template_exercises** — esercizi dentro un template
  - `template_id, exercise_id, target_sets, target_reps, position`

- **sessions** — un allenamento effettivamente svolto
  - `id, user_id, date, template_id (null = libero), notes`

- **session_sets** — riga chiave del tracking
  - `id, session_id, exercise_id, set_number, weight, reps, rpe (opzionale)`

### Come rispondono alle query chiave

- **"Quanti allenamenti di petto?"**
  `sessions` distinte che contengono almeno un `session_set` il cui `exercise` ha in `exercise_muscles` `role='primary'` e muscolo = petto, in un intervallo di date.

- **"Evoluzione carico per tot rep su un esercizio"**
  Filtro `session_sets` per `exercise_id` + `reps`, plot `weight` vs `sessions.date`.
  In più: **1RM stimato** (formula Epley: `peso × (1 + reps / 30)`) per confrontare progressi anche con ripetizioni diverse.

- **"Cadenza allenamenti"** → conteggio `sessions` per settimana/mese.
- **"Volume per gruppo muscolare"** → somma `weight × reps` raggruppata per muscolo primario.

### Sicurezza
Row Level Security (RLS) su tutte le tabelle con dati utente: ogni riga filtrata da `user_id = auth.uid()`. Gli esercizi/gruppi muscolari "globali" (user_id null) sono in sola lettura per tutti.

---

## 3-bis. Distribuzione come PWA (senza store)

Con Expo web l'app diventa un sito statico installabile come PWA.

**Come si pubblica e installa:**

1. Build: `expo export --platform web` → genera i file statici.
2. Deploy gratuito su Vercel / Netlify / Cloudflare Pages (collegati al repo, deploy automatico ad ogni push).
3. **iPhone:** apri il sito in Safari → *Condividi* → *Aggiungi alla schermata Home*. Icona a schermo intero, senza barra del browser.
4. **Android:** Chrome propone in automatico "Installa app".

**Requisiti tecnici PWA:** manifest (nome, icona, colori, `display: standalone`) e service worker per installabilità e cache offline base. Expo web li gestisce quasi del tutto; va solo curata la configurazione di icone e manifest.

**Limiti della PWA su iOS** (trascurabili per questo progetto):

- Notifiche push solo da iOS 16.4+ e solo se l'app è aggiunta alla Home.
- Nessun accesso ad Apple Health o funzioni native profonde.
- Lo spazio dati locale può essere liberato da iOS dopo lunga inattività — ma i dati sono al sicuro su Supabase (cloud).

**Percorso futuro (opzionale):** lo stesso codebase Expo può essere compilato in app nativa con EAS Build + EAS Submit, pagando le tasse store, senza riscrivere nulla.

---

## 4. Schermate principali

- **Auth** — login / registrazione (email + password) + reset password.
- **Home / Dashboard** — prossimo allenamento, grafici sintetici, ultima sessione.
- **Allenamenti (template)** — lista template, avvia sessione da template.
- **Sessione attiva** — inserimento rapido set (peso/rep) esercizio per esercizio.
- **Esercizi** — libreria, creazione nuovo esercizio con selezione muscolo primario/secondari.
- **Storico** — lista sessioni filtrabile (gruppo muscolare, esercizio, data).
- **Statistiche** — grafici progressione, frequenza, volume.
- **Profilo** — account, logout.

---

## 5. Fasi di sviluppo (roadmap)

1. **Setup** — progetto Expo (con target web), client Supabase, autenticazione email/password.
2. **Schema + seed** — creazione tabelle, RLS, popolamento gruppi muscolari ed esercizi base.
3. **Logging** — avvio sessione e inserimento set rapido durante l'allenamento.
4. **Template** — allenamenti preimpostati e "avvia da template".
5. **Storico + filtri** — sessioni filtrabili per gruppo muscolare, esercizio, data.
6. **Grafici** — carico/1RM nel tempo, frequenza per gruppo muscolare, volume.
7. **PWA + deploy** — manifest, icone, service worker; build `expo export --platform web` e deploy su Vercel/Netlify/Cloudflare Pages.
8. **(Futuro, opzionale)** — build nativa iOS/Android con EAS e pubblicazione sugli store.

---

## 6. Considerazioni future

- **Offline-first:** Supabase non è offline nativo. In palestra la connessione può mancare → valutare cache locale con `expo-sqlite` / WatermelonDB e sync al ritorno online.
- **Timer di recupero** tra i set.
- **Progressive overload / PR:** notifica record personali.
- **Esportazione dati** (CSV) e backup.

---

## 7. Prerequisiti operativi

- Account Supabase (free) → creare progetto, ottenere URL + anon key.
- Account su Vercel / Netlify / Cloudflare Pages (free) per l'hosting della PWA.
- Node.js installato in locale.
- Account Expo (free) — necessario solo se in futuro si passerà alla build nativa (EAS).
- Solo per gli store in futuro: Apple Developer (99 $/anno) e/o Google Play Developer (25 $ una tantum).
