import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Check, Loader2, Sparkles } from "lucide-react";
import { addToWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const outOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const [wishlistState, setWishlistState] = useState("idle");

  const { addToCart, getQuantity, isPending } = useCart();
  const [cartError, setCartError] = useState("");
  const inCartQty = getQuantity(product._id);
  const adding = isPending(product._id);
  const atStockLimit = inCartQty >= product.stock;

  const handleAddToCart = async () => {
    setCartError("");
    const result = await addToCart(product._id);
    if (!result.ok) setCartError(result.message);
  };

  const handleAddToWishlist = async () => {
    if (wishlistState === "saving" || wishlistState === "saved") return;

    setWishlistState("saving");
    try {
      await addToWishlist(product._id);
      setWishlistState("saved");
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistState("saved");
      } else {
        setWishlistState("error");
      }
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-subtle border border-slate-200/80 overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-card-hover transition-all duration-300 relative">
      
      {/* Image Container with Floating Overlays */}
      <div className="relative aspect-square bg-slate-100/70 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60";
          }}
        />

        {/* Category Pill Tag */}
        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
          {product.category}
        </span>

        {/* Floating Heart Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          disabled={wishlistState === "saving" || wishlistState === "saved"}
          title={wishlistState === "saved" ? "In Wishlist" : "Add to Wishlist"}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
            wishlistState === "saved"
              ? "bg-rose-500 text-white scale-105"
              : wishlistState === "error"
              ? "bg-rose-100 text-rose-600 border border-rose-300"
              : "bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white hover:scale-110"
          }`}
        >
          {wishlistState === "saving" ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
          ) : (
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlistState === "saved" ? "fill-white stroke-white" : ""
              }`}
            />
          )}
        </button>

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={() => navigate(`/products/${product._id}`)}
            className="w-full py-2 px-3 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 font-semibold text-xs shadow-md hover:bg-white transition flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-brand-600" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Title & Price */}
        <h3
          onClick={() => navigate(`/products/${product._id}`)}
          className="font-display text-base font-bold text-slate-900 line-clamp-1 cursor-pointer hover:text-brand-600 transition"
        >
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {/* Stock Level Indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                outOfStock
                  ? "bg-rose-500"
                  : isLowStock
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500"
              }`}
            />
            <span
              className={`text-xs font-semibold ${
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
                ? `Only ${product.stock} left`
                : "In Stock"}
            </span>
          </div>
        </div>

        {/* Actions Area */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={adding || outOfStock || atStockLimit}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              outOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : atStockLimit
                ? "bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed"
                : inCartQty > 0
                ? "bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100"
                : "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.98]"
            }`}
          >
            {adding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding to Cart...</span>
              </>
            ) : outOfStock ? (
              <span>Out of Stock</span>
            ) : atStockLimit ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>In Cart ({inCartQty}) · Max</span>
              </>
            ) : inCartQty > 0 ? (
              <>
                <ShoppingCart className="w-4 h-4 text-brand-600" />
                <span>Add Another ({inCartQty} in cart)</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {cartError && (
            <p className="text-[11px] text-rose-600 text-center font-medium">
              {cartError}
            </p>
          )}

          <button
            onClick={() => navigate(`/products/${product._id}`)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition md:hidden"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
