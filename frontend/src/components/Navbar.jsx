import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Search, ChevronDown, Sun, Moon,
  Home, Heart, ShoppingCart, User, LogOut, Globe, Settings,
} from "lucide-react";
import { useTheme }    from "../context/ThemeContext";
import { useSearch }   from "../context/SearchContext";
import { useLanguage, LANGUAGE_OPTIONS } from "../context/LanguageContext";
import API from "../service/api";

// ─── Icon+Label nav button ─────────────────────────────────────────────────────
function NavIcon({ to, icon, label, badge, active }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors duration-150 relative
        ${active ? "bg-blue-600 dark:bg-gray-700" : "hover:bg-blue-600 dark:hover:bg-gray-700"}`}
    >
      <div className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center leading-none">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium text-white leading-none">{label}</span>
    </Link>
  );
}

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const {
    search, setSearch,
    selectedCategory, setSelectedCategory,
    sortOption,       setSortOption,
    minRating,        setMinRating,
  } = useSearch();

  const isHome = location.pathname === "/";

  // ── User ─────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  });

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("user"))); }
    catch { setUser(null); }
  }, [location.pathname]);

  // ── Cart count ────────────────────────────────────────────────────────────
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) { setCartCount(0); return; }
    API.get("/cart/my-cart")
      .then((res) => {
        const items = res.data || [];
        setCartCount(items.reduce((s, i) => s + (i.quantity || 1), 0));
      })
      .catch(() => setCartCount(0));
  }, [location.pathname, user]);

  // ── Language dropdown ─────────────────────────────────────────────────────
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = LANGUAGE_OPTIONS.find((o) => o.code === lang) || LANGUAGE_OPTIONS[0];

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await API.post("/users/logout", { refreshToken: localStorage.getItem("refreshToken") });
    } catch { /* clear client state regardless */ }
    finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setCartCount(0);
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <nav className="bg-blue-700 dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors duration-200">
      {/* ── Main row ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 py-2.5 flex flex-wrap lg:flex-nowrap items-center gap-3">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-white shrink-0">
          <div className="bg-yellow-400 text-black w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg shadow">
            F
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">FastCart</span>
        </Link>

        {/* SEARCH BAR */}
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex-1 min-w-[160px] max-w-2xl shadow-sm">
          <Search className="text-gray-400 dark:text-gray-500 mr-2 shrink-0" size={16} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isHome) navigate("/");
            }}
            className="w-full outline-none text-sm bg-transparent text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1 text-lg leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-1 text-white shrink-0">

          {/* ── FILTER DROPDOWNS — home only ─────────────────────────────── */}
          {isHome && (
            <div className="hidden xl:flex items-center gap-0.5 mr-1">

              {/* All Categories */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent appearance-none outline-none cursor-pointer pl-2.5 pr-6 py-2 text-xs font-semibold text-white hover:bg-blue-600 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <option value=""            className="text-black">{t.allCategories}</option>
                  <option value="fashion"     className="text-black">Fashion</option>
                  <option value="mobile"      className="text-black">Mobile</option>
                  <option value="electronics" className="text-black">Electronics</option>
                  <option value="beauty"      className="text-black">Beauty</option>
                  <option value="sports"      className="text-black">Sports</option>
                  <option value="books"       className="text-black">Books</option>
                  <option value="furniture"   className="text-black">Furniture</option>
                </select>
                <ChevronDown size={11} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent appearance-none outline-none cursor-pointer pl-2.5 pr-6 py-2 text-xs font-semibold text-white hover:bg-blue-600 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <option value=""          className="text-black">{t.sort}</option>
                  <option value="lowToHigh" className="text-black">{t.lowToHigh}</option>
                  <option value="highToLow" className="text-black">{t.highToLow}</option>
                </select>
                <ChevronDown size={11} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Rating */}
              <div className="relative">
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="bg-transparent appearance-none outline-none cursor-pointer pl-2.5 pr-6 py-2 text-xs font-semibold text-white hover:bg-blue-600 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <option value=""  className="text-black">{t.rating}</option>
                  <option value="4" className="text-black">{t.star4}</option>
                  <option value="3" className="text-black">{t.star3}</option>
                  <option value="2" className="text-black">{t.star2}</option>
                </select>
                <ChevronDown size={11} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="w-px h-6 bg-blue-500 dark:bg-gray-700 mx-1.5" />
            </div>
          )}

          {/* ── LANGUAGE DROPDOWN ──────────────────────────────────────────── */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-600 dark:hover:bg-gray-700 transition text-white"
              aria-label="Select language"
            >
              <Globe size={16} />
              <span className="text-xs font-bold hidden sm:block">{currentLang.code.toUpperCase()}</span>
              <ChevronDown size={11} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-700 dark:border-gray-600 overflow-hidden z-50">
                <p className="text-gray-400 text-xs font-bold px-4 py-2.5 border-b border-gray-700 dark:border-gray-600 uppercase tracking-wider">
                  {t.language}
                </p>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => { setLang(opt.code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      ${lang === opt.code
                        ? "text-white bg-blue-600"
                        : "text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700"}`}
                  >
                    <span className="text-base">{opt.flag}</span>
                    <span>{opt.native}</span>
                    {lang === opt.code && (
                      <span className="ml-auto text-green-400 font-bold">✓</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-700 dark:border-gray-600">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <Settings size={14} />
                    <span>{t.moreSettings}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── THEME TOGGLE ──────────────────────────────────────────────── */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === "dark"
              ? <Sun  size={18} className="text-yellow-300" />
              : <Moon size={18} className="text-white" />
            }
          </button>

          {/* ── ICON NAV ITEMS ─────────────────────────────────────────────── */}
          <NavIcon
            to="/"
            icon={<Home size={19} />}
            label={t.home}
            active={isActive("/")}
          />
          <NavIcon
            to="/wishlist"
            icon={<Heart size={19} className={isActive("/wishlist") ? "fill-red-400 text-red-400" : ""} />}
            label={t.wishlist}
            active={isActive("/wishlist")}
          />
          <NavIcon
            to="/cart"
            icon={<ShoppingCart size={19} />}
            label={t.cart}
            badge={cartCount}
            active={isActive("/cart")}
          />

          {/* ── USER SECTION ───────────────────────────────────────────────── */}
          {user ? (
            <>
              <Link
                to="/account"
                title="My Account"
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors
                  ${isActive("/account") ? "bg-blue-600 dark:bg-gray-700" : "hover:bg-blue-600 dark:hover:bg-gray-700"}`}
              >
                <User size={19} />
                <span className="text-[10px] font-medium text-white leading-none max-w-[72px] truncate">
                  {user.name?.split(" ")[0] || t.account}
                </span>
              </Link>

              <button
                onClick={logout}
                title={t.logout}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition font-semibold text-sm ml-1"
              >
                <LogOut size={15} />
                <span className="hidden lg:inline">{t.logout}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1 font-semibold text-sm ml-1">
              <Link
                to="/login"
                className="px-3 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-gray-700 transition text-white"
              >
                {t.login}
              </Link>
              <Link
                to="/signup"
                className="bg-white text-blue-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
              >
                {t.signup}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
