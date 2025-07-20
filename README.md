# ML-Driven-Full-Stack-Sports-Betting-Platform
# **HoopBetz 🏀💸**  
*An end-to-end, machine-learning-driven NBA sports-betting platform*

<details>
<summary><strong>Table&nbsp;of&nbsp;Contents</strong></summary>

1. [Why HoopBetz?](#why-hoopbetz)  
2. [Tech-stack](#tech-stack)  
3. [Data & ML Infrastructure](#data-&-ml-infrastructure)  
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

HoopBetz began as a lightweight proof‑of‑concept for serving ML‑generated NBA money‑line odds over a friendly web UI.  
It has since grown into a full‑blown betting experience:

- Modern, reactive front‑end that feels like a polished sportsbook
- In-depth data analysis and machine learning pipelines powering in-house money-line odds generation based on historical performance and advanced stats 
- Historical date selector → explore any game day since 2020
- Google OAuth 2.0 sign‑in & session management  
- Virtual wallet, bet slip, editable bet cards  
- Expandable to props / parlays thanks to a clean API boundary  
- 100% typed (FastAPI + Pydantic & React + TypeScript)


---

## Tech-stack


| **Layer / Domain** | **Technology (+ key packages)**         | **Version (typical)**     | **Role in HoopBetz**                               | **Notes / Rationale**                                 |
|--------------------|-----------------------------------------|----------------------------|----------------------------------------------------|--------------------------------------------------------|
| **Frontend**       | React (with Vite)                       | 18.x / Vite 5.x            | Core UI runtime & dev server                       | Vite = fast HMR & TypeScript support                   |
|                    | TypeScript                              | 5.x                        | Type-safe component code                           | Eliminates many runtime bugs                           |
|                    | Tailwind CSS                            | 3.x                        | Utility-first styling                              | Rapid responsive design                                |
|                    | Headless UI                             | 1.x                        | Accessible dialog & menu primitives                | Powers BetModal, Edit/Delete modals                    |
|                    | React Router DOM                        | 6.22 (“future flags”)      | Client-side routing                                | Nested routes: `/`, `/day/:dt`, `/my-bets`, etc.       |
| **State + UX**     | Custom BetContext (React Context + Reducer) | –                      | Tracks local bets, edit/delete                     | Pure client state until full user account system added |
| **Backend (API)**  | FastAPI                                 | 0.111.x                    | REST endpoints, OpenAPI docs                       | `/api/game-days`, `/api/odds`, `/auth/*`               |
|                    | Uvicorn + uvloop                        | 0.29.x                     | ASGI server                                        | `uvicorn backend.api.main:app --reload`                |
|                    | Authlib                                 | 1.x                        | OAuth 2 / OIDC flow                                | Wraps Google OAuth in `auth.py`                        |
|                    | itsdangerous                            | 2.x                        | Session signing (Starlette)                        | Required by `SessionMiddleware`                        |
|                    | pandas + numpy                          | 2.x / 2.x                  | Loads historical odds CSVs                         | Used in `/api/odds` route                              |
| **Data / ML**      | Pre-trained odds model outputs (CSV / Parquet) | –                   | Provide `ml_home`, `p_home`, etc.                  | Model itself can live in separate repo                 |
| **Auth / Identity**| Google Cloud OAuth 2.0 Client           | n/a                        | External IdP for “Sign in with Google”             | JavaScript origin: `http://localhost:5173`<br>Authorized redirect: `http://localhost:8000/auth/google/callback` |
| **Dev Tooling**    | Prettier / ESLint                       | latest                     | Code formatting & linting                          | Optional but recommended                               |
|                    | pyenv / virtualenv                      | 3.9+                       | Python version management                          | `.venv` activated before dev                           |
| **Testing**        | Jest + React Testing Library            | –                          | Component tests                                    | Snapshot & interaction tests                           |
|                    | Pytest                                  | –                          | API unit / integration tests                       | Use `httpx.AsyncClient` for FastAPI                    |
| **Deployment (future)** | Docker (+ docker-compose)         | n/a                        | Containerize frontend & backend                    | Multi-stage build → slim images                        |
|                    | (Cloud of choice)                       | –     
---

## How to setup

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


## Data & ML Infrastructure

A breakdown of every data and ML-related layer used in HoopBetz, including tooling, responsibilities, and rationale for each decision.

| **Layer / Domain**          | **Technology (+ key packages)**                      | **Version (typical)**     | **Role in HoopBetz**                                                                 | **Notes / Rationale**                                                                 |
|-----------------------------|------------------------------------------------------|----------------------------|--------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| **Data / ML – Ingestion**   | Python ETL scripts (`pandas 2.x`, `requests`, `httpx`) | –                        | Nightly job downloads NBA box scores, betting lines, and injury reports → dumps clean Parquet files to `/data/raw/YYYY-MM-DD/` | Simple cron or GitHub Action; Parquet retains type fidelity and compression            |
|                             | **Pre-made season data files (CSV/Parquet)**        | –                          | Provides historical team and game-level data with advanced stats                     | Includes offensive/defensive ratings, ELO, net rating, true shooting %, and more      |
| **Feature Store**           | Feast                                                | 0.37                       | Versioned feature registry (per season)                                              | Allows both model training and API to consume the same feature sets offline & online  |
| **Modeling / Training**     | XGBoost                                              | 2.x                        | Gradient-boosted probability model (`p_home`, `p_away`)                              | Ideal for tabular sports data; fast training with interpretable SHAP values           |
|                             | scikit-learn                                         | 1.5                        | Pipeline wrapper, `GridSearchCV` for hyperparameter tuning                           | Reproducible transforms → exported as Parquet artifacts                               |
|                             | MLflow                                               | 2.x                        | Experiment tracking and model registry                                               | Each run tagged with Git SHA and data snapshot ID                                     |
| **Batch Scoring**           | Airflow DAG (`Celery` executor)                     | 2.9                        | After training, score every matchup in season → generate `ml_home`, `ml_away` CSV    | Outputs dropped into `backend/data/odds_<season>.csv`, consumed by `/api/odds`       |
| **Model Serving (future)**  | FastAPI micro-service with `onnxruntime`            | 0.111 / 1.18               | Serve real-time odds predictions during live season                                  | Keeps main API lean; model weights can auto-refresh via MLflow registry              |








Ask ChatGPT
