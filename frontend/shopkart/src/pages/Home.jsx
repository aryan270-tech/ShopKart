import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Heart,
  ShoppingCart,
  ArrowRight,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../services/api";

export default function Home() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentCustomer()
      .then((res) => {
        setCustomer(res.data.customer || res.data);
      })
      .catch(() => {
        setError("Could not load your account details.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white p-8 sm:p-10 shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 top-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-300 text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Premium Member Experience</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {loading
                ? "Welcome to ShopKart"
                : `Welcome back, ${customer?.fullName || customer?.name || "Shopper"}! 👋`}
            </h1>
            
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Discover top-tier curated products across Electronics, Fashion, Books & Home with rapid shipping and exclusive member perks.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-brand-500/25 hover:from-brand-400 hover:to-indigo-500 transition-all flex items-center gap-2 group"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/cart"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-semibold border border-white/15 transition flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-brand-300" />
                <span>My Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
            <p className="text-sm font-medium">Loading your profile details...</p>
          </div>
        )}

        {/* Error Alert */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Account Details & Dashboard Grid */}
        {!loading && customer && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Account Card (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-display text-xl font-bold flex items-center justify-center shadow-md shadow-brand-500/20">
                    {getInitials(customer.fullName || customer.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-bold text-slate-900">
                        {customer.fullName || customer.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Customer Account Dashboard</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white text-brand-600 shadow-sm border border-slate-200/60">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Full Name</span>
                    <span className="text-sm font-bold text-slate-900 line-clamp-1">
                      {customer.fullName || customer.name}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white text-brand-600 shadow-sm border border-slate-200/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Email Address</span>
                    <span className="text-sm font-bold text-slate-900 line-clamp-1">
                      {customer.email}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white text-brand-600 shadow-sm border border-slate-200/60">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                    <span className="text-sm font-bold text-slate-900">
                      {customer.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card (1 col) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-600" />
                  <span>Quick Shortcuts</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Jump directly to your preferred sections</p>

                <div className="mt-5 space-y-2.5">
                  <Link
                    to="/products"
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-brand-200 hover:bg-brand-50/50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">Browse Catalog</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/wishlist"
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-rose-200 hover:bg-rose-50/50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition">
                        <Heart className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">Saved Wishlist</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/cart"
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-brand-200 hover:bg-brand-50/50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">View Shopping Cart</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guarantee Features Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-subtle flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Fast Shipping</h4>
              <p className="text-[11px] text-slate-500">Free delivery on top items</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-subtle flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Secure Checkout</h4>
              <p className="text-[11px] text-slate-500">256-bit Encrypted data</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-subtle flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Easy Returns</h4>
              <p className="text-[11px] text-slate-500">30-day money back</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-subtle flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">24/7 Support</h4>
              <p className="text-[11px] text-slate-500">Always here to help</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
