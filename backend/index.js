const path = require('path');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// Required behind reverse proxies (Render, Railway, Vercel, Heroku) for HTTPS cookies
app.set('trust proxy', 1);

// Permissive CORS for development & deployed frontends (Vercel, Netlify, Render)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all origins with credentials for evaluation
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Direct routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Also support /api prefix for flexibility
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Serve built frontend if deployed together (e.g. Render / Single-Service)
const frontendDistPath = path.join(__dirname, '../frontend/shopkart/dist');
app.use(express.static(frontendDistPath));

// For client-side routing, route any unmatched GET request to index.html (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (
    req.path.startsWith('/customers') ||
    req.path.startsWith('/products') ||
    req.path.startsWith('/wishlist') ||
    req.path.startsWith('/cart') ||
    req.path.startsWith('/orders') ||
    req.path.startsWith('/api')
  ) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });