const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN");

export default function AiProductCard({ product, onView, onAdd }) {
  return (
    <article aria-label={product.name} className="w-56 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="h-32 w-full bg-white">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-contain" />
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{product.name}</p>
        {product.rating != null && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {Number(product.rating).toFixed(1)} <span className="text-amber-500">★</span>
            {product.reviewCount != null && <span> ({num.format(product.reviewCount)})</span>}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base font-bold text-gray-900 dark:text-white">{inr.format(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-500 line-through">{inr.format(product.originalPrice)}</span>
          )}
          {product.discountPercent > 0 && (
            <span className="rounded bg-green-700 px-1.5 py-0.5 text-[10px] font-semibold text-green-100">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>
        {!product.inStock && <p className="text-xs font-medium text-red-500">Out of stock</p>}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onView(product)}
            className="flex-1 rounded-lg bg-amber-400 px-2 py-1.5 text-xs font-semibold text-gray-900 hover:bg-amber-300"
          >
            View Product
          </button>
          <button
            onClick={() => onAdd(product)}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className="rounded-lg border border-amber-400 px-2 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-400/10 disabled:opacity-40 dark:text-amber-400"
          >
            + Cart
          </button>
        </div>
      </div>
    </article>
  );
}
