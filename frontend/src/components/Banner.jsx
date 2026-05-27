import { useEffect, useState } from "react";


export default function Banner() {
 const images = [
    "/images/banner1.jpg",
    "/images/banner2.jpg",
    "/images/banner3.jpg",
    "/images/banner4.jpg",
    "/images/banner5.jpg"
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