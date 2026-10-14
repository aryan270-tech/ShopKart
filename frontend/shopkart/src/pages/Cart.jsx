import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    actionError,
    totalUnits,
    subtotal,
    isPending,
    updateQuantity,
    removeFromCart,
    refreshCart,
  } = useCart();

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>Shopping Cart</span>
              {totalUnits > 0 && (
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                  {totalUnits} {totalUnits === 1 ? "Item" : "Items"}
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review your items before proceeding to checkout.
            </p>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-9 h-9 animate-spin text-brand-600 mb-3" />
            <p className="text-sm font-semibold">Retrieving your cart items...</p>
          </div>
        )}

        {/* Error Alert */}
        {!loading && error && (
          <div className="rounded-3xl bg-white border border-rose-200 p-8 text-center max-w-md mx-auto shadow-subtle">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-slate-800 text-sm font-semibold mb-4">{error}</p>
            <button
              onClick={refreshCart}
              className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center gap-2 mx-auto shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Empty Cart View */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-10 shadow-subtle max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-4 shadow-inner">
              <ShoppingCart className="w-10 h-10 stroke-[1.8]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Your cart is empty
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">
              Looks like you haven't added anything to your cart yet. Explore our catalog and find great deals!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 transition flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Start Shopping Now</span>
            </button>
          </div>
        )}

        {/* Cart Content (Items + Order Summary) */}
        {!loading && !error && cartItems.length > 0 && (
          <>
            {actionError && (
              <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Items List (Left Column) */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.product._id}
                    item={item}
                    busy={isPending(item.product._id)}
                    onIncrease={() =>
                      updateQuantity(item.product._id, item.quantity + 1)
                    }
                    onDecrease={() =>
                      updateQuantity(item.product._id, item.quantity - 1)
                    }
                    onRemove={() => removeFromCart(item.product._id)}
                  />
                ))}
              </div>

              {/* Order Summary (Right Column Sticky) */}
              <aside className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 lg:sticky lg:top-24 space-y-6">
                <h2 className="font-display text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <Sparkles className="w-4 h-4 text-brand-600" />
                </h2>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <dt>Total Quantity</dt>
                    <dd className="font-bold text-slate-900">{totalUnits} units</dd>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <dt>Shipping Fee</dt>
                    <dd className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                      FREE
                    </dd>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <dt>Estimated Tax</dt>
                    <dd className="font-semibold text-slate-700">Included</dd>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100 text-slate-900 font-extrabold text-lg">
                    <dt>Subtotal</dt>
                    <dd className="text-brand-600">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </dd>
                  </div>
                </dl>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="pt-2 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-bit Encrypted Checkout</span>
                </div>
              </aside>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
