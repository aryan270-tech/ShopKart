import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import OrderStatusTracker from "../components/OrderStatusTracker";
import {
  getOrderByIdRequest,
  updateOrderStatusRequest,
} from "../services/api";
import { STATUS_STEPS, formatDate, formatINR, statusStyles } from "../utils";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getOrderByIdRequest(id)
      .then((res) => setOrder(res.data.order))
      .catch((err) =>
        setError(
          err.response?.status === 404
            ? "Order not found."
            : "We couldn't load this order."
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  const [advancing, setAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState("");

  const nextStatus = order
    ? STATUS_STEPS[STATUS_STEPS.indexOf(order.status) + 1]
    : null;

  // Dev-only helper for the bonus: moves the order one step forward.
  const handleAdvance = async () => {
    setAdvancing(true);
    setAdvanceError("");
    try {
      const res = await updateOrderStatusRequest(order._id, nextStatus);
      setOrder(res.data.order);
    } catch (err) {
      setAdvanceError(
        err.response?.data?.message || "Could not update the status."
      );
    } finally {
      setAdvancing(false);
    }
  };

  const addr = order?.shippingAddress;

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Orders</span>
        </Link>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-9 h-9 animate-spin text-brand-600 mb-3" />
            <p className="text-sm font-semibold">Loading order...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl bg-white border border-rose-200 p-8 text-center max-w-md mx-auto shadow-subtle">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-slate-800 text-sm font-semibold">{error}</p>
          </div>
        )}

        {!loading && order && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-extrabold text-slate-900">
                  Order #{order._id.slice(-8)}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                  statusStyles[order.status] || statusStyles.PLACED
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="pt-2 pb-1">
              <OrderStatusTracker status={order.status} />
            </div>

            {nextStatus && (
              <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-brand-900 block">
                    Order Status Progress (Lab Demo Tool)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Advance this order from <span className="font-semibold text-slate-700">{order.status}</span> to <span className="font-semibold text-brand-700">{nextStatus}</span>
                  </span>
                </div>
                <button
                  onClick={handleAdvance}
                  disabled={advancing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-sm hover:from-brand-500 hover:to-indigo-500 disabled:opacity-60 transition flex items-center gap-1.5"
                >
                  {advancing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Advance to {nextStatus} ➔</span>
                  )}
                </button>
                {advanceError && (
                  <p className="w-full text-xs text-rose-700 font-medium">{advanceError}</p>
                )}
              </div>
            )}

            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.product} className="flex items-center gap-4 py-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatINR(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {formatINR(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex justify-between pt-4 border-t border-slate-100 text-lg font-extrabold text-slate-900">
              <span>Total</span>
              <span className="text-brand-600">
                {formatINR(order.totalAmount)}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-sm">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Shipping To
                </h2>
                <p className="font-semibold text-slate-900">{addr.fullName}</p>
                <p className="text-slate-600">{addr.addressLine1}</p>
                <p className="text-slate-600">
                  {addr.city}, {addr.state} {addr.pincode}
                </p>
                <p className="text-slate-600">Phone: {addr.phone}</p>
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Payment
                </h2>
                <p className="text-slate-600">
                  Status:{" "}
                  <span className="font-semibold text-slate-900">
                    {order.paymentStatus}
                  </span>
                </p>
                {order.razorpayPaymentId && (
                  <p className="text-slate-600 break-all">
                    Payment ID:{" "}
                    <span className="font-mono text-xs">
                      {order.razorpayPaymentId}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
