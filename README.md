# TechZone eCommerce

TechZone eCommerce is a full-stack electronics storefront rebuilt around a modular Node.js + Express API, a React storefront/admin UI, and a MySQL database designed for local development and production deployment.

## What is included

- Customer storefront with search, category browsing, filtering, cart, wishlist, checkout, orders, and profile management
- Admin console for dashboard metrics, product CRUD, order updates, user management, category management, and coupon management
- MySQL-first backend with modular routes, controllers, services, validators, and middleware
- JWT authentication with refresh-token cookies, secure password hashing, RBAC, rate limiting, CORS, logging, and centralized error handling
- Realistic seed data for a tech store demo

## Stack

- Frontend: React 18, React Router, Tailwind CSS, Axios, Recharts, React Hot Toast
- Backend: Node.js, Express, MySQL2, bcryptjs, jsonwebtoken, helmet, express-rate-limit, cookie-parser, morgan
- Database: MySQL 8+

## Project structure

```text
techzone-ecommerce/
├── backend/
│   ├── api/                     # Vercel serverless entry
│   ├── database/
│   │   └── schema.sql           # Full MySQL schema
│   ├── scripts/
│   │   ├── setup-db.js          # Schema + seed bootstrap
│   │   └── seed-data/           # Catalog and commerce fixtures
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── bootstrap.js             # Local server entry
│   ├── seed.js                  # Seed runner
│   └── vercel.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── shop/
│   │   └── utils/
│   ├── netlify.toml
│   └── vercel.json
└── README.md
```

## Seeded demo data

The project ships with realistic demo content for immediate testing:

- 8 users including 1 admin and multiple customers
- 7 categories
- 22 tech products across laptops, smartphones, accessories, gaming, smart home, audio, and wearables
- Multiple product images, features, and specs per product
- Sample carts, wishlists, addresses, reviews, coupons, and orders

Demo accounts after seeding:

- Admin: `admin@techzone.com` / `Admin@1234`
- Customer: `aisha.khan@example.com` / `User@1234`

## Local setup

### 1. Prerequisites

- Node.js 18+
- MySQL 8+
- MySQL Workbench (optional but recommended for local inspection)

### 2. Backend environment

Create `backend/.env` from `backend/.env.example`.

Important values:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`

### 3. Frontend environment

Create `frontend/.env` from `frontend/.env.example`.

Important value:

- `REACT_APP_API_URL=http://localhost:5000/api`

### 4. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 5. Create and populate the MySQL database

You can use either of the following flows.

#### Option A: CLI bootstrap

This is the fastest path. It creates the schema and immediately seeds the demo data.

```bash
cd backend
npm run db:setup
```

#### Option B: MySQL Workbench + seed script

1. Open MySQL Workbench and connect to your local MySQL server.
2. Open `backend/database/schema.sql`.
3. Execute the schema file.
4. Confirm your `backend/.env` database credentials point to that schema.
5. Run the seed script:

```bash
cd backend
npm run seed
```

### 6. Start the application

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

Default local URLs:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Key API areas

- `/api/auth` for register, login, refresh, logout, current user, and profile access
- `/api/products` for catalog browsing, filters, admin product management, and reviews
- `/api/categories` for storefront and admin category management
- `/api/cart` for persistent user carts
- `/api/wishlist` for saved items
- `/api/orders` for checkout, customer order history, and admin order operations
- `/api/users` for profile, address, and admin user management
- `/api/coupons` for validation and admin discount management
- `/api/dashboard` for admin summary data

## Recommended deployment split

Best production split for this project:

- Frontend on Netlify
- Backend on Vercel
- MySQL hosted externally

Why this split works well:

- Netlify is excellent for hosting the static React storefront/admin bundle
- Vercel handles the Express API through the existing `backend/api/index.js` and `backend/vercel.json`
- MySQL should stay on a managed external provider so both deployments can connect through environment variables

If you want one host for everything, you can also deploy the frontend to Vercel using `frontend/vercel.json`, but Netlify + Vercel is the cleaner split for this repo as it stands.

## Netlify frontend deployment

1. Push the repo to GitHub.
2. Create a new Netlify site from the repository.
3. Set the Netlify base directory to `frontend`.
4. Netlify will use:
   - build command: `npm run build`
   - publish directory: `build`
5. Add frontend environment variables:
   - `REACT_APP_API_URL=https://your-backend-domain.vercel.app/api`
6. Deploy.

The repo already includes:

- `frontend/netlify.toml`
- `frontend/public/_redirects`

These ensure SPA routing works for deep links like `/products/12` and `/admin/orders`.

## Vercel backend deployment

1. Import the repository into Vercel.
2. Set the Vercel project root to `backend`.
3. Vercel will use `backend/vercel.json`.
4. Add backend environment variables:
   - `NODE_ENV=production`
   - `APP_NAME=TechZone API`
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `JWT_ACCESS_TTL`
   - `JWT_REFRESH_TTL`
   - `JWT_REFRESH_COOKIE_NAME`
   - `CORS_ORIGINS=https://your-netlify-site.netlify.app`
5. Deploy.

## Optional Vercel frontend deployment

If you prefer Vercel for the React app too:

1. Create a separate Vercel project with the root directory set to `frontend`.
2. Add `REACT_APP_API_URL=https://your-backend-domain.vercel.app/api`.
3. Deploy.

The repo already includes `frontend/vercel.json` with SPA rewrites.

## Production checklist

- Replace all JWT secrets with strong random values
- Use a managed MySQL database and allowlist your deployment hosts if needed
- Set `CORS_ORIGINS` to exact deployed frontend URLs
- Confirm cookie settings and HTTPS in production
- Verify seeded demo accounts are removed or passwords changed before public release
- Re-run `npm run build` in `frontend` before release validation
- Confirm order checkout works end-to-end against the production database

## Notes for MySQL Workbench users

- `backend/database/schema.sql` is safe to open and run directly in Workbench
- The schema defines foreign keys, indexes, and constraints for ecommerce workflows
- If you want to use a different database name, update `DB_NAME` in `backend/.env` and either:
  - run `npm run db:setup`, or
  - replace `techzone_ecommerce` in the schema before executing manually

## Verification commands

Frontend production build:

```bash
cd frontend
npm run build
```

Backend sanity checks:

```bash
cd backend
node -e "require('./src/app'); console.log('backend-app-ok')"
node -e "require('./seed'); console.log('seed-ok')"
```
