# 🏋️‍♂️ IronTrack — Modern MERN Gym & Workout Progress Tracker

A full-stack fitness application engineered for progressive overload tracking, real-time rest timing, estimated 1-Rep Max calculations, and comprehensive workout analytics.

Built with a responsive, dark-themed UI (Tailwind CSS v4 + Lucide Icons + Recharts) and an offline-first demo mode.

---

## 🌟 Key Features

- **🔐 User Authentication & Authorization**:
  - Secure registration and login using JWT (JSON Web Tokens) and bcrypt password hashing.
  - 1-click **Instant Demo Mode** for immediate test-driving without entering credentials.
- **📊 Interactive Dashboard**:
  - Live metric cards: Total Workouts, Lifetime Volume, Active Streak (days), and Personal Records smashed.
  - Weekly volume progression area chart and muscle group frequency distribution.
- **⏱️ Live Active Workout Logger**:
  - Stopwatch timer for the session duration.
  - Dynamic sets & reps logging with weight, reps, and RPE.
  - **Ghost Performance Memory**: Displays your past session's numbers (`Last: 80kg × 8`) so you know what progressive overload weight to beat.
  - **Automated Rest Countdown Timer**: Automatically starts a customizable countdown timer (30s, 60s, 90s, 120s, 180s) with an audio cue when a set is completed.
  - **Automatic PR Detection**: Celebratory confetti burst when beating previous max weight or estimated 1RM.
- **📈 Progress & 1RM Analytics (Recharts)**:
  - Estimated 1-Rep Max (1RM) curve calculated using the standard Epley formula: $\text{Weight} \times (1 + \frac{\text{Reps}}{30})$.
  - Toggle between Estimated 1RM, Heaviest Weight, and Volume lifted over time.
- **📚 30+ Exercise Library & Custom Exercises**:
  - Filter by muscle group (Chest, Back, Legs, Shoulders, Arms, Core) and equipment (Barbell, Dumbbell, Cable, Machine, Bodyweight).
  - Ability to create and manage custom exercises.
- **🧮 Barbell Plate Calculator**:
  - Interactive visual barbell sleeve showing Olympic plate breakdown (Red 25kg, Blue 20kg, Yellow 15kg, Green 10kg, etc.) per side.
- **⚖️ Unit Toggle**:
  - One-click toggle between Kilograms (KG) and Pounds (LBS).

---

## 🏗️ Project Architecture

```text
gym-tracker/
├── client/                     # Frontend (React 19, TypeScript, Vite, Tailwind v4)
│   ├── src/
│   │   ├── components/         # Navbar, RestTimer, PlateCalculator, AuthModal, AddExerciseModal
│   │   ├── pages/              # DashboardPage, ActiveWorkoutPage, HistoryPage, ExercisesPage, AnalyticsPage
│   │   ├── context/            # AuthContext (global state, rest timer, unit preference)
│   │   ├── services/           # api.ts (backend API calls + offline demo fallback)
│   │   └── types/              # TypeScript interfaces
│   ├── vercel.json             # Vercel SPA routing rewrites
│   └── vite.config.ts          # Vite build config
├── server/                     # Backend (Node.js, Express, Mongoose, JWT)
│   ├── config/                 # db.js (MongoDB Atlas connection)
│   ├── models/                 # User.js, Exercise.js, Workout.js
│   ├── controllers/            # authController, exerciseController, workoutController, statsController
│   ├── middleware/             # authMiddleware.js
│   ├── routes/                 # Express API routes
│   └── server.js               # Main application entry point
├── .github/workflows/          # deploy.yml (GitHub Pages auto-deploy workflow)
├── render.yaml                 # Render Blueprint deployment configuration
└── README.md
```

---

## 🚀 Deployment Guide: GitHub, Vercel & Render

Connecting your project across GitHub, Vercel (Frontend), and Render (Backend) gives you automated CI/CD: every time you push to GitHub, both your frontend and backend update automatically.

### Step 1: Push Code to GitHub

1. Go to [GitHub.com/new](https://github.com/new) and create a new repository named `gym-tracker` (or your preferred name).
2. Run the following commands in the `gym-tracker` root directory:

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: full-stack MERN gym tracker"

# Rename branch to main
git branch -M main

# Link remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/gym-tracker.git

# Push code
git push -u origin main
```

---

### Step 2: Deploy Backend to Render

1. Sign up or log into [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `gym-tracker`.
4. Configure the settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: Your MongoDB Atlas connection string (`mongodb+srv://<user>:<password>@cluster.mongodb.net/gym_tracker?retryWrites=true&w=majority`)
   - `JWT_SECRET`: Any random 32-character secret string.
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app` (you can update this after Step 3).
6. Click **Deploy Web Service**. Copy the backend URL generated by Render (e.g. `https://gym-tracker-api.onrender.com`).

---

### Step 3: Deploy Frontend to Vercel

1. Sign up or log into [Vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository `gym-tracker`.
4. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `client`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g. `https://gym-tracker-api.onrender.com/api`)
6. Click **Deploy**. Vercel will build and launch your application globally!

---

## 💻 Local Development Setup

To run both frontend and backend locally on your computer:

### 1. Backend (`server/`)
```bash
cd server
npm install
npm run dev
# Server will run on http://localhost:5000
```

### 2. Frontend (`client/`)
```bash
cd client
npm install
npm run dev
# Frontend will run on http://localhost:5173
```
