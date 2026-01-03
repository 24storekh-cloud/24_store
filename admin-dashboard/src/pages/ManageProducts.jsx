import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Package, Image as ImageIcon } from 'lucide-react';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'phone',
    image: ''
  });

  // ១. ទាញទិន្នន័យមកបង្ហាញក្នុងតារាង
  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ២. មុខងារបន្ថែមផលិតផល (POST)
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        price: Number(formData.price) // បំប្លែងតម្លៃទៅជាលេខ
      })
    })
    .then(res => res.json())
    .then(() => {
      alert("បន្ថែមផលិតផលជោគជ័យ!");
      setFormData({ name: '', price: '', category: 'phone', image: '' }); // សម្អាត Form
      fetchProducts(); // ទាញទិន្នន័យថ្មីមកបង្ហាញ
    });
  };

  // ៣. មុខងារលុបផលិតផល (DELETE)
  const deleteProduct = (id) => {
    if(window.confirm("តើអ្នកចង់លុបទំនិញនេះមែនទេ?")) {
      fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' })
        .then(() => fetchProducts());
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Form បន្ថែមផលិតផល */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <PlusCircle className="text-blue-600" /> បន្ថែមផលិតផលថ្មី
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="text" placeholder="ឈ្មោះផលិតផល" required
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="number" placeholder="តម្លៃ ($)" required
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
          <select 
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="phone">ទូរស័ព្ទ (Phone)</option>
            <option value="laptop">កុំព្យូទ័រ (Laptop)</option>
            <option value="accessories">គ្រឿងបន្លាស់ (Accessories)</option>
          </select>
          <input 
            type="text" placeholder="Link រូបភាព (URL)" required
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.image}
            onChange={(e) => setFormData({...formData, image: e.target.value})}
          />
          <button className="md:col-span-4 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            បង្ហោះផលិតផលទៅកាន់វេបសាយ
          </button>
        </form>
      </div>

      {/* តារាងគ្រប់គ្រងផលិតផល */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">រូបភាព</th>
              <th className="p-4">ឈ្មោះ</th>
              <th className="p-4">ប្រភេទ</th>
              <th className="p-4">តម្លៃ</th>
              <th className="p-4 text-center">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                </td>
                <td className="p-4 font-bold">{product.name}</td>
                <td className="p-4 capitalize text-gray-500">{product.category}</td>
                <td className="p-4 text-red-600 font-bold">${product.price}</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProducts;