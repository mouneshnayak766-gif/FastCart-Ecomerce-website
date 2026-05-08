import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {

  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="border rounded-lg p-3 shadow bg-white cursor-pointer hover:shadow-xl
       hover:-translate-y-1 transition duration-300"
    >

      {/* Image */}
      <div className="w-full h-[220px] flex items-center justify-center overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Details */}
      <h2 className="font-bold mt-3 text-lg">
        {product.name}
      </h2>

      <p className="text-green-600 font-semibold">
        ₹{product.price}
      </p>

    </div>
  );
}