import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, PackageSearch, Sparkles, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    setLoading(true);
    setError("");

    const timeoutId = setTimeout(() => {
      const params = {};
      if (search) params.search = search;
      if (category && category !== "All") params.category = category;

      getProducts(params)
        .then((res) => {
          setProducts(res.data.products || []);
        })
        .catch(() => {
          setError("Something went wrong while loading products.");
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, category]);

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Back to Home Navigation */}
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-subtle mb-6 group hover:border-brand-200"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-brand-600 group-hover:-translate-x-0.5 transition-all" />
          <span>Back to Home</span>
        </Link>

        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Explore Collection</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
              All Products
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Browse top electronics, fashion, literature, and home essentials.
            </p>
          </div>

          {!loading && !error && (
            <span className="self-start md:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-subtle">
              Showing {products.length} {products.length === 1 ? "Product" : "Products"}
            </span>
          )}
        </div>

        {/* Search & Filter Component */}
        <SearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-9 h-9 animate-spin text-brand-600 mb-3" />
            <p className="text-sm font-semibold">Fetching products catalog...</p>
          </div>
        )}

        {/* Error Alert */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-800 text-sm max-w-md mx-auto">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-subtle max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <PackageSearch className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              No products found
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs">
              We couldn't find any products matching your search criteria. Try adjusting your query or category filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-5 px-4 py-2.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
