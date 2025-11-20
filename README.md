# SkillLinkBD Platform

SkillLinkBD is a local skill and microjob marketplace that connects clients with nearby providers. The project includes a React (Vite) frontend and a Node.js (Express + MongoDB) backend that implements authentication, job management, applications, chat, notifications, reviews, and admin moderation in line with the SRS requirements.

## Project Structure

```
/ (front-end React app)
└── server/ (Node.js API server)
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or cloud)

## Frontend Setup

```bash
npm install
npm run dev
```

Create a `.env` file in the project root if you need to override defaults:

```
VITE_API_BASE_URL=http://localhost:4000
```

## Backend Setup

```bash
cd server
npm install
cp env.example .env
# update MONGODB_URI and JWT_SECRET in .env
```

**Important**: Make sure to update the `.env` file in the `server/` directory with your MongoDB connection string and a strong JWT secret.

The backend listens on `PORT` (default `4000`) and expects `CLIENT_URL` to include the frontend origin for CORS/socket access.

## Quick Start (Recommended)

To run both frontend and backend together:

```bash
npm install
cd server && npm install && cd ..
npm run dev:all
```

Or use the start script:
```bash
npm start
```

This will start:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:4000`

## Available Scripts

### Run Both Servers Together

- `npm start` or `npm run dev:all` – start both frontend and backend servers concurrently
- `npm run server` – start only the backend server

### Frontend

- `npm run dev` – start Vite dev server
- `npm run build` – create production build
- `npm run preview` – preview production build
- `npm run lint` – run ESLint

### Backend (inside `server/`)

- `npm run dev` – start Express server with nodemon
- `npm start` – start Express server

## Features

- JWT-based authentication with role support (client, provider, admin)
- Client dashboards for job posting, applicant management, and history
- Provider dashboards for job recommendations, applications, earnings, and profile management
- Provider & client direct-invite workflow for private jobs
- Real-time chat using Socket.IO
- Notifications, reports, and admin moderation flows
- Reviews, ratings, and analytics for performance tracking

## SRS Alignment

This implementation covers the functional modules described in `SRS.md`, including the rule-based recommendation engine, dashboards, job lifecycle, reporting, and admin tooling. Future enhancements such as payments or native apps can be layered using the existing REST API.
