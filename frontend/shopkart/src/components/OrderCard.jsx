import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import OrderStatusTracker from "./OrderStatusTracker";
import { formatDate, formatINR, statusStyles } from "../utils";

export default function OrderCard({ order }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition-all duration-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Order #{order._id.slice(-8)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatDate(order.createdAt)}
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

      <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
        {order.items.map((item) => (
          <li key={item.product} className="flex justify-between gap-4">
            <span className="truncate">
              {item.name} × {item.quantity}
            </span>
            <span className="font-semibold text-slate-700 shrink-0">
              {formatINR(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <OrderStatusTracker status={order.status} />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Total:{" "}
          <span className="font-extrabold text-brand-600">
            {formatINR(order.totalAmount)}
          </span>
        </p>
        <Link
          to={`/orders/${order._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 group"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
