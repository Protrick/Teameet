# TEAMEET - Team Formation Platform

A full-stack MERN application for team formation and collaboration. Users can create teams, apply to join teams, and manage team applications with an intuitive interface.

## 🚀 Features

- **User Authentication**: Register, login, password reset with JWT and email notifications
- **Team Creation**: Create teams with domain-specific requirements
- **Team Discovery**: Browse and filter available teams by domain
- **Application System**: Apply to teams with LinkedIn, GitHub, and resume links
- **Team Management**: Accept/reject applications, view team members
- **Email Notifications**: Automated emails for application status updates
- **Responsive Design**: Mobile-friendly interface with TailwindCSS

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email notifications
- **bcryptjs** for password hashing

# Teameet

Teameet is a small team-finding web app (React + Vite frontend, Express backend). It helps users create teams, browse openings, apply to teams, and manage applications.

## Quick summary

- Frontend: React (Vite) + TailwindCSS
- Backend: Node.js + Express + MongoDB (Mongoose)

## Getting started (development)

Prereqs: Node.js (18+ recommended), npm, MongoDB (local or Atlas)

1. Install & run frontend

```bash
cd client
npm install
npm run dev
```

2. Install & run backend

```bash
cd server
npm install
npm run dev
```

Frontend dev server (Vite) default: http://localhost:5173
Backend default port: check `server/server.js` (commonly 3000)

## Build for production

```bash
cd client && npm run build
cd server && npm start
```

## Environment variables

Create a `.env` in `server/` with at least:

```
PORT=3000
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<secret>
FRONTEND_URL=http://localhost:5173
```

Adjust values for production (e.g., FRONTEND_URL to your deployed URL).

## Project structure

```
Teameet/
├── client/        # React + Vite frontend
├── server/        # Express backend
├── start-dev.sh   # helper script (optional)
└── README.md
```

## Notes about the UI & recent changes

- App name standardized to `Teameet` across UI and configs.
- Navbar now shows the logo and `Teameet` label.
- Menu items are plain links: default white, change to amber (`text-amber-400`) on hover and remain amber when active (route selected).
- Navbar height and logo sizing constrained so a larger source image won't stretch the bar.

## Troubleshooting

- If Tailwind classes like `text-amber-400` don't take effect, verify Tailwind setup and your `tailwind.config.js`.
- If the logo doesn't appear, check `client/public/LOGO.png` or `client/public/Teameet(logo).png`.

## Contributing

- Create a branch, make changes, open a PR.

## License

ISC

---

Updated README for Teameet.
