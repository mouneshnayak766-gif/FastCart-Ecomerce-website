import Navbar from "../components/Navbar";
import CategoryBar from "../components/CategoryBar";
import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";

const products = [
  { id:1, name:"Shirt", price:499, image:"https://via.placeholder.com/200" },
  { id:2, name:"Phone", price:15000, image:"https://via.placeholder.com/200" },
  { id:3, name:"Book", price:299, image:"https://via.placeholder.com/200" },
]; 

export default function Home() {
  return (
    <div>
      <Header /> 
      <Banner />
      <Navbar />
      <CategoryBar />
    

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}