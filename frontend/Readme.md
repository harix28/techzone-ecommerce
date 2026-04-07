# TechZone - MERN E-Commerce Store

A full-stack electronics e-commerce application built with MongoDB, Express.js, React, and Node.js (MERN stack).

## Features

### Customer (Visitor) Side
- 🏪 Beautiful homepage with hero, categories, featured & new products
- 🔍 Product search, filtering by category/price, sorting
- 📦 Product detail pages with images, specs, reviews
- 🛒 Shopping cart (persisted in localStorage)
- 💳 Checkout with shipping address & payment method selection
- 📋 Order tracking with status progression
- ⭐ Product review system
- 👤 User registration, login & profile management

### Admin Side (`/admin`)
- 📊 Dashboard with revenue charts, order stats, top products
- 📦 Full product CRUD (create, edit, delete, bulk manage)
- 🛍️ Order management with status updates & tracking
- 👥 User management (roles, activation/suspension)
- 🏷️ Category management

## Project Structure

```
ecommerce/
├── backend/                  # Node.js + Express API
│   ├── models/               # MongoDB Mongoose models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   └── Order.js
│   ├── routes/               # API route handlers
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   ├── cart.js
│   │   ├── users.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js           # JWT auth middleware
│   ├── server.js             # Express app entry
│   ├── seed.js               # Database seeder
│   └── .env.example
│
└── frontend/                 # React app
    └── src/
        ├── components/
        │   ├── layout/       # Layout, AdminLayout
        │   └── ui/           # ProductCard, etc.
        ├── context/          # AuthContext, CartContext
        ├── pages/
        │   ├── shop/         # Customer pages
        │   └── admin/        # Admin pages
        └── utils/
            └── api.js        # Axios instance
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed   # Populate demo data
npm run dev    # Start on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start      # Start on http://localhost:3000
```

### 3. Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/techzone
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

**frontend** (optional, defaults to localhost:5000):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Demo Accounts (after seeding)

| Role  | Email                  | Password |
|-------|------------------------|----------|
| Admin | admin@techzone.com     | admin123 |
| User  | user@techzone.com      | user123  |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create (admin)
- `PUT /api/products/:id` - Update (admin)
- `DELETE /api/products/:id` - Delete (admin)
- `POST /api/products/:id/reviews` - Add review (user)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - User's orders
- `GET /api/orders` - All orders (admin)
- `PUT /api/orders/:id/status` - Update status (admin)

### Categories, Users, Dashboard
- Standard CRUD endpoints at `/api/categories`, `/api/users`
- `GET /api/dashboard/stats` - Admin dashboard data

## Technology Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs  
**Frontend:** React 18, React Router 6, Tailwind CSS, Recharts, React Hot Toast, React Icons, Axios

## Production Deployment

1. Build frontend: `cd frontend && npm run build`
2. Serve `build/` folder with Nginx or from Express
3. Set `NODE_ENV=production` in backend
4. Use MongoDB Atlas for production database
5. Deploy backend to Heroku, Railway, or Render# techzone-ecommerce
