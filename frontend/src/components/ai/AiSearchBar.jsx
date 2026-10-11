import AiIcon from "./AiIcon";
import { useAiAssistant } from "./AiAssistantContext";

const Badge = ({ size = "h-8 w-8" }) => (
  <span className={`flex ${size} shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-500 text-gray-900`}>
    <AiIcon className="h-4 w-4" />
  </span>
);

/**
 * variant="compact": icon button for the Navbar, right after the existing search input
 *                    (label shows from xl screens up).
 * variant="bar":     full-width entry point for the homepage and mobile layout.
 */
export default function AiSearchBar({ variant = "bar", className = "" }) {
  const { open } = useAiAssistant();

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="Open FastCart AI chat"
        title="Ask FastCart AI"
        className={`flex h-12 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 text-gray-900 transition hover:border-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-amber-400 ${className}`}
      >
        <Badge />
        <span className="hidden text-sm font-medium xl:inline">Ask AI</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open FastCart AI chat"
      className={`flex h-12 w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-2.5 text-left transition hover:border-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-amber-400 ${className}`}
    >
      <Badge />
      <span className="truncate text-sm text-gray-500 dark:text-gray-400">Ask FastCart AI or search products</span>
    </button>
  );
}
