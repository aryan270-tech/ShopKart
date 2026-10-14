import axios from "axios";

// Point this at your Lab 01 backend.
// Keep it in an env file (.env) in a real project: VITE_API_BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// A single shared axios instance.
// withCredentials: true tells the browser to send/receive the HttpOnly
// session cookie on every request, so we never touch the cookie in JS.
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Auth endpoints -------------------------------------------------

export const registerCustomer = (payload) =>
  api.post("/customers/register", payload);

export const loginCustomer = (payload) =>
  api.post("/customers/login", payload);

export const getCurrentCustomer = () => api.get("/customers/me");

export const logoutCustomer = () => api.post("/customers/logout");

// ---- Product endpoints ------------------------------------------------

// params can include: search, category, sort
export const getProducts = (params = {}) =>
  api.get("/products", { params });

export const getProductById = (id) => api.get(`/products/${id}`);

export const createProduct = (payload) => api.post("/products", payload);

// ---- Wishlist endpoints ------------------------------------------------

export const addToWishlist = (productId) =>
  api.post(`/wishlist/${productId}`);

export const getWishlist = () => api.get("/wishlist");

export const removeFromWishlist = (productId) =>
  api.delete(`/wishlist/${productId}`);

// ---- Cart endpoints ------------------------------------------------------

export const addToCartRequest = (productId) => api.post(`/cart/${productId}`);

export const getCartRequest = () => api.get("/cart");

export const updateCartQuantityRequest = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

export const removeFromCartRequest = (productId) =>
  api.delete(`/cart/${productId}`);

// ---- Order endpoints (Lab 06) ---------------------------------------------

// Sends ONLY the shipping address. The server reads the cart and prices itself.
export const createPaymentOrderRequest = (shippingAddress) =>
  api.post("/orders/create-payment-order", { shippingAddress });

export const verifyPaymentRequest = (payload) =>
  api.post("/orders/verify-payment", payload);

export const getOrdersRequest = () => api.get("/orders");

export const getOrderByIdRequest = (id) => api.get(`/orders/${id}`);

// Bonus: dev-only endpoint to move an order forward
export const updateOrderStatusRequest = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });

export default api;
