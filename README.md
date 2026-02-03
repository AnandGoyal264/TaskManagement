# 📋 Autonomise — Task Management Platform

> A modern full-stack task management platform with collaboration, email notifications, analytics, and role-based access control.

---

## 🚀 Overview

Autonomise helps teams manage tasks efficiently with real-time collaboration, smart email notifications, analytics, and bulk operations.

Built using React, Node.js, and MongoDB, it supports multiple roles, file uploads, and dark mode.

---

## ✨ Features

### 📌 Core Features
- Task creation, editing, and tracking  
- Status, priority & due dates  
- Multiple assignees per task  
- Comments & collaboration  
- File attachments (Cloudinary)  
- Role-based access control  
- Analytics dashboard  
- Dark mode (persistent)

### 🚀 Advanced Features
- Bulk task creation (CSV import)  
- CSV export/import  
- Smart email notifications  
- Search & filtering  
- JWT authentication  
- Rate limiting & input sanitization  
- Pagination & optimized queries  

---

## 🏗️ Tech Stack

### Frontend
- React  
- Redux  
- React Router  
- Axios  
- CSS Variables (Dark Mode)

### Backend
- Node.js  
- Express.js  
- MongoDB & Mongoose  
- JWT Authentication  
- Nodemailer  

### Services
- Cloudinary (file storage)  
- Gmail SMTP / Mailtrap  

---

## 📁 Project Structure

```
autonomise/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
└── postman_collection.json
```

---

## ⚙️ Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/AnandGoyal264/TaskManagement

```

---

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_name

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Access App

Frontend:  
```
http://localhost:5173
```

Backend:  
```
http://localhost:5000
```

---

## 📡 API Endpoints

### Tasks
- POST `/api/tasks`  
- GET `/api/tasks`  
- GET `/api/tasks/:id`  
- PUT `/api/tasks/:id`  
- DELETE `/api/tasks/:id`  
- POST `/api/tasks/bulk`  

### Comments
- POST `/api/comments`  
- GET `/api/comments/task/:taskId`  
- PUT `/api/comments/:id`  
- DELETE `/api/comments/:id`  

### Files
- POST `/api/files/upload`  
- GET `/api/files/:id/download`  
- DELETE `/api/files/:id`  

### Users
- GET `/api/users`  
- PATCH `/api/users/:id/role`  

### Analytics
- GET `/api/analytics/stats`  

---

## 🛡️ Security

- JWT authentication  
- Role-based authorization  
- bcrypt password hashing  
- Helmet security headers  
- Rate limiting  
- CORS protection  
- Input validation & sanitization  

---

## 🚢 Deployment

### Backend (Render / Heroku)

Build Command:
```bash
npm install
```

Start Command:
```bash
npm start
```

---

### Frontend (Vercel / Netlify)

```bash
npm run build
```

---

## 🤝 Contributing

1. Fork repository  
2. Create feature branch  
3. Commit changes  
4. Push & open PR  

---

## 📄 License

MIT License

---

## ❤️ Built With

React • Node.js • Express • MongoDB • Cloudinary

---

### ⭐ If you like this project, consider giving it a star!

