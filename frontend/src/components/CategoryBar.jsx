import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import API from "../service/api";
import { useLanguage } from "../context/LanguageContext";

// ─── Icon map: category slug → emoji ─────────────────────────────────────────
const CATEGORY_ICONS = {
  beauty:      "💄",
  books:       "📚",
  electronics: "🖥️",
  fashion:     "👗",
  furniture:   "🪑",
  mobile:      "📱",
  sports:      "⚽",
};

// ─── Translation key map: slug → t key ───────────────────────────────────────
const CAT_TKEY = {
  beauty:      "catBeauty",
  books:       "catBooks",
  electronics: "catElectronics",
  fashion:     "catFashion",
  furniture:   "catFurniture",
  mobile:      "catMobile",
  sports:      "catSports",
};

function CategoryBar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t }     = useLanguage();
  const scrollRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showArrow,  setShowArrow]  = useState(false);

  useEffect(() => {
    API.get("/products/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  // Show the right-arrow only if there is horizontal overflow
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setShowArrow(el.scrollWidth > el.clientWidth + 4);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [categories]);

  // Current active category from URL
  const activeCategory = location.pathname.startsWith("/category/")
    ? location.pathname.split("/category/")[1]
    : location.pathname === "/" ? "__home__" : "";

  if (loading) {
    return (
      <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  const Pill = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
        shrink-0 transition-all duration-150 border
        ${active
          ? "bg-orange-500 border-orange-500 text-white shadow-md"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"}
      `}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div
        ref={scrollRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Home pill */}
        <Pill
          icon="🏠"
          label={t.catHome}
          active={activeCategory === "__home__"}
          onClick={() => navigate("/")}
        />

        {/* Dynamic category pills */}
        {categories.map((cat) => (
          <Pill
            key={cat}
            icon={CATEGORY_ICONS[cat] || "🏷️"}
            label={t[CAT_TKEY[cat]] || cat}
            active={activeCategory === cat}
            onClick={() => navigate(`/category/${cat}`)}
          />
        ))}
      </div>

      {/* Right fade + chevron when scrollable */}
      {showArrow && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent w-12 pointer-events-none">
          <ChevronRight size={18} className="text-gray-400 ml-auto mr-1" />
        </div>
      )}
    </div>
  );
}

export default CategoryBar;
