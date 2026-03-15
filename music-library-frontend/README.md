# 🎵 MELODIA — Full Stack Music Library Platform

Welcome to the **MELODIA** repository! This is a complete, full-stack Single Page Application (SPA) built with the MERN stack (MongoDB, Express, React, Node.js) for the Music Library Capstone project.

This project features a powerful backend API and a beautiful, responsive frontend designed to provide a seamless music browsing and listening experience.

---

## ✨ Project Overview

MELODIA offers an integrated environment where regular users can enjoy dynamic music playbacks, create custom playlists, and search for their favorite tracks, while administrators have full capabilities to manage the catalog.

### Core Features
- **User Authentication:** Secure JWT-based registration and login system with password hashing (bcrypt).
- **Role-Based Access (RBAC):** Distinct features for standard users (browsing, managing personal playlists, playback) and administrators (managing songs, artists, albums, directors, and system notifications).
- **Music Player:** Persistent audio player context that allows seamless music playback, shuffling, and looping while navigating the app without interruptions.
- **Playlist Management:** Create, edit, and curate your own custom playlists dynamically.
- **File Uploads:** Integrated backend file storage using `multer` for robust image and audio file handling.
- **Search & Filter:** Find songs instantly by name, artist, album, or director with responsive backend queries.

---

## 🏗 Tech Stack

The platform is divided into two decoupled architectures communicating via REST APIs:

### Frontend
| Category | Technology |
|---|---|
| **Framework** | React 18 (Bootstrapped with Create React App) |
| **Routing** | React Router v6 |
| **State Management**| React Context API (Auth & Player states) |
| **HTTP Client** | Axios (with automatic JWT interceptors) |
| **Styling** | Custom CSS Design System (CSS Variables, Flexbox, Grid) |
| **Icons & Toasts** | React Icons (Feather) & React Hot Toast |
| **Testing** | Jest + React Testing Library (Unit) & Cypress (E2E) |

### Backend
| Category | Technology |
|---|---|
| **Runtime & Framework** | Node.js with Express.js |
| **Database & ORM** | MongoDB Atlas & Mongoose |
| **Authentication** | JSON Web Tokens (JWT) & bcryptjs |
| **File Management** | Multer (for handling multipart form-data) |
| **Testing** | Mocha, Chai, Supertest |
| **Cross-Origin** | CORS |

---

## 📁 Project Structure

The repository is structured as a monorepo setup conceptually, split into two top-level directories:

```text
root/
├── backend/             # Node.js + Express API
│   ├── middleware/      # Auth guards, role checks, and Multer upload config
│   ├── models/          # Mongoose Schemas (User, Song, Playlist, Artist, etc.)
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic controllers
│   ├── tests/           # API and Integration tests (Mocha/Chai)
│   ├── uploads/         # Static storage for audio and image files
│   └── server.js        # Main application entry point
│
└── music-library-frontend/  # React SPA
    ├── src/
    │   ├── components/  # Reusable UI building blocks (Songs, Playlists, Modals)
    │   ├── context/     # Global state (Auth & Player)
    │   ├── hooks/       # Custom React hooks (e.g., useApi, useNotifications)
    │   ├── pages/       # Top-level route components (Auth, User, Admin pages)
    │   ├── services/    # Axios API call abstractions
    │   └── styles/      # Global CSS and Custom Design System tokens
    └── cypress/         # Cypress E2E workflows
```

---

## 🚀 Getting Started

Follow these steps to get both the backend API and frontend application running locally on your machine.

### 1. Prerequisites
- **Node.js**: Make sure you have Node v16 or higher installed.
- **MongoDB**: Have a local MongoDB instance running (port 27017) or a MongoDB Atlas URI ready.

---

### 2. Backend Setup (`/backend`)

The backend manages the database connections, authentication, file storage, and API logic. 

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   npm install
   ```
2. Create your `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/MusicLibraryDB
   JWT_SECRET=your_super_secret_key
   ```
3. **Important for first-time setup:** Seed the primary database roles (`admin` and `user`) by running:
   ```bash
   node seedRoles.js
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will boot up at `http://localhost:5000`.*

#### 👑 Creating an Admin User
By default, new sign-ups via the frontend are assigned the standard `user` role. To give an account admin privileges, update their record in your MongoDB instance:

```javascript
// Using MongoDB Shell or MongoDB Compass
const adminRole = db.roles.findOne({ roleName: 'admin' });
db.users.updateOne({ email: 'your-admin@email.com' }, { $set: { roleId: adminRole._id } });
```

---

### 3. Frontend Setup (`/music-library-frontend`)

The frontend connects to your running backend to serve the user interface.

1. Open a **new terminal tab** and navigate to the frontend folder:
   ```bash
   cd music-library-frontend
   npm install
   ```
2. Double-check your environment variables. There should be a `.env` file present in the frontend root:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_UPLOADS_URL=http://localhost:5000
   ```
3. Start the React application:
   ```bash
   npm start
   ```
   *The app will automatically open in your browser at `http://localhost:3000`.*

*(You now have both servers running dynamically side-by-side!)*

---

## 🧪 Testing the Stack

Testing is maintained strictly on both sides of the application.

### Backend Testing (Mocha/Chai)
Ensure your MongoDB is running, then execute API tests:
```bash
cd backend
npm test
```
*Covers routes, authentication tokens, file upload endpoints, validation layers, and database interactions.*

### Frontend End-to-End Tests (Cypress)
Ensure **both** the frontend and backend are running. Then execute:
```bash
cd music-library-frontend
npm run cypress:open   # For interactive UI
npm run cypress:run    # For headless terminal runs
```

---

## 🔌 API Integration Map

Here is the high-level mapping of how the frontend requests data from the backend:

| Feature | Endpoint Scope Map |
|---|---|
| **Authentication** | `POST /api/auth/register` · `POST /api/auth/login` |
| **Profile & Media** | `GET /api/auth/profile` · `POST /api/auth/profile-picture` |
| **Browsing Songs** | `GET /api/songs` (Query filters) · `GET /api/songs/:id` |
| **Admin Songs CRUD** | `POST /api/songs` (multer upload) · `PUT /api/songs/:id` · `PATCH /api/songs/:id/visibility` |
| **Playlists** | `GET/POST/PUT/DELETE /api/playlists` |
| **Playlist Editor**| `POST /api/playlists/:id/songs` · `DELETE /api/playlists/:id/songs/:songId` |
| **Entities (Admins)** | CRUD for `/api/artists`, `/api/directors`, and `/api/albums` |
| **Notifications** | `GET /api/notifications` · `PATCH /api/notifications/:id/read` |

---

## 🎨 Design System & Aesthetics

We take pride in our frontend visual presentation. Instead of relying on bulk external UI libraries, we've structured our own scalable CSS ecosystem utilizing custom variables in `src/styles/global.css`.

- **Theme:** Dark, modern, and highly editorial with a `#0a0a0f` background.
- **Accents:** Neon pops of Electric Lime (`#e8ff47`) and Coral (`#ff4d6d`).
- **Typography:** A strategic, readable mix of Bebas Neue, DM Sans, and Space Mono.
- **Responsiveness:** Fluid grid-driven layouts constructed mobile-first.

---

## 💡 Future Roadmap & Improvements

- **Backend Pagination Strategy:** Implement query parameters (like `?page=1&limit=20`) to handle large-scale database requests effectively.
- **Refresh Token Security:** Move away from pure short-lived JWTs to an architecture combining stateless access tokens and secure, HTTP-only refresh tokens.
- **Optimized Populates:** Increase database populate depth to resolve related metadata instantly (reducing frontend N+1 API waterfalls).
- **Environment Security:** Hardened CORS locking dynamically to production client domains.
