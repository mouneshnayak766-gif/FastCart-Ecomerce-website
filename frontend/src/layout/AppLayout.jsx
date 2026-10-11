import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import BackendStatusBanner from "../components/BackendStatusBanner";
import AiAssistantProvider from "../components/ai/AiAssistantProvider";
import { SearchProvider } from "../context/SearchContext";
import { useLanguage } from "../context/LanguageContext";

/**
 * AppLayout wraps every user-facing page with the global Navbar.
 * Admin and auth pages (Login, Signup) are routed OUTSIDE this layout
 * in AppRoutes.jsx, so they never get the Navbar.
 *
 * SearchProvider lives here so both Navbar (writes) and Home (reads)
 * share the same search/filter state — no prop drilling needed.
 */
export default function AppLayout() {
  const { lang } = useLanguage();

  return (
    <AiAssistantProvider language={lang}>
      <SearchProvider>
        <BackendStatusBanner />
        <Navbar />
        <Outlet />
      </SearchProvider>
    </AiAssistantProvider>
  );
}
