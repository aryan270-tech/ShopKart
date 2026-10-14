# ShopKart — Full-Stack E-Commerce Platform

A production-grade, modern full-stack e-commerce web application built with **React**, **Node.js**, **Express**, **MongoDB Atlas**, and **Tailwind CSS**. Features customer authentication, dynamic catalog search/filters, cart and wishlist management, stock limit guards, order processing with Razorpay payment verification, and order tracking.

**GitHub Username:** [@aryan270-tech](https://github.com/aryan270-tech)  
**Project:** ShopKart Full-Stack Lab Project  

---

## 🚀 Key Features

### 🛍️ Customer & Storefront Experience
* **Modern Restyled UI/UX**: Clean indigo/slate aesthetic, glassmorphic navigation header, fluid typography (Plus Jakarta Sans), and responsive layout across mobile, tablet, and desktop.
* **Authentication & Profiles**: Secure JWT authentication with HttpOnly cookies, password hashing (bcrypt), form validation, and dedicated customer profile overview.
* **Dynamic Product Catalog**: Real-time debounced search, category filtering (Electronics, Fashion, Books, Home), stock status pills, and detailed product breakdown pages.
* **Smart Cart System**: Shared context state, quantity increment/decrement controls, real-time stock limiter guards, subtotal calculation, and persistence in MongoDB.
* **Saved Wishlist**: Add/remove favorite items with optimistic UI and dedicated wishlist gallery.
* **Seamless Checkout & Payment Flow**: Multi-field validated shipping address form, Razorpay integration, HMAC-SHA256 signature verification, and automated test payment fallback.
* **Order Management & Tracking**: Real-time order status tracker (`PLACED` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`), interactive order history, and detailed receipt views.

---

## 🛠️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS v3, Lucide React, Axios |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB ODM), JWT, Cookie-Parser, CORS |
| **Database** | MongoDB Atlas (Cloud Managed NoSQL) |
| **Payment Gateway** | Razorpay SDK (with server-side signature verification & mock test mode) |
| **Styling & Fonts** | Tailwind CSS, Plus Jakarta Sans, Custom Glassmorphism Layers |

---

## 📁 Project Structure

```text
ShopKart-Lab06/
├── backend/
│   ├── config/             # DB & Razorpay configuration
│   ├── controllers/        # Business logic (auth, product, cart, order, wishlist)
│   ├── middlewares/        # JWT auth protection & request validators
│   ├── models/             # Mongoose schemas (Customer, Product, Order)
│   ├── routes/             # Express API routes
│   ├── utils/              # Token generators & helpers
│   ├── .env.example        # Sample environment variables
│   ├── index.js            # Express server entry point
│   └── package.json
│
├── frontend/
│   └── shopkart/
│       ├── public/         # Static assets
│       ├── src/
│       │   ├── components/ # Reusable UI components (Navbar, ProductCard, CartItem, etc.)
│       │   ├── context/    # CartContext & global state providers
│       │   ├── pages/      # Route pages (Home, Products, ProductDetails, Cart, Checkout, Orders)
│       │   ├── services/   # Axios API client & endpoints
│       │   ├── App.jsx     # Route configurations
│       │   ├── index.css   # Tailwind design tokens & component layers
│       │   └── main.jsx
│       ├── .env.example    # Sample frontend environment config
│       ├── tailwind.config.js
│       └── package.json
│
├── .gitignore              # Protects secrets & node_modules from git
└── README.md
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [Git](https://git-scm.com/)
* A [MongoDB Atlas](https://www.mongodb.com/atlas) connection string (or local MongoDB)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/aryan270-tech/ShopKart.git
cd ShopKart
```

---

### Step 2: Configure & Start Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the `backend/` directory (refer to `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopkart?retryWrites=true&w=majority
   JWT_SECRET=myShopKartSecret123
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
   ```
   *(Note: If placeholder keys are left as-is, the built-in Mock Test Mode automatically processes test checkout seamlessly).*

3. Start the backend server:
   ```bash
   npm start
   # or for development with hot reload:
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

---

### Step 3: Configure & Start Frontend

1. In a new terminal, navigate to the `frontend/shopkart` directory:
   ```bash
   cd frontend/shopkart
   npm install
   ```

2. *(Optional)* Verify or create `.env` in `frontend/shopkart/`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The client application will run at `http://localhost:5173`.*

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/customers`)
* `POST /api/customers/register` — Register a new customer
* `POST /api/customers/login` — Authenticate and issue HttpOnly session cookie
* `GET  /api/customers/me` — Get authenticated customer profile
* `POST /api/customers/logout` — Clear session cookie

### 📦 Products (`/api/products`)
* `GET  /api/products` — Retrieve all products (supports `?search=` and `?category=`)
* `GET  /api/products/:id` — Retrieve product details by ID
* `POST /api/products` — Add a new product (admin/seed)

### 🛒 Cart & Wishlist (`/api/cart`, `/api/wishlist`)
* `GET    /api/cart` — Fetch customer's active cart
* `POST   /api/cart/:productId` — Add item to cart
* `PATCH  /api/cart/:productId` — Update item quantity
* `DELETE /api/cart/:productId` — Remove item from cart
* `GET    /api/wishlist` — Fetch customer wishlist
* `POST   /api/wishlist/:productId` — Add product to wishlist
* `DELETE /api/wishlist/:productId` — Remove product from wishlist

### 💳 Orders & Payments (`/api/orders`)
* `POST  /api/orders/create-payment-order` — Validates inventory & generates Razorpay / test payment order
* `POST  /api/orders/verify-payment` — Validates HMAC SHA-256 signature, marks order `PAID`, clears cart
* `GET   /api/orders` — List authenticated user's order history
* `GET   /api/orders/:id` — Fetch specific order details with status tracker

---

## 🌐 Deployment Guide (Live Demo)

### Option 1: Fast Full-Stack Deployment on Render (Recommended)
This repository is pre-configured with a root `package.json` to deploy both frontend and backend together as a single service on Render:

1. Go to [render.com](https://render.com) and click **New + > Web Service**.
2. Connect your GitHub repository: `https://github.com/aryan270-tech/ShopKart`.
3. Set the following settings:
   * **Name**: `shopkart`
   * **Root Directory**: *(leave blank)*
   * **Environment**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   * `NODE_ENV` = `production`
   * `MONGO_URI` = *(your MongoDB Atlas connection string)*
   * `JWT_SECRET` = *(your secret key, e.g. `myShopKartSecret123`)*
   * `RAZORPAY_KEY_ID` = `rzp_test_xxxxxxxxxxxxxx`
   * `RAZORPAY_KEY_SECRET` = `your_razorpay_test_key_secret`
5. Click **Create Web Service**. Your app will be live at `https://shopkart-xxxx.onrender.com`!

---

### Option 2: Split Deployment (Backend on Render + Frontend on Vercel)
If you prefer deploying frontend and backend independently:

1. **Deploy Backend on Render**:
   * Root Directory: `backend`
   * Build Command: `npm install`
   * Start Command: `npm start`
   * Environment Variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL=https://your-frontend.vercel.app`
2. **Deploy Frontend on Vercel**:
   * Go to [vercel.com](https://vercel.com) and import the repository.
   * Root Directory: `frontend/shopkart`
   * Framework Preset: `Vite`
   * Environment Variable: `VITE_API_BASE_URL` = `https://your-backend.onrender.com`
   * Click **Deploy**.

---

## 🔒 Security Practices
* **Zero Secrets Committed**: All database credentials, JWT secrets, and payment keys are loaded strictly from environment variables.
* **HttpOnly Session Cookies**: JWT cookies are `HttpOnly` and cannot be accessed via browser JavaScript, mitigating XSS attacks.
* **Cross-Site Cookie Compatibility**: Configured `SameSite=None; Secure` in production for seamless authentication across domains.
* **Server-Side Validation**: Product pricing, stock verification, and subtotal calculation are performed strictly on the backend to prevent client-side manipulation.
* **Cryptographic Verification**: Payment verification uses HMAC SHA-256 checksums to authenticate genuine Razorpay callbacks.

---

## 👨‍💻 Author
* **Aryan Patil** ([@aryan270-tech](https://github.com/aryan270-tech))
