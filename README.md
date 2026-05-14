# ✂️ BarberShop — App de Citas para Barbería

Aplicación full stack para gestión de citas en barbería.
Formulario de reservas + API REST + Base de datos MongoDB.

---

## 📐 Estructura del Proyecto

```
barber-app/
├── client/          # Frontend — React + TypeScript + CSS
│   ├── src/
│   │   ├── assets/       # Imágenes e iconos
│   │   ├── components/   # Componentes reutilizables (Cards, Modal, Footer)
│   │   ├── hooks/        # Custom hooks (useServices, useBarbers)
│   │   ├── pages/        # Vistas principales (Services, Barbers, 404)
│   │   ├── services/     # Llamadas a la API
│   │   ├── styles/       # CSS global y compartido
│   │   ├── types/        # Interfaces TypeScript
│   │   ├── utils/        # Funciones utilitarias (formatPrice, formatDate)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/          # Backend — Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/       # Conexión a base de datos
│   │   ├── controllers/  # Lógica de request/response
│   │   ├── middlewares/  # Manejo de errores, CORS
│   │   ├── models/       # Esquemas Mongoose
│   │   ├── routes/       # Definición de endpoints
│   │   ├── services/     # Lógica de negocio
│   │   ├── utils/        # Helpers y seed de datos
│   │   ├── app.js        # Configuración de Express
│   │   └── server.js     # Punto de arranque
│   ├── .env
│   └── package.json
└── README.md
```
---

## ▶️ Ejecución en Desarrollo

### Frontend (desde `client/`)

```bash
npm run dev
```

Inicia Vite en `http://localhost:5173`

### Backend (desde `server/`)

```bash
npm run dev
```

Inicia Express con nodemon en `http://localhost:5000`

---

## 📦 Scripts Disponibles

### Cliente (`client/package.json`)

| Script          | Comando            | Descripción                              |
| --------------- | ------------------ | ---------------------------------------- |
| `dev`           | `npm run dev`      | Servidor de desarrollo Vite (HMR)        |
| `build`         | `npm run build`    | Compila TypeScript y genera bundle       |
| `preview`       | `npm run preview`  | Previsualiza el build de producción      |
| `lint`          | `npm run lint`     | Ejecuta ESLint en el proyecto            |

### Servidor (`server/package.json`)

| Script          | Comando            | Descripción                              |
| --------------- | ------------------ | ---------------------------------------- |
| `dev`           | `npm run dev`      | Servidor con nodemon (auto-restart)      |
| `start`         | `npm start`        | Servidor en producción con Node          |
| `seed`          | `npm run seed`     | Carga datos iniciales en MongoDB         |

---

## 🗄️ Seed de Datos

Para poblar la base de datos con servicios, barberos y un usuario admin:

```bash
cd server
npm run seed
```

---

## 🛠️ Stack Tecnológico

| Capa       | Tecnología                        |
| ---------- | --------------------------------- |
| Frontend   | React 19, TypeScript, CSS puro    |
| Backend    | Node.js, Express 5                |
| Base Datos | MongoDB, Mongoose 9               |
| Bundler    | Vite 8                            |
| Seguridad  | bcryptjs, CORS restringido        |

