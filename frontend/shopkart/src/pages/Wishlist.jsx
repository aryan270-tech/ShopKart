import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, RefreshCw, ShoppingBag, Loader2, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { getWishlist, removeFromWishlist } from "../services/api";

export default function Wishlist() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = useCallback(() => {
    setLoading(true);
    setError("");

    getWishlist()
      .then((res) => {
        setProducts(res.data.wishlist || []);
      })
      .catch(() => {
        setError("We couldn't load your wishlist.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      // Leave in place on error
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Saved Favorites</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
              My Wishlist
            </h1>
            {!loading && !error && (
              <p className="text-slate-500 text-sm mt-1">
                {products.length} {products.length === 1 ? "product" : "products"} saved for later.
              </p>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-9 h-9 animate-spin text-brand-600 mb-3" />
            <p className="text-sm font-semibold">Loading your saved items...</p>
          </div>
        )}

        {/* Error Alert */}
        {!loading && error && (
          <div className="rounded-3xl bg-white border border-rose-200 p-8 text-center max-w-md mx-auto shadow-subtle">
            <p className="text-slate-800 text-sm font-semibold mb-4">{error}</p>
            <button
              onClick={fetchWishlist}
              className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center gap-2 mx-auto shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Empty Wishlist */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-10 shadow-subtle max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4 shadow-inner">
              <Heart className="w-10 h-10 stroke-[1.8]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Your wishlist is empty
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">
              Save products you love while browsing and keep track of them right here.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 transition flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
                removing={removingId === product._id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
