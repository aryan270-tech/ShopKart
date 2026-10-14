import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Home as HomeIcon,
  Grid,
  Heart,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnits, clearCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch {
      // Fall through to login
    } finally {
      clearCart();
      navigate("/login", { replace: true });
    }
  };

  const navItems = [
    { name: "Home", path: "/home", icon: HomeIcon },
    { name: "Products", path: "/products", icon: Grid },
    { name: "Wishlist", path: "/wishlist", icon: Heart },
    { name: "My Orders", path: "/orders", icon: Package },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link
            to="/home"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-slate-800 bg-clip-text text-transparent">
                ShopKart
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-600 -mt-1 flex items-center gap-0.5">
                Premium Store <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-white text-brand-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      active ? "text-brand-600 stroke-[2.2]" : "text-slate-500"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                isActive("/cart")
                  ? "bg-brand-50 border-brand-200 text-brand-700 shadow-sm"
                  : "bg-white border-slate-200/90 text-slate-700 hover:border-brand-200 hover:bg-slate-50"
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-brand-600" />
              <span>Cart</span>
              {totalUnits > 0 ? (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-brand-600 text-white shadow-sm animate-pulse-subtle">
                  {totalUnits}
                </span>
              ) : (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                  0
                </span>
              )}
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-200"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <ShoppingCart className="w-5 h-5 text-brand-600" />
              {totalUnits > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {totalUnits}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition ${
                  active
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5 text-brand-500" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
