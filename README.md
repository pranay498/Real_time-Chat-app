# Real-Time Chat Application 💬

A modern, full-stack real-time chat application built with a microservices architecture, featuring user authentication, instant messaging, image sharing, and real-time online status.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Socket Events](#socket-events)
- [Contributing](#contributing)

---

## 🎯 Overview

This is a scalable, real-time chat application with a modular microservices backend and modern React/Next.js frontend. The application supports:

- User registration and authentication via OTP
- Real-time one-to-one messaging
- Image sharing with Cloudinary integration
- Online/offline status tracking
- Message read receipts
- Typing indicators
- Redis caching for user sessions
- Message queue for email notifications

---

## 🏗️ Architecture

The application follows a **microservices architecture** with the following components:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js + React)                   │
│                                                                  │
│  Authentication → Chat Interface → Real-time Messaging          │
└────────────────┬────────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐  ┌─────▼────┐  ┌────▼────┐
│User  │  │  Chat    │  │  Mail   │
│API   │  │  API +   │  │ Service │
│      │  │ WebSocket│  │         │
└──────┘  └──────────┘  └─────────┘
    │            │            │
    └────────────┼────────────┘
            ┌────▼────────┐
       ┌────┤  MongoDB   │
       │    └────────────┘
       │
    ┌──▼──────┐  ┌──────────┐  ┌──────────────┐
    │ RabbitMQ │  │  Redis   │  │  Cloudinary  │
    │(Message  │  │(Caching) │  │(Image CDN)   │
    │ Queue)   │  │          │  │              │
    └──────────┘  └──────────┘  └──────────────┘
```

### Microservices Overview

| Service | Port | Purpose |
|---------|------|---------|
| **User Service** | 5000 | Authentication, user management, profile handling |
| **Chat Service** | 5001 | Real-time messaging, chat management, WebSocket server |
| **Mail Service** | 5002 | Email delivery via RabbitMQ queue (OTP emails) |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1.0
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.io 4.8.1
- **Message Queue**: RabbitMQ (amqplib)
- **Caching**: Redis 5.5.6
- **Email**: Nodemailer (SMTP)
- **File Upload**: Multer with Cloudinary CDN integration

### Frontend
- **Framework**: Next.js 15.3.4 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 with PostCSS
- **Real-time**: Socket.io Client 4.8.1
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Utilities**: 
  - js-cookie (session management)
  - lucide-react (icons)
  - moment (date formatting)
- **Linting & Type Safety**: ESLint, TypeScript 5

### Infrastructure
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Tools**: Nodemon, Concurrently, ts-node
- **CORS**: Enabled for cross-origin requests

---

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── user/                    # User authentication and management service
│   │   ├── src/
│   │   │   ├── index.ts         # Entry point
│   │   │   ├── config/
│   │   │   │   ├── db.ts        # MongoDB connection
│   │   │   │   ├── generateToken.ts  # JWT token generation
│   │   │   │   ├── rabbitmq.ts  # RabbitMQ connection & message publication
│   │   │   │   └── TryCatch.ts  # Error handling wrapper
│   │   │   ├── controllers/
│   │   │   │   └── user.ts      # User endpoints logic
│   │   │   ├── middleware/
│   │   │   │   └── isAuth.ts    # JWT verification middleware
│   │   │   ├── model/
│   │   │   │   └── User.ts      # User schema
│   │   │   └── routes/
│   │   │       └── user.ts      # User API routes
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── chat/                    # Real-time chat service
│   │   ├── src/
│   │   │   ├── index.ts         # Entry point with Express & Socket.io
│   │   │   ├── config/
│   │   │   │   ├── db.ts        # MongoDB connection
│   │   │   │   ├── cloudinary.ts # Cloudinary configuration
│   │   │   │   ├── socket.ts    # Socket.io setup & event handlers
│   │   │   │   └── TryCatch.ts  # Error handling wrapper
│   │   │   ├── controllers/
│   │   │   │   └── chat.ts      # Chat endpoints logic
│   │   │   ├── middlewares/
│   │   │   │   ├── isAuth.ts    # JWT verification
│   │   │   │   └── multer.ts    # File upload middleware
│   │   │   ├── models/
│   │   │   │   ├── Chat.ts      # Chat schema (conversation)
│   │   │   │   └── Messages.ts  # Message schema
│   │   │   └── routes/
│   │   │       └── chat.ts      # Chat API routes
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mail/                    # Email service (consumer)
│       ├── src/
│       │   ├── index.ts         # Express server
│       │   └── consumer.ts      # RabbitMQ consumer for OTP emails
│       ├── package.json
│       ├── tsconfig.json
│       └── nodemon.json
│
├── frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Home page (redirects to /chat)
│   │   │   ├── globals.css      # Global styles
│   │   │   ├── chat/
│   │   │   │   └── page.tsx     # Chat interface
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Login page
│   │   │   ├── profile/
│   │   │   │   └── page.tsx     # User profile
│   │   │   └── verify/
│   │   │       └── page.tsx     # OTP verification
│   │   ├── components/          # Reusable React components
│   │   │   ├── ChatHeader.tsx   # Chat header with user info
│   │   │   ├── ChatMessages.tsx # Messages display
│   │   │   ├── ChatSidebar.tsx  # Conversation list
│   │   │   ├── Loading.tsx      # Loading spinner
│   │   │   ├── MessageInput.tsx # Message input with file upload
│   │   │   └── VerifyOtp.tsx    # OTP verification component
│   │   └── context/             # React Context for state management
│   │       ├── AppContext.tsx   # Global app state (user, auth)
│   │       └── SocketContext.tsx # Socket.io connection state
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   └── eslint.config.mjs
│
└── README.md
```

### Database Schemas

#### User Collection
```typescript
{
  _id: ObjectId
  name: String          // User's display name
  email: String         // Unique email
  createdAt: Date
  updatedAt: Date
}
```

#### Chat Collection
```typescript
{
  _id: ObjectId
  users: String[]       // Array of user IDs [userId1, userId2]
  latestMessage: {
    text: String
    sender: String
  }
  createdAt: Date
  updatedAt: Date
}
```

#### Messages Collection
```typescript
{
  _id: ObjectId
  chatId: ObjectId      // Reference to Chat
  sender: String        // User ID of sender
  text?: String         // Message text (optional)
  image?: {
    url: String         // Cloudinary CDN URL
    publicId: String    // Cloudinary public ID
  }
  messageType: "text" | "image"
  seen: Boolean         // Read receipt
  seenAt?: Date         // Timestamp when read
  createdAt: Date
  updatedAt: Date
}
```

---

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas cloud)
- **Redis** (for session caching)
- **RabbitMQ** (for message queue)
- **Git**

### Third-party Services Required
- **Cloudinary Account** (for image hosting)
- **Gmail Account** (for SMTP - for sending OTP emails)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
```

### 2. Install Dependencies

#### User Service
```bash
cd backend/user
npm install
cd ../..
```

#### Chat Service
```bash
cd backend/chat
npm install
cd ../..
```

#### Mail Service
```bash
cd backend/mail
npm install
cd ../..
```

#### Frontend
```bash
cd frontend
npm install
cd ..
```

### 3. Build TypeScript Files

For each backend service:

```bash
cd backend/user && npm run build
cd ../chat && npm run build
cd ../mail && npm run build
cd ../..
```

---

## ⚙️ Environment Configuration

Create `.env` files in each service directory with the following variables:

### `backend/user/.env`
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URL=mongodb://localhost:27017/chat-app
# or for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key_here

# RabbitMQ
Rabbitmq_Host=localhost
Rabbitmq_Username=guest
Rabbitmq_Password=guest
Rabbitmq_Port=5672
```

### `backend/chat/.env`
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URL=mongodb://localhost:27017/chat-app
# or for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary (Image hosting)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### `backend/mail/.env`
```env
# Server Configuration
PORT=5002
NODE_ENV=development

# RabbitMQ
Rabbitmq_Host=localhost
Rabbitmq_Username=guest
Rabbitmq_Password=guest
Rabbitmq_Port=5672

# Email Configuration (Gmail SMTP)
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password  # Use Gmail App Password, not your actual password
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

**Note**: Generate Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-factor authentication
3. Navigate to App passwords
4. Select Mail and Windows Computer (or your OS)
5. Use the generated 16-character password

---

## 🏃 Running the Application

### Option 1: Run Services Individually

#### Terminal 1 - User Service
```bash
cd backend/user
npm run dev
# Server running on http://localhost:5000
```

#### Terminal 2 - Chat Service
```bash
cd backend/chat
npm run dev
# Server running on http://localhost:5001 with WebSocket
```

#### Terminal 3 - Mail Service
```bash
cd backend/mail
npm run dev
# Mail consumer listening on port 5002
```

#### Terminal 4 - Frontend
```bash
cd frontend
npm run dev
# Next.js app running on http://localhost:3000
```

### Option 2: Production Build

```bash
# Build all services
cd backend/user && npm run build && cd ../..
cd backend/chat && npm run build && cd ../..
cd backend/mail && npm run build && cd ../..
cd frontend && npm run build && cd ..

# Run production
cd backend/user && npm start
cd backend/chat && npm start
cd backend/mail && npm start
cd frontend && npm start
```

---

## 📡 API Endpoints

### User Service (Port 5000)

#### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/login` | Send OTP to email | ❌ |
| `POST` | `/api/v1/verify` | Verify OTP and create user | ❌ |

#### User Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/me` | Get current user profile | ✅ |
| `GET` | `/api/v1/user/all` | Get all users | ✅ |
| `GET` | `/api/v1/user/:id` | Get specific user by ID | ❌ |
| `POST` | `/api/v1/update/user` | Update user name | ✅ |

### Chat Service (Port 5001)

#### Chat Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/chat/new` | Create new chat | ✅ |
| `GET` | `/api/v1/chat/all` | Get all user's chats | ✅ |

#### Messaging

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/message` | Send message (text or image) | ✅ |
| `GET` | `/api/v1/message/:chatId` | Get messages by chat | ✅ |

---

## ✨ Features

### Authentication & User Management
- ✅ OTP-based authentication (no password)
- ✅ Email verification for registration
- ✅ JWT token-based session management
- ✅ Redis-backed user caching
- ✅ Profile view and edit

### Real-time Messaging
- ✅ One-to-one instant messaging
- ✅ Message delivery confirmation
- ✅ Read receipts (message seen status)
- ✅ Typing indicators (real-time typing status)
- ✅ Online/offline presence detection

### Media Sharing
- ✅ Image upload and sharing
- ✅ Cloudinary CDN integration for fast delivery
- ✅ Image preview in chat

### User Experience
- ✅ User search and discovery
- ✅ Conversation list with latest message preview
- ✅ Responsive design (mobile-friendly)
- ✅ Loading states and error handling
- ✅ Toast notifications for actions

### Performance & Scalability
- ✅ Microservices architecture
- ✅ Message queue for async email handling
- ✅ Redis caching for sessions
- ✅ Database indexing
- ✅ CORS configuration for security

---

## 🔌 Socket Events

Real-time communication via Socket.io between chat service and clients.

### Client → Server Events

```typescript
// Join a chat room
socket.emit("joinChat", chatId: string)

// Leave a chat room
socket.emit("leaveChat", chatId: string)

// Typing indicator
socket.emit("typing", { userId: string, chatId: string })

// Stop typing
socket.emit("stopTyping", { userId: string, chatId: string })
```

### Server → Client Events

```typescript
// Receive list of online users
socket.on("getOnlineUser", (users: string[]) => {})

// User is typing in chat
socket.on("userTyping", ({ chatId, userId }) => {})

// User stopped typing
socket.on("userStoppedTyping", ({ chatId, userId }) => {})

// New message received (emitted from chat controller)
socket.on("newMessage", (message: IMessage) => {})

// Message read receipt
socket.on("messageSeen", ({ chatId, messageId }) => {})
```

---

## 📱 Frontend Pages

### `/login`
- Email input
- OTP verification
- User registration/login

### `/chat`
- Sidebar with conversation list (online status indicator)
- Chat header with recipient info
- Message display with timestamps
- Message input with image upload
- Typing indicator
- Real-time message delivery

### `/profile`
- User profile information
- Edit user name
- Logout functionality

### `/verify`
- OTP email verification
- Resend OTP option

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **OTP Verification**: Two-step login process
- **Password-less**: No password storage (OTP-based)
- **CORS Protection**: Only allows localhost:3000 in dev
- **Input Validation**: Server-side validation of all inputs
- **Error Handling**: Graceful error responses without exposing internals
- **Middleware Protection**: Auth middleware on protected routes

---

## 🐛 Debugging

### Check Service Status
```bash
# Test user service
curl http://localhost:5000/api/v1/user/all

# Test chat service
curl http://localhost:5001/api/v1/chat/all
```

### View Logs
Each service logs to console with timestamps. Check terminal output for:
- Connection status (MongoDB, Redis, RabbitMQ)
- Socket.io connections
- API requests and errors

### Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Ensure MongoDB is running: `mongod` |
| Redis connection fails | Start Redis: `redis-server` |
| RabbitMQ not working | Ensure RabbitMQ is running on port 5672 |
| Socket.io connection fails | Check CORS origin in chat config |
| Emails not sending | Verify Gmail App Password, enable 2FA |
| Port already in use | Change PORT in .env or kill process |

---

## 📦 Deployment

### Docker Deployment (Optional)

Create a `docker-compose.yml` for easy deployment:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
  
  redis:
    image: redis:latest
    ports:
      - "6379:6379"
  
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
```

Start services: `docker-compose up`

### Cloud Deployment
- **Backend**: Deploy to Heroku, Railway, or AWS
- **Frontend**: Deploy to Vercel, Netlify
- **Database**: MongoDB Atlas
- **Cache**: Redis Cloud
- **Message Queue**: CloudAMQP

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add error handling
- Test before submitting PR

---

## 📝 License

This project is licensed under the ISC License - see individual package.json files for details.

---

## 👤 Author

Created with ❤️ for real-time communication

---

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

---

## 🚀 Future Enhancements

- [ ] Group chat support
- [ ] Message search functionality
- [ ] File sharing (documents, videos)
- [ ] Voice/Video calling
- [ ] User blocking
- [ ] Message encryption
- [ ] Dark mode UI
- [ ] Mobile app (React Native)
- [ ] Message reactions/emojis
- [ ] Pin important messages

---

**Happy Chatting! 💬🎉**
