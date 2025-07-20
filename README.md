# ML-Driven-Full-Stack-Sports-Betting-Platform
# **HoopBetz 🏀💸**  
*An end-to-end, machine-learning-driven NBA sports-betting platform*

<details>
<summary><strong>Table&nbsp;of&nbsp;Contents</strong></summary>

1. [Why HoopBetz?](#why-hoopbetz)  
2. [Tech-stack at a glance](#tech-stack-at-a-glance)  
3. [Architecture diagram](#architecture-diagram)  
4. [From idea → production – the journey](#from-idea-→-production--the-journey)  
5. [Data pipeline & ML methodology](#data-pipeline--ml-methodology)  
6. [Backend (⚡ FastAPI + Uvicorn)](#backend-⚡-fastapi--uvicorn)  
7. [Frontend (⚛ React + Vite + TypeScript)](#frontend-⚛-react--vite--typescript)  
8. [Authentication – Google OAuth 2.0](#authentication--google-oauth-20)  
9. [Local setup & deployment](#local-setup--deployment)  
10. [What I’d improve next](#what-id-improve-next)  
11. [Wrapping up](#wrapping-up)  

</details>

---

## Why HoopBetz?
**HoopBetz** turns raw NBA game logs into actionable money-line odds, lets users log in with Google, place bets with mock currency, and track their wagers in real-time — all wrapped in a responsive, Tailwind-styled UI.

It is equal parts **data engineering pipeline**, **ML experimentation suite**, **REST API**, and **SPA**.  
Recruiters: this repo is my “full-stack in public” proof-of-work.

---

## Tech-stack at a glance

| Layer | Highlights |
|-------|------------|
| **Data & ML** | Python 3.11 • *Pandas* for scraping/cleaning/feature-eng • *scikit-learn* & *XGBoost* for model stacking • hyper-parameter sweeps with *Optuna* • rolling-window evaluation • persisted models with *joblib* |
| **Backend** | FastAPI • Uvicorn/uvloop • Pydantic v2 • Authlib (OAuth 2.0) • Jose (JWT) • gunicorn (prod) |
| **Frontend** | React 18 • Vite • TypeScript • React-Router v6 • Zustand store • Tailwind CSS • Headless UI & Heroicons |
| **Tooling** | Pre-commit hooks • Ruff & Black • Vitest & React Testing Library • GitHub Actions CI • Docker Compose |
| **DevOps** | Poetry for dependency management • dotenv for secrets • CORS middleware • Nginx reverse-proxy (prod) |
| **Cloud services** | Google Cloud OAuth credentials • GitHub Container Registry • Fly.io for preview apps |

---

## ▶️ Quick start

```bash
# 1. clone + cd
git clone https://github.com/your‑handle/hoopbetz.git
cd hoopbetz

# 2. backend ‑‑ Python 3.9‑3.11
python -m venv .venv
source .venv/bin/activate         # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# 3. frontend
cd frontend
npm i       # or `pnpm i` / `yarn`

# 4. copy env template and paste your Google creds
cp .env.sample .env
# → edit .env with your GOOGLE_CLIENT_ID / SECRET

# 5. two terminals
# ── terminal A ──
uvicorn backend.api.main:app --reload

# ── terminal B ──
npm run dev            # default http://localhost:5173
```
---

## Architecture diagram
mermaid
flowchart LR
  subgraph Frontend (Vite + React)
    A[Landing\npage] --> B[Odds\nDashboard]
    B --> C[Bet Modal]
    A --OAuth--> D[Login]
    D --> B
    B --> E["/my-bets"]
  end

  subgraph FastAPI ASGI   (Uvicorn)
    F[/routes.py\n/odds] --REST--> G[(Pandas\nCSV store)]
    H[/auth.py\nOAuth] --JWT--> A
    I[ml/rolling_model.pkl] --> F
  end

  G --> F
  I -. joblib .-> F
  H --Google OpenID--> K[(Google\nAuth Server)]
