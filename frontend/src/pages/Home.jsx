import Navbar from "../components/Navbar";
import CategoryBar from "../components/CategoryBar";
import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import {useEffect, useState} from "react";



export default function Home() {
  const [products,setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/products")
      .then(response => response.json())
      .then(data => setProducts(data))
       .catch(err => console.log(err));
    
  },[]);

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