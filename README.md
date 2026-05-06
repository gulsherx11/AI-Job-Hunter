# 🤖 AI Job Hunter

An intelligent multi-agent system that fetches real jobs and automatically 
generates a complete application package tailored to each position.

![Tech Stack](https://img.shields.io/badge/LangGraph-Orchestration-6C63FF)
![Groq](https://img.shields.io/badge/Groq-LLM-00D9A6)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)

## ✨ Features

- 🔍 **Real Job Fetching** — pulls live jobs from LinkedIn & Indeed via JSearch API
- 📍 **Location Based** — filter by city, country, or remote
- ✍️ **ATS Resume Rewriter** — tailors your resume keywords for each job
- 📝 **Cover Letter Generator** — personalized using live company research
- 🌐 **Company Research Agent** — searches the web for real company info
- 🎯 **Interview Prep** — generates tailored Q&As from your actual resume
- 🎤 **Mock Interview Chatbot** — live AI interviewer with feedback and scoring

## 🏗️ Architecture

User selects job + uploads resume
↓
[LangGraph Pipeline]
↓
Agent 1: JD Parser
Agent 2: Resume Rewriter
Agent 3: Company Researcher (Tavily web search)
Agent 4: Cover Letter Writer
Agent 5: Interview Prep Coach
↓
Complete Application Package

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| LLM | Groq API (Llama 3.3 70B) |
| Orchestration | LangGraph |
| Web Search | Tavily API |
| Job Data | JSearch API (RapidAPI) |
| Backend | FastAPI |
| Frontend | React + Vite + TailwindCSS |
| Resume Parsing | PyMuPDF |

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- API keys for: Groq, Tavily, JSearch (RapidAPI)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```
Create `backend/.env`:

GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
JSEARCH_API_KEY=your_rapidapi_key

Run backend:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## 📸 How It Works

1. **Browse Jobs** — real jobs fetched from LinkedIn & Indeed
2. **Select a Job** — click any job card to select it
3. **Upload Resume** — drag & drop your PDF resume
4. **Generate** — one click runs all 5 AI agents
5. **Get Results** — tailored resume, cover letter, research & interview prep
6. **Mock Interview** — practice with the AI interviewer chatbot

## 🔑 API Keys (All Free)

| API | Where to get | Free limit |
|---|---|---|
| Groq | console.groq.com | Very generous |
| Tavily | tavily.com | 1000/month |
| JSearch | rapidapi.com/JSearch | 10 req/day |

## 📁 Project Structure

ai-job-hunter/
├── backend/
│   ├── agents/          # 5 specialized AI agents
│   ├── tools/           # LLM client, PDF reader, job fetcher
│   ├── main.py          # FastAPI endpoints
│   ├── pipeline.py      # LangGraph orchestration
│   └── state.py         # Shared agent state
└── frontend/
└── src/
├── components/  # Reusable UI components
└── pages/       # Home & Results pages

## 🤝 Contributing

Pull requests welcome. For major changes please open an issue first.

## 📄 License

MIT