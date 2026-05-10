# 🛍️ NovaShop — Full-Stack E-Commerce Platform

A production-ready e-commerce application built with **Node.js**, **Express**, **MongoDB**, and a clean **Vanilla JS** frontend featuring a modern, editorial design system.

---

## ✨ Features

### 🖥️ Frontend
- **Modern Homepage** — Hero section, category grid, featured products, testimonials
- **Product Listing** — Filters by category/price, sorting, search, pagination
- **Product Detail** — Image gallery, ratings/reviews, quantity selector, add to cart
- **Shopping Cart** — Slide-out sidebar cart, quantity updates, real-time totals
- **Checkout** — Multi-step form with Stripe and PayPal integration
- **User Auth** — Login/register modal, protected routes
- **Order History** — View past orders with status tracking
- **Profile Page** — Update personal information
- **Mobile Responsive** — Works beautifully on all screen sizes
- **Smooth Animations** — Page transitions, hover effects, skeleton loaders

### ⚙️ Backend
- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** — Secure token-based auth
- **Password Hashing** — bcryptjs with 12 salt rounds
- **Input Validation** — express-validator on all routes
- **CORS** configured for security

### 🔐 API Routes
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Protected |
| PUT | `/api/auth/profile` | Update profile | Protected |
| GET | `/api/products` | List products (filters) | Public |
| GET | `/api/products/:id` | Get product details | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/cart` | Get user's cart | Protected |
| POST | `/api/cart/add` | Add item to cart | Protected |
| PUT | `/api/cart/update` | Update item quantity | Protected |
| DELETE | `/api/cart/item/:id` | Remove cart item | Protected |
| POST | `/api/orders` | Create order | Protected |
| GET | `/api/orders` | Get user's orders | Protected |
| GET | `/api/orders/:id` | Get order details | Protected |
| POST | `/api/payment/stripe/create-intent` | Create Stripe intent | Protected |
| GET | `/api/payment/paypal/client-id` | Get PayPal client ID | Public |
| GET | `/api/admin/dashboard` | Admin stats | Admin |
| GET | `/api/admin/orders` | All orders | Admin |
| PUT | `/api/admin/orders/:id` | Update order status | Admin |
| GET | `/api/admin/users` | All users | Admin |

### 🛡️ Admin Panel
- Dashboard with revenue/order/user statistics
- Full product CRUD (create, read, update, delete)
- Order management with status updates
- Customer management

### 💳 Payments
- **Stripe** — Credit/debit card payments via Payment Intents API
- **PayPal** — PayPal button integration with sandbox support
- **Cash on Delivery** — Manual payment option

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **MongoDB** (local) or a **MongoDB Atlas** account → [mongodb.com/atlas](https://www.mongodb.com/atlas)
- **npm** (comes with Node.js)

---

### 1. Clone or Download

```bash
git clone https://github.com/yourname/novashop.git
cd novashop
```

---

### 2. Set Up the Backend

```bash
# Enter the backend folder
cd backend

# Install dependencies
npm install

# Create your .env file from the example
cp .env.example .env
```

Now edit `backend/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_very_long_secret_key_here

# Get these from https://stripe.com/docs/keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Get these from https://developer.paypal.com
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox

FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@shop.com
ADMIN_PASSWORD=Admin123!
```

---

### 3. Seed the Database

Populate the database with sample admin user and 12 products:

```bash
# Make sure you're in the backend folder
cd backend
node config/seed.js
```

Output:
```
📦 Connected to MongoDB for seeding...
🗑️  Cleared existing data
✅ Admin created: admin@shop.com
✅ Sample customer created: jane@example.com
✅ Created 12 sample products
🎉 Database seeded successfully!
```

---

### 4. Start the Backend Server

```bash
# Development mode (auto-reload with nodemon)
npm run dev

# OR production mode
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

Test the API: http://localhost:5000/api/health

---

### 5. Set Up the Frontend

```bash
# From root, go to frontend
cd ../frontend

# Install serve (static file server)
npm install

# Start the frontend server
npm start
```

The frontend will be available at: **http://localhost:3000**

> **Note:** The frontend works even without the backend running! It uses mock data for demo purposes. When the backend is available, it automatically switches to real API calls.

---

### 6. Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend store |
| http://localhost:3000/#admin | Admin panel |
| http://localhost:5000/api/health | Backend health check |

**Demo Credentials:**
- **Admin:** `admin@shop.com` / `Admin123!`
- **Customer:** `jane@example.com` / `Customer123!`

---

## 📁 Project Structure

```
novashop/
├── backend/
│   ├── config/
│   │   └── seed.js           # Database seeder with sample data
│   ├── middleware/
│   │   └── auth.js           # JWT auth middleware + token generation
│   ├── models/
│   │   ├── User.js           # User schema with password hashing
│   │   ├── Product.js        # Product schema with reviews
│   │   ├── Order.js          # Order schema with status tracking
│   │   └── Cart.js           # Shopping cart schema
│   ├── routes/
│   │   ├── auth.js           # Login, register, profile routes
│   │   ├── products.js       # Product CRUD + reviews
│   │   ├── cart.js           # Cart management
│   │   ├── orders.js         # Order creation + tracking
│   │   ├── payment.js        # Stripe + PayPal integration
│   │   └── admin.js          # Admin dashboard routes
│   ├── uploads/              # Product image uploads (created automatically)
│   ├── .env.example          # Environment variable template
│   ├── package.json
│   └── server.js             # Express app entry point
│
└── frontend/
    ├── public/
    │   ├── css/
    │   │   └── styles.css    # Complete design system (3000+ lines)
    │   ├── js/
    │   │   └── app.js        # SPA router + all page renderers
    │   └── index.html        # Single HTML entry point
    └── package.json
```

---

## 🌐 Deploying Online

### Backend — Deploy to Render (Free)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo → select the `backend` folder
4. **Build command:** `npm install`
5. **Start command:** `npm start`
6. Add all environment variables from `.env` in the Render dashboard
7. Get your service URL (e.g., `https://novashop-api.onrender.com`)

### Frontend — Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend/public`
4. Update `API_BASE` in `frontend/public/js/app.js` to your Render URL:
   ```js
   const API_BASE = 'https://novashop-api.onrender.com/api';
   ```
5. Deploy!

### Database — MongoDB Atlas (Free Tier)

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string: `mongodb+srv://...`
4. Update `MONGODB_URI` in your backend environment variables
5. Whitelist all IPs (`0.0.0.0/0`) or your Render service IP

---

## 🔧 Customization

### Adding Products
- **Via Admin Panel:** Login as admin → Admin Panel → Products → Add Product
- **Via Seed File:** Edit `backend/config/seed.js` and re-run `node config/seed.js`
- **Via API:** `POST /api/products` with admin JWT token

### Changing the Theme
Edit CSS variables in `frontend/public/css/styles.css`:
```css
:root {
  --gold:  #c9a84c;   /* Accent color */
  --black: #0a0a0a;   /* Primary dark */
  --cream: #f5f0e8;   /* Background tint */
}
```

### Payment Configuration
- **Stripe:** Replace test keys with live keys in production `.env`
- **PayPal:** Switch `PAYPAL_MODE` from `sandbox` to `live` and use live credentials

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (custom design system), Vanilla JS (SPA) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Payments | Stripe API, PayPal SDK |
| Validation | express-validator |
| Dev Tools | nodemon |

---

## 📸 Sample Data

The seed script creates **12 products** across 7 categories:
- Sony WH-1000XM5 Headphones ($279.99)
- Apple AirPods Pro 2nd Gen ($219.99)
- Samsung 65" 4K QLED TV ($1,199.99)
- MacBook Pro 14" M3 Pro ($1,999.99)
- Nike Air Max 270 ($129.99)
- Levi's 501 Original Jeans ($59.99)
- Instant Pot Duo 7-in-1 ($79.99)
- Dyson V15 Detect Vacuum ($649.99)
- The Psychology of Money ($18.99)
- Premium Yoga Mat ($45.99)
- CeraVe Moisturizing Cream ($14.99)
- LEGO Technic Ferrari 488 ($169.99)

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request
