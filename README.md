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

- 🏠 **Home Dashboard** — Friends, groups, pending requests aur open tasks ek jagah, plus quick actions
- 💬 **Chats** — Sirf **friends** ke saath 1-to-1 realtime chat (unread badges ke saath)
- 👥 **Groups** — Naya group banao (aap admin honge), join requests approve/reject karo, members remove karo, group delete karo
- 🤝 **Friends** — Friend request bhejo / accept / decline / cancel, log dhoondo, friend remove karo
- ✅ **Tasks (Todo)** — Priority, due date, progress bar, filters, aur completed tasks clear karne ka option
- 🔍 **In-chat Search** — Kisi bhi chat mein messages search karo
- 🟢 **Online Status** — Real-time online/offline indicator
- 🔔 **Notifications** — Naye message par sound aur unread count
- 🔐 **JWT Authentication** — Secure signup & login with hashed passwords
- 📱 **Responsive Design** — Mobile par bottom navigation, desktop par side rail

### Rules
- **DM** sirf friends ke beech hota hai. Pehle friend request accept honi chahiye.
- **Group** banane wala user **Admin** hota hai. Doosre users join request bhejte hain, admin accept/reject karta hai.
- Group ke members aapas mein group chat kar sakte hain.

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
├── Frontend/
│   └── src/
│       ├── components/       # Login, Signup, Modal, Avatar, shared UI
│       ├── layout/           # AppShell, NavRail (section navigation)
│       ├── sections/         # Dashboard, Chats, Groups, Friends, Todo
│       ├── chat/             # ChatWindow, MessageBubble
│       ├── groups/           # CreateGroupModal, GroupInfoPanel
│       ├── hooks/            # useRealtime (socket events → store)
│       ├── context/          # Auth, Socket providers
│       ├── store/            # Zustand app store
│       └── lib/              # axios API instance
│
└── Backend/
    ├── controller/           # user, message, friend, group, todo
    ├── middleware/           # secureRoute (JWT auth)
    ├── models/               # User, Message, Conversation, FriendRequest, Group, Todo
    ├── routes/               # user, message, friend, group, todo
    ├── jwt/                  # generateToken
    ├── SocketIO/             # server.js (socket + emitToUser helper)
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

Local backend use karna ho to `frontend/.env` mein:

```env
VITE_API_URL=http://localhost:5002
```

App will run at `http://localhost:5173`

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Netlify |
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

## 🔧 API Endpoints

### Auth — `/api/user`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |
| GET | `/allusers` | Get all users (auth required) |

### Friends — `/api/friend`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/people?search=` | Users dhoondo, har ek ka relation ke saath |
| GET | `/list` | Meri friends list |
| GET | `/requests` | Incoming aur outgoing pending requests |
| POST | `/request/:id` | Friend request bhejo |
| POST | `/request/:requestId/accept` | Request accept karo |
| DELETE | `/request/:requestId` | Request reject / cancel karo |
| DELETE | `/:id` | Friend remove karo |

### Groups — `/api/group`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Group banao (creator = admin) |
| GET | `/mine` | Mere groups |
| GET | `/discover?search=` | Groups dhoondo (join ke liye) |
| GET | `/:id` | Group details (join requests sirf admin ko) |
| DELETE | `/:id` | Group delete (sirf admin) |
| POST | `/:id/join` | Join request bhejo |
| DELETE | `/:id/join` | Apni join request cancel karo |
| POST | `/:id/requests/:userId/approve` | Request approve (sirf admin) |
| POST | `/:id/requests/:userId/reject` | Request reject (sirf admin) |
| DELETE | `/:id/members/:userId` | Member remove (sirf admin) |
| POST | `/:id/leave` | Group chhodo (admin nahi chhod sakta) |
| GET | `/:id/messages` | Group messages (members only) |
| POST | `/:id/messages` | Group mein message bhejo (members only) |

### Messages — `/api/message`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send/:id` | DM bhejo (sirf friend ko) |
| GET | `/get/:id` | DM messages (sirf friend ke saath) |

### Tasks — `/api/todo`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Meri tasks |
| POST | `/` | Task banao (`title`, `priority`, `dueDate`) |
| PATCH | `/:id` | Task update (`title`, `done`, `priority`, `dueDate`) |
| DELETE | `/completed` | Completed tasks clear karo |
| DELETE | `/:id` | Task delete |

---

## 👨‍💻 Author

**Kashish Kumar**

## 🔗 Live Demo

🌐 **[https://chat-sphere-fawn.vercel.app](https://chatshpere.netlify.app/)**

---

## 📄 License

This project is licensed under the ISC License.
