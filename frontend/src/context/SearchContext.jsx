import { createContext, useContext, useState } from "react";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [search,           setSearch]           = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption,       setSortOption]       = useState("");
  const [minRating,        setMinRating]        = useState("");

  return (
    <SearchContext.Provider value={{
      search, setSearch,
      selectedCategory, setSelectedCategory,
      sortOption, setSortOption,
      minRating, setMinRating,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}
