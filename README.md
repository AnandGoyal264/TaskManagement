# 📋 Autonomise - Task Management Platform

> A modern, full-stack task management platform with email notifications, dark mode, bulk operations, and real-time collaboration features.

---

## 🎯 Key Features

### ✨ Core Features
- **📌 Task Management** — Create, edit, update, and track tasks with status, priority, and due dates
- **👥 Multiple Assignees** — Assign single or multiple employees to one task
- **📧 Email Notifications** — Employees receive email when assigned tasks via Gmail SMTP
- **💬 Comments & Collaboration** — Add comments on tasks; managers can edit/delete all comments
- **📁 File Attachments** — Upload files to tasks via Cloudinary
- **🔐 Role-Based Access Control** — Employee, Manager, and Admin roles with granular permissions
- **📊 Analytics Dashboard** — Track task completion, performance metrics
- **🌓 Dark Mode** — Toggle between light and dark themes (localStorage persistent)

### 🚀 Advanced Features
- **📦 Bulk Task Creation** — Create multiple tasks at once with CSV import
- **🔔 Smart Email System** — Notifications for task assignments, updates, and manager changes
- **🔍 Search & Filter** — Find tasks by status, priority, assignee, keywords
- **📄 CSV Export/Import** — Bulk operations for task management
- **♿ Accessible UI** — Mobile-responsive, keyboard-friendly interface
- **🛡️ Security** — JWT authentication, rate limiting, input sanitization
- **⚡ Performance** — Optimized database queries, pagination, caching

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTONOMISE PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐          ┌──────────────────┐             │
│  │   FRONTEND       │          │    BACKEND API   │             │
│  │   (React)        │◄────────►│   (Node.js)      │             │
│  │                  │          │                  │             │
│  │ • Tasks Page     │          │ • Task Routes    │             │
│  │ • Task Form      │          │ • Auth Routes    │             │
│  │ • Bulk Create    │          │ • Comment API    │             │
│  │ • Dashboard      │          │ • File Upload    │             │
│  │ • Analytics      │          │ • User Mgmt      │             │
│  │ • Dark Mode      │          │                  │             │
│  └──────────────────┘          └────────┬─────────┘             │
│         │                                │                       │
│         │                    ┌───────────┴────────────┐          │
│         │                    ▼                        ▼          │
│         │              ┌──────────────┐      ┌──────────────┐   │
│         │              │   MongoDB    │      │  Cloudinary  │   │
│         │              │   Database   │      │  File Store  │   │
│         │              └──────────────┘      └──────────────┘   │
│         │                                                         │
│         └────────────────┬──────────────────────────────────┐    │
│                          ▼                                  ▼    │
│                  ┌──────────────────┐         ┌──────────────┐  │
│                  │  Email Service   │         │  JWT Auth    │  │
│                  │  (Nodemailer)    │         │  Middleware  │  │
│                  │  Gmail SMTP      │         └──────────────┘  │
│                  └──────────────────┘                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Task Creation & Email Flow

```
SINGLE TASK CREATION FLOW
═══════════════════════════════════════════════════════════════════

┌──────────┐
│  Manager │
│  Creates │
│   Task   │
└────┬─────┘
     │
     ▼
┌──────────────────────────┐
│  Select Assignee(s)      │
│  - Dropdown Multi-Select │
│  - Visual Tags Display   │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│  Validate Task Data      │
│  - Required: title       │
│  - Optional: description │
│  - Priority, Status, DD  │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│  Save to MongoDB         │
│  - Create Task Record    │
│  - Link Assignees        │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│  Email Service Triggered │
│  - Fetch Assignee Info   │
│  - Fetch Manager Name    │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│  Send Email via Gmail    │
│  - Task Title            │
│  - Assignee Name         │
│  - Task ID + Link        │
│  - Manager's Name        │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│  Employee Receives Email │
│  - Real Gmail Inbox      │
│  - Click Link to View    │
└──────────────────────────┘
```

---

## 📦 Bulk Task Creation Flow

```
BULK TASK CREATION (CSV IMPORT)
═══════════════════════════════════════════════════════════════════

┌──────────────────┐
│  Upload CSV File │
└────┬─────────────┘
     │
     ▼
┌────────────────────────────────┐
│  Parse CSV                     │
│  Columns:                      │
│  - title (required)            │
│  - description                 │
│  - priority (low/med/high)     │
│  - status (todo/in-prog/done)  │
│  - assignees (;-separated IDs) │
│  - dueDate                     │
└────┬─────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│  Dynamic Row Editor            │
│  - Edit each task              │
│  - Multi-select dropdown       │
│  - Add/Remove rows             │
└────┬─────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│  Validate All Tasks            │
│  - Check titles                │
│  - Verify assignees exist      │
│  - Validate dates              │
└────┬─────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│  Bulk Insert to MongoDB        │
│  - insertMany() operation      │
│  - Transaction-like behavior   │
└────┬─────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│  Send Emails for Each Task     │
│  - Loop through created tasks  │
│  - Fetch assignee data         │
│  - Send email per assignee     │
└────┬─────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│  Success Notification          │
│  - Show count created          │
│  - Redirect to Tasks page      │
└────────────────────────────────┘
```

---

## 🔐 Role-Based Permissions Matrix

| Action | Employee | Manager | Admin |
|--------|----------|---------|-------|
| **View Own Tasks** | ✅ | ✅ | ✅ |
| **Create Task** | ❌ | ✅ | ✅ |
| **Edit Task** | 🟡* | ✅ | ✅ |
| **Delete Task** | ❌ | ✅ | ✅ |
| **Assign Task** | ❌ | ✅ | ✅ |
| **Add Comment** | ✅ | ✅ | ✅ |
| **Edit Own Comment** | ✅ | ✅ | ✅ |
| **Edit Others' Comments** | ❌ | ✅ | ✅ |
| **Delete Comment** | 🟡* | ✅ | ✅ |
| **View Analytics** | ❌ | ✅ | ✅ |
| **Manage Users** | ❌ | 🟡* | ✅ |
| **Upload Files** | ✅ | ✅ | ✅ |
| **Download Files** | ✅ | ✅ | ✅ |

> 🟡* Only for own items

---

## 🌓 Dark Mode Implementation

```javascript
// How Dark Mode Works
═══════════════════════════════════════════════════════════════════

1. CSS VARIABLES (global.css)
   ├─ Light Mode (default)
   │  ├─ --bg: #f8fafc
   │  ├─ --text-primary: #1e293b
   │  └─ --border: #e2e8f0
   │
   └─ Dark Mode (body.dark-mode)
      ├─ --bg: #0f172a
      ├─ --text-primary: #f1f5f9
      └─ --border: #334155

2. TOGGLE BUTTON (Header.jsx)
   ├─ Click moon/sun icon
   ├─ Toggle class on body
   └─ Save preference to localStorage

3. PERSISTENCE
   ├─ On app load: check localStorage
   ├─ If 'dark-mode' === 'true'
   └─ Apply class and toggle state

4. ALL COMPONENTS INHERIT
   ├─ Use var(--bg) for background
   ├─ Use var(--text-primary) for text
   └─ Automatic theme switching
```

---

## 📧 Email Notification System

### Configuration

```env
# Gmail Setup
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=YOUR_16_CHAR_APP_PASSWORD
FRONTEND_URL=http://localhost:5173

# OR Mailtrap (Development)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=YOUR_MAILTRAP_USER
EMAIL_PASSWORD=YOUR_MAILTRAP_PASS
```

### Email Triggers

```
TASK ASSIGNMENT EMAIL
├─ When: Manager creates task + assigns employee
├─ Recipient: Employee email
├─ Content:
│  ├─ Task title
│  ├─ Task ID
│  ├─ Task link (clickable)
│  └─ Assigner name
└─ Status: Sent asynchronously (doesn't block task creation)

UPDATE ASSIGNMENT EMAIL
├─ When: Manager updates task and adds new assignee
├─ Recipient: Only newly assigned employees
├─ Content: Same as assignment email
└─ Status: Sent after task save

BULK CREATE EMAIL
├─ When: Bulk create CSV with assignees
├─ Recipient: All assigned employees
├─ Content: Per-task email notifications
└─ Status: Sent for each task created
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Cloudinary account (for file uploads)
- Gmail account with App Password OR Mailtrap account

### Installation

```bash
# Clone repository
git clone <repo-url>
cd autonomise-3

# Backend Setup
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
EOF

# Start backend
npm run dev

# Frontend Setup (in new terminal)
cd frontend
npm install
npm run dev
```

### Access Application
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API Docs: Test with Postman (import postman_collection.json)

---

## 📱 UI Components Showcase

### 1. **Task Form** (Create/Edit)
```
┌─────────────────────────────────────┐
│  Create New Task                    │
├─────────────────────────────────────┤
│                                      │
│  Title: [________________]           │
│                                      │
│  Description: [___________________] │
│                                      │
│  Priority: [Medium ▼]               │
│  Status:   [To Do ▼]                │
│  Due Date: [2026-02-10]             │
│                                      │
│  Assign To (Multiple): [▼ Dropdown] │
│  ┌──────────────┐                   │
│  │ ☑ John Doe   │                   │
│  │ ☐ Jane Smith │                   │
│  │ ☑ Bob Wilson │                   │
│  └──────────────┘                   │
│                                      │
│  [Create Task]  [Cancel]            │
└─────────────────────────────────────┘
```

### 2. **Bulk Task Create**
```
┌─────────────────────────────────────────────┐
│  Bulk Create Tasks                          │
├─────────────────────────────────────────────┤
│                                              │
│  Upload CSV: [Choose File] No file chosen   │
│                                   [+ Add Row]│
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ Title | Description | Priority | ... │   │
│  ├──────────────────────────────────────┤   │
│  │ Task1 | Do this    | High    | ...  │   │
│  │ Task2 | Do that    | Medium  | ...  │   │
│  │ Task3 | Do more    | Low     | ...  │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [Create 3 Tasks]  [Cancel]                 │
└─────────────────────────────────────────────┘
```

### 3. **Task List with Dark Mode**
```
LIGHT MODE                    DARK MODE
┌─────────────────┐          ┌─────────────────┐
│ 📋 Tasks        │          │ 📋 Tasks        │
├─────────────────┤          ├─────────────────┤
│ ⚪ White BG     │          │ ⚫ Dark BG      │
│ 🟤 Dark Text    │          │ 🤍 Light Text   │
│ ☀️ Light Mode   │◄────────►│ 🌙 Dark Mode    │
│                 │          │ (localStorage)  │
│ [☀️ Toggle]     │          │ [🌙 Toggle]     │
└─────────────────┘          └─────────────────┘
```

---

## 🔄 Data Flow Examples

### Create Task Flow
```
Frontend               Backend              Database
   │                    │                     │
   ├─ POST /tasks ─────►│                     │
   │ (task data)        ├─ Validate ─────────►│
   │                    │                     │
   │                    │ Create Task ◄──────┤
   │                    │                     │
   │                    ├─ Get Assignees ────►│
   │                    │                     │
   │                    ├─ Send Emails        │
   │                    │ (nodemailer)        │
   │                    │                     │
   │◄─ 201 Created ─────┤                     │
   │ (task object)      │                     │
   │                    │                     │
   ├─ Redirect /tasks   │                     │
```

### Comment on Task Flow
```
Frontend               Backend              Database
   │                    │                     │
   ├─ POST /comments ──►│                     │
   │ (text, taskId)     ├─ Validate ─────────►│
   │                    │                     │
   │                    │ Create Comment ◄───┤
   │                    │                     │
   │                    ├─ Link to Task ─────►│
   │                    │                     │
   │◄─ 201 Created ─────┤                     │
   │                    │                     │
   ├─ Refresh Comments  │                     │
```

---

## 🛡️ Security Features

- **Authentication**: JWT tokens with 7-day expiration
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Joi schema validation on all inputs
- **Data Sanitization**: MongoDB sanitization, XSS protection
- **Rate Limiting**: 10,000 requests/hour (10,000/60min)
- **HTTPS Ready**: Helmet.js security headers
- **Password Hashing**: bcryptjs with salt rounds
- **CORS**: Restricted to trusted origins

---

## 📊 Performance Optimizations

- **Database**: Indexed queries on taskId, userId, status
- **Pagination**: 20 items per page by default
- **Lazy Loading**: Comments and files loaded on demand
- **Caching**: LocalStorage for user preferences, dark mode
- **File Optimization**: Cloudinary handles image resizing
- **Email Async**: Emails sent asynchronously (non-blocking)

---

## 🐛 Troubleshooting

### Email Not Sending
```
Issue: "Missing credentials for PLAIN"
Solution: 
  1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
  2. For Gmail: Use 16-char App Password (not your main password)
  3. Ensure 2-Step Verification is enabled on Gmail
  4. Check: https://myaccount.google.com/apppasswords

Issue: "Invalid login: 535 Bad Credentials"
Solution:
  1. Regenerate App Password from Google Account
  2. Copy without spaces
  3. Remove old password from .env
  4. Restart backend server
```

### Dark Mode Not Persisting
```
Solution:
  1. Clear browser cache (Ctrl+Shift+Del)
  2. Check localStorage in DevTools (F12 → Application)
  3. Verify 'dark-mode' key is being set
  4. Check if browser allows localStorage
```

### Tasks Not Appearing
```
Solution:
  1. Verify user is logged in
  2. Check role permissions (employee/manager/admin)
  3. Verify MongoDB connection in backend logs
  4. Check if tasks are assigned to current user
  5. Look for validation errors in browser console
```

---

## 📚 API Endpoints

### Tasks
- `POST /api/tasks` — Create task
- `GET /api/tasks` — List tasks (paginated)
- `GET /api/tasks/:id` — Get task details
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Soft delete task
- `POST /api/tasks/bulk` — Bulk create tasks

### Comments
- `POST /api/comments` — Add comment
- `GET /api/comments/task/:taskId` — Get comments
- `PUT /api/comments/:id` — Edit comment
- `DELETE /api/comments/:id` — Delete comment

### Files
- `POST /api/files/upload` — Upload file
- `GET /api/files/:id/download` — Download file
- `DELETE /api/files/:id` — Delete file

### Users
- `GET /api/users` — List users
- `PATCH /api/users/:id/role` — Change user role

### Analytics
- `GET /api/analytics/stats` — Get statistics

---

## 🚢 Deployment Guide

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=production_secret
heroku config:set MONGO_URI=your_mongodb_uri
# ... set all other env vars

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variable for backend API
vercel env add VITE_API_URL https://your-backend.herokuapp.com
```

---

## 📝 Project Structure

```
autonomise-3/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Cloudinary config
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Email service
│   │   ├── validations/     # Joi schemas
│   │   └── index.js         # Express app
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client services
│   │   ├── store/           # Redux state
│   │   ├── styles/          # Global CSS
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   └── package.json
│
└── postman_collection.json  # API testing
```

---

## 🎓 Learning Resources

- **Frontend**: React, Redux, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Security**: JWT, bcryptjs, CORS, Helmet
- **Email**: Nodemailer (Gmail/Mailtrap)
- **Storage**: Cloudinary API
- **Styling**: CSS Variables, Dark Mode

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support

For issues and questions:
- 📧 Email: support@autonomise.com
- 🐛 GitHub Issues: [Create issue]
- 💬 Discord: [Join server]

---

**Built with ❤️ using React, Node.js, and MongoDB**

Last Updated: February 3, 2026
#   T a s k M a n a g e m e n t  
 