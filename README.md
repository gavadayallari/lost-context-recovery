# Lost Context Recovery

AI-powered GitHub repository context recovery and project intelligence platform.

Lost Context Recovery helps developers quickly understand an unfamiliar GitHub repository by collecting repository metadata, commits, issues, pull requests, README content, and project activity into one interactive dashboard.

It also provides AI-powered Project Intelligence so developers can ask questions about the repository and recover project context faster.

---

## 🚀 Features

- GitHub repository analysis
- Automatic repository synchronization
- Repository metadata overview
- Commit activity tracking
- Issue tracking
- Pull request tracking
- Project timeline
- README viewer
- Project analytics and charts
- AI-powered Project Intelligence
- Local project-context fallback
- Sync history
- Repository switching
- Responsive dashboard UI

---

## 🧠 Project Intelligence

The Project Intelligence feature allows users to ask questions such as:

- What is this project?
- What technologies are used?
- What are the main features?
- What changed recently?
- What are the current issues?
- What pull requests are active?
- Give me a summary of this project.

The application uses OpenAI for intelligent answers when available and can fall back to repository-local context.

---

## 📊 Dashboard

The dashboard provides visual insights into repository activity, including:

- Commit activity
- Issue status
- Pull request status
- Overall project activity
- Recent repository activity
- Repository statistics

Charts are generated using real repository data.

---

## 🏗️ Architecture

```text
GitHub Repository
       │
       ▼
 GitHub API
       │
       ▼
   Backend API
       │
 ┌─────┼──────────────┐
 │     │              │
 ▼     ▼              ▼
PostgreSQL        OpenAI API
 │                    │
 └─────────┬──────────┘
           ▼
        React
       Frontend
           │
           ▼
      Dashboard


      🛠️ Tech Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
React Router
Axios
Recharts
Backend
Node.js
Express
TypeScript
PostgreSQL
Octokit
OpenAI API

⚙️ Local Setup
1. Clone repository
git clone https://github.com/gavadayallari/lost-context-recovery.git
cd lost-context-recovery
2. Backend setup
cd backend
npm install
npm run dev

Backend runs on:

http://localhost:5000
3. Frontend setup

Open another terminal:

cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5174
🔐 Environment Variables
Backend

Create:

backend/.env

Example:

PORT=5000
DATABASE_URL=
GITHUB_TOKEN=
OPENAI_API_KEY=
Frontend

Create:

frontend/.env

Example:

VITE_API_URL=http://localhost:5000/api

Never commit actual API keys or passwords to GitHub.

🔄 Application Flow
Home
  ↓
Enter GitHub Repository
  ↓
Analyze Repository
  ↓
Repository Sync
  ↓
Dashboard
  ↓
Overview
  ├── Timeline
  ├── Commits
  ├── Issues
  ├── Pull Requests
  ├── README
  ├── Ask Project
  └── Sync History
🤖 AI Flow
User Question
      ↓
Project Assistant API
      ↓
Current Repository
      ↓
Repository Context
      ↓
OpenAI
      ↓
AI Answer

If OpenAI is unavailable:
      ↓
Local Project Context
      ↓
Fallback Answer
🔒 Repository Isolation

Project context is scoped to the selected repository.

Commits, issues, pull requests, and documents are retrieved using the corresponding repository_id to prevent data from different repositories from being mixed.

Repositories without a README are handled gracefully.
