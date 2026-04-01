# RESONATE

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)
![TanStack Query](https://img.shields.io/badge/-TanStack%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![LLM](https://img.shields.io/badge/AI-LLM-blue?style=for-the-badge)
![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-00E676?style=for-the-badge&logo=redis&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)

Your private, AI-powered voice diary -> record, reflect, and rediscover yourself through sound.

## 📖 Overview

Resonate is a full-stack web application designed to be a modern, intelligent journaling experience. Users can record audio diary entries which are transcribed and analyzed by a Hybrid AI Engine. The application leverages a microservice-inspired architecture where a Node.js backend handles business logic, API security, and automated maintenance, while a detached Python FastAPI service handles heavy ML computation asynchronously.

The system is built for ultimate flexibility and protection. It supports both **Local AI** (Ollama + local Whisper) for offline, privacy-focused users, and **Cloud AI** (Google Gemini + Groq) for high-speed analysis. The API layer is strictly protected by Upstash Serverless Redis to prevent abuse and manage rate limits effectively.

## ✨ Core Features

* **🎙️ Voice Recording:** Intuitive interface to record, preview, and upload audio entries.
* **⚡ Real-Time Architecture:**
    * **Fire-and-Forget Processing:** The user is never blocked waiting for AI. Uploads return immediately while analysis runs in the background using FastAPI's BackgroundTasks and asyncio.
    * **Live Notifications:** Integrated Socket.io pushes real-time updates to the client when analysis completes, updating the UI instantly without page reloads.
* **🧠 Hybrid AI Analysis & Transcription:**
    * **Flexible Backend:** Seamlessly switch between Local LLMs (Ollama) or Cloud AI (Google Gemini) via environment variables.
    * **High-Speed Transcription:** Toggle between local Whisper processing or ultra-fast external transcription using **Groq's API (whisper-large-v3)**.
    * **Adaptive Prompting:** Uses "One-Shot" prompting for Gemini and "Chain of Thought" (4 separate calls) for local models to ensure high accuracy.
* **🛡️ API Protection & Rate Limiting:**
    * Integrated **Upstash Serverless Redis** with Node.js to strictly govern API usage without consuming local server memory.
    * Tiered rate limiting tied to Clerk User IDs:
      * **Standard DB Limits:** 100 requests per minute.
      * **AI Burst Limits:** 3 AI requests per minute.
      * **AI Daily Quota:** 20 AI processing requests per 24 hours.
* **🎯 Smart Goal Detection:** The AI intelligently identifies potential life goals mentioned in your audio and suggests adding them to your tracker.
* **📊 Analytics Dashboard:** Server-side aggregated visualizations using SQL functions for maximum performance:
    * **Mood Trend Line:** Track emotional changes over time.
    * **Emotion Heatmap:** Calendar view of daily dominant emotions.
    * **Topic Frequency:** Analysis of most discussed themes.
* **🔐 Enterprise-Grade Security:**
    * **Encryption at Rest:** All sensitive text (transcripts, summaries, reflections) is encrypted at the application layer before storage.
    * **Row Level Security (RLS):** Supabase policies ensure strict data isolation between users—users can only access their own data.
* **🚀 Performance:**
    * **TanStack Query:** All API calls utilize useQuery and useMutation for aggressive caching, optimistic updates, and background re-fetching.
    * **Server-Side Aggregation:** Heavy analytics calculations are offloaded to Postgres functions via schema_logic.sql, keeping the API lightweight.

## 🏗️ Technical Architecture

Resonate uses an Event-Driven, Asynchronous Architecture to handle heavy AI workloads without compromising user experience.

```mermaid
sequenceDiagram
    participant User as Frontend (Next.js)
    participant Node as Backend (Express)
    participant DB as Supabase (Postgres)
    participant Python as ML Service (FastAPI)
    
    User->>Node: 1. Upload Audio
    Node->>DB: 2. Save File & Create Entry (Status: Processing)
    Node->>Python: 3. Dispatch Analysis Job (Fire & Forget)
    Node-->>User: 4. Return 200 OK (Immediate)
    
    Note over Python: Background Tasks (Async)
    Python->>Python: 5. Transcribe (Whisper)
    Python->>Python: 6. Analyze (Gemini/Ollama)
    
    Python->>Node: 7. Webhook POST /ai-result
    Node->>DB: 8. Update Entry (Encrypted Data)
    Node->>User: 9. Socket Emit (Real-time Update)

```

## Folder Structure

```text
Resonate
├── LICENSE
├── README.md
├── resonate-backend
│   ├── Backend-ML              # Python FastAPI Service
│   │   ├── main.py             # Entry point & Endpoints
│   │   ├── requirements.txt
│   │   └── utils
│   │       ├── ai_service.py   # LLM Logic (Gemini/Ollama)
│   │       └── helperFunction.py
│   └── Backend-Node            # Node.js Express Service
│       ├── controllers/        # Business Logic
│       │   ├── entryController.js
│       │   ├── goalController.js
│       │   ├── insightController.js
│       │   ├── quoteController.js
│       │   └── webhookController.js
|       ├── jobs/
|       |   └── storageCleanUp.js # Cron Job
|       ├── middleware/
|       |   └── rateLimiter.js # API Rate Limiters
│       ├── routes/             # API Routes
│       │   ├── entryRoutes.js
│       │   ├── goalRoutes.js
│       │   ├── insightRoutes.js
│       │   ├── quoteRoutes.js
│       │   └── webhookRoutes.js
│       ├── server.js
│       └── utils
│           ├── config.js
│           └── encryption.js   # AES Encryption Logic
├── resonate-frontend           # Next.js Application
│   ├── src
│   │   ├── app                 # App Router
│   │   ├── components          # Shadcn UI & Custom Components
│   │   ├── hooks               # Custom React Query Hooks
│   │   ├── lib                 # Utilities & Socket Client
│   │   └── ...
└── schema_logic.sql            # Database Triggers & Functions

```

## 🛠️ Database Logic & Automation

Resonate uses a combination of server-side Postgres functions and Node.js scheduled tasks to maintain performance and data integrity.

* **Server-Side Analytics (`get_insights`):**
    * Instead of fetching thousands of rows to Node.js to calculate averages, we call a single SQL RPC function.
    * It computes Heatmaps, Mood Charts, and Topic frequencies directly within the Postgres engine and returns a single, pre-calculated JSON object.

* **Automated Storage Cleanup (Orphan Sweeper):**
    * *Note:* Due to Supabase policy restrictions on executing direct SQL deletes on storage buckets via triggers, the previous database-level cleanup triggers were dropped.
    * **Node.js Cron Job:** We now utilize a dedicated scheduled task (`jobs/storageCleanUp.js`) using the `cron` library on the Express backend.
    * **Execution:** Runs every Sunday at 3:00 AM (`0 3 * * 0`).
    * **Logic:** It fetches all file paths currently sitting in the Supabase storage bucket and cross-references them against a `Set` of `audio_path` values actively linked to user Diary Entries in the database. Any file in storage that does not exist in the database records is identified as an orphan and permanently deleted, ensuring zero wasted cloud storage costs.

## 🚀 Getting Started

### Prerequisites

* Bun (v1.0+)
* Python (v3.10+)
* Supabase Project
* Clerk Account
* Ollama (Optional, for local AI)

### 1. Environment Setup

Clone the repo and configure environment variables. Refer to `.env.example`

```bash
git clone https://github.com/CodeDevvv/Resonate.git
cd resonate
```

### 2. Database Setup

1. Go to your Supabase SQL Editor.
2. Run the contents of `schema_logic.sql`. This creates the Tables, Enums, Triggers, and Analytics Functions required for the app to function.

### 3. AI Model Setup & Transcription

The application can toggle seamlessly between Cloud and Local processing simply by changing the `USE_LOCAL_LLM` flag in your environment variables.

**Option A: Cloud AI (Google Gemini + Groq Transcription)**
This is the recommended setup for the fastest processing times and lowest server memory usage.

1. Get an API Key from [Google AI Studio](https://aistudio.google.com/) and the [Groq Console](https://console.groq.com/).
2. Set the following in your `Backend-ML/.env`:
```env
USE_LOCAL_LLM=False
RESONATE_GEMINI_KEY=your_gemini_api_key
GROQ_WHISPER_KEY=your_groq_api_key
LLM_MODEL_ID=gemini-1.5-pro-latest # Or your preferred Gemini model
# LLM_API_URL= # 
```
### 3.5 Rate Limiting Setup (Upstash)
1. Create a free Serverless Redis database on [Upstash](https://upstash.com/).
2. Copy the Redis URL and add it to `Backend-Node/.env`:
```bash
UPSTASH_REDIS_URL="rediss://default:your_password@your_url.upstash.io:6379"
```

### 4. Run the Application

**Step 1: Start ML Backend (Python)**
Handles Transcription & Intelligence.

```bash
cd resonate-backend/Backend-ML
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Step 2: Start API Backend (Node.js)**
Handles Database, Auth, and Webhooks.

```bash
cd resonate-backend/Backend-Node
bun install
bun run server
```

**Step 3: Start Frontend (Next.js)**
The User Interface.

```bash
cd resonate-frontend
bun install
bun run dev
```

Visit `http://localhost:3000` to start recording.

## 🧩 Feature to Tech Mapping

| Feature | Tech Stack |
| --- | --- |
| **Frontend Caching** | TanStack Query (Stale-while-revalidate strategy) |
| **Real-time Status** | Socket.io (Event-driven updates) |
| **DB, Storage** | Supabase (PostgreSQL + Triggers) |
| **Rate Limiting** | Upstash Serverless Redis + Express Rate Limit |
| **Transcription** | Groq API (whisper-large-v3) or Local OpenAI Whisper |
| **LLM Orchestration** | FastAPI (Background Tasks) |
| **Analytics** | RPC |
| **CRON** | node-cron (clean up db storage) |

## 📜 License

This project is licensed under the MIT License. See the LICENSE file for the full text.