import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import {
  createPaymentOrderRequest,
  verifyPaymentRequest,
} from "../services/api";
import { formatINR } from "../utils";

const FIELDS = [
  { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma" },
  {
    name: "phone",
    label: "Phone",
    placeholder: "9876543210",
    inputMode: "tel",
  },
  {
    name: "addressLine1",
    label: "Address",
    placeholder: "22 MG Road",
    wide: true,
  },
  { name: "city", label: "City", placeholder: "Bengaluru" },
  { name: "state", label: "State", placeholder: "Karnataka" },
  {
    name: "pincode",
    label: "Pincode",
    placeholder: "560001",
    inputMode: "numeric",
  },
];

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

// Client-side checks only save a round trip; the server validates again.
const validate = (form) => {
  const errors = {};
  const labels = Object.fromEntries(FIELDS.map((f) => [f.name, f.label]));

  for (const key of Object.keys(EMPTY_FORM)) {
    if (!form[key].trim()) errors[key] = `${labels[key]} is required.`;
  }

  if (!errors.phone) {
    const digits = form.phone.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }
  }

  if (!errors.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  return errors;
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading, subtotal, clearCart } = useCart();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState("");

  // Set once payment is verified, so clearing the cart doesn't flash the
  // "cart is empty" screen before we navigate away.
  const completedRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleVerified = (order) => {
    completedRef.current = true;
    clearCart(); // global cart state -> [] so the navbar shows Cart (0)
    navigate(`/order-success/${order._id}`, { replace: true });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (placing) return;

    const found = validate(form);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length > 0) return; // no backend call

    setPlacing(true);

    try {
      // Only the shipping address is sent. The server owns items and prices.
      const shippingAddress = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v.trim()])
      );
      const { data } = await createPaymentOrderRequest(shippingAddress);

      if (data.isMock) {
        try {
          const res = await verifyPaymentRequest({
            shopKartOrderId: data.shopKartOrderId,
            razorpay_order_id: data.razorpayOrderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_signature",
          });
          handleVerified(res.data.order);
        } catch (err) {
          setFormError(
            err.response?.data?.message ||
              "We couldn't verify your payment. Your cart has not been cleared."
          );
          setPlacing(false);
        }
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(
          "Could not load Razorpay. Check your connection and try again."
        );
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,

        // This callback is NOT proof of payment. We hand the details to the
        // backend, which verifies the signature.
        handler: async (response) => {
          try {
            const res = await verifyPaymentRequest({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            handleVerified(res.data.order);
          } catch (err) {
            setFormError(
              err.response?.data?.message ||
                "We couldn't verify your payment. Your cart has not been cleared."
            );
            setPlacing(false);
          }
        },

        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        theme: { color: "#4f46e5" },
        modal: {
          // User closed the popup without paying: cart untouched.
          ondismiss: () => setPlacing(false),
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", () => {
        setFormError(
          "Payment failed. Your cart has not been cleared. Please try again."
        );
        setPlacing(false);
      });
      paymentObject.open();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
      setPlacing(false);
    }
  };

  // ---- Loading / empty cart guards ------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/70">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-28 text-slate-500">
          <Loader2 className="w-9 h-9 animate-spin text-brand-600 mb-3" />
          <p className="text-sm font-semibold">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !completedRef.current) {
    return (
      <div className="min-h-screen bg-slate-50/70">
        <Navbar />
        <main className="max-w-lg mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center bg-white rounded-3xl border border-slate-200/80 p-10 shadow-subtle">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
              <ShoppingBag className="w-10 h-10 stroke-[1.8]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Your cart is empty
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Add something to your cart before checking out.
            </p>
            <Link
              to="/products"
              className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Start Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ---- Checkout form ----------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate("/cart")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </button>

        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
          Checkout
        </h1>

        <form
          onSubmit={handlePlaceOrder}
          noValidate
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
          {/* Shipping details */}
          <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-slate-900 pb-3 mb-5 border-b border-slate-100">
              Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FIELDS.map((f) => (
                <div key={f.name} className={f.wide ? "sm:col-span-2" : ""}>
                  <label htmlFor={f.name} className="field-label">
                    {f.label}
                  </label>
                  <input
                    id={f.name}
                    name={f.name}
                    type="text"
                    inputMode={f.inputMode}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    disabled={placing}
                    className={`field-input ${
                      errors[f.name] ? "has-error" : ""
                    }`}
                  />
                  {errors[f.name] && (
                    <p className="field-error">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors[f.name]}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Order summary */}
          <aside className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 lg:sticky lg:top-24 space-y-5">
            <h2 className="font-display text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <ul className="space-y-2.5 text-sm">
              {cartItems.map((item) => (
                <li
                  key={item.product._id}
                  className="flex justify-between gap-3 text-slate-600"
                >
                  <span className="truncate">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-slate-800 shrink-0">
                    {formatINR(item.product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between pt-4 border-t border-slate-100 text-lg font-extrabold text-slate-900">
              <span>Total</span>
              <span className="text-brand-600">{formatINR(subtotal)}</span>
            </div>

            {formError && (
              <div
                role="alert"
                className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-800 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <button type="submit" disabled={placing} className="btn-primary">
              {placing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Place Order</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              You'll pay securely with Razorpay (Test Mode). The final amount is
              confirmed by our server.
            </p>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Payments verified server-side</span>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
