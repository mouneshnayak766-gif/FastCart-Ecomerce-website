import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import CategoryBar from "../components/CategoryBar";
import ProductCard from "../components/ProductCard";

export default function CategoryPage() {
  const { name } = useParams();

  const products = [
    { id:1, name:`${name} item`, price:99, image:"https://cdn.pixabay.com/photo/2024/02/06/18/10/ai-generated-8557635_1280.jpg" },
  ];

  return (
    <div>
      <Navbar />
      <CategoryBar />

      <h1 className="text-xl font-bold p-4">{name.toUpperCase()}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}