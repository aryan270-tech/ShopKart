import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { registerCustomer } from "../services/api";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
};

function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit phone number.";
  }

  return errors;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await registerCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      navigate("/login", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Could not create your account. Please try again.";
      setServerError(message);
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
            Join ShopKart <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
          </span>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Sign up to start shopping and track your orders.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Register Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          
          {/* Full Name */}
          <div>
            <label className="field-label" htmlFor="fullName">
              Full Name
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className={`field-input !pl-11 ${errors.fullName ? "has-error" : ""}`}
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>
            {errors.fullName && (
              <p className="field-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
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
                placeholder="jane@example.com"
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

          {/* Password */}
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`field-input !pl-11 !pr-11 ${errors.password ? "has-error" : ""}`}
                placeholder="At least 6 characters"
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

          {/* Phone Number */}
          <div>
            <label className="field-label" htmlFor="phone">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`field-input !pl-11 ${errors.phone ? "has-error" : ""}`}
                placeholder="9876543210"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            {errors.phone && (
              <p className="field-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-slate-500 font-medium border-t border-slate-100 pt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-brand-600 hover:text-brand-700 transition underline underline-offset-2"
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}
