import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Loader2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getProductById(id)
      .then((res) => {
        setProduct(res.data.product);
      })
      .catch(() => {
        setError("Something went wrong while loading this product.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const outOfStock = product && product.stock <= 0;
  const isLowStock = product && product.stock > 0 && product.stock <= 3;

  const { addToCart, getQuantity, isPending } = useCart();
  const [cartError, setCartError] = useState("");
  const inCartQty = product ? getQuantity(product._id) : 0;
  const adding = product ? isPending(product._id) : false;
  const atStockLimit = product ? inCartQty >= product.stock : false;

  const handleAddToCart = async () => {
    setCartError("");
    const result = await addToCart(product._id);
    if (!result.ok) setCartError(result.message);
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Back Link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-subtle mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-9 h-9 animate-spin text-brand-600 mb-3" />
            <p className="text-sm font-semibold">Loading product details...</p>
          </div>
        )}

        {/* Error Alert */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-800 text-sm max-w-md mx-auto">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Product Info Card */}
        {!loading && !error && product && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Image Box */}
            <div className="relative aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/60 group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60";
                }}
              />
              <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Details Box */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>

                <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {product.name}
                </h1>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Inclusive of all taxes</span>
                </div>

                <p className="mt-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-5">
                  {product.description}
                </p>

                {/* Stock Indicator */}
                <div className="mt-5 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      outOfStock
                        ? "bg-rose-500"
                        : isLowStock
                        ? "bg-amber-500 animate-pulse"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      outOfStock
                        ? "text-rose-600"
                        : isLowStock
                        ? "text-amber-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {outOfStock
                      ? "Out of Stock"
                      : isLowStock
                      ? `Low Stock - Only ${product.stock} left`
                      : `In Stock (${product.stock} units available)`}
                  </span>
                </div>
              </div>

              {/* Action & Features */}
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
                <div>
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || outOfStock || atStockLimit}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                      outOfStock
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
                        : atStockLimit
                        ? "bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed shadow-none"
                        : inCartQty > 0
                        ? "bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 shadow-brand-500/10"
                        : "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.99]"
                    }`}
                  >
                    {adding ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Adding to Cart...</span>
                      </>
                    ) : outOfStock ? (
                      <span>Currently Out of Stock</span>
                    ) : atStockLimit ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-600" />
                        <span>In Cart ({inCartQty}) · Stock Limit Reached</span>
                      </>
                    ) : inCartQty > 0 ? (
                      <>
                        <ShoppingCart className="w-5 h-5 text-brand-600" />
                        <span>Add Another ({inCartQty} in cart)</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  {cartError && (
                    <p className="mt-2 text-xs text-rose-600 font-medium flex items-center gap-1 justify-center">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{cartError}</span>
                    </p>
                  )}
                </div>

                {/* Benefits Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 flex flex-col items-center">
                    <Truck className="w-4 h-4 text-brand-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">Free Express Delivery</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 flex flex-col items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">1 Year Warranty</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 flex flex-col items-center">
                    <RotateCcw className="w-4 h-4 text-indigo-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">30 Days Return</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
