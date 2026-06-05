import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../service/api";

function CategoryBar() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/products/categories")
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 px-6 py-3 overflow-x-auto">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 rounded-full bg-gray-200 animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex gap-3 px-6 py-3 overflow-x-auto border-b border-gray-200">
     <button
  onClick={() => navigate("/")}
  className="px-4 py-1.5 rounded-full border border-gray-300 text-sm
             whitespace-nowrap hover:bg-gray-100 hover:border-gray-400
             transition-colors duration-150"
>
  Home
</button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => navigate(`/category/${cat}`)}
          className="px-4 py-1.5 rounded-full border border-gray-300 text-sm capitalize
                     whitespace-nowrap hover:bg-gray-100 hover:border-gray-400
                     transition-colors duration-150"
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryBar;
