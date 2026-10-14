import { useNavigate } from "react";
import { Eye, Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";

export default function WishlistCard({ product, onRemove, removing }) {
  const navigate = useNavigate();
  const outOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-2xl shadow-subtle border border-slate-200/80 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
      
      {/* Image Banner */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60";
          }}
        />

        {/* Category Pill Tag */}
        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
          {product.category}
        </span>

        {/* Wishlisted Badge */}
        <div className="absolute top-3 right-3 p-2 rounded-full bg-rose-500 text-white shadow-md">
          <Heart className="w-4 h-4 fill-white stroke-white" />
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-base font-bold text-slate-900 line-clamp-1">
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg font-extrabold text-slate-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              outOfStock
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {outOfStock ? "Out of Stock" : `${product.stock} left`}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 mt-auto">
          <button
            onClick={() => navigate(`/products/${product._id}`)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-sm hover:from-brand-500 hover:to-indigo-500 transition flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Product</span>
          </button>

          <button
            onClick={() => onRemove(product._id)}
            disabled={removing}
            className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {removing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove from Wishlist</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
