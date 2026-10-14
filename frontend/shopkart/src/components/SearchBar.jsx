import { Search, X, SlidersHorizontal, Layers } from "lucide-react";

const CATEGORIES = ["All", "Electronics", "Fashion", "Books", "Home"];

export default function SearchBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}) {
  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle mb-8 flex flex-col sm:flex-row gap-3 items-center">
      
      {/* Search Input Field */}
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products by name, category..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills / Select */}
      <div className="relative w-full sm:w-auto flex items-center gap-2">
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          </div>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full sm:w-48 pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white cursor-pointer transition appearance-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
