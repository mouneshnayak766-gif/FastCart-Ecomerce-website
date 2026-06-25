import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { SearchProvider } from "../context/SearchContext";

/**
 * AppLayout wraps every user-facing page with the global Navbar.
 * Admin and auth pages (Login, Signup) are routed OUTSIDE this layout
 * in AppRoutes.jsx, so they never get the Navbar.
 *
 * SearchProvider lives here so both Navbar (writes) and Home (reads)
 * share the same search/filter state — no prop drilling needed.
 */
export default function AppLayout() {
  return (
    <SearchProvider>
      <Navbar />
      <Outlet />
    </SearchProvider>
  );
}
