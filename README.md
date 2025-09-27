# Single-Product E‑commerce (Ghee Store)

A production‑ready, full‑stack single‑product e‑commerce platform focused on premium ghee. The frontend is built with Next.js (App Router) and Tailwind CSS; the backend is a secure REST API on Express and MongoDB with Razorpay payments, invoices, coupons, subscriptions, wishlist, and real‑time notifications.

## ✨ Highlights

- **Modern UX**: Next.js App Router, responsive Tailwind UI, animations, charts
- **Complete commerce flow**: Products → Cart → Checkout → Payment → Orders → Invoices
- **Secure backend**: JWT auth, RBAC, rate‑limit, CORS, Helmet, validation
- **Rich features**: Coupons, wishlist, subscriptions, notifications, shipping rules, admin
- **Real‑time**: WebSocket notifications and live UI updates

## 🧱 Tech Stack

### Frontend
- Next.js 15 (App Router), React 19
- Tailwind CSS, Radix UI, shadcn/ui
- State with Jotai; data via SWR and Axios
- Forms via React Hook Form + Zod
- Charts with Chart.js + react-chartjs-2
- Framer Motion animations, Sonner toasts

### Backend
- Node.js, Express.js, MongoDB (Mongoose)
- Auth with JWT; cookies supported via `cookie-parser`
- Payments: Razorpay (order create + signature verify)
- Email: Nodemailer (Gmail SMTP)
- Files/Media: Cloudinary
- Invoices: PDFKit
- Real‑time: `ws` WebSocket server
- Security: Helmet, express‑rate‑limit, CORS, express‑validator

## 📁 Monorepo Structure

```
.
├─ client/                # Next.js app (frontend)
│  ├─ src/app/            # App Router pages and layouts
│  ├─ src/components/     # UI, admin, profile, charts, payments, etc.
│  ├─ src/contexts/       # Auth, Cart, Wishlist providers
│  ├─ src/hooks/          # useHydration, useWebSocket
│  └─ src/lib/            # api.js (client), utils.js
├─ server/                # Express API (backend)
│  ├─ config/             # DB connection
│  ├─ controllers/        # Business logic per resource
│  ├─ middleware/         # auth, error handler
│  ├─ models/             # Mongoose models
│  ├─ routes/             # REST endpoints
│  ├─ utils/              # seeders, email, cloudinary, websocket
│  └─ app.js              # App entry, security & routers
└─ README.md              # This file
```

## 🧩 Features

### Storefront & User
- Auth (register, login, JWT), forgot/reset password, profile
- Product catalog (ghee variants: Cow, Buffalo, A2, Organic, Mixed)
- Sizes (250g, 500g, 1kg, 2kg, 5kg), reviews & ratings
- Cart with quantity updates and tax/summary
- Wishlist add/remove and sync
- Address book with default address selection
- Subscriptions (recurring orders, pause/resume/cancel)
- Orders (tracking, cancel), invoices (GST‑compliant, PDF download)
- Real‑time notifications (order status, stock, promos)

### Coupons & Shipping
- Coupon types: percentage/fixed, usage limits, first‑order, bulk, loyalty
- Shipping rules: pincode/zone based, dynamic charges, free‑shipping thresholds, ETA

### Payments
- Razorpay order creation and server‑side signature verification
- Payment success/failure routes and order confirmation

### Admin
- Dashboard with sales/users analytics
- Products, orders, users, coupons, shipping rules CRUD
- Invoices and subscriptions management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay account/keys
- Gmail (for SMTP) and Cloudinary (for media)

### 1) Install dependencies
```bash
# From repo root
cd server && npm install
cd ../client && npm install
```

### 2) Environment variables
Create `server/.env` (see `server/env.example` for all options):
```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ghee-ecommerce

# JWT
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=optional-webhook-secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@example.com
EMAIL_PASS=your-app-password
FROM_NAME=Pure Ghee Store
FROM_EMAIL=your-gmail@example.com

# Cloudinary (optional for media)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloud-key
CLOUDINARY_API_SECRET=your-cloud-secret
```

Important: Do not commit secrets. Rotate any leaked keys.

### 3) Seed sample data (optional)
```bash
cd server
npm run seed:all     # products, admin, shipping rules, coupons
```

### 4) Run in development
```bash
# Backend
cd server
npm run dev

# Frontend (new terminal)
cd client
npm run dev
```
- API: `http://localhost:5000`
- Web: `http://localhost:3000`

### 5) Production build
```bash
# Backend
cd server
npm start

# Frontend
cd client
npm run build && npm start
```

## 🔌 API Overview

Base URL: `/api/v1`

- Auth: register, login, logout, me, update profile/password, forgot/reset
- Products: list, details, by type/size, featured, reviews CRUD
- Cart: add, read, update, remove, clear, summary (with coupons)
- Coupons: validate; admin CRUD
- Wishlist: list, add, remove, clear, check
- Notifications: list, read one/all, delete, unread count
- Subscriptions: create, list, update, pause/resume/cancel
- Orders: create, get by id, list mine, cancel
- Shipping: calculate; admin rules CRUD
- Invoice: generate by order, get by id/mine, PDF download
- Payment: create Razorpay order, verify payment

Explore all endpoints in `server/README.md`.

## 🔐 Security & Best Practices
- JWT auth with password hashing (bcrypt)
- Helmet headers, CORS, rate limits (non‑dev), input validation
- Centralized error handling; structured logs (morgan in dev)
- WebSocket server mounted on Express HTTP server

## 🖼️ Images & Assets
- Next.js images allow domains: Unsplash, Cloudinary, and specific stock domains (see `client/next.config.mjs`).

## 🧪 Scripts

### Backend (`server/package.json`)
- `dev`: nodemon app.js
- `start`: node app.js
- `seed`, `seed:shipping`, `seed:coupons`, `seed:all`

### Frontend (`client/package.json`)
- `dev`, `build`, `start`, `lint`

## 🛠️ Troubleshooting
- MongoDB not connected: check `MONGODB_URI` and server logs
- CORS issues: verify `FRONTEND_URL` matches client origin
- Razorpay verification failing: confirm signature, keys, and callback URL
- Emails not sending: use Gmail app password; ensure “less secure app” alternatives are not required

## 🧑‍🤝‍🧑 Contributing
1. Fork and create a feature branch
2. Commit clean, small edits with context
3. Add/update docs where relevant
4. Open a PR

## 📄 License
MIT

## 📬 Support
Open an issue or contact the maintainers.
