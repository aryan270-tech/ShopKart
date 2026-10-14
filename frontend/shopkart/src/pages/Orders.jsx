import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import { getOrdersRequest } from "../services/api";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError("");
    getOrdersRequest()
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => setError("We couldn't load your orders."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Everything you've purchased, newest first.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-9 h-9 animate-spin text-brand-600 mb-3" />
            <p className="text-sm font-semibold">Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl bg-white border border-rose-200 p-8 text-center max-w-md mx-auto shadow-subtle">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-slate-800 text-sm font-semibold mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center gap-2 mx-auto shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-10 shadow-subtle max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-4 shadow-inner">
              <Package className="w-10 h-10 stroke-[1.8]" />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              You have not placed any orders yet.
            </h2>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 transition flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Start Shopping</span>
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
