import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { loginCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCart } = useCart();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/home";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required.";
    if (!form.password) next.password = "Password is required.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await loginCustomer({
        email: form.email.trim(),
        password: form.password,
      });
      await refreshCart();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        setAuthError("Invalid email or password.");
      } else {
        setAuthError(
          err.response?.data?.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Subtle Ambient Glow Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-brand-500/15 via-indigo-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/30 mb-3">
            <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-600 flex items-center gap-1">
            ShopKart Account <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
          </span>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Log in to manage your orders, wishlist, and cart.
          </p>
        </div>

        {/* Server Auth Error Alert */}
        {authError && (
          <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          
          {/* Email Input */}
          <div>
            <label className="field-label" htmlFor="email">
              Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                className={`field-input !pl-11 ${errors.email ? "has-error" : ""}`}
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <p className="field-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="field-label mb-0" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`field-input !pl-11 !pr-11 ${errors.password ? "has-error" : ""}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 flex items-center text-slate-400 hover:text-slate-600 transition z-10"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="field-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary mt-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-slate-500 font-medium border-t border-slate-100 pt-5">
          Don't have a ShopKart account?{" "}
          <Link
            to="/register"
            className="font-bold text-brand-600 hover:text-brand-700 transition underline underline-offset-2"
          >
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
