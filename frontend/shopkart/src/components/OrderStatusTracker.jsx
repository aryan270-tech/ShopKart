import { Check } from "lucide-react";
import { STATUS_STEPS } from "../utils";

// Visual progress bar: PLACED -> CONFIRMED -> SHIPPED -> DELIVERED
export default function OrderStatusTracker({ status }) {
  const current = STATUS_STEPS.indexOf(status);

  return (
    <ol className="flex items-start w-full" aria-label="Order progress">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= current;
        const isLast = i === STATUS_STEPS.length - 1;
        return (
          <li
            key={step}
            className={`flex flex-col items-center relative ${
              isLast ? "" : "flex-1"
            }`}
          >
            <div className="flex items-center w-full">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border-2 transition-colors ${
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-slate-300 text-slate-400"
                } ${i === current ? "ring-4 ring-emerald-100" : ""}`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              {!isLast && (
                <span
                  className={`h-0.5 flex-1 mx-1 transition-colors ${
                    i < current ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-1.5 text-[10px] font-bold tracking-wide self-start -ml-1 ${
                done ? "text-emerald-700" : "text-slate-400"
              }`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
