import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";

export default function CartItem({
  item,
  busy,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;
  const atMax = quantity >= product.stock;

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-subtle hover:shadow-card transition-all duration-200">
      
      {/* Product Image */}
      <Link
        to={`/products/${product._id}`}
        className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 group relative"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60";
          }}
        />
      </Link>

      {/* Item Info & Actions */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <Link
              to={`/products/${product._id}`}
              className="mt-1 block font-display text-base font-bold text-slate-900 line-clamp-1 hover:text-brand-600 transition"
            >
              {product.name}
            </Link>
            <p className="text-xs text-slate-500 font-medium">
              Unit Price: ₹{product.price.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="text-right">
            <span className="font-display text-lg font-extrabold text-slate-900">
              ₹{lineTotal.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Quantity Controls & Remove */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          
          {/* Stepper */}
          <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1 border border-slate-200/60">
            <button
              onClick={onDecrease}
              disabled={busy || quantity <= 1}
              aria-label="Decrease quantity"
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 hover:shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-10 text-center text-xs font-bold text-slate-900 flex items-center justify-center">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" /> : quantity}
            </span>

            <button
              onClick={onIncrease}
              disabled={busy || atMax}
              aria-label="Increase quantity"
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 hover:shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Remove Button & Warnings */}
          <div className="flex items-center gap-3">
            {atMax && (
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                <AlertCircle className="w-3 h-3" /> Max ({product.stock})
              </span>
            )}

            <button
              onClick={onRemove}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
