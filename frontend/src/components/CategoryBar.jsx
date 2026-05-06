import { Link } from "react-router-dom";

const categories = [
  "home","fashion","mobile","electronics",
  "beauty","sports","books","furniture"
];

export default function CategoryBar() {
  return (
    <div className="flex flex-wrap justify-center gap-3 p-4 bg-gray-100">
      {categories.map((cat) => (
  <Link
    key={cat}
    to={cat === "home" ? "/" : `/category/${cat}`}
    className="bg-white px-4 py-2 rounded shadow hover:bg-blue-500 hover:text-white"
  >
    {cat.toUpperCase()}
  </Link>
))}
    </div>
  );
}