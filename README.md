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

- 🏠 **Home Dashboard** — Friends, groups, pending requests, and open tasks in one place, plus quick actions
- 💬 **Chats** — Real-time 1-to-1 chat with **friends only**, with unread badges
- 👥 **Groups** — Create a new group (you become the admin), approve/reject join requests, remove members, and delete the group
- 🤝 **Friends** — Send, accept, decline, or cancel friend requests, search for people, and remove friends
- ✅ **Tasks (Todo)** — Priorities, due dates, a progress bar, filters, and an option to clear completed tasks
- 🔍 **In-chat Search** — Search for messages inside any chat
- 🟢 **Online Status** — Real-time online/offline indicator
- 🔔 **Notifications** — Sound alert and unread count for new messages
- 🔐 **JWT Authentication** — Secure signup and login with hashed passwords
- 📱 **Responsive Design** — Bottom navigation on mobile, side rail on desktop

### Rules

- **DMs** are only possible between friends. A friend request must be accepted first.
- The user who creates a **group** becomes its **Admin**. Other users send join requests, and the admin accepts or rejects them.
- Group members can chat with each other in the group chat.

---

## 🛠️ Tech Stack

### Frontend

| Tech | Usage |
|------|-------|
| React 18 | UI framework |
| Vite | Build tool |
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
cd Backend
npm install
```

Create a `.env` file:

```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/chatsphere
JWT_TOKEN=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

To use the local backend, add this to `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5002
```

The app will run at `http://localhost:5173`

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
FRONTEND_URL=https://your-netlify-app.netlify.app
NODE_ENV=production
```

> ⚠️ Make sure `FRONTEND_URL` exactly matches your Netlify domain — no trailing slash.

---

## 🔧 API Endpoints

### Auth — `/api/user`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/login` | Log in a user |
| POST | `/logout` | Log out a user |
| GET | `/allusers` | Get all users (auth required) |

### Friends — `/api/friend`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/people?search=` | Search users, each with their relationship status |
| GET | `/list` | My friends list |
| GET | `/requests` | Incoming and outgoing pending requests |
| POST | `/request/:id` | Send a friend request |
| POST | `/request/:requestId/accept` | Accept a request |
| DELETE | `/request/:requestId` | Reject / cancel a request |
| DELETE | `/:id` | Remove a friend |

### Groups — `/api/group`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a group (creator = admin) |
| GET | `/mine` | My groups |
| GET | `/discover?search=` | Search for groups to join |
| GET | `/:id` | Group details (join requests visible to admin only) |
| DELETE | `/:id` | Delete a group (admin only) |
| POST | `/:id/join` | Send a join request |
| DELETE | `/:id/join` | Cancel your own join request |
| POST | `/:id/requests/:userId/approve` | Approve a request (admin only) |
| POST | `/:id/requests/:userId/reject` | Reject a request (admin only) |
| DELETE | `/:id/members/:userId` | Remove a member (admin only) |
| POST | `/:id/leave` | Leave a group (admin cannot leave) |
| GET | `/:id/messages` | Group messages (members only) |
| POST | `/:id/messages` | Send a message in the group (members only) |

### Messages — `/api/message`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send/:id` | Send a DM (friends only) |
| GET | `/get/:id` | Get DM messages (with a friend only) |

### Tasks — `/api/todo`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | My tasks |
| POST | `/` | Create a task (`title`, `priority`, `dueDate`) |
| PATCH | `/:id` | Update a task (`title`, `done`, `priority`, `dueDate`) |
| DELETE | `/completed` | Clear completed tasks |
| DELETE | `/:id` | Delete a task |

---

## 👨‍💻 Author

**Kashish Kumar**

## 🔗 Live Demo

🌐 **[https://chatshpere.netlify.app](https://chatshpere.netlify.app/)**

---

## 📄 License

This project is licensed under the ISC License.
