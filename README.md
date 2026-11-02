# VoiceCoach AI — Spoken Mock Interview & Soft-Skills Coach

VoiceCoach AI is a production-grade, full-stack mock interview voice partner engineered for first-time job seekers and students from non-native English speaking backgrounds. It conducts realistic, spoken-turn interviews, analyzes candidate speech in real-time, calculates deterministic delivery metrics (words per minute, filler words, clarity, confidence, and STAR answer structure), and generates comprehensive final coaching reports with actionable 7-day practice plans.

---

## 🌟 Key Features

1. **Realistic Spoken Mock Interviews**:
   - Spoken-turn interaction with **Coach Aria** powered by Google Gemini.
   - Real-time speech synthesis (Gemini TTS with automatic browser `speechSynthesis` fallback).
   - Dynamic follow-up questions referencing specific claims, results, or gaps from the candidate's actual answer.
   - Live visual audio level meter (`AnalyserNode`) and silence auto-stop detection (2 to 8 seconds).
   - High-contrast accessible interface, keyboard shortcuts (`Space` to record/finish), live captions toggle, and text-answer fallback.

2. **Deterministic Speech & Soft-Skills Metrics**:
   - **Pacing Analysis**: Measures Words Per Minute (WPM) mapped to target conversational cadence (110–160 WPM).
   - **Filler Word Detection**: Deterministic regex-based scanner detects single-word (`um`, `uh`, `like`, `basically`) and multi-word (`you know`, `i mean`, `sort of`) crutches, plus contextual fillers (`so`, `well`, `right` at clause starts).
   - **Accent-Neutral Evaluation**: Strictly evaluates intelligibility, articulation, structural coherence, and substance. Accent and dialect are never penalized.
   - **STAR Framework Evaluation**: Evaluates Situation, Task, Action, and Measurable Result presence.

3. **Multilingual Spoken Coaching**:
   - Interviews are conducted in English, but Coach Aria can deliver spoken and written critiques in 11 languages (English, Hindi, Telugu, Tamil, Spanish, French, Arabic, Portuguese, Bengali, Indonesian, Swahili).

4. **Comprehensive Coaching Report & Progress Trends**:
   - Category Competency Radar Chart (Clarity, Structure, Relevance, Confidence, Pacing, Vocabulary/Grammar).
   - Pacing line chart over question progression with target band shading.
   - Filler word frequency breakdown bar chart.
   - Model rewritten answers based on the candidate's actual spoken ideas.
   - Personalized 7-day micro-drill practice plan (15–20 minutes/day).
   - Interactive transcript review with highlighted filler words and audio playback.
   - Historical progress dashboard tracking WPM, fillers, and scores across sessions.
   - "Practice-This-Again" single-question drill retry.

5. **Privacy & Security by Design**:
   - Audio is deleted immediately after analysis by default. Saving audio is strictly opt-in.
   - Private Supabase storage bucket (`interview-audio`) with short-lived signed URLs (60s expiry).
   - Complete data purge control (`DELETE /api/account/data`) that deletes all recordings, sessions, reports, and logs.
   - Server-side only Gemini API key encapsulation. Frontend uses only Supabase anon key.
   - Row Level Security (RLS) policies enforcing multi-tenant data isolation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router v6, TanStack Query, Recharts, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express.js, `@google/genai` SDK, Multer (memory storage), Helmet, CORS, Express-Rate-Limit, Pino |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth (Email/Password + Google OAuth), Row Level Security (RLS) |
| **Speech & Audio** | Browser MediaRecorder API (`audio/webm;codecs=opus`, Safari fallback), Web Audio API `AnalyserNode`, Gemini TTS + Browser SpeechSynthesis fallback, Server-side RIFF/WAV PCM header wrapping |
| **Validation & Testing** | Zod (client & server schemas), Vitest (unit tests), Supertest (API integration tests) |

---

## 📁 Project Structure

```text
├── package.json                   # Root workspace orchestration
├── README.md                      # Documentation & deployment guide
├── shared/
│   └── constants.js               # Shared constants (domains, roles, pace bands, languages)
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql         # Core schema: profiles, sessions, turns, reports, usage log
│       └── 002_rls_and_storage.sql# RLS policies & private storage bucket
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js               # Server entry point
│       ├── app.js                 # Express app middleware chain & security config
│       ├── config/
│       │   ├── env.js             # Zod environment validation (fail-fast on boot)
│       │   └── coaching.js        # Coaching thresholds & filler lexicon
│       ├── lib/
│       │   ├── supabase.js        # Service-role Supabase admin & JWT verification
│       │   ├── logger.js          # Redacted Pino logger
│       │   ├── errors.js          # Custom typed AppErrors
│       │   └── wav.js             # PCM to RIFF/WAV header packing
│       ├── middleware/
│       │   ├── requireAuth.js     # Bearer token JWT verification
│       │   ├── validate.js        # Reusable Zod schema middleware
│       │   ├── rateLimit.js       # Global, AI turn, and TTS rate limiters
│       │   ├── upload.js          # Multer memory storage & magic bytes validation
│       │   └── errorHandler.js    # Standard { data, error } JSON envelope
│       ├── services/
│       │   ├── gemini.js          # GoogleGenAI SDK wrapper, timeout & retries
│       │   ├── interviewPlanner.js# Opening plan & question generator
│       │   ├── turnAnalyzer.js    # Per-turn analysis & deterministic metric blending
│       │   ├── reportBuilder.js   # Final session report generator
│       │   ├── metrics.js         # Deterministic WPM, filler word & pacing calculator
│       │   └── audioStorage.js    # Supabase storage & signed URL provider
│       ├── schemas/               # Zod schemas (env, profile, session, turn, tts, ai)
│       └── tests/                 # Vitest suite (metrics, schemas, API endpoints)
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.jsx                # Route definitions & protected route guards
        ├── main.jsx               # React DOM root & providers
        ├── lib/
        │   ├── supabase.js        # Client-side anon Supabase instance
        │   ├── api.js             # Authenticated API client wrapper
        │   └── utils.js           # Score badges, duration & pace formatting
        ├── hooks/
        │   ├── useAudioRecorder.js# Cross-browser MediaRecorder & AnalyserNode
        │   ├── useSilenceDetection.js # Silence auto-stop trigger
        │   ├── useSpeechPlayback.js   # Gemini TTS with SpeechSynthesis fallback
        │   └── useInterviewMachine.js # Finite state machine for interview flow
        ├── context/
        │   └── AuthContext.jsx    # Session state & profile management
        ├── components/            # Reusable UI components
        └── pages/                 # Route page components
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Supabase Project**: Free tier or self-hosted Supabase project
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

---

### 2. Supabase Setup
1. Log into your [Supabase Dashboard](https://app.supabase.com/) and navigate to the **SQL Editor**.
2. Run the migration script in `supabase/migrations/001_schema.sql` to create all tables, enums, triggers, and indices.
3. Run the migration script in `supabase/migrations/002_rls_and_storage.sql` to apply Row Level Security (RLS) policies and create the `interview-audio` private storage bucket.
4. In **Authentication -> Providers**, ensure Email/Password is enabled. Optionally enable Google OAuth by supplying your Google Client ID and Secret.

---

### 3. Environment Configuration

#### Server (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```bash
NODE_ENV=development
PORT=8080
CLIENT_ORIGIN=http://localhost:5173

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Server-only!

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TTS_MODEL=gemini-2.5-flash
GEMINI_TTS_VOICE=Kore
GEMINI_TIMEOUT_MS=30000

# Limits
MAX_AUDIO_MB=8
MAX_ANSWER_SECONDS=130
AI_TURNS_PER_HOUR=30
TTS_PER_HOUR=60
GLOBAL_RATE_LIMIT_PER_15MIN=300
```

#### Client (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### 4. Installation & Running Locally

Install dependencies across both workspaces:
```bash
# Install root, server, and client dependencies
npm run install:all
```

Run both backend server and frontend client concurrently:
```bash
npm run dev
```

- **Client**: `http://localhost:5173`
- **Server API**: `http://localhost:8080/api`
- **Health Check**: `http://localhost:8080/api/health`

---

### 5. Running the Test Suite

Run unit and integration tests using Vitest:
```bash
npm run test
```
The test suite validates:
- Deterministic word count and WPM calculation.
- Filler word detection (single-word, multi-word, and clause-conditional fillers).
- Deterministic pacing score overrides and composite category weighting.
- Zod schema validation rules (question limits, character constraints, strictness).
- API routes and unauthenticated rejection responses.

---

## 🔒 Architectural & Security Decisions

1. **Deterministic Metrics Authority**:
   Large Language Models are excellent at qualitative semantic feedback but notoriously unreliable at counting discrete tokens or calculating time intervals. VoiceCoach AI uses Gemini to produce raw, faithful transcripts, but computes **WPM**, **word counts**, **filler frequencies**, and **pacing scores** deterministically on the server via audited algorithms. The model's qualitative observations are blended with these deterministic values.

2. **Server-Side Audio Wrapping**:
   Gemini TTS returns raw linear PCM audio bytes. Standard HTML5 `<audio>` elements and browser decoders expect container formats. The backend packages raw PCM into RIFF/WAV containers with standard 44-byte headers on-the-fly (`server/src/lib/wav.js`). If server-side TTS is blocked or unavailable, the client seamlessly falls back to `window.speechSynthesis`.

3. **Prompt Injection Defense**:
   All user-supplied inputs (transcripts, target job descriptions, text responses) are treated as untrusted data, enclosed in strict `<candidate_answer>` and `<job_description>` delimiters, and validated against Zod schemas before being processed.

4. **Private Storage & Audio Lifecycle**:
   By default, audio buffers exist only in server memory during transcription and analysis, and are discarded immediately. If the user opts in (`save_audio = true`), recordings are placed in an isolated, private Supabase storage path (`{userId}/{sessionId}/{turnId}.webm`) and served only through short-lived signed URLs (60 seconds). Account data deletion completely purges all audio files from storage.

