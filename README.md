# HireSmart – AI-Powered Job Portal (MERN)

Three roles (Job Seeker, Recruiter, Admin), JWT auth, job CRUD with search/filter/pagination, PDF resume uploads to Cloudinary, AI resume analysis with Google Gemini, real-time notifications with Socket.io, MongoDB aggregation dashboards, and a responsive Tailwind UI.

## 1. Prerequisites
- Node.js 18+ (uses built-in `fetch`)
- MongoDB running locally, or a MongoDB Atlas URI
- Cloudinary account (free) – for resume and image uploads
- Google Gemini API key (free tier works) – https://aistudio.google.com/apikey
- (Optional) SMTP account for emails

## 2. Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env        # then fill in values (see below)
npm run seed                # demo data + admin account (WIPES the database)
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

Use `npm run seed:admin` instead of `seed` if you only want the admin account and no demo data.

### Required `.env` values (backend)
| Key | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `CLIENT_URL` | Frontend origin(s) for CORS, comma separated |
| `CLOUDINARY_*` | Cloud name, API key, API secret |
| `GEMINI_API_KEY` | Server-side only. Never in the frontend |
| `GEMINI_MODEL` | Defaults to `gemini-2.5-flash` |
| `SMTP_*`, `MAIL_FROM` | Optional. Leave `SMTP_HOST` empty to disable emails |

> **Cloudinary + PDFs:** in Cloudinary *Settings → Security*, enable **"Allow delivery of PDF and ZIP files"**. Without it, recruiters cannot open resumes and Gemini cannot download them.

## 3. Demo accounts (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | `admin@hiresmart.com` | `Admin@12345` (from `.env`) – log in at `/admin/login` |
| Recruiter | `recruiter1@hiresmart.com` | `Password@123` |
| Job seeker | `seeker1@hiresmart.com` | `Password@123` |

Seeded job seekers have a placeholder resume URL so you can test applying. **Upload a real PDF** on *My Resume* before using the AI analyzer.

## 4. Project structure
```
backend/
  config/       db + cloudinary setup
  controllers/  request handlers (auth, user, job, application, notification, ai, dashboard, admin, contact)
  middleware/   auth (protect/authorize), error, validate, validators, sanitize, upload
  models/       User, Job, Application, Notification, ResumeAnalysis, ContactMessage
  routes/       REST routes
  services/     cloudinary, gemini, email, notification
  socket/       Socket.io server (JWT-authenticated, per-user rooms)
  utils/        ApiError, asyncHandler, helpers, cascade delete, seed
  uploads/      intentionally empty (files stream to Cloudinary from memory)
frontend/src/
  components/ context/ hooks/ layouts/ pages/ routes/ services/ utils/
```

## 5. API overview
| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/admin/login`; `GET /me`; `PUT /password` |
| Users | `PUT /api/users/profile`, `POST /avatar`, `POST/DELETE /resume`, `PUT /preferences`, `DELETE /me` |
| Jobs | `GET /api/jobs` (search, filters, pagination), `GET /stats`, `GET /:id`, `GET /mine/list`, `POST`, `PUT /:id`, `DELETE /:id` |
| Applications | `POST /api/applications/:jobId`, `GET /mine`, `GET /recruiter`, `PATCH /:id/status`, `DELETE /:id` |
| Notifications | `GET /api/notifications`, `PATCH /read-all`, `PATCH /:id/read`, `DELETE /:id` |
| AI | `POST /api/ai/analyze`, `GET /api/ai/history` |
| Dashboards | `GET /api/dashboard/seeker`, `/recruiter`, `/admin` (aggregation pipelines) |
| Admin | `GET/PATCH/DELETE /api/admin/users`, `/jobs`, `GET /applications` |

Job search query params: `q, location, category, jobType, experienceLevel, minSalary, maxSalary, sort, page, limit`.

## 6. Key design decisions (interview prep)

**Authentication & authorization.** Passwords are hashed with bcryptjs (cost 12) in a Mongoose `pre('save')` hook. Login returns a JWT; the `protect` middleware verifies it, loads the user and rejects deactivated accounts on every request. `authorize(...roles)` implements RBAC. Admins cannot self-register (the `role` validator only allows `jobseeker`/`recruiter`), and login errors use one generic message to prevent account enumeration. The frontend `ProtectedRoute` is only UX; the API enforces everything.

**Ownership checks.** A recruiter can only edit/delete their own jobs and change status only on applications where `application.recruiter === req.user._id`. This prevents IDOR attacks, where a user changes an id in the URL.

**Duplicate applications.** A unique compound index `{ applicant, job }` guarantees one application per candidate per job at the database level; the controller's pre-check just gives a friendlier error. This is race-condition safe.

**Application history.** Each status change pushes `{status, changedBy, note, changedAt}` into `statusHistory`, which powers the tracking timeline.

**File uploads.** Multer uses `memoryStorage` and streams to Cloudinary, so the server stays stateless. We validate the mimetype, extension, size limit, and the file's magic bytes (`%PDF-`, JPEG/PNG/WEBP signatures) because mimetypes are client-controlled.

**AI analysis.** The server downloads the resume, sends the PDF to Gemini as `inlineData` with a strict JSON schema prompt, clamps and sanitises the response, and stores it in `ResumeAnalysis`. The key never reaches the browser, and the endpoint is rate-limited (20/hour) to control cost.

**Real-time notifications.** Socket.io authenticates the handshake with the same JWT and puts each socket into a `user:<id>` room. `notify()` first saves a `Notification` document (history) and then emits to that room, so every open tab receives it.

**Aggregation pipelines.** Dashboards use `$match → $group` (counts by status), `$group` on `$year/$month` for trends (gaps filled in JS), and `$lookup/$unwind/$project` for "most applied jobs".

**Security hardening.** Helmet, CORS allow-list, rate limiting on auth and contact, body size limit, `express-validator` on inputs, a sanitizer that strips `$` and `.` keys (NoSQL injection), regex escaping in search, whitelisted profile fields (no mass assignment), centralised error handler that hides stack traces in production.

**Frontend.** Vite + React Router with lazy-loaded routes, Context API for auth/toasts/notifications, a `useFetch` hook with stale-request protection, URL-driven search state (shareable and refresh-safe), SVG charts with no chart library, skeleton loaders, empty/error states and confirmation modals for destructive actions.

## 7. Production notes
- Set `NODE_ENV=production`, a strong `JWT_SECRET`, and exact `CLIENT_URL` origins.
- Frontend: `npm run build` and serve `dist/`; set `VITE_API_URL` / `VITE_SOCKET_URL` to your API host.
- The seed script deletes data. Never run it against production.
