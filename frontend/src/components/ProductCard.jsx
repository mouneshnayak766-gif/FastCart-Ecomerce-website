import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  
  return (
    <Link
      to={`/product/${product.id}`}
      className="text-black dark:text-white no-underline"
    >
      <div
        className="
          border border-gray-200 dark:border-gray-700
          p-4
          rounded-xl
          bg-white dark:bg-gray-800
          shadow-md
          hover:shadow-xl
          hover:scale-105
          transition
          duration-300
          cursor-pointer
        "
      >
        {/* Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="
            w-full
            h-56
            object-contain
            mb-4
          "
        />

        {/* Product Name */}
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {product.name}
        </h2>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          Premium quality product with best features.
        </p>

        {/* Rating */}
        <div
          className="
            inline-block
            bg-green-600
            text-white
            text-sm
            px-2
            py-1
            rounded-md
            mb-3
          "
        >
          ⭐ {product.rating}
        </div>

        {/* Price */}
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          ₹{product.price}
        </h3>

        {/* Offer */}
        <p className="text-green-600 dark:text-green-400 font-semibold text-sm mt-2">
          20% Off • Free Delivery
        </p>

        {/* Stock */}
        <p className="text-green-700 dark:text-green-500 text-sm font-bold mt-1">
          In Stock
        </p>
      </div>
    </Link>
  );
}