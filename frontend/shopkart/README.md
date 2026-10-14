# ShopKart — Auth, Products, Wishlist & Shopping Cart (Lab 05)

React frontend for the ShopKart customer auth flow (Register → Login → Protected Home → Logout), built against the Lab 01 backend.

## Stack

React 18 · React Router DOM 6 · Axios · Tailwind CSS · Vite

## Project structure

```
src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Home.jsx
├── components/
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
├── services/
│   └── api.js
├── App.jsx
├── main.jsx
└── index.css
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Point the app at your Lab 01 backend:
   ```
   cp .env.example .env
   ```
   then edit `VITE_API_BASE_URL` in `.env` if your backend isn't on `http://localhost:5000/api`.
3. Make sure your backend has CORS configured to allow credentials from the frontend origin, e.g.:
   ```js
   app.use(cors({ origin: "http://localhost:5173", credentials: true }));
   ```
   and that `POST /customers/login` sets its cookie with `httpOnly: true`.
4. Run the dev server:
   ```
   npm run dev
   ```
   The app runs at `http://localhost:5173`.

## How the auth flow works

- **Register** (`/register`) — controlled form, client-side validation, `POST /customers/register`, redirects to `/login` on success.
- **Login** (`/login`) — `POST /customers/login` via the shared axios instance (`withCredentials: true`), so the HttpOnly session cookie the backend sets is stored by the browser automatically. Shows "Invalid Credentials" on a failed attempt. Redirects to `/home` on success.
- **Home** (`/home`) — wrapped in `ProtectedRoute`, which calls `GET /customers/me` on mount to confirm the session is valid (rather than trusting anything stored locally) and redirects to `/login` if that call fails. Displays the customer's name, email, and phone.
- **Logout** — Navbar button calls `POST /customers/logout`, then navigates to `/login`. The backend clears the cookie; the frontend never touches it directly.

## Viva prep

**1. Why do we use `withCredentials: true`?**
By default, the browser won't attach cookies to cross-origin (or even some same-site) XHR/fetch requests. Setting `withCredentials: true` on the axios instance tells the browser to include the session cookie on every request to the API, and to store any `Set-Cookie` the server sends back. Without it, the login cookie would never reach the backend on later requests, and the user would look logged out on every page load.

**2. Why can't JavaScript read an HttpOnly cookie?**
`HttpOnly` is a cookie flag the server sets that hides the cookie from `document.cookie` and any other JS API — it's only ever sent automatically by the browser in HTTP request headers. This is a deliberate defense: if an attacker manages to inject a script (XSS), that script still can't steal the session cookie and replay it elsewhere. It's why this app never stores or manually forwards a token — the browser handles it entirely.

**3. Why is `/home` called a protected route?**
Because it should only render for a logged-in customer. `ProtectedRoute` enforces that by calling `GET /customers/me` before rendering `Home`, and redirecting to `/login` if that call comes back unauthorized. It's "protected" in the sense that access is gated on a real, server-verified session — not just on the route existing.

**4. Why do we fetch `/customers/me` instead of storing the user manually?**
Because the HttpOnly cookie can't be read by JavaScript, the frontend has no reliable way to know who's logged in (or whether the session is still valid) without asking the server. Storing a "logged in" flag or user object in localStorage would drift out of sync — it wouldn't reflect an expired session, a logout from another tab, or a revoked account. `/customers/me` is always asking the source of truth.

**5. What is the difference between authentication and authorization?**
Authentication is confirming *who* someone is (login: matching an email/password to an account, and getting a valid session in return). Authorization is deciding *what that identity is allowed to do* (e.g., can this customer view this order, access this admin page, etc.). This lab only implements authentication — every logged-in customer sees the same `/home` page — but the same session cookie pattern is what authorization checks would build on.

---

## Lab 05 — Shopping Cart

### What was added

**Backend** (`/cart`, all routes protected by the JWT cookie)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/cart/:productId` | Add product (new → qty 1, existing → qty + 1) |
| GET | `/cart` | Current customer's cart, Product populated |
| PATCH | `/cart/:productId` | Set quantity (`{ "quantity": 3 }`) |
| DELETE | `/cart/:productId` | Remove product, returns updated cart |

- `Customer` schema gets `cart: [{ product (ref), quantity (min 1) }]`, default `[]` (existing customers keep working).
- Stock is validated on add and on update (400 if exceeded). 400 for invalid id / quantity < 1 / non-number, 404 for missing product or product not in cart, 401 if not logged in.
- Mutations return the full populated cart so the frontend can replace its state directly.

**Frontend**

```
src/
├── context/CartContext.jsx   # global cart state (Context API)
├── components/CartItem.jsx   # row with [-] qty [+] and Remove
├── pages/Cart.jsx            # /cart: items, Order Summary, loading/empty/error
├── pages/Checkout.jsx        # placeholder for Lab 06
└── (updated) Navbar, ProductCard, ProductDetails, Login, App, main, api.js
```

- `CartProvider` wraps the app; Navbar, ProductCard, ProductDetails and the Cart page all use `useCart()`. Nothing fetches the cart on its own.
- `subtotal` and `totalUnits` are **derived** from `cartItems` (never stored in MongoDB).
- Per-item loading: `isPending(productId)` disables only the row/button being updated.
- Cart is reloaded on app start (refresh keeps it), after login, and cleared on logout. It persists in MongoDB, so logout → login restores it.

### Postman test plan
1. `POST /cart/:id` → quantity 1 → again → quantity 2
2. `GET /cart` → populated products
3. `PATCH /cart/:id` `{ "quantity": 3 }`
4. `PATCH` with quantity above stock → 400
5. `DELETE /cart/:id` → item gone
6. Any call without the cookie → 401

### Viva prep (Lab 05)

**Why global state?** Navbar count, product cards and the cart page must show the same cart. One shared `CartContext` removes duplicate copies that can drift apart.

**Server state vs UI state?** Server state (`cartItems`) mirrors MongoDB and is replaced with the backend response after each mutation. UI state (`pendingIds`, `actionError`) only describes what the screen is doing right now.

**Derived state / why not store subtotal?** `subtotal = Σ price × quantity` is computed from `cartItems`. A stored copy could go stale when a price changes.

**How is stock enforced?** The backend compares the new quantity with `Product.stock` on add and update and returns 400 if exceeded; the UI also disables `+` / Add at the limit.

**Same product twice?** The backend finds the existing cart entry and increments `quantity`, so there is never a duplicate row.

**Why price isn't copied into the cart?** The cart stores only `product` ref + `quantity`; `populate` always returns the latest price/stock.

**Why does the server use the JWT?** The user id comes from the verified cookie, so a client can never read or edit another customer's cart.
