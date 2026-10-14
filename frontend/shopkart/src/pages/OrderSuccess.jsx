import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { getOrderByIdRequest } from "../services/api";
import { formatINR } from "../utils";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrderByIdRequest(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError("We couldn't load this order."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-8 sm:p-10 text-center">
          {loading && (
            <div className="py-10 text-slate-500">
              <Loader2 className="w-9 h-9 animate-spin text-brand-600 mx-auto mb-3" />
              <p className="text-sm font-semibold">Loading your order...</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-6">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">{error}</p>
            </div>
          )}

          {!loading && order && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Order Placed Successfully
              </h1>

              <dl className="mt-6 space-y-3 text-sm text-left bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Order ID</dt>
                  <dd className="font-mono text-xs text-slate-800 break-all text-right">
                    {order._id}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Total</dt>
                  <dd className="font-extrabold text-brand-600">
                    {formatINR(order.totalAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-bold text-emerald-700">{order.status}</dd>
                </div>
              </dl>

              <p className="mt-5 text-sm text-slate-500">
                Your payment was verified and your order has been saved
                successfully.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/orders"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 transition"
                >
                  View My Orders
                </Link>
                <Link
                  to="/products"
                  className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
