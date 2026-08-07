# 🎤 VerbaFlow - Impromptu Speaking & Communication Platform

> **A minimal, gamified web platform engineered to build spontaneous speaking confidence, structured preparation habits, and instant AI-assisted performance evaluation.**

---

## 🌟 Key Features

- ⏱ **Thinking Timer (USP)**: Mandates 1 min to 1 hr preparation before speaking to simulate real-world speech planning.
- 🎯 **26+ Curated Genres & 1,300+ Topics**: Deep coverage from Indian History, Politics & Finance to Debate & Abstract Thinking.
- 🤖 **Multi-Layer AI Speech Evaluation**: Serverless backend API (`/api/feedback`) calculating a 5-dimension rubric (**Clarity, Confidence, Grammar, Depth, Structure**).
- 🧠 **AI Coach Mode & Custom Topic Engine**: Provides structured talking points, ideal answer snippets, and custom prompt breakdowns (`/api/custom-topic`).
- ⚔️ **AI Debate Arena Mode (`/debate`)**: Interactive argument and counterpoint practice against an AI opponent.
- 📊 **Speaking Analytics Dashboard (`/dashboard`)**: Visual radar charts, fluency scores, and streak heatmaps.
- 🔐 **Firebase Auth & Hybrid Storage**: Google Login integration with Firestore persistence and LocalStorage fallback.

---

## 🏗 System Architecture

```
[Client UI: Next.js + Tailwind + Framer Motion]
      │
      ├── 1. Topic Generator ──► Static JSON DB (1,300+ items) + AI Prompt API
      │
      ├── 2. Thinking Timer ───► High-precision preparation countdown
      │
      ├── 3. Recording Studio ──► Browser MediaRecorder API (Audio/Video WebM Blobs)
      │
      ├── 4. Speech Transcription ► Browser Web Speech API (webkitSpeechRecognition)
      │
      ├── 5. AI Speech Evaluator ─► /api/feedback (5-Dimension Rubric & Coach Advice)
      │
      └── 6. Persistence & Auth ──► Firebase Auth + Firestore & LocalStorage
```

---

## 🛠 Tech Stack Matrix

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, TypeScript) |
| **Styling & Icons** | Tailwind CSS, Lucide React Icons |
| **Recording & Speech** | Browser MediaRecorder API & Web Speech API |
| **Backend & AI APIs** | Next.js API Routes (`/api/feedback`, `/api/custom-topic`) |
| **Database & Auth** | Firebase Firestore & Google Auth |

---

## 📖 Complete Interview Master Guide

An interactive, single-page HTML documentation guide is available at:
👉 **[public/verbaflow_interview_guide.html](public/verbaflow_interview_guide.html)**

---

## 🚀 Getting Started Locally

```bash
# Clone repository
git clone https://github.com/your-username/verbaflow.git

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start practicing!
