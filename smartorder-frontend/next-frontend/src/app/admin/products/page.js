'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import DropdownCustom from '@/components/DropdownCustom';

export default function ProductsAdminPage() {
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editProductId, setEditProductId] = useState(null);
  const [editProductData, setEditProductData] = useState({ name: '', category: '', price: '' });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/products',
        { ...newProduct, price: parseFloat(newProduct.price) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessageType('success');
      setMessage('Producto creado correctamente.');
      setNewProduct({ name: '', category: '', price: '' });
      fetchProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessageType('error');
      setMessage('Error creando producto. Intenta nuevamente.');
      console.error(error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const saveEditProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/products/${editProductId}`,
        { ...editProductData, price: parseFloat(editProductData.price) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditProductId(null);
      setEditProductData({ name: '', category: '', price: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error actualizando producto:', error);
    }
  };

  const startEditing = (product) => {
    setEditProductId(product._id);
    setEditProductData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditProductId(null);
    setEditProductData({ name: '', category: '', price: '' });
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Administrar Productos</h1>

      {/* Crear Producto */}
      <form onSubmit={handleCreateProduct} className="mb-6 space-y-4 bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2 text-white">Crear Producto</h3>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border border-gray-700 bg-gray-700 text-white px-3 py-2 w-full rounded"
          required
        />

        <DropdownCustom
          options={[
            { value: '', label: 'Seleccionar categoría' },
            { value: 'Comida', label: 'Comida' },
            { value: 'Bebida', label: 'Bebida' },
          ]}
          value={newProduct.category}
          onChange={(val) => setNewProduct({ ...newProduct, category: val })}
          required
        />

        <input
          type="number"
          step="0.01"
          placeholder="Precio"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="border border-gray-700 bg-gray-700 text-white px-3 py-2 w-full rounded"
          required
          min="0.01"
        />

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Crear Producto
        </button>

        {message && (
          <p className={`mt-2 font-semibold ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </form>

      {/* Editar Producto */}
      {editProductId && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveEditProduct();
          }}
          className="mb-6 bg-gray-800 p-4 rounded space-y-4"
        >
          <h2 className="text-xl font-semibold">Editar Producto</h2>
          <input
            type="text"
            value={editProductData.name}
            onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}
            className="border border-gray-700 bg-gray-700 text-white px-3 py-2 w-full rounded"
            required
          />
          <select
            value={editProductData.category}
            onChange={(e) => setEditProductData({ ...editProductData, category: e.target.value })}
            className="border border-gray-700 bg-gray-700 text-white px-3 py-2 w-full rounded"
            required
          >
            <option value="">Seleccionar categoría</option>
            <option value="Comida">Comida</option>
            <option value="Bebida">Bebida</option>
          </select>
          <input
            type="number"
            step="0.01"
            value={editProductData.price}
            onChange={(e) => setEditProductData({ ...editProductData, price: e.target.value })}
            className="border border-gray-700 bg-gray-700 text-white px-3 py-2 w-full rounded"
            required
            min="0.01"
          />

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Guardar
            </button>
            <button type="button" onClick={cancelEditing} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-4 mb-4">
        <DropdownCustom
          options={[
            { value: 'Todos', label: 'Todos' },
            { value: 'Comida', label: 'Comida' },
            { value: 'Bebida', label: 'Bebida' },
          ]}
          value={filterCategory}
          onChange={setFilterCategory}
        />

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-700 bg-gray-700 text-white px-3 py-2 rounded w-full"
        />
      </div>

      {/* Lista */}
      <h2 className="text-xl font-semibold mb-2">Productos existentes:</h2>
      <ul className="space-y-2">
        {products
          .filter((p) => filterCategory === 'Todos' || p.category === filterCategory)
          .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((product) => (
            <li
              key={product._id}
              className="flex justify-between items-center border bg-gray-700 border-gray-700 px-4 py-2 rounded"
            >
              <div>
                <span>{product.name} - ${product.price}</span>
                <small className="text-gray-400 ml-2 text-xs">{product.category}</small>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEditing(product)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
                      handleDeleteProduct(product._id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
