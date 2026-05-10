import { Link } from "react-router-dom";

export default function ProductCard({ product }) {

  return (

    <Link to={`/product/${product.id}`}>

      <div className="border p-4 rounded-lg">

        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-48 w-full object-contain"
        />

        <h2 className="text-xl font-bold">
          {product.name}
        </h2>

        <p className="text-green-600">
          ₹{product.price}
        </p>

      </div>

    </Link>

  );
}