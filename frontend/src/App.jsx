import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider }    from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SearchProvider }   from "./context/SearchContext";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SearchProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              theme="colored"
            />
          </div>
        </SearchProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
