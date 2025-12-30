# Task Management System

A full-stack MERN Task Management application with multiple views, collaboration features, and a professional UI using shadcn/ui with the Vintage Paper theme.

## 🚀 Features

### ✅ Completed Features

- **User Authentication**
  - Register & Login with JWT
  - Protected routes
  - Secure password hashing

- **Task Management (CRUD)**
  - Create tasks with title, description, due date, and priority
  - Edit task details
  - Delete tasks with confirmation dialog
  - Update task status (pending, in-progress, completed)
  - Update task priority (low, medium, high, urgent)
  - Color-coded priority system

- **Multiple Views**
  - **List View** - Paginated list with all task details
  - **Calendar View** - Monthly calendar with tasks on due dates
  - **Timeline View** - Chronological timeline grouped by date

- **Collaboration**
  - Assign tasks to multiple users
  - Search users by email
  - View assigned users on tasks
  - Only task creator can delete tasks

- **UI/UX**
  - Professional landing page with animations
  - Responsive design (mobile-first)
  - Vintage Paper theme from shadcn/ui
  - Micro-interactions using Framer Motion
  - Toast notifications for feedback
  - Loading states and skeletons

## 📦 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Build tool
- **TailwindCSS v4** - Styling
- **shadcn/ui** - Component library (Vintage Paper theme)
- **React Router** - Routing
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **React Hook Form + Zod** - Form validation
- **Framer Motion** - Animations
- **date-fns** - Date utilities
- **Lucide React** - Icons
- **Axios** - API client

### Backend
- **Node.js** with **Bun** runtime
- **Express** - Web framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin requests

## 🛠️ Installation & Setup

### Prerequisites
- [Bun](https://bun.sh/) installed
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

```bash
cd backend

# Dependencies are already installed
# Environment variables are set in .env

# Start the backend server
bun run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Dependencies are already installed
# Environment variable is set in .env

# Start the frontend dev server
bun run dev
```

Frontend runs on: `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (with pagination & filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/priority` - Update task priority

### Users/Collaboration
- `GET /api/users/search?email=` - Search users by email
- `POST /api/users/tasks/:id/assign` - Assign user to task
- `DELETE /api/users/tasks/:id/assign/:userId` - Remove user from task

## 🎨 Color-Coded Priorities

- **Low**: Green (#22c55e)
- **Medium**: Yellow (#eab308)
- **High**: Orange (#f97316)
- **Urgent**: Red (#ef4444)

## 📂 Project Structure

```
magnet-brains/
├── backend/
│   ├── config/
│   │   └── db.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── taskController.ts
│   │   └── userController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── Task.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   └── users.ts
│   ├── .env
│   ├── server.ts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/ (shadcn components)
    │   │   ├── layout/
    │   │   │   └── DashboardLayout.tsx
    │   │   ├── views/
    │   │   │   ├── TasksView.tsx
    │   │   │   ├── ListView.tsx
    │   │   │   ├── CalendarView.tsx
    │   │   │   └── TimelineView.tsx
    │   │   └── tasks/
    │   │       ├── CreateTaskDialog.tsx
    │   │       ├── TaskDetailSheet.tsx
    │   │       └── DeleteTaskDialog.tsx
    │   ├── pages/
    │   │   ├── Landing.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   └── Dashboard.tsx
    │   ├── stores/
    │   │   └── authStore.ts
    │   ├── lib/
    │   │   ├── api.ts
    │   │   └── utils.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env
    └── package.json
```

## 🔐 Environment Variables

### Backend (.env)
```
PORT=7001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🚦 Current Status

✅ **Backend**: Fully implemented and running
✅ **Frontend**: All core features implemented
✅ **Authentication**: Working with JWT
✅ **Task CRUD**: All operations functional
✅ **Multiple Views**: List, Calendar, Timeline all working
✅ **UI/UX**: Professional design with Vintage Paper theme

## 📱 Usage

1. **Visit the landing page** at `http://localhost:5173`
2. **Register** a new account
3. **Login** with your credentials
4. **Create tasks** from the dashboard
5. **Switch views** using the tabs (List/Calendar/Timeline)
6. **Update status** and **priority** directly from task details
7. **Delete tasks** with confirmation

## 🎯 Next Steps (Optional Enhancements)

- [ ] Add drag & drop for Kanban board view
- [ ] Real-time updates with WebSockets
- [ ] Task comments and activity log
- [ ] Email notifications
- [ ] File attachments
- [ ] Task templates
- [ ] Export tasks to CSV/PDF
- [ ] Dark mode toggle
- [ ] Advanced filtering and sorting
- [ ] Task dependencies

## 📄 License

MIT

---

**Built with ❤️ using MERN Stack + shadcn/ui**
