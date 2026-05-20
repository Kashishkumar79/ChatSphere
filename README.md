# 💬 ChatSphere

> **Connect. Message. Belong.**

A real-time chat application built with the MERN stack and Socket.IO — featuring live messaging, online status indicators, and a sleek dark UI.

![ChatSphere](https://img.shields.io/badge/ChatSphere-v1.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure signup & login with hashed passwords
- 💬 **Real-time Messaging** — Instant chat powered by Socket.IO
- 🟢 **Online Status** — See who's online in real time
- 🔔 **Message Notifications** — Audio notification on new messages
- 🔍 **User Search** — Find and start conversations with any user
- 📱 **Responsive Design** — Works on mobile and desktop
- 🌙 **Dark UI** — Beautiful glassmorphism dark theme

---

## 🛠️ Tech Stack

### Frontend
| Tech | Usage |
|------|-------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Socket.IO Client | Real-time communication |
| Axios | API calls |
| Zustand | State management |
| React Router DOM | Routing |
| React Hook Form | Form handling |
| React Hot Toast | Notifications |

### Backend
| Tech | Usage |
|------|-------|
| Node.js + Express | Server |
| MongoDB + Mongoose | Database |
| Socket.IO | WebSocket server |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Cookie Parser | Cookie handling |

---

## 📁 Project Structure

```
ChatSphere/
├── frontend/
│   └── src/
│       ├── components/       # Login, Signup
│       ├── context/          # Hooks (messages, users, socket)
│       ├── home/
│       │   ├── Leftpart/     # Sidebar, user list, search
│       │   ├── Rightpart/    # Chat window, messages
│       │   └── left1/        # Logout
│       ├── statemanage/      # Zustand store
│       └── App.jsx
│
└── backend/
    ├── controller/           # user.controller, message.controller
    ├── middleware/           # secureRoute (JWT auth)
    ├── models/               # User, Message, Conversation
    ├── routes/               # user.route, message.route
    ├── jwt/                  # generateToken
    ├── SocketIO/             # server.js
    └── index.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/chatsphere.git
cd chatsphere
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/chatsphere
JWT_TOKEN=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App will run at `http://localhost:5173`

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

### Environment Variables for Production (Backend)

```env
PORT=5002
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatsphere
JWT_TOKEN=your_production_secret
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

> ⚠️ Make sure `FRONTEND_URL` exactly matches your Vercel domain — no trailing slash.

---

## 📸 Screenshots

| Login | Chat |
|-------|------|
| ![Login](./screenshots/login.png) | ![Chat](./screenshots/chat.png) |

---

## 🔧 API Endpoints

### Auth Routes — `/api/user`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |
| GET | `/allusers` | Get all users (auth required) |

### Message Routes — `/api/message`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send/:id` | Send message (auth required) |
| GET | `/get/:id` | Get messages (auth required) |

---

## 👨‍💻 Author

**Kashish Kumar**

## 🔗 Live Demo

🌐 **[https://chat-sphere-fawn.vercel.app](https://chat-sphere-fawn.vercel.app)**

---

## 📄 License

This project is licensed under the ISC License.
