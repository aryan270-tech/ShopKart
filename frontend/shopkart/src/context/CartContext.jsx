import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addToCartRequest,
  getCartRequest,
  removeFromCartRequest,
  updateCartQuantityRequest,
} from "../services/api";

// One shared source of truth for the cart on the frontend.
// Navbar, ProductCard, ProductDetails and the Cart page all read from here,
// so they can never disagree with each other.
const CartContext = createContext(null);

const errorMessage = (err, fallback) =>
  err.response?.data?.message || fallback;

export function CartProvider({ children }) {
  // Server state: the cart as returned by the backend
  // [{ product: {...}, quantity }]
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state: which product ids currently have a request in flight,
  // so only that card/button shows a loading state.
  const [pendingIds, setPendingIds] = useState([]);
  // Last mutation error (e.g. "Only 3 unit(s) available") shown near the UI.
  const [actionError, setActionError] = useState("");

  // Refresh cart from backend.
  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCartRequest();
      setCartItems(res.data.cart || []);
    } catch (err) {
      if (err.response?.status === 401) {
        // Not logged in (e.g. on the login page) -> not an error, just empty.
        setCartItems([]);
      } else {
        setError("Unable to load your cart.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load once when the app starts (also covers page refresh).
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Used on logout so the next user never sees the previous user's cart.
  const clearCart = useCallback(() => {
    setCartItems([]);
    setError("");
    setActionError("");
  }, []);

  const setPending = (productId, isPending) =>
    setPendingIds((prev) =>
      isPending
        ? [...prev, productId]
        : prev.filter((id) => id !== productId)
    );

  // Shared wrapper for every mutation: marks the item as pending, calls the
  // API, and replaces cart state with the cart the backend returns.
  const runMutation = useCallback(async (productId, request, fallbackMsg) => {
    setPending(productId, true);
    setActionError("");
    try {
      const res = await request();
      setCartItems(res.data.cart || []);
      return { ok: true };
    } catch (err) {
      const message = errorMessage(err, fallbackMsg);
      setActionError(message);
      return { ok: false, message };
    } finally {
      setPending(productId, false);
    }
  }, []);

  const addToCart = useCallback(
    (productId) =>
      runMutation(
        productId,
        () => addToCartRequest(productId),
        "Could not add to cart."
      ),
    [runMutation]
  );

  const updateQuantity = useCallback(
    (productId, quantity) =>
      runMutation(
        productId,
        () => updateCartQuantityRequest(productId, quantity),
        "Could not update quantity."
      ),
    [runMutation]
  );

  const removeFromCart = useCallback(
    (productId) =>
      runMutation(
        productId,
        () => removeFromCartRequest(productId),
        "Could not remove item."
      ),
    [runMutation]
  );

  // Derived values: calculated from cartItems, never stored or fetched.
  const totalUnits = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const getQuantity = useCallback(
    (productId) =>
      cartItems.find((item) => item.product._id === productId)?.quantity || 0,
    [cartItems]
  );

  const isPending = useCallback(
    (productId) => pendingIds.includes(productId),
    [pendingIds]
  );

  const value = {
    cartItems,
    loading,
    error,
    actionError,
    clearActionError: () => setActionError(""),
    totalUnits,
    subtotal,
    getQuantity,
    isPending,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
