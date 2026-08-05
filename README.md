# ✂️ BarberShop — Barber Appointment App

A full-stack application for managing barber shop appointments.
Appointment booking form + REST API + MongoDB database.

---

## 📐 Project Structure

```text
barber-app/
├── client/          # Frontend — React + TypeScript + CSS
│   ├── src/
│   │   ├── assets/       # Images and icons
│   │   ├── components/   # Reusable components (Cards, Modal, Footer)
│   │   ├── hooks/        # Custom hooks (useServices, useBarbers)
│   │   ├── pages/        # Main views (Services, Barbers, 404)
│   │   ├── services/     # API requests
│   │   ├── styles/       # Global and shared CSS
│   │   ├── types/        # TypeScript interfaces
│   │   ├── utils/        # Utility functions (formatPrice, formatDate)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/          # Backend — Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Request/response logic
│   │   ├── middlewares/  # Error handling, CORS
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoint definitions
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helpers and database seed
│   │   ├── app.js        # Express configuration
│   │   └── server.js     # Application entry point
│   ├── .env
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Frontend   | React 19, TypeScript, Vanilla CSS  |
| Backend    | Node.js, Express 5                 |
| Database   | MongoDB, Mongoose 9                |
| Bundler    | Vite 8                             |
| Security   | bcryptjs, Restricted CORS          |
```
