import { useEffect, useState } from "react";

export default function Banner() {
 const images = [
    "https://img.freepik.com/premium-psd/mobile-sale-promotional-poster-design-template_987701-2675.jpg?w=2000",
    "https://tse2.mm.bing.net/th/id/OIP.45cRWwCT2N8sI9OjaPuTXAHaKe?rs=1&pid=ImgDetMain&o=7&rm=3",
    "https://img.freepik.com/premium-vector/men-wear-men-style-product-sale-banner-template_753208-23.jpg?w=2000",
    "https://img.freepik.com/premium-vector/new-laptop-sale-promotion-social-facebook-cover-banner_252779-424.jpg",
    "https://i.pinimg.com/originals/dc/f6/23/dcf6239bbf6a973c7b06908f8fe03409.png",
  ];

  const [current, setCurrent] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-xl mt-4">
      
      {/* Slider */}
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="banner"
            className="w-full flex-shrink-0 h-[200px] md:h-[300px] object-cover"
          />
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-2 gap-2">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-6 rounded-full ${
              current === i ? "bg-black" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}