// Small shared helpers for the order screens.
export const formatINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const statusStyles = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700 border-amber-200",
  PLACED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-slate-100 text-slate-700 border-slate-200",
};

// Bonus: order status progression
export const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
