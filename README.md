# 🎓 InternFlow — Internship Management System

A full-stack MERN application for managing internships, connecting students with employers, and allowing admins to oversee the entire process.

🌐 **Live Demo:** [https://internship-management-58nh.onrender.com](https://internship-management-58nh.onrender.com)

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Demo Credentials](#demo-credentials)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)

---

## 📖 About the Project

InternFlow is a platform that streamlines the internship application process. Students can browse and apply for internships, employers can post listings and manage applications, and admins can oversee and approve all user accounts and activities.

---

## ✨ Features

### 👨‍🎓 Students
- Register and create a profile
- Upload resume (PDF)
- Browse internship listings
- Apply for internships
- Track application status

### 🏢 Employers
- Register company profile
- Post internship listings
- Review and manage applications
- Approve or reject student applications

### 🛡️ Admin
- Approve or reject user registrations
- Manage all users (students & employers)
- Oversee all internship listings
- Full platform control

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **File Uploads** | Multer |
| **Email** | Nodemailer |
| **Deployment** | Render (full stack), MongoDB Atlas |

---

## 📁 Project Structure

```
internship-management-mern/
├── client/                     # React frontend
│   ├── public/
│   │   └── _redirects          # Netlify redirect rules
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ...
│   │   ├── components/
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js             # JWT middleware
│   │   └── upload.js           # Multer file upload
│   ├── models/
│   │   └── User.js             # Mongoose models
│   ├── routes/
│   │   ├── auth.js             # Auth routes
│   │   ├── users.js            # User routes
│   │   ├── internships.js      # Internship routes
│   │   ├── applications.js     # Application routes
│   │   ├── admin.js            # Admin routes
│   │   └── employer.js         # Employer routes
│   ├── scripts/
│   │   ├── seed.js             # Demo data seeder
│   │   ├── seedAdmin.js        # Admin seeder
│   │   ├── createUser.js       # Create user script
│   │   ├── updateUser.js       # Update user script
│   │   └── deleteUser.js       # Delete user script
│   ├── uploads/                # Uploaded resumes
│   ├── index.js                # Entry point
│   ├── .env                    # Environment variables
│   └── package.json
│
├── package.json                # Root package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/gagan191104/internship-management-mern.git
cd internship-management-mern
```

2. **Install backend dependencies:**
```bash
cd server
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../client
npm install
```

4. **Set up environment variables:**

Create a `.env` file inside the `server/` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/internship_management
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

5. **Seed the database:**
```bash
cd server
npm run seed:admin
npm run seed
```

6. **Run the backend:**
```bash
cd server
npm run dev
```

7. **Run the frontend (in a new terminal):**
```bash
cd client
npm run dev
```

8. **Open in browser:**
```
http://localhost:5173
```

---

## 🔐 Environment Variables

### `server/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/internship_management` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_random_secret` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |
| `ADMIN_EMAIL` | Admin email for seeding | `admin@internhub.com` |
| `ADMIN_PASSWORD` | Admin password for seeding | `StrongPass@123` |
| `EMAIL_USER` | Gmail address for emails | `your@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `your_app_password` |

### `client/.env` (optional)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (leave empty for local proxy) |

---

## 📜 Available Scripts

### Backend (`server/`)

| Script | Description |
|---|---|
| `npm run dev` | Start server with nodemon (development) |
| `npm start` | Start server with node (production) |
| `npm run seed` | Seed demo users and internships |
| `npm run seed:admin` | Seed admin account |
| `npm run create-user` | Create a user via CLI |
| `npm run update-user` | Update a user via CLI |
| `npm run delete-user` | Delete a user via CLI |

### Frontend (`client/`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@demo.com | demo1234 |
| **Student** | student@demo.com | demo1234 |
| **Employer** | employer@demo.com | demo1234 |
| **Admin (Production)** | admin@internhub.com | StrongPass@123 |

---

## ☁️ Deployment

This project is deployed as a **single service on Render** where the Express backend serves the React frontend.

### Steps to Deploy on Render:

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repository
4. Use these settings:

| Setting | Value |
|---|---|
| **Root Directory** | *(leave blank)* |
| **Build Command** | `npm run build && cd server && npm install` |
| **Start Command** | `cd server && node index.js` |

5. Add all environment variables from `server/.env`
6. Click **Deploy**

### Auto-Deploy

Every `git push` to the `main` branch automatically triggers a new deployment on Render.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |

### Internships
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/internships` | Get all internships |
| POST | `/api/internships` | Create internship (employer) |
| GET | `/api/internships/:id` | Get single internship |
| PUT | `/api/internships/:id` | Update internship |
| DELETE | `/api/internships/:id` | Delete internship |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/applications` | Apply for internship |
| GET | `/api/applications` | Get user applications |
| PUT | `/api/applications/:id` | Update application status |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id` | Approve/reject user |

### Health Check
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check if API is running |

---

## 👨‍💻 Author

**Gagan CV**
- GitHub: [@gagan191104](https://github.com/gagan191104)

---

## 📄 License

This project is licensed under the MIT License.
