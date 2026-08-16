# JanSewa - AI-Powered Public Service Complaint Management Platform

An intelligent complaint management system powered by AI (Google Gemini) that helps citizens report and track public service issues efficiently. JanSewa is a full-stack MERN application designed for streamlined complaint resolution.

---

## ✨ Features

- **AI-Powered Assistance**: Google Gemini AI integration for intelligent complaint analysis
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Complaint Management**: Create, track, and manage complaints with real-time status updates
- **Department-Specific Routing**: Route complaints to appropriate departments
- **Image Upload**: Upload complaint-related images via Cloudinary
- **Location Tracking**: Integrated maps with Leaflet for complaint location
- **Multi-language Support**: Support for multiple languages via context API
- **Email Notifications**: Email alerts for complaint updates via Nodemailer
- **Admin Dashboard**: Comprehensive admin dashboard for system management
- **Chat Widget**: AI-powered chat support for users
- **Rate Limiting**: Protection against abuse with express-rate-limit

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 16.x or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | 8.x or higher | Comes with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **MongoDB** | 5.x or higher | [mongodb.com](https://www.mongodb.com/try/download/community) |

### Required Accounts & API Keys

You'll need to create accounts and obtain the following API keys:

1. **MongoDB Atlas** (Cloud Database)
   - Sign up at [mongodb.com/cloud](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and get connection string

2. **Google Generative AI (Gemini)**
   - Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Cloudinary** (Image Upload)
   - Sign up at [cloudinary.com](https://cloudinary.com/)
   - Get Cloud Name, API Key, and API Secret

4. **Email Service** (Gmail or any SMTP provider)
   - Gmail: Enable App Passwords in Google Account settings
   - Or use any SMTP service credentials

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
# Clone the repository from GitHub
git clone https://github.com/Divya-Bhandari/jansewa.git

# Navigate to the project directory
cd jansewa
```

### Step 2: Verify Installation Requirements

Check if Node.js and npm are properly installed:

```bash
# Check Node.js version (should be 16.x or higher)
node --version

# Check npm version (should be 8.x or higher)
npm --version

# Check Git version
git --version
```

### Step 3: Install Dependencies

Install dependencies for both client and server:

```bash
# Install dependencies for both client and server at once
npm run install:all

# OR install them separately
# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### Step 4: MongoDB Setup

#### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Edition**
   - Windows: Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow official MongoDB installation guide

2. **Start MongoDB Service**
   ```bash
   # Windows (run as Administrator)
   mongod

   # macOS/Linux
   brew services start mongodb-community
   # or
   mongod
   ```

3. **Verify MongoDB is Running**
   ```bash
   # Connect to MongoDB shell
   mongosh
   # or for older versions
   mongo
   ```

#### Option B: MongoDB Atlas (Cloud Database)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project and cluster
3. Create a database user with username and password
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
5. Use this connection string in your `.env` file

---

## ⚙️ Environment Configuration

### Create Environment Variables Files

#### Step 1: Server Environment Variables

Create `.env` file in the `server` directory:

```bash
# server/.env

# Application Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/jansewa
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jansewa?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Google Generative AI (Gemini)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Gmail Example)
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM_EMAIL=noreply@jansewa.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Step 2: Client Environment Variables

Create `.env` file in the `client` directory:

```bash
# client/.env

# API Configuration
VITE_API_URL=http://localhost:5000/api
```

### Important Notes:

- **Never commit `.env` files** to version control
- `JWT_SECRET` should be a strong, random string in production
- Get your actual API keys from the respective services
- Keep sensitive information secure

---

## 🏃 Running the Application

### Option 1: Run Both Client and Server (Recommended for Development)

#### Terminal Method:

```bash
# Terminal 1: Start Backend Server (from project root)
npm run dev:server

# Terminal 2: Start Frontend Client (from project root)
npm run dev:client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

#### Watch for Success Messages:

**Backend Success Indicators:**
```
Server running on http://localhost:5000
Connected to MongoDB
```

**Frontend Success Indicators:**
```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Option 2: Production Build & Run

```bash
# Build the frontend for production
npm run build:client

# Start the backend server in production mode
NODE_ENV=production npm start --prefix server
```

### Option 3: Run Only Backend (for API Testing)

```bash
# Start only the backend server
npm run dev:server

# The API will be available at http://localhost:5000/api
```

### Option 4: Run Only Frontend (if Backend Already Running)

```bash
# Start only the frontend client
npm run dev:client

# Access at http://localhost:5173
```

---

## 📂 Project Structure

```
jansewa/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── cards/               # Card components
│   │   │   ├── common/              # Common components (Navbar, Illustrations)
│   │   │   ├── forms/               # Form components
│   │   │   ├── layout/              # Layout components
│   │   │   └── ui/                  # UI components (Charts, etc.)
│   │   ├── pages/                   # Page components
│   │   │   ├── Admin/               # Admin dashboard pages
│   │   │   ├── Complaints/          # Complaint-related pages
│   │   │   ├── Dashboard/           # User dashboard
│   │   │   ├── Home/                # Home page
│   │   │   ├── Login/               # Login page
│   │   │   ├── Register/            # Registration page
│   │   │   ├── Profile/             # User profile
│   │   │   └── NotFound/            # 404 page
│   │   ├── services/                # API service files
│   │   │   ├── api.js               # Axios instance configuration
│   │   │   ├── adminService.js      # Admin API calls
│   │   │   ├── complaintService.js  # Complaint API calls
│   │   │   ├── userService.js       # User API calls
│   │   │   └── ...                  # Other services
│   │   ├── context/                 # React Context for state management
│   │   │   ├── AuthContext.jsx      # Authentication context
│   │   │   └── LanguageContext.jsx  # Language context
│   │   ├── routes/                  # Route definitions
│   │   │   └── AppRouter.jsx        # Main router
│   │   ├── layouts/                 # Layout components
│   │   ├── utils/                   # Utility functions
│   │   ├── constants/               # Constants
│   │   ├── App.jsx                  # Main App component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── public/                      # Static assets
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   └── postcss.config.js            # PostCSS configuration
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── controllers/             # Route controllers
│   │   │   ├── authController.js    # Auth logic
│   │   │   ├── complaintController.js
│   │   │   ├── userController.js    # User management
│   │   │   └── ...                  # Other controllers
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.js              # User schema
│   │   │   ├── Complaint.js         # Complaint schema
│   │   │   ├── Department.js        # Department schema
│   │   │   └── ...
│   │   ├── routes/                  # API routes
│   │   │   ├── authRoutes.js        # Auth endpoints
│   │   │   ├── complaintRoutes.js   # Complaint endpoints
│   │   │   └── ...
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js              # Authentication middleware
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   ├── uploadMiddleware.js  # File upload middleware
│   │   │   └── ...
│   │   ├── config/                  # Configuration files
│   │   │   ├── db.js                # Database connection
│   │   │   └── cloudinary.js        # Cloudinary setup
│   │   ├── utils/                   # Utility functions
│   │   │   ├── apiResponse.js       # Response formatter
│   │   │   ├── asyncHandler.js      # Async error handler
│   │   │   ├── sendEmail.js         # Email sender
│   │   │   └── ...
│   │   ├── validators/              # Input validation
│   │   ├── constants/               # Constants
│   │   ├── scripts/                 # Seed scripts
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Server entry point
│   ├── uploads/                     # Local upload directory
│   ├── package.json                 # Backend dependencies
│   └── .env                         # Environment variables (not in git)
│
├── package.json                     # Root package.json
├── README.md                        # This file
└── .gitignore                       # Git ignore rules
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-----------------|
| POST | `/auth/register` | Register a new user | ❌ No |
| POST | `/auth/login` | Login user | ❌ No |
| POST | `/auth/logout` | Logout user | ✅ Yes |
| POST | `/auth/refresh` | Refresh JWT token | ✅ Yes |

### User Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-----------------|
| GET | `/users/profile` | Get user profile | ✅ Yes |
| PUT | `/users/profile` | Update user profile | ✅ Yes |
| GET | `/users/:id` | Get user by ID | ✅ Yes |

### Complaint Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-----------------|
| GET | `/complaints` | List all complaints | ✅ Yes |
| POST | `/complaints` | Create new complaint | ✅ Yes |
| GET | `/complaints/:id` | Get complaint details | ✅ Yes |
| PUT | `/complaints/:id` | Update complaint | ✅ Yes |
| DELETE | `/complaints/:id` | Delete complaint | ✅ Yes |

### Department Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-----------------|
| GET | `/departments` | List all departments | ❌ No |
| GET | `/departments/:id` | Get department details | ❌ No |

### Admin Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-----------------|
| GET | `/admin/dashboard` | Admin dashboard stats | ✅ Yes (Admin) |
| GET | `/admin/users` | List all users | ✅ Yes (Admin) |
| GET | `/admin/complaints` | List all complaints | ✅ Yes (Admin) |

### Notification Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-----------------|
| GET | `/notifications` | Get user notifications | ✅ Yes |
| POST | `/notifications/:id/read` | Mark as read | ✅ Yes |

### Chat Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-----------------|
| POST | `/chat` | Send chat message to AI | ✅ Yes |

---

## 🛠️ Technologies Used

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.7 | UI library |
| **Vite** | 5.4.21 | Build tool & dev server |
| **React Router** | 7.17.0 | Client-side routing |
| **Axios** | 1.17.0 | HTTP client |
| **Tailwind CSS** | 3.4.4 | Styling |
| **Leaflet** | 1.9.4 | Maps integration |
| **React Leaflet** | 5.0.0 | React wrapper for Leaflet |

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 16+ | Runtime environment |
| **Express** | 5.2.1 | Web framework |
| **MongoDB** | 5.0+ | Database |
| **Mongoose** | 9.7.4 | ODM for MongoDB |
| **JWT** | 9.0.3 | Authentication |
| **Bcryptjs** | 3.0.3 | Password hashing |
| **Google Generative AI** | 0.24.1 | AI integration (Gemini) |
| **Cloudinary** | 2.10.0 | Image hosting |
| **Nodemailer** | 9.0.3 | Email service |
| **Multer** | 2.2.0 | File uploads |
| **Helmet** | 8.2.0 | Security headers |
| **CORS** | 2.8.6 | Cross-origin requests |
| **Morgan** | 1.11.0 | HTTP logging |
| **Nodemon** | 3.1.14 | Development auto-reload |

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules server/node_modules client/node_modules
npm run install:all
```

### Issue: MongoDB Connection Error

**Error:** `MongooseError: Cannot connect to MongoDB`

**Solutions:**
1. Ensure MongoDB is running:
   ```bash
   # Check if MongoDB is running
   ps aux | grep mongod  # macOS/Linux
   # or
   tasklist | findstr mongod  # Windows
   ```

2. Verify connection string in `.env`:
   - Local: `mongodb://localhost:27017/jansewa`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/jansewa`

3. Check if port 27017 is accessible (local) or network access is enabled (Atlas)

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000 and kill it
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows (PowerShell as Admin)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### Issue: API Key Errors (Gemini, Cloudinary)

**Error:** `Invalid API Key` or `Authentication failed`

**Solutions:**
1. Verify API keys in `.env` file are correct (no extra spaces)
2. Ensure API keys haven't expired
3. Check API quotas and rate limits
4. Regenerate API keys if needed

### Issue: CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
1. Verify `FRONTEND_URL` in server `.env` matches frontend URL
2. Check CORS middleware configuration in `server/src/app.js`
3. Ensure backend is running on correct port

### Issue: Email Not Sending

**Error:** `Error sending email` or `SMTP connection failed`

**Solutions:**
1. For Gmail:
   - Enable 2-factor authentication
   - Generate App-Specific Password
   - Use app password in `.env`, not regular password

2. Verify SMTP settings:
   ```bash
   SMTP_SERVICE=gmail
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-specific-password
   ```

3. Check firewall/antivirus isn't blocking SMTP

### Issue: Frontend Not Loading

**Error:** `Vite is not starting` or `Port 5173 already in use`

**Solutions:**
```bash
# Kill process on port 5173
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows (PowerShell as Admin)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Then restart
npm run dev:client
```

### Issue: Node Modules Installation Fails

**Error:** `npm ERR! code ERESOLVE` or `npm ERR! ERESOLVE unable to resolve dependency tree`

**Solution:**
```bash
# Try with legacy peer deps flag
npm install --legacy-peer-deps --prefix server
npm install --legacy-peer-deps --prefix client
```

---

## 📝 Additional Commands

### Development Scripts

```bash
# Install all dependencies
npm run install:all

# Start client development server
npm run dev:client

# Start server development server
npm run dev:server

# Build client for production
npm run build:client

# Start server in production
npm start --prefix server

# Lint client code
npm run lint --prefix client

# Lint server code
npm run lint --prefix server

# Seed admin user (backend only)
npm run seed:admin --prefix server
```

### Database Management

```bash
# Access MongoDB shell (local)
mongosh
# or
mongo

# Common MongoDB commands
use jansewa                    # Switch to database
db.users.find()               # List all users
db.complaints.find()          # List all complaints
db.dropDatabase()             # Drop entire database
```

---

## 🚀 Deployment Guide

### Deploy Backend to Heroku

```bash
# Install Heroku CLI
# Create Heroku account at heroku.com

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production --app your-app-name
heroku config:set JWT_SECRET=your_secret --app your-app-name
# ... set other env variables

# Deploy
git push heroku main
```

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from client directory
cd client
vercel
```
---

## ✅ Quick Start Checklist

- [ ] Node.js (16+) and npm (8+) installed
- [ ] Git installed
- [ ] MongoDB installed or Atlas account created
- [ ] Google Gemini API key obtained
- [ ] Cloudinary account created
- [ ] Repository cloned
- [ ] Dependencies installed (`npm run install:all`)
- [ ] Environment variables configured (`.env` files created)
- [ ] MongoDB running (local or Atlas)
- [ ] Backend running (`npm run dev:server`)
- [ ] Frontend running (`npm run dev:client`)
- [ ] Application accessible at http://localhost:5173

---

**Happy coding! 🎉**

If you found this helpful, please star ⭐ the repository and share with others!
