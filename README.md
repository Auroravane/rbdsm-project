# Board Game Night Planner

A full-stack board game night planning application.

## Structure

- `frontend/` — React + Vite client app
- `backend/` — Express + MySQL API server

## Quick Start (Run Directly from Project Root)

From `C:\Users\Code66\Documents\game-planner\board-game_night-planner_version_2\board-game_night-planner`:

```bash
# Run Frontend (Vite on http://localhost:5173)
npm run dev
# or
npm run dev:frontend

# Run Backend (Express API on http://localhost:5000)
npm run dev:backend
# or
npm start

# Build Frontend
npm run build
```

## Environment Configuration

Copy `backend/.env.example` to `backend/.env` (or project root `.env`) to configure your MySQL database connection:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=boardnight_db
```

# rbdsm-project
