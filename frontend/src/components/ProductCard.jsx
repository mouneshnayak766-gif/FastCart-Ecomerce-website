import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="border p-3 rounded cursor-pointer hover:shadow-lg"
    >
      <img src={product.image} className="w-full h-40 object-cover" />
      <h2 className="font-bold mt-2">{product.name}</h2>
      <p className="text-green-600">₹{product.price}</p>
    </div>
  );
}