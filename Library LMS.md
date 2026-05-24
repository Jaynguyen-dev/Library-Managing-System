# Library Management System — Implementation Blueprint

> **SE104 — Introduction to Software Engineering**
> Master Engineering Specification • Production Architecture Guide
> Development Roadmap • AI-Agent Implementation Reference

| Field | Detail |
|---|---|
| Project | Library Management System (LMS) |
| Course | SE104 — Nhập môn Công nghệ Phần mềm |
| Architecture | Monolithic Web Application |
| Team Size | 5 members (T1–T5) |
| Duration | 2 weeks (14 days) |
| Stack | React + Node.js/Express + Microsoft SQL Server/PostgreSQL + Prisma |
| Document Version | v2.0 — Web Crawling & Extended DB Design Added |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Frontend System Design](#4-frontend-system-design)
5. [Backend System Design](#5-backend-system-design)
6. [Database Design](#6-database-design)
7. [Web Crawling & Data Ingestion](#7-web-crawling--data-ingestion)
8. [UX Workflow & User Journeys](#8-ux-workflow--user-journeys)
9. [Security Design](#9-security-design)
10. [DevOps & Deployment](#10-devops--deployment)
11. [Testing Strategy](#11-testing-strategy)
12. [Scalability & Performance](#12-scalability--performance)
13. [Development Roadmap](#13-development-roadmap)
14. [AI Agent Execution Instructions](#14-ai-agent-execution-instructions)
15. [Final Recommendations & Best Practices](#15-final-recommendations--best-practices)

---

## 1. Project Overview

### 1.1 Project Summary

- **Project Name:** Library Management System (LMS)
- **Course:** SE104 — Introduction to Software Engineering
- **Team:** 5 students (T1: Backend/Auth Lead, T2: Backend Business Logic, T3: Frontend Lead, T4: Frontend Features, T5: QA/Docs/Integration)
- **Timeline:** 2 weeks — Sprint-based delivery targeting a stable local demo

### 1.2 Core Objective

Build a monolithic web application that digitises the core workflows of a small library: account management with role-based access, catalogue management, borrow/return transactions, automatic fine calculation, and an operational dashboard. The system must be implementable, testable, and demo-able within 14 days by a five-person team.

### 1.3 Target Users

| Role | Description | Key Permissions |
|---|---|---|
| Admin | Super-user with full system control | Manage users, manage books, view all borrows/fines, view dashboard |
| Librarian | Day-to-day library operations staff | Manage books, create borrow records, confirm returns, view fines, view dashboard |
| Student | Library patron / end user | View catalogue, view own borrow history, view own fines |

### 1.4 Functional Requirements

| ID | Feature | Priority | Actor(s) |
|---|---|---|---|
| FR01 | User Registration — create account with name, email, password | High | Student |
| FR02 | User Login — authenticate via email/password; backend returns JWT | High | All |
| FR03 | Book CRUD — add, view, edit, soft-delete, search books | High | Admin, Librarian |
| FR04 | User CRUD — view, add/edit user info, lock/unlock accounts | High | Admin |
| FR05 | Create Borrow Record — select borrower + available book(s), set due date | High | Librarian |
| FR06 | Return Book — confirm return, update record status and return date | High | Librarian |
| FR07 | Fine Calculation — auto-compute fine = overdue days × 2,000 VND/day | High | System (auto) |
| FR08 | Borrow History — student views own records and fines | Medium | Student |
| FR09 | Dashboard — summary stats: total books, users, active borrows, overdue, unpaid fines | Medium | Admin, Librarian |

### 1.5 Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | All API endpoints respond within 500 ms on localhost; dashboard query < 1 s |
| Security | Passwords hashed with bcrypt (cost ≥ 10); JWT signed with secret; role-guard middleware on all protected routes |
| Usability | UI functional on 1280×720 laptop viewport; clear error messages; loading indicators on async actions |
| Reliability | Core borrow/return flow works without errors in a clean demo environment |
| Maintainability | Consistent folder structure, named exports, ESLint config, commented business logic |
| Portability | Runs on any machine with Node.js 18+ and Microsoft SQL Server 8 / PostgreSQL 15 installed |
| Scalability (future) | Stateless JWT design allows horizontal scaling; DB schema allows future index additions |

### 1.6 Out of Scope (Deliberately Excluded)

- Refresh token rotation / server-side session invalidation
- Cron jobs, email notifications, real-time notifications
- Reservation queue for waitlisted books
- Audit log / data change history
- CI/CD pipelines and mandatory Docker/cloud deployment
- Full unit test coverage (only critical path tests required)

---

## 2. System Architecture

### 2.1 Architecture Style: Monolithic Web Application

The system uses a classic three-tier monolithic architecture. All backend logic — auth, books, users, borrows, fines, dashboard — is housed inside a single Express application. The React SPA communicates with the backend exclusively via REST/JSON. A single relational database stores all persistent state.

> **Justification:** A monolith minimises infrastructure complexity for a 2-week student project while still demonstrating all core software engineering concepts (MVC separation, REST API design, DB normalisation, JWT auth, role-based access control). Microservices would add operational overhead with no benefit at this scale.

### 2.2 Layer Breakdown

| Layer | Technology | Role |
|---|---|---|
| Presentation | React 18 + Vite + TailwindCSS | Renders UI, handles forms, calls REST API, manages client-side auth state |
| Application | Express.js routes + controllers | Receives HTTP requests, validates input, delegates to services, returns JSON |
| Business Logic | Express service modules | Encapsulates borrow rules, fine calculation, availability checks, statistics queries |
| Data Access | Prisma ORM (or Sequelize) | Maps JS models to SQL tables; handles migrations and seeding |
| Database | Microsoft SQL Server 8 / PostgreSQL 15 | Persists users, books, borrow_records, borrow_items, fines |

### 2.3 High-Level Architecture Diagram

```
[Browser / React SPA]
      |  HTTP/JSON (REST)
      v
[Express.js API Server :3001]
  ├── /api/auth      (AuthController)
  ├── /api/books     (BookController)
  ├── /api/users     (UserController)
  ├── /api/borrows   (BorrowController)
  ├── /api/fines     (FineController)
  ├── /api/dashboard (DashboardController)
  └── /api/crawl     (CrawlController)  ← NEW
      |  Prisma / Sequelize
      v
[Microsoft SQL Server 8 / PostgreSQL 15]
  ├── users
  ├── books
  ├── book_metadata   ← NEW (populated by crawl pipeline)
  ├── borrow_records
  ├── borrow_items
  ├── fines
  └── crawl_logs      ← NEW

[CrawlService]  ← runs inside Express, triggered by Admin API
  ├── openLibraryCrawler  → https://openlibrary.org
  ├── googleBooksCrawler  → https://books.googleapis.com
  └── vinabookScraper     → https://vinabook.com (optional)
```

### 2.4 Request Lifecycle

| Step | Component | Action |
|---|---|---|
| 1 | Browser (React) | User action triggers axios call; JWT attached in Authorization header |
| 2 | Express Router | Matches route; passes to authMiddleware |
| 3 | authMiddleware | Verifies JWT signature; attaches req.user; checks role permission |
| 4 | Controller | Validates request body/params using express-validator |
| 5 | Service | Executes business logic (availability check, fine calc, etc.) |
| 6 | Prisma / ORM | Runs parameterised SQL query; returns typed result |
| 7 | Controller | Formats JSON response with consistent shape `{ success, data, message }` |
| 8 | Browser (React) | Updates UI state; shows success toast or error message |

### 2.5 Authentication Flow

```
POST /api/auth/login
  → validate email + password
  → find user by email
  → bcrypt.compare(password, hash)
  → jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "24h" })
  → return { token, user: { id, name, email, role } }

Subsequent requests:
  Authorization: Bearer <token>
  → authMiddleware decodes token
  → roleGuard checks req.user.role vs required roles
  → 401 if no token | 403 if wrong role
```

---

## 3. Technology Stack

### 3.1 Full Stack Selection Table

| Layer | Technology | Version | Purpose | Why Chosen | Alternative |
|---|---|---|---|---|---|
| Frontend Framework | React | 18.x | Component-based UI | Industry standard, large ecosystem, familiar to students | Vue 3 |
| Build Tool | Vite | 5.x | Dev server + HMR + bundler | Extremely fast cold start vs CRA; native ESM | CRA, Parcel |
| CSS/Styling | TailwindCSS | 3.x | Utility-first styling | No custom CSS needed; fast responsive prototyping | CSS Modules |
| HTTP Client | Axios | 1.x | REST API calls from React | Interceptors for auth headers; better error handling than fetch | fetch API |
| Frontend State | React Context + useState | built-in | Auth state, global UI | Sufficient for small app; no Redux overhead | Zustand, Redux |
| Backend Framework | Express.js | 4.x | REST API server | Minimal, widely documented, easy for students | Fastify, Koa |
| Runtime | Node.js | 18 LTS | JS server runtime | Same language as frontend; npm ecosystem | Deno, Bun |
| ORM | Prisma | 5.x | Database access + migrations | Type-safe, great DX, auto-generated client | Sequelize, raw SQL |
| Database | Microsoft SQL Server 8 / PostgreSQL 15 | latest | Primary data store | Team familiarity; both are relational and well-documented | SQLite (dev only) |
| Authentication | jsonwebtoken | 9.x | JWT sign/verify | Simple stateless auth; no session store needed | Passport.js |
| Password Hashing | bcrypt | 5.x | Secure password storage | Industry standard; built-in salt rounds | argon2 |
| Input Validation | express-validator | 7.x | Request validation | Chainable validators, well-documented | Joi, Zod |
| **HTTP Crawling** | **Axios (server-side)** | **1.x** | **Fetch data from Open Library & Google Books APIs** | **Same library already in use; lightweight for API calls** | **node-fetch, got** |
| **HTML Scraping** | **Cheerio** | **1.x** | **Parse HTML responses from book websites (optional)** | **jQuery-like API; no browser overhead; fast** | **Playwright, Puppeteer** |
| **Headless Browser** | **Playwright** | **latest** | **Scrape JS-rendered pages if Cheerio is insufficient** | **Reliable automation; supports Chromium/Firefox/WebKit** | **Puppeteer** |
| API Testing | Postman / Insomnia | latest | Manual API testing | Collection export for demo; easy to share | Thunder Client |
| Version Control | Git + GitHub | latest | Source control + collaboration | Industry standard; free for teams | GitLab |
| Dev Tooling | ESLint + Prettier | latest | Code quality & formatting | Consistent code style across 5 contributors | Biome |
| Package Manager | npm | 10.x | Dependency management | Default with Node.js; no extra install | yarn, pnpm |
| Environment Config | dotenv | 16.x | Env variable loading | De-facto standard for .env file support | cross-env |

### 3.2 Technology Integration Map

```
React (port 5173) → Axios (JWT interceptor) → Express (port 3001) → Prisma → Microsoft SQL Server/PostgreSQL
```

Environment variables stored in `server/.env`; never committed to Git. CORS configured to allow only `localhost:5173` in development.

---

## 4. Frontend System Design

### 4.1 Frontend Architecture

The frontend is a Single Page Application (SPA) built with React 18 and Vite. It uses React Router v6 for client-side navigation, React Context for global auth state, and Axios (with a pre-configured interceptor instance) for all API calls. TailwindCSS handles styling without any custom CSS files.

### 4.2 Folder Structure

```
client/
  src/
    assets/          # Static images, logos
    components/      # Reusable UI components
      common/        #   Button, Modal, Table, Input, Badge, Spinner
      layout/        #   Sidebar, Navbar, ProtectedRoute
    contexts/        # AuthContext (user, token, login, logout)
    hooks/           # useAuth(), useFetch(), useToast()
    pages/           # One folder per route
      auth/          #   LoginPage, RegisterPage
      dashboard/     #   DashboardPage
      books/         #   BookListPage, BookFormPage
      users/         #   UserListPage, UserFormPage
      borrows/       #   BorrowListPage, BorrowFormPage, ReturnPage
      fines/         #   FineListPage
      profile/       #   StudentHistoryPage
    services/        # api.js (axios instance) + endpoint wrappers
    utils/           # formatDate, formatCurrency, constants.js
    App.jsx          # Router definition
    main.jsx         # React root mount
  index.html
  vite.config.js
  tailwind.config.js
  .eslintrc.cjs
```

### 4.3 Routing & Access Control

React Router v6 is used with a `ProtectedRoute` wrapper component. Routes are grouped by required role. Unauthenticated users are redirected to `/login`.

| Path | Component | Allowed Roles |
|---|---|---|
| /login | LoginPage | Public |
| /register | RegisterPage | Public |
| /dashboard | DashboardPage | Admin, Librarian |
| /books | BookListPage | Admin, Librarian, Student (read-only) |
| /books/new | BookFormPage | Admin, Librarian |
| /books/:id/edit | BookFormPage | Admin, Librarian |
| /users | UserListPage | Admin |
| /users/new | UserFormPage | Admin |
| /borrows | BorrowListPage | Admin, Librarian |
| /borrows/new | BorrowFormPage | Librarian |
| /borrows/:id/return | ReturnPage | Librarian |
| /fines | FineListPage | Admin, Librarian |
| /profile/history | StudentHistoryPage | Student |

### 4.4 Auth State (Context)

```jsx
// contexts/AuthContext.jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("lms_token"));

  const login = (tokenStr, userData) => {
    localStorage.setItem("lms_token", tokenStr);
    setToken(tokenStr);
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem("lms_token");
    setToken(null); setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 4.5 Axios Instance

```js
// services/api.js
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001" });

api.interceptors.request.use(config => {
  const token = localStorage.getItem("lms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) { /* redirect to login */ }
    return Promise.reject(err);
  }
);
```

### 4.6 Page Specifications

#### Login Page (`/login`)
- Components: Email input, Password input, Submit button, link to Register
- Validation: required fields, valid email format (client-side)
- On submit: `POST /api/auth/login` → store token → redirect to `/dashboard`
- Error state: Show "Invalid email or password" below form on 401

#### Dashboard Page (`/dashboard`)
- 4 stat cards: Total Books, Total Users, Currently Borrowed, Overdue
- Overdue records table: borrower name, book title, due date, days overdue
- API: `GET /api/dashboard/summary` — single call returns all stats + overdue list
- Loading state: skeleton loader on cards while fetching

#### Book List Page (`/books`)
- Searchable table: filter by title or ISBN (client-side or query param)
- Columns: Title, Author, ISBN, Category, Total Qty, Available Qty, Actions
- Admin/Librarian: Edit and Soft-Delete buttons per row; Add Book button top-right
- Student: read-only view, no action buttons

#### Borrow Form Page (`/borrows/new`)
- Librarian selects Student from dropdown (`GET /api/users?role=student`)
- Librarian selects up to 3 available books (books with `available_quantity > 0`)
- Due date auto-set to today + 7 days (editable)
- On submit: `POST /api/borrows` → success toast → redirect to borrow list

#### Return Page (`/borrows/:id/return`)
- Displays borrow details: borrower, books, borrow date, due date
- Shows calculated fine if today > due date (fine = days overdue × 2,000 VND)
- Confirm Return button: `PATCH /api/borrows/:id/return`

#### Student History Page (`/profile/history`)
- Shows authenticated student's own borrow records
- Columns: Book(s), Borrow Date, Due Date, Return Date, Status, Fine Amount
- API: `GET /api/borrows/my` — filtered by `req.user.id` in backend

### 4.7 UI Design System

| Token | Value | Usage |
|---|---|---|
| Primary Blue | #2E75B6 | Buttons, active nav, links |
| Dark Blue | #1F4E79 | Headings, sidebar bg |
| Light Blue | #BDD7EE | Table header bg, tag bg |
| Success Green | #28A745 | Status badge: returned |
| Warning Orange | #FD7E14 | Status badge: overdue |
| Danger Red | #DC3545 | Errors, delete confirmation |
| Neutral Gray | #6C757D | Secondary text, borders |
| White | #FFFFFF | Card bg, input bg |
| Font (Body) | Inter, sans-serif | All body text |
| Font (Mono) | Fira Mono, monospace | ISBN, IDs |

---

## 5. Backend System Design

### 5.1 Folder Structure

```
server/
  src/
    config/          # db.js, env.js
    controllers/     # authController.js, bookController.js ...
    middlewares/     # authMiddleware.js, roleGuard.js, errorHandler.js
    routes/          # auth.routes.js, book.routes.js ...
    services/        # authService.js, bookService.js ...
    utils/           # fineCalculator.js, responseHelper.js
    validators/      # bookValidator.js, borrowValidator.js ...
    prisma/          # schema.prisma, seed.js
      migrations/    # auto-generated by prisma migrate
    app.js           # Express app setup, middleware registration
    server.js        # HTTP server startup
  .env
  .env.example
  package.json
```

### 5.2 Express App Setup

```js
// src/app.js
const express = require("express");
const cors    = require("cors");
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth",      require("./routes/auth.routes"));
app.use("/api/books",     require("./routes/book.routes"));
app.use("/api/users",     require("./routes/user.routes"));
app.use("/api/borrows",   require("./routes/borrow.routes"));
app.use("/api/fines",     require("./routes/fine.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

app.use(require("./middlewares/errorHandler"));
module.exports = app;
```

### 5.3 Middleware Design

#### `authMiddleware.js`

```js
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: "Invalid token" }); }
};
```

#### `roleGuard.js`

```js
// Usage: router.get("/", auth, roleGuard("admin","librarian"), controller)
module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ message: "Forbidden" });
  next();
};
```

### 5.4 API Endpoint Reference

#### Auth API

| Method | Route | Auth | Description | Request Body | Response |
|---|---|---|---|---|---|
| POST | /api/auth/register | None | Create new student account | `{ full_name, email, password }` | 201 `{ user }` |
| POST | /api/auth/login | None | Authenticate user | `{ email, password }` | 200 `{ token, user }` |
| GET | /api/auth/me | JWT | Get current user info | — | 200 `{ user }` |

#### Books API

| Method | Route | Auth / Role | Description |
|---|---|---|---|
| GET | /api/books | JWT (all) | List books; optional `?search=` query param |
| GET | /api/books/:id | JWT (all) | Get single book details |
| POST | /api/books | JWT + Admin\|Librarian | Create new book record |
| PUT | /api/books/:id | JWT + Admin\|Librarian | Update book info |
| DELETE | /api/books/:id | JWT + Admin\|Librarian | Soft-delete (`is_deleted = true`) |

#### Users API

| Method | Route | Auth / Role | Description |
|---|---|---|---|
| GET | /api/users | JWT + Admin | List all users; optional `?role=` filter |
| POST | /api/users | JWT + Admin | Create user (any role) |
| PUT | /api/users/:id | JWT + Admin | Update user info |
| PATCH | /api/users/:id/toggle-active | JWT + Admin | Lock / unlock account |

#### Borrows API

| Method | Route | Auth / Role | Description |
|---|---|---|---|
| POST | /api/borrows | JWT + Librarian | Create borrow record (max 3 books); decrements `available_quantity` |
| GET | /api/borrows | JWT + Admin\|Librarian | List all borrow records; optional `?status=` filter |
| GET | /api/borrows/my | JWT + Student | List own borrow records |
| PATCH | /api/borrows/:id/return | JWT + Librarian | Confirm return; update status + `return_date`; auto-create fine if overdue |

#### Fines API

| Method | Route | Auth / Role | Description |
|---|---|---|---|
| GET | /api/fines | JWT + Admin\|Librarian | List all fines; optional `?is_paid=` filter |
| PATCH | /api/fines/:id/pay | JWT + Admin\|Librarian | Mark fine as paid (`is_paid = true`) |

#### Dashboard API

| Method | Route | Auth / Role | Description |
|---|---|---|---|
| GET | /api/dashboard/summary | JWT + Admin\|Librarian | Returns `{ totalBooks, totalUsers, activeBorrows, overdueCount, unpaidFinesTotal, overdueList }` |

### 5.5 Fine Calculation Utility

```js
// src/utils/fineCalculator.js
const FINE_PER_DAY = 2000; // VND

function calculateFine(dueDate, returnDate) {
  const due    = new Date(dueDate);
  const ret    = new Date(returnDate);
  const msDay  = 24 * 60 * 60 * 1000;
  const overdue = Math.max(0, Math.ceil((ret - due) / msDay));
  return overdue * FINE_PER_DAY;
}

module.exports = { calculateFine, FINE_PER_DAY };
```

### 5.6 Consistent API Response Shape

```json
// Success
{ "success": true, "data": { "..." }, "message": "Book created" }

// Error
{ "success": false, "message": "Book not found", "errors": [] }
```

### 5.7 Environment Variables (`.env`)

```
DATABASE_URL="Microsoft SQL Server://root:password@localhost:3306/library_db"
JWT_SECRET="replace_with_strong_random_secret_min_32_chars"
PORT=3001
CLIENT_URL="http://localhost:5173"
```

---

## 6. Database Design

### 6.1 Entity Overview

| Table | Purpose | Key Relations |
|---|---|---|
| users | All system accounts (admin/librarian/student) | Referenced by borrow_records, fines |
| books | Library catalogue entries | Referenced by borrow_items |
| borrow_records | Each borrow transaction (header) | Belongs to users; has many borrow_items; has fines |
| borrow_items | Line items: which book in which borrow record | Belongs to borrow_records, books |
| fines | Penalty records for overdue returns | Belongs to borrow_records, users |
| book_metadata | Extended crawled metadata per book (cover, description, subjects) | Belongs to books (1:1) |
| crawl_logs | Audit trail of all web-crawl jobs and their outcomes | Standalone (references books) |

### 6.2 Prisma Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "Microsoft SQL Server"  // or "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            Int            @id @default(autoincrement())
  full_name     String
  email         String         @unique
  password_hash String
  role          Role           @default(student)
  is_active     Boolean        @default(true)
  created_at    DateTime       @default(now())
  borrows       BorrowRecord[]
  fines         Fine[]
}

enum Role { admin librarian student }

model Book {
  id                 Int           @id @default(autoincrement())
  title              String
  author             String
  isbn               String        @unique
  category           String
  total_quantity     Int           @default(1)
  available_quantity Int           @default(1)
  is_deleted         Boolean       @default(false)
  created_at         DateTime      @default(now())
  updated_at         DateTime      @updatedAt
  borrow_items       BorrowItem[]
  metadata           BookMetadata?

  @@index([title])
  @@index([is_deleted])
  @@index([category])
}

// Extended metadata populated by the web-crawl pipeline (Section 7)
model BookMetadata {
  id              Int      @id @default(autoincrement())
  book_id         Int      @unique
  cover_image_url String?
  description     String?  @db.Text
  publisher       String?
  publish_year    Int?
  language        String?  @default("vi")
  subjects        String?  // JSON array stored as string: ["Fiction","Drama"]
  page_count      Int?
  rating          Float?
  source_url      String?  // URL crawled from (e.g. Open Library permalink)
  crawled_at      DateTime?
  book            Book     @relation(fields: [book_id], references: [id])
}

model BorrowRecord {
  id          Int          @id @default(autoincrement())
  user_id     Int
  borrow_date DateTime     @default(now())
  due_date    DateTime
  return_date DateTime?
  status      BorrowStatus @default(active)
  user        User         @relation(fields: [user_id], references: [id])
  items       BorrowItem[]
  fines       Fine[]

  @@index([user_id])
  @@index([status])
  @@index([due_date])
}

enum BorrowStatus { active returned overdue }

model BorrowItem {
  id               Int          @id @default(autoincrement())
  borrow_record_id Int
  book_id          Int
  quantity         Int          @default(1)
  borrow_record    BorrowRecord @relation(fields: [borrow_record_id], references: [id])
  book             Book         @relation(fields: [book_id], references: [id])
}

model Fine {
  id               Int          @id @default(autoincrement())
  borrow_record_id Int
  user_id          Int
  amount           Int          // VND, integer
  reason           String       @default("Overdue return")
  is_paid          Boolean      @default(false)
  created_at       DateTime     @default(now())
  borrow_record    BorrowRecord @relation(fields: [borrow_record_id], references: [id])
  user             User         @relation(fields: [user_id], references: [id])

  @@index([user_id])
  @@index([is_paid])
}

// Audit log for all automated crawl jobs (Section 7)
model CrawlLog {
  id           Int       @id @default(autoincrement())
  job_type     String    // "isbn_lookup" | "batch_enrich" | "category_sync"
  isbn         String?
  status       CrawlStatus @default(pending)
  source       String?   // "open_library" | "google_books" | "vinabook"
  books_found  Int       @default(0)
  books_updated Int      @default(0)
  error_msg    String?
  started_at   DateTime  @default(now())
  finished_at  DateTime?

  @@index([status])
  @@index([started_at])
}

enum CrawlStatus { pending running success failed }
```

### 6.3 Index Strategy

| Table | Index Column(s) | Reason |
|---|---|---|
| users | email (UNIQUE) | Login lookup; enforces uniqueness |
| books | isbn (UNIQUE) | Enforce unique ISBN; crawl deduplication |
| books | title (INDEX) | Full-text search/filter by title |
| books | category (INDEX) | Category filter on catalogue page |
| books | is_deleted (INDEX) | Filter out soft-deleted books efficiently |
| book_metadata | book_id (UNIQUE) | 1-to-1 join; fast cover/description lookup |
| borrow_records | user_id (INDEX) | Student history queries |
| borrow_records | status (INDEX) | Dashboard queries for active/overdue |
| borrow_records | due_date (INDEX) | Overdue detection queries |
| fines | user_id (INDEX) | User fine lookup |
| fines | is_paid (INDEX) | Unpaid fine totals on dashboard |
| crawl_logs | status (INDEX) | Admin panel: filter pending/failed jobs |
| crawl_logs | started_at (INDEX) | Chronological audit display |

### 6.4 Database Normalization Notes

The schema follows **Third Normal Form (3NF)**:

- `books` stores only canonical catalogue data; extended/volatile metadata (cover images, descriptions, crawl timestamps) is isolated in `book_metadata` to avoid wide rows and simplify updates from the crawl pipeline.
- `borrow_items` decomposes the many-to-many relationship between `borrow_records` and `books`, with an explicit `quantity` column to handle multi-copy borrows cleanly.
- `fines` carries a redundant `user_id` alongside `borrow_record_id` as a deliberate denormalization for query performance — dashboard aggregate queries on fines can avoid joining through `borrow_records` to reach `users`.
- `crawl_logs` is completely independent of the core domain tables, making it safe to truncate or archive without affecting library operations.

### 6.5 Seed Data Script

```js
// prisma/seed.js — run: npx prisma db seed
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const hash = pwd => bcrypt.hash(pwd, 10);
  await prisma.user.createMany({ data: [
    { full_name: "Admin User",  email: "admin@demo.com",     password_hash: await hash("admin123"), role: "admin" },
    { full_name: "Librarian",   email: "librarian@demo.com", password_hash: await hash("lib123"),   role: "librarian" },
    { full_name: "Student A",   email: "student@demo.com",   password_hash: await hash("stu123"),   role: "student" },
  ]});

  // Seed 10+ books; metadata will be populated by the crawl pipeline (Section 7)
  const books = await prisma.book.createMany({ data: [
    { title: "Clean Code",           author: "Robert C. Martin", isbn: "9780132350884", category: "Engineering", total_quantity: 3, available_quantity: 3 },
    { title: "The Pragmatic Programmer", author: "Hunt & Thomas", isbn: "9780135957059", category: "Engineering", total_quantity: 2, available_quantity: 2 },
    { title: "Design Patterns",      author: "Gang of Four",    isbn: "9780201633610", category: "Engineering", total_quantity: 2, available_quantity: 1 },
    // ... add 7+ more books
  ]});

  // Seed 2 borrow records: 1 on-time, 1 overdue (for dashboard demo)
  // ... create borrow records and fine record
}
main().catch(console.error).finally(() => prisma.$disconnect());
```

### 6.6 ERD (Extended)

```
users ──< borrow_records >─── borrow_items >── books ──── book_metadata
  |              |                                              |
  └──────────────┴──< fines                             (populated by
                                                        crawl pipeline)

crawl_logs  (standalone audit table, no FK constraints)
```

---

## 7. Web Crawling & Data Ingestion

> This section covers the automated pipeline that enriches the book catalogue with metadata — cover images, descriptions, subjects, publisher details — sourced from public library APIs and book-data websites. The crawl pipeline runs as a background task, decoupled from the main Express server.

### 7.1 Crawling Objectives

| Goal | Detail |
|---|---|
| Auto-populate metadata | When a librarian adds a book by ISBN, automatically fetch its cover, description, and subjects from external sources |
| Batch enrichment | Back-fill metadata for all existing books that have no `book_metadata` record |
| Category sync | Periodically refresh subject/category tags from Open Library for accurate search filtering |
| Crawl auditability | Write every job outcome (success/fail, records updated) to `crawl_logs` for Admin review |

### 7.2 Data Sources

| Source | API / Method | Data Available | Rate Limit |
|---|---|---|---|
| Open Library | REST API (`openlibrary.org/api/books?bibkeys=ISBN:...`) | Cover image, description, subjects, publisher, publish year, page count | None (public, be polite) |
| Google Books API | REST API (`books.googleapis.com/books/v1/volumes?q=isbn:...`) | Title, authors, description, cover thumbnail, rating, language | 1,000 req/day (free tier) |
| Vinabook.com | HTML scraping (Cheerio/Playwright) | Vietnamese-language book data, local publisher info | Best-effort; respect `robots.txt` |

> **Ethics note:** Always check and comply with a website's `robots.txt` and Terms of Service before scraping. Prefer official APIs (Open Library, Google Books) over HTML scraping wherever possible. Add `User-Agent` headers identifying your crawler.

### 7.3 Architecture: Crawl Pipeline

```
[Admin / Librarian triggers crawl]
         │
         ▼
[POST /api/crawl/isbn/:isbn]    ◄── manual single-book trigger
         │
         ▼
[CrawlService.enrichByIsbn()]
    │   Writes CrawlLog {status: "running"}
    │
    ├── fetchOpenLibrary(isbn)     → cover, subjects, description
    ├── fetchGoogleBooks(isbn)     → rating, language, page count
    └── (optional) scrapeVinabook(isbn)   → local publisher info
         │
         ▼
[Merge & upsert BookMetadata]
    Prisma: upsert { where: { book_id }, create: {...}, update: {...} }
         │
         ▼
[Update CrawlLog {status: "success", books_updated: 1, finished_at}]

[Batch job — daily or on-demand]
POST /api/crawl/batch
    → finds all books WHERE book_metadata IS NULL
    → queues each ISBN with concurrency limit (3 at a time)
    → respects polite delay (500ms between requests)
```

### 7.4 Folder Structure (Crawl Module)

```
server/
  src/
    crawlers/
      openLibraryCrawler.js   # Fetches from Open Library API
      googleBooksCrawler.js   # Fetches from Google Books API
      vinabookScraper.js      # HTML scraper for Vinabook (optional)
      crawlerUtils.js         # Shared: delay(), retryFetch(), sanitizeText()
    services/
      crawlService.js         # Orchestrates sources, merges data, upserts DB
    routes/
      crawl.routes.js         # POST /api/crawl/isbn/:isbn, POST /api/crawl/batch
    controllers/
      crawlController.js      # Auth guard (Admin only), delegates to crawlService
```

### 7.5 Open Library Crawler

```js
// src/crawlers/openLibraryCrawler.js
const axios = require("axios");

const BASE_URL = "https://openlibrary.org/api/books";

async function fetchByIsbn(isbn) {
  const bibkey = `ISBN:${isbn}`;
  const url = `${BASE_URL}?bibkeys=${bibkey}&format=json&jscmd=data`;

  try {
    const { data } = await axios.get(url, {
      timeout: 8000,
      headers: { "User-Agent": "LMS-SE104-Crawler/1.0 (student project)" },
    });

    const book = data[bibkey];
    if (!book) return null;

    return {
      cover_image_url: book.cover?.large || book.cover?.medium || null,
      description:     book.notes || null,
      publisher:       book.publishers?.[0]?.name || null,
      publish_year:    book.publish_date ? parseInt(book.publish_date) : null,
      subjects:        JSON.stringify(book.subjects?.map(s => s.name) || []),
      page_count:      book.number_of_pages || null,
      source_url:      book.url || null,
    };
  } catch (err) {
    console.error(`[OpenLibrary] ISBN ${isbn} failed:`, err.message);
    return null;
  }
}

module.exports = { fetchByIsbn };
```

### 7.6 Google Books Crawler

```js
// src/crawlers/googleBooksCrawler.js
const axios = require("axios");

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

async function fetchByIsbn(isbn) {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: { q: `isbn:${isbn}`, key: process.env.GOOGLE_BOOKS_API_KEY },
      timeout: 8000,
    });

    if (!data.totalItems || !data.items?.length) return null;

    const info = data.items[0].volumeInfo;
    return {
      description:     info.description || null,
      cover_image_url: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
      language:        info.language || null,
      page_count:      info.pageCount || null,
      rating:          info.averageRating || null,
      publish_year:    info.publishedDate ? parseInt(info.publishedDate) : null,
      publisher:       info.publisher || null,
    };
  } catch (err) {
    console.error(`[GoogleBooks] ISBN ${isbn} failed:`, err.message);
    return null;
  }
}

module.exports = { fetchByIsbn };
```

### 7.7 Crawl Service (Orchestrator)

```js
// src/services/crawlService.js
const { PrismaClient } = require("@prisma/client");
const openLib    = require("../crawlers/openLibraryCrawler");
const googleBooks = require("../crawlers/googleBooksCrawler");
const { delay }  = require("../crawlers/crawlerUtils");

const prisma = new PrismaClient();

async function enrichByIsbn(isbn) {
  const book = await prisma.book.findUnique({ where: { isbn } });
  if (!book) throw new Error(`Book with ISBN ${isbn} not found`);

  // Write start log
  const log = await prisma.crawlLog.create({
    data: { job_type: "isbn_lookup", isbn, status: "running", source: "multi" },
  });

  try {
    const [olData, gbData] = await Promise.allSettled([
      openLib.fetchByIsbn(isbn),
      googleBooks.fetchByIsbn(isbn),
    ]);

    // Merge: Open Library is primary; Google Books fills gaps
    const merged = {
      ...(gbData.value  || {}),
      ...(olData.value  || {}),   // ol overwrites gb on conflict
      crawled_at: new Date(),
      source_url: olData.value?.source_url || null,
    };

    if (!Object.keys(merged).some(k => k !== "crawled_at" && merged[k])) {
      // Nothing found from any source
      await prisma.crawlLog.update({
        where: { id: log.id },
        data: { status: "failed", error_msg: "No data returned by any source", finished_at: new Date() },
      });
      return { success: false, isbn };
    }

    await prisma.bookMetadata.upsert({
      where:  { book_id: book.id },
      create: { book_id: book.id, ...merged },
      update: merged,
    });

    await prisma.crawlLog.update({
      where: { id: log.id },
      data:  { status: "success", books_found: 1, books_updated: 1, finished_at: new Date() },
    });

    return { success: true, isbn, metadata: merged };
  } catch (err) {
    await prisma.crawlLog.update({
      where: { id: log.id },
      data:  { status: "failed", error_msg: err.message, finished_at: new Date() },
    });
    throw err;
  }
}

async function batchEnrich({ concurrency = 3, delayMs = 500 } = {}) {
  // Find all books missing metadata
  const books = await prisma.book.findMany({
    where: { is_deleted: false, metadata: null },
    select: { isbn: true },
  });

  console.log(`[CrawlService] Batch enriching ${books.length} books...`);
  const results = { success: 0, failed: 0 };

  // Process in batches of `concurrency` to avoid rate limits
  for (let i = 0; i < books.length; i += concurrency) {
    const batch = books.slice(i, i + concurrency);
    await Promise.allSettled(
      batch.map(b => enrichByIsbn(b.isbn).then(() => results.success++).catch(() => results.failed++))
    );
    if (i + concurrency < books.length) await delay(delayMs);
  }

  return results;
}

module.exports = { enrichByIsbn, batchEnrich };
```

### 7.8 Crawl API Endpoints

| Method | Route | Auth / Role | Description |
|---|---|---|---|
| POST | /api/crawl/isbn/:isbn | JWT + Admin | Enrich a single book by ISBN; returns merged metadata |
| POST | /api/crawl/batch | JWT + Admin | Enrich all books missing metadata; returns `{ success, failed }` |
| GET | /api/crawl/logs | JWT + Admin | List all crawl job logs with status, timestamps, and error messages |
| DELETE | /api/crawl/logs | JWT + Admin | Truncate old crawl logs (older than 30 days) |

### 7.9 Crawler Utilities

```js
// src/crawlers/crawlerUtils.js

/** Polite delay between requests */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Retry a fetch up to `retries` times with exponential back-off */
async function retryFetch(fn, retries = 3, baseDelayMs = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await delay(baseDelayMs * 2 ** attempt);
    }
  }
}

/** Strip HTML tags from crawled descriptions */
function sanitizeText(raw) {
  if (!raw) return null;
  return raw.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

module.exports = { delay, retryFetch, sanitizeText };
```

### 7.10 Frontend Integration (Crawl Trigger)

Librarians can trigger a single-book crawl from the Book Form page immediately after saving a new book:

```jsx
// After successful POST /api/books, optionally trigger enrichment
const handleAddBook = async (formData) => {
  const { data } = await api.post("/api/books", formData);
  toast.success("Book added!");

  // Non-blocking enrichment — don't await; errors won't block UX
  api.post(`/api/crawl/isbn/${formData.isbn}`)
    .then(() => toast.info("Metadata fetched from Open Library"))
    .catch(() => {/* silently fail; metadata can be crawled later */});

  navigate("/books");
};
```

On the Book Detail / Edit page, if `book.metadata` is populated, the UI should display:
- Cover image (thumbnail, graceful fallback to a placeholder SVG if null)
- Description paragraph
- Subject tag pills (parsed from the JSON array)
- Publisher and publish year in the book info panel

### 7.11 Environment Variables for Crawlers

Add to `server/.env`:

```
GOOGLE_BOOKS_API_KEY="your_google_books_api_key_here"
CRAWL_CONCURRENCY=3
CRAWL_DELAY_MS=500
```

### 7.12 Out of Scope for Crawl Module (Phase 1)

- Scheduling (cron jobs) — manually triggered only in the 2-week MVP
- Full-text indexing of crawled descriptions (Elasticsearch / Microsoft SQL Server FULLTEXT)
- Image caching/proxying — cover images referenced directly via URL
- Scraping Vinabook or other Vietnamese sources (optional bonus)

---

## 8. UX Workflow & User Journeys

### 8.1 Admin Journey

| Step | Action | Page / API |
|---|---|---|
| 1 | Login with admin@demo.com | `POST /api/auth/login` → /dashboard |
| 2 | Review dashboard stats (books, users, borrows, overdue) | `GET /api/dashboard/summary` |
| 3 | Add new book to catalogue | `POST /api/books` → BookFormPage |
| 4 | Lock a student account | `PATCH /api/users/:id/toggle-active` |
| 5 | View and mark fine as paid | `PATCH /api/fines/:id/pay` |
| 6 | Logout (clear localStorage token) | Client-side `logout()` |

### 8.2 Librarian Journey (Primary Business Flow)

| Step | Action | Page / API |
|---|---|---|
| 1 | Login as librarian | `POST /api/auth/login` → /dashboard |
| 2 | Student requests book; librarian opens Borrow Form | /borrows/new |
| 3 | Select student from dropdown | `GET /api/users?role=student` |
| 4 | Select up to 3 available books | `GET /api/books` (filtered `available_quantity > 0`) |
| 5 | Set due date (default: today + 7 days); submit | `POST /api/borrows` |
| 6 | Student returns book; librarian opens Return Page | /borrows/:id/return |
| 7 | System shows fine if overdue; librarian confirms return | `PATCH /api/borrows/:id/return` |
| 8 | Fine record created automatically; status updated to returned | Auto: internal fine creation |

### 8.3 Student Journey

| Step | Action | Page / API |
|---|---|---|
| 1 | Register new account | `POST /api/auth/register` |
| 2 | Login → redirected to book catalogue (read-only) | /books |
| 3 | Browse and search available books | `GET /api/books?search=` |
| 4 | View own borrow history and fine status | `GET /api/borrows/my` → /profile/history |

### 8.4 Empty States & Error UX

- **No books in catalogue:** Show illustration + "No books found. Add the first book." (Admin/Librarian only)
- **No borrow history:** "You have no borrow records yet."
- **API error (5xx):** Toast notification "Something went wrong. Please try again."
- **Validation error (4xx):** Inline field error messages below affected inputs
- **Loading state:** Spinner/skeleton on all async data fetches
- **Overdue badge:** Red "OVERDUE" badge on borrow records with `due_date < today`

---

## 9. Security Design

| Threat | Mitigation | Implementation |
|---|---|---|
| Weak passwords | bcrypt hashing | `bcrypt.hash(password, 10)` at registration; `bcrypt.compare` at login |
| JWT forgery | Strong secret + expiry | `JWT_SECRET` min 32 chars in `.env`; `expiresIn: "24h"` |
| Unauthorised access | Role-based guards | `authMiddleware` + `roleGuard` on every protected route |
| SQL injection | Parameterised queries | Prisma ORM always uses prepared statements; never raw string concat |
| XSS | React auto-escaping | React escapes all JSX values by default; avoid `dangerouslySetInnerHTML` |
| CORS abuse | Origin whitelist | `Express cors({ origin: CLIENT_URL })` — only `localhost:5173` allowed |
| Env secret leakage | `.env` never committed | `.gitignore` includes `.env`; use `.env.example` with placeholders |
| Mass assignment | DTO pattern in controllers | Explicitly list allowed fields; never pass `req.body` directly to ORM |
| Insecure direct object reference | Ownership check | Student borrow endpoints verify `borrow.user_id === req.user.id` |
| Brute force (future) | Rate limiting | `express-rate-limit` on `/api/auth/login` (100 req/15 min recommended) |

---

## 10. DevOps & Deployment

### 10.1 Git Workflow

| Branch | Purpose | Rule |
|---|---|---|
| main | Stable demo-ready code | Only merged via PR after passing manual test |
| dev | Integration branch | All feature branches merge here first |
| feature/auth | T1 auth work | Branch from dev; merge back via PR |
| feature/books | T1/T4 book work | Same pattern |
| feature/borrow | T2/T4 borrow work | Same pattern |
| feature/frontend | T3/T4 UI work | Same pattern |

### 10.2 Local Development Setup

```bash
# 1. Clone repo
git clone https://github.com/your-team/library-ms.git

# 2. Backend
cd server && npm install
cp .env.example .env   # Fill DATABASE_URL, JWT_SECRET
npx prisma migrate dev --name init
npx prisma db seed
npm run dev            # nodemon src/server.js :3001

# 3. Frontend (new terminal)
cd client && npm install
npm run dev            # Vite :5173
```

### 10.3 Optional Docker Compose

```yaml
# docker-compose.yml
services:
  db:
    image: Microsoft SQL Server:8
    environment:
      Microsoft SQL Server_ROOT_PASSWORD: rootpass
      Microsoft SQL Server_DATABASE: library_db
    ports: ["3306:3306"]
  backend:
    build: ./server
    env_file: ./server/.env
    ports: ["3001:3001"]
    depends_on: [db]
  frontend:
    build: ./client
    ports: ["5173:80"]
```

### 10.4 Optional Cloud Deployment (Bonus Points)

- **Frontend:** Deploy to Vercel — push to GitHub; Vercel auto-deploys from `main` branch
- **Backend:** Deploy to Render (free tier) — connect GitHub repo; set env vars in dashboard
- **Database:** PlanetScale (Microsoft SQL Server) or Supabase (PostgreSQL) free tier
- **Important:** Update `VITE_API_URL` in client to the Render backend URL before frontend deploy

---

## 11. Testing Strategy

### 11.1 Testing Approach

Given the 2-week timeframe, testing focuses on high-value manual and API tests rather than automated unit test coverage. The goal is confidence that all core business flows work correctly for the demo.

### 11.2 Test Types

| Type | Tool | Owner | Scope |
|---|---|---|---|
| API Testing | Postman | T5 + T1/T2 | All endpoints: status codes, response shapes, auth enforcement, business rules |
| Manual UI Testing | Chrome | T5 + T3/T4 | All pages: form validation, navigation, loading states, error messages |
| Integration Testing | Local env | All | Full flows: register → login → borrow → return → fine → dashboard |
| Regression Testing | Checklist | T5 | Re-test core flows after each bug fix; prevent regressions |
| Optional: Unit Tests | Jest | T1/T2 | fineCalculator.js, availability check logic |

### 11.3 Critical Test Cases

| ID | Scenario | Expected Result |
|---|---|---|
| TC01 | Login with correct credentials | JWT returned; user redirected to dashboard; role-specific nav shown |
| TC02 | Login with wrong password | 401 response; error message displayed; no navigation |
| TC03 | Add book with valid data | Book appears in list; `available_quantity = total_quantity` |
| TC04 | Add book with duplicate ISBN | 400 error; duplicate ISBN message shown |
| TC05 | Create borrow when book available (qty > 0) | Borrow record created; `available_quantity` decremented by 1 |
| TC06 | Create borrow when book qty = 0 | 400 error; "Book not available" message shown; no record created |
| TC07 | Return book on time (`return_date ≤ due_date`) | Status = returned; no fine created |
| TC08 | Return book 3 days late | Fine created: amount = 6,000 VND; status = returned |
| TC09 | Student accesses /users (admin-only) | 403 Forbidden; student cannot see user management |
| TC10 | Student views /profile/history | Shows only own records; cannot see other students' records |
| TC11 | Dashboard after creating overdue borrow | `overdueCount` incremented; `unpaidFinesTotal` updated |
| TC12 | Lock user account; locked user tries to login | 403 error; "Account is disabled" message |
| TC13 | Crawl valid ISBN (e.g. 9780132350884) | `book_metadata` row created/updated; `crawl_logs` entry shows `status = success` |
| TC14 | Crawl ISBN not found in any source | `crawl_logs` entry shows `status = failed`; no metadata row created; no crash |
| TC15 | Batch crawl with 5 unenriched books | All 5 books processed; `books_updated` sum correct; polite delay observed |
| TC16 | Non-admin user calls `/api/crawl/isbn/:isbn` | 403 Forbidden; crawl not executed |

### 11.4 Postman Collection Structure

- **Auth folder:** Register, Login (save token to env var), GetMe
- **Books folder:** List, Create, Update, SoftDelete, SearchByTitle
- **Users folder:** List, Create, ToggleActive
- **Borrows folder:** Create, List, GetMy, Return (on-time), Return (overdue)
- **Fines folder:** List, MarkPaid
- **Dashboard folder:** GetSummary
- **Crawl folder:** EnrichByIsbn (valid ISBN), EnrichByIsbn (unknown ISBN), BatchEnrich, GetLogs

Export collection as `library_ms.postman_collection.json` and include in repo under `/docs/`.

---

## 12. Scalability & Performance

### 12.1 Current Scope (2-week MVP)

The system is designed for a single-library demo with up to ~100 books, ~50 users, and ~200 borrow records. No caching or load balancing is needed at this scale.

### 12.2 Performance Optimisations (Implemented)

- Database indexes on frequently queried fields (email, isbn, status, due_date, user_id)
- Soft-delete pattern on books: filter `is_deleted=false` in all list queries
- Dashboard summary: single aggregated query per metric instead of N+1 queries
- Prisma `select{}`: fetch only required columns, not full record
- Client-side search for book list (if record count < 500); server-side search for larger datasets

### 12.3 Future Scalability Path

| Concern | Current State | Future Solution |
|---|---|---|
| Horizontal scaling | Single Node.js process | Stateless JWT allows multiple instances behind a load balancer (Nginx) |
| Database load | Single DB instance | Read replica for dashboard queries; connection pooling via PgBouncer |
| Background jobs | No async tasks | Add Bull/BullMQ queue for email notifications, overdue status updates |
| Caching | No cache | Redis for dashboard summary (TTL 60s) to avoid repeated aggregation |
| Microservices | Monolith | Extract fine-service, notification-service as independent services when team scales |
| File uploads | Not implemented | Book cover images: S3-compatible storage (AWS S3, Cloudflare R2) |

---

## 13. Development Roadmap

### 13.1 14-Day Sprint Plan

| Day | Focus | Key Tasks | Owner(s) | Done When |
|---|---|---|---|---|
| 1 | Project Setup | Create GitHub repo, init Vite + Express, agree on API contract, create GitHub issues | All | Everyone can clone & run skeleton |
| 2 | DB Design | Write Prisma schema, run migration, create seed script, document endpoints | T1 | DB has seed data; endpoint list agreed |
| 3 | Auth | Backend: register/login/me + middleware; Frontend: layout, routing, login/register pages | T1 + T3 | Login via API and UI works |
| 4 | Books | Backend: book CRUD API; Frontend: book list + form | T1 + T4 | Admin can add/edit/delete books |
| 5 | Users | Backend: user CRUD API; Frontend: user management page | T1 + T4 | Admin can manage users |
| 6 | Borrow | Backend: create borrow (availability check); Frontend: borrow form | T2 + T4 | Librarian can create borrow record |
| 7 | Return + Fine | Backend: return endpoint + auto fine; Frontend: return page + fine display | T2 + T4 | Return sets status; fine created if overdue |
| 8 | Dashboard | Backend: summary query; Frontend: dashboard stats + overdue table | T2 + T3 | Dashboard shows correct numbers |
| 9 | Integration 1 | Connect all frontend pages to real API; fix CORS, token, response format issues | T3 + T4 + T5 | Full flow: login → borrow → return works |
| 10 | Bug Fix Round 1 | T5 runs all test cases; team fixes critical bugs | T5 leads, All | All TC01–TC12 pass (or documented) |
| 11 | UI Polish | Loading states, error messages, responsive check, badge colours, empty states | T3 + T4 | UI is clean on 1280×720; no layout breaks |
| 12 | Bug Fix Round 2 + Demo Data | Re-test full flow; prepare demo accounts + 10 books + overdue record | T5 + All | Demo script runs without errors |
| 13 | Report + Slides | Write final report, create slide deck, screenshot UI, assign presentation roles | T5 | Report, slides, and demo script ready |
| 14 | Demo Rehearsal | Full demo run-throughs; fix last-minute bugs; prepare fallback plan (video) | All | Team is confident; local build is stable |

### 13.2 Task Assignment Summary

| Member | Primary Role | Key Deliverables |
|---|---|---|
| T1 — Backend/Auth Lead | Backend setup, DB, auth API, middleware | Running Express server, Prisma migrations, auth endpoints, roleGuard |
| T2 — Backend Business Logic | Borrow/return/fine/dashboard APIs | Create borrow, return + auto-fine, dashboard summary query |
| T3 — Frontend Lead | React setup, layout, auth UI, dashboard | Vite scaffold, AuthContext, routing, login/register pages, dashboard page |
| T4 — Frontend Feature Dev | Book/user/borrow/fine UI pages | All CRUD pages, borrow form, return page, student history page |
| T5 — QA/Docs/Integration | Testing, documentation, demo prep | Test cases, bug reports, Postman collection, final report, slide deck, demo script |

---

## 14. AI Agent Execution Instructions

> This section provides a structured implementation order for autonomous coding agents or AI-assisted development. Follow the sequence strictly to minimise dependency conflicts and rework.

### 14.1 Implementation Order

| Phase | Module | Instructions for Agent |
|---|---|---|
| P1 | Database Schema | Generate `prisma/schema.prisma` exactly as specified in Section 6.2. Run: `npx prisma migrate dev --name init`. Then run seed script. |
| P2 | Express Skeleton | Scaffold `src/app.js`, `src/server.js` with all 7 route mounts (including `/api/crawl`). Install: `express, cors, dotenv, jsonwebtoken, bcrypt, express-validator, @prisma/client, cheerio`. |
| P3 | Auth Module | Implement `authController.js` + `authService.js`. Implement `authMiddleware.js` + `roleGuard.js`. Test with Postman: register, login, getMe. |
| P4 | Book Module | Implement `bookController.js` + `bookService.js` with full CRUD. Soft-delete sets `is_deleted=true`; search filters by title/ISBN. Test all 5 endpoints. |
| P5 | User Module | Implement `userController.js` + `userService.js`. `toggle-active` flips `is_active`. Ensure only Admin role can access. Test all 4 endpoints. |
| P6 | Borrow Module | Implement `borrowController.js` + `borrowService.js`. Create borrow: check `available_quantity > 0` for each book; decrement within a Prisma transaction. Limit 3 items per record. Return: call `calculateFine`; create Fine record if fine > 0; increment `available_quantity` back. Test TC04–TC08. |
| P7 | Fine + Dashboard | Implement `fineController.js` (list, markPaid). Implement `dashboardController.js` using Prisma aggregates: count, sum, where clauses. |
| P7b | Crawl Module | Implement `openLibraryCrawler.js`, `googleBooksCrawler.js`, `crawlerUtils.js`, `crawlService.js`, `crawlController.js`, `crawl.routes.js` per Section 7. Test TC13–TC16 with real ISBNs. |
| P8 | React Scaffold | `npx create-vite@latest client --template react`. Install: `tailwindcss, axios, react-router-dom`. Configure Tailwind. Create AuthContext + `api.js`. |
| P9 | Auth Pages | Build `LoginPage` and `RegisterPage`. Wire to `/api/auth/login` and `/api/auth/register`. On success store token, redirect to `/dashboard`. |
| P10 | Feature Pages | Build all pages in order: Dashboard → BookList+Form → UserList+Form → BorrowList+Form → ReturnPage → FineList → StudentHistory. Each page: fetch data on mount, handle loading/error states, render table/form. |
| P11 | Integration | Ensure CORS is correctly set. Confirm Axios interceptor attaches token. Test all pages in sequence matching the demo script (Section 13). Fix any mismatches between API response shape and frontend expectations. |
| P12 | Seed + Polish | Run seed script. Trigger batch crawl via `POST /api/crawl/batch` to populate `book_metadata`. Verify book covers show on book detail pages. Add loading spinners, toast notifications, empty states. Validate responsive layout on 1280×720. |

### 14.2 Multi-Agent Collaboration Strategy

| Agent | Scope | Interface Contract |
|---|---|---|
| DB Agent | Generate and validate Prisma schema, migrations, seed | Outputs: `schema.prisma`, migration SQL, `seed.js` |
| Backend Agent | Implement all Express routes, controllers, services, middleware | Consumes: `schema.prisma`; Produces: running REST API on `:3001` |
| Crawl Agent | Implement crawlers, crawlService, crawl routes; integrate with BookMetadata model | Consumes: `schema.prisma`, Open Library & Google Books API docs; Produces: `crawlers/`, `crawlService.js`, `/api/crawl/*` |
| Frontend Agent | Build all React pages, components, contexts, services | Consumes: API endpoint spec (Section 5.4); Produces: running SPA on `:5173` |
| QA Agent | Generate Postman collection, run test cases, verify TC01–TC16 | Consumes: running API; Produces: test report, bug list |
| Docs Agent | Generate report, README, demo script, slide outline | Consumes: all above; Produces: final documentation bundle |

### 14.3 Prompting Strategy for Code Generation

- Always provide the Prisma schema and API response shape as context before generating service/controller code
- When generating a controller: *"Implement bookController.js. The Book Prisma model has: [paste schema]. The endpoint is POST /api/books. Validation: title, author, isbn, category required. Return `{ success: true, data: book, message: 'Book created' }`"*
- When generating React pages: *"Build BorrowFormPage.jsx using Tailwind. It fetches `/api/users?role=student` and `/api/books` (available_quantity > 0). Uses a form with student dropdown, up to 3 book checkboxes, and a date picker for due_date. On submit calls POST /api/borrows."*
- Use incremental generation: generate one module at a time; test before moving to the next
- Always specify error handling: *"If the API returns an error, show a toast notification with the error message"*

---

## 15. Final Recommendations & Best Practices

### 15.1 Best Practices

- Agree on API contract (endpoint names, request/response shapes) on Day 2 and document in a shared file. Never change endpoint shapes unilaterally.
- Use a consistent response shape: `{ success, data, message }` on all endpoints. This makes frontend error handling uniform.
- Never commit `.env` to GitHub. Use `.env.example` with placeholder values.
- Use Prisma transactions for operations that modify multiple tables (e.g., create borrow + decrement `available_quantity` + create `borrow_items`).
- Keep controllers thin: validate input, call one service method, return response. All business logic goes in service layer.
- Seed demo data before the demo. Never rely on manual data entry during a live demo.
- Add a loading state to every async operation. A spinner is better than a frozen UI.

### 15.2 Common Mistakes to Avoid

- **MISTAKE:** Storing plaintext passwords → ALWAYS hash with bcrypt.
- **MISTAKE:** Forgetting to add `authMiddleware` to protected routes → Test every endpoint with an invalid token.
- **MISTAKE:** N+1 queries in dashboard → Use Prisma aggregate queries (`count`, `sum`) instead of fetching all records and counting in JS.
- **MISTAKE:** `available_quantity` going negative (race condition) → Use Prisma transaction with a check: `if (book.available_quantity < 1) throw error`.
- **MISTAKE:** Frontend calling API with wrong base URL after deploy → Use `VITE_API_URL` environment variable.
- **MISTAKE:** Trying to add new features after Day 8 → Freeze scope; polish what exists.

### 15.3 Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| API contract mismatch between T1/T2 and T3/T4 | High | High | Define and share API spec doc on Day 2; use Postman mock |
| One member's task blocks another | Medium | High | Identify blockers in daily standups; pair on blockers immediately |
| Database migration conflict | Medium | Medium | Only T1 manages migrations; never run local schema changes without team coordination |
| Demo environment failure | Low | High | Prepare a screen-recorded fallback video of the full demo flow |
| Scope creep past Day 8 | High | Medium | Tech lead (T1/T3) enforces scope freeze after Day 8 |

### 15.4 Future Expansion Ideas (Post-Project)

- **Refresh token rotation:** issue short-lived access tokens + long-lived refresh tokens stored in httpOnly cookies
- **Email notifications:** SendGrid integration for overdue reminders via a Bull queue cron job
- **Book reservation queue:** allow students to join a waitlist when `available_quantity = 0`
- **Admin analytics:** charts for most-borrowed books, monthly borrow trends (Chart.js / Recharts)
- **Mobile PWA:** add service worker + `manifest.json` to make the React app installable on mobile
- **Microservices migration:** extract notification-service and fine-service as independent Node.js apps communicating via REST or message queue
- **Full test coverage:** Jest + Supertest for all backend routes; React Testing Library for frontend components
- **Scheduled crawl jobs:** Bull/BullMQ cron to auto-enrich new books nightly and refresh subject tags weekly
- **Full-text search:** Microsoft SQL Server FULLTEXT index or Elasticsearch on `book_metadata.description` for semantic catalogue search
- **Cover image proxy/cache:** store crawled cover images in S3/Cloudflare R2 to avoid broken external URLs
- **Vietnamese book sources:** expand crawl pipeline to Vinabook, Fahasa, or Tiki Books for local publisher data

---

*Document version 2.0 — Enhanced with Web Crawling & Data Ingestion (Section 7) and extended Database Design (Section 6)*
