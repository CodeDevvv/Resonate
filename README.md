#  RESONATE

**Your private, AI-powered voice diary — record, reflect, and rediscover yourself through sound.**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📖 Overview
Resonate is a full-stack web application designed to be a modern, intelligent journaling experience. Users can record audio diary entries, which are then transcribed and analyzed by a AI model. The application provides deep insights into the user's mood trends, emotional patterns, and recurring topics, helping them achieve greater self-awareness. The entire system is built to be secure, private, and performant, leveraging a microservice-inspired architecture to separate concerns between the user-facing application, business logic, and machine learning computation.

## ✨ Core Features

* **🎙️ Voice Recording:** A simple, intuitive interface to record, preview, and save audio diary entries.
* **🔊 AI Transcription:** Leverages a local instance of OpenAI's Whisper for highly accurate, private speech-to-text transcription.
* **🧠 Deep AI Analysis:** Uses a locally-run Gemma 2B model via Ollama to analyze transcripts and generate:
    * **Concise Summaries:** Quick overviews of each entry.
    * **Emotional Analysis:** A detailed breakdown of 7 key emotions and their intensity scores.
    * **Keyword Tagging:** Automatic extraction of key topics and themes.
    * **Personalized Reflections & Suggestions:** Empathetic feedback to guide self-discovery.
    * **Goal Detection:** Intelligently identifies potential goals mentioned in entries and allows users to add them with one click.
* **📊 Interactive Insights Dashboard:** A suite of data visualizations to track personal growth:
    * **Mood Trend Line:** An area chart (Recharts) showing the net mood score over time.
    * **Emotion Heatmap:** A calendar-style heatmap (Nivo) displaying the dominant emotion for each day.
    * **Topic Frequency:** A horizontal bar chart (Recharts) of the most-discussed topics.
* **🎯 Goal Management:** A full CRUD interface for users to set, track, edit, and complete their personal goals.
* **🔐 Secure & Private:** All user data, including transcripts and audio files, is encrypted before being stored. Authentication is handled by Clerk, providing robust session management and user security.
* **🚀 Performance Optimized:** Employs TanStack Query (React Query) for efficient data caching, server-side data aggregation to minimize client-side load, and skeleton loaders for a smooth user experience.


## 🏗️ Technical Architecture
Resonate is designed with a decoupled, three-part architecture to ensure a clean separation of concerns and scalability.
``` 
        +---------------------------+       +----------------------------+       +---------------------------+
        |      Frontend (Next.js)   |       |      Backend (Node.js)     |       |       ML Backend (Python) |
        |   (UI & Client State)     |       | (Business Logic & Auth)    |       |      (AI & Computation)   |
        |---------------------------|       |----------------------------|       |---------------------------|
        | - React Components (tsx)  |       | - Express.js API Server    |       | - FastAPI Server          |
        | - shadcn/ui, Tailwind CSS |       | - Supabase Client (DB/Auth)|       | - Ollama (Gemma 2B)       |
        | - TanStack Query          |------>| - Clerk Token Verification |------>| - Whisper (Transcription) |
        | - Recharts, Nivo          |       | - Data Aggregation Logic   |       | - Analysis Logic          |
        | - Clerk Authentication    |       | - Encryption/Decryption    |       |                           |
        +---------------------------+       +----------------------------+       +---------------------------+
```

### Folder Structure
```
/
├── resonate-frontend/
│   ├── src/app/
│   │   ├── (home)/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── diary/[audioId]/page.tsx
│   │   │   ├── insights/page.tsx
│   │   │   └── goals/page.tsx
│   │   └── ...
│   └── .env.local
│
└── resonate-backend/
    ├── Resonate-Node/
    │   ├── server.js
    │   ├── controllers/
    │   ├── routes/
    │   └── .env
    │
    └── Resonate-ML/
        ├── main.py
        ├── .env
        └── ...
```

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, TanStack Query, Recharts, Nivo |
| **Backend (Node)** | Node.js, Express.js, Supabase (PostgreSQL Database & Storage), Clerk (Authentication) |
| **ML Backend** | Python, FastAPI, Ollama (Gemma 2B), OpenAI Whisper, httpx |

## 🧩 Feature to Tech Mapping

This table breaks down each core feature of Resonate and the primary technology used to implement it.

| Feature | Core Technology / Library |
| :--- | :--- |
| **User Authentication & Management** | `Clerk` |
| **Frontend Framework** | `Next.js` / `React` |
| **UI Components & Styling** | `shadcn/ui`, `Tailwind CSS`, `Lucide React` |
| **Client Data Fetching & Caching** | `TanStack Query (React Query)` |
| **Audio Recording** | Browser `MediaStream Recording API` |
| **Database & Audio File Storage** | `Supabase` (PostgreSQL & Storage) |
| **Primary Backend API** | `Node.js` / `Express.js` |
| **Machine Learning Backend API** | `Python` / `FastAPI` |
| **Local LLM Serving** | `Ollama` |
| **AI Text Analysis** | `Gemma 2B` |
| **Audio Transcription** | `OpenAI Whisper` |
| **Data Encryption** | `PyCryptodome` (AES, scrypt) |
| **Mood Trend Line Chart** | `Recharts` (`AreaChart`) |
| **Emotion Heatmap** | `@nivo/calendar` |
| **Topic Frequency Chart**| `Recharts` (`BarChart`) |
| **"Thought of the Day"** | `Next.js API Route` (Proxy for ZenQuotes.io) |

## 🚀 Getting Started

### Prerequisites
* Bun (v1.0 or later)
* Python (v3.10 or later)
* Ollama ([Installation Guide](https://ollama.com/))
* A Supabase account
* A Clerk account

### Local Setup
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/resonate.git](https://github.com/your-username/resonate.git)
    cd resonate
    ```
2.  **Setup Environment Variables:**
    Create a `.env` file in the root of `resonate-frontend`, `resonate-backend/Resonate-Node`, and `resonate-backend/Resonate-ML`, then populate them based on the `.env.example` files.

3.  **Run the Local AI Model:**
    Open a new terminal and run the following command. This will download the Gemma 2B model (a one-time process) and start the local AI server.
    ```bash
    ollama run gemma:2b
    ```

4.  **Install & Run Backend Services:**
    * **ML Backend (Python):**
        ```bash
        cd resonate-backend/Resonate-ML
        pip install -r requirements.txt
        uvicorn main:app --reload --port 8000
        ```
    * **Node.js Backend:**
        ```bash
        cd resonate-backend/Resonate-Node
        bun install
        bun run dev
        ```

5.  **Install & Run Frontend:**
    ```bash
    cd resonate-frontend
    bun install
    bun run dev
    ```
    Your application should now be running at `http://localhost:3000`.

## 🧠 Challenges & Learnings
* **Local LLM Performance:** The initial plan to use Llama 3 8B worked perfectly via APIs but was too resource-intensive to run locally on consumer hardware. This led to a deep dive into model quantization and the trade-offs between model size and capability. Selecting Gemma 2B and refactoring the AI logic into a "divide and conquer" strategy with multiple, simpler prompts was a key architectural decision to ensure reliability on a constrained system.
* **Next.js Hydration Errors:** Encountered and solved widespread hydration errors caused by rendering locale-specific dates on the server. The solution involved creating a reusable, hydration-safe `<FormattedDate />` component that defers date formatting until the client has mounted, fixing the root cause across the entire application.
* **Asynchronous State Management:** Architected a robust data-fetching layer using TanStack Query to manage server state, caching, and reduce backend load. This involved creating reusable custom hooks and handling complex, dependent queries (e.g., fetching a token before fetching data).

## 🗺️ Roadmap
The core features of the application are complete and fully functional! Future development will focus on enhancing performance, scalability, and the user experience.

Here are some of the planned improvements:
* **Pagination:** Implement pagination for the diary entries list to gracefully handle a large number of entries.
* **Caching:** Integrate a Redis client into the Node.js backend to cache frequent queries and reduce database load.
* **Enhanced Visualizations:** Add more interactive features to charts, such as date range filtering.
* **Live Demo:** Deploy the full application stack for a live, interactive demonstration.