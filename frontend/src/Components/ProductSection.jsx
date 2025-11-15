// src/components/ProductSection.jsx
import { Link } from "react-router-dom";

function ProductSection({ title, products }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-lg font-bold text-red-600">₹{product.price}</p>
              {product.quickBuy && <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded">Quick Buy</button>}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-6">
        <Link to="#" className="text-red-600 hover:underline">View More</Link>
      </div>
    </section>
  );
}

export default ProductSection;