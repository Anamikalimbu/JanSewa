# JanSewa – Smart Public Service Complaint Management System (Backend)

Production-ready Node.js/Express/MongoDB backend for a MERN-stack public
grievance redressal platform. Citizens can raise complaints against public
services; department officers manage and resolve them; admins get
platform-wide analytics.

## Tech Stack
- Node.js + Express.js (ES Modules)
- MongoDB + Mongoose
- JWT (Access + Refresh Token strategy)
- bcryptjs (password hashing)
- Multer + Cloudinary (image uploads)
- express-validator (input validation)
- cookie-parser, cors, helmet, express-mongo-sanitize, xss-clean, express-rate-limit

## Getting Started

```bash
cd server
npm install
cp .env.example .env    # then fill in real values
npm run dev              # nodemon, http://localhost:5000
```

Seed an initial admin + default departments:
```bash
node seeder.js       # import
node seeder.js -d    # destroy (except admin)
```
Default admin credentials after seeding: `admin@jansewa.gov.in` / `Admin@12345`
**Change this password immediately in any real deployment.**

## Folder Structure
```
server/
├── config/          # DB & Cloudinary configuration
├── controllers/      # Route handler logic (business logic)
├── middleware/        # Auth, role, upload, validation, error handling
├── models/            # Mongoose schemas
├── routes/            # Express routers
├── utils/              # Reusable helpers (tokens, responses, query features)
├── validators/         # express-validator rule chains
├── uploads/             # Temp local storage before Cloudinary push
├── app.js               # Express app & middleware pipeline
├── server.js             # Entry point / DB bootstrap
└── seeder.js               # Initial data seeding script
```

## Authentication Flow
- **Access token**: short-lived JWT (15m default), returned in the JSON body,
  meant to be stored in memory on the client and sent as
  `Authorization: Bearer <token>`.
- **Refresh token**: long-lived JWT (7d default), stored in an `HttpOnly`,
  `Secure` cookie scoped to `/api/v1/auth`. Used to silently mint new access
  tokens via `POST /api/v1/auth/refresh-token`.

## Roles
| Role     | Capabilities                                                            |
|----------|---------------------------------------------------------------------------|
| citizen  | Register, file/edit/delete own complaints, track status, upvote           |
| officer  | View/manage complaints of their department, update status                |
| admin    | Full access: users, departments, all complaints, dashboard analytics     |

## API Reference (base URL: `/api/v1`)

### Auth — `/auth`
| Method | Endpoint                  | Access  | Description                     |
|--------|----------------------------|---------|----------------------------------|
| POST   | /register                  | Public  | Register citizen/officer         |
| POST   | /login                     | Public  | Login, issue tokens              |
| POST   | /logout                    | Private | Clear refresh cookie             |
| POST   | /refresh-token              | Public  | Rotate access token via cookie   |
| POST   | /forgot-password             | Public  | Email password reset link        |
| PATCH  | /reset-password/:token        | Public  | Reset password with token         |
| PATCH  | /change-password               | Private | Change password (logged in)       |
| GET    | /me                              | Private | Get own profile                    |
| PATCH  | /update-profile                    | Private | Update name/phone/address           |

### Users — `/users`
| Method | Endpoint            | Access        | Description                  |
|--------|-----------------------|----------------|--------------------------------|
| PATCH  | /avatar                | Private        | Upload/update avatar (Cloudinary) |
| GET    | /officers/list           | Officer, Admin | List officers (assignment dropdown)|
| GET    | /                          | Admin          | List all users (search/filter/paginate) |
| GET    | /:id                         | Admin          | Get user by ID                |
| PATCH  | /:id                           | Admin          | Update role/status/department  |
| DELETE | /:id                             | Admin          | Deactivate user                 |

### Complaints — `/complaints`
| Method | Endpoint               | Access          | Description                          |
|--------|--------------------------|------------------|-----------------------------------------|
| POST   | /                          | Citizen          | Create complaint (multipart, up to 5 images) |
| GET    | /                            | Any (scoped)     | List complaints (search/filter/sort/paginate) |
| GET    | /:id                           | Any (scoped)     | Get complaint detail                    |
| PATCH  | /:id                             | Owner/Admin      | Edit complaint (while Pending)          |
| DELETE | /:id                               | Owner/Admin      | Soft-delete complaint                   |
| PATCH  | /:id/status                          | Officer, Admin   | Update status (+ audit trail entry)     |
| PATCH  | /:id/assign                            | Admin            | Assign an officer                       |
| GET    | /:id/history                             | Any (scoped)     | Full status history / audit trail       |
| DELETE | /:id/images/:imageId                       | Owner/Admin      | Remove a single image                   |
| PATCH  | /:id/upvote                                  | Citizen          | Toggle upvote on a complaint             |

**Query params supported on `GET /complaints`:**
`?keyword=pothole&status=Pending&priority=High&category=Roads&sort=-createdAt&page=1&limit=10`

### Admin Dashboard — `/admin`
| Method | Endpoint                          | Access | Description                        |
|--------|--------------------------------------|--------|---------------------------------------|
| GET    | /departments                          | Any    | List all departments                  |
| POST   | /departments                             | Admin  | Create department                     |
| PATCH  | /departments/:id                           | Admin  | Update department                     |
| DELETE | /departments/:id                             | Admin  | Deactivate department                 |
| GET    | /dashboard/summary                             | Admin  | Total users/complaints/status counts   |
| GET    | /dashboard/analytics                             | Admin  | Status/priority distribution, avg resolution time |
| GET    | /dashboard/monthly-report?year=2026                | Admin  | Month-wise complaint report            |
| GET    | /dashboard/category-stats                            | Admin  | Stats grouped by category              |
| GET    | /dashboard/department-stats                            | Admin  | Stats grouped by department            |

### Notifications — `/notifications`
| Method | Endpoint        | Access | Description                    |
|--------|-------------------|--------|-----------------------------------|
| GET    | /                  | Private| Get own notifications (paginated)  |
| POST   | /                    | Admin  | Manually create a notification      |
| PATCH  | /read-all               | Private| Mark all as read                    |
| PATCH  | /:id/read                 | Private| Mark one as read                     |
| DELETE | /:id                         | Private| Delete a notification                 |

## Complaint Status Lifecycle
```
Pending → Under Review → In Progress → Resolved
                                  ↘ Rejected
```
Every transition is appended to `statusHistory` with the acting user,
timestamp, and optional remarks — giving citizens full transparency.

## Security Measures
- Passwords hashed with bcrypt (cost factor 12)
- JWT access/refresh token rotation
- HttpOnly, Secure, SameSite cookies for refresh tokens
- Helmet security headers
- express-mongo-sanitize (NoSQL injection protection)
- xss-clean (input sanitization)
- express-rate-limit (brute-force / DoS mitigation)
- Centralized error handler (no stack traces leaked in production)
- Role-based route authorization on every sensitive endpoint

## License
MIT
