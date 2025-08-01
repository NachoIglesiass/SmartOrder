'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import DropdownCustom from '@/components/DropdownCustom';

export default function ProductsAdminPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '' });
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState({ name: '', category: '', price: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/products', {
        ...newProduct,
        price: parseFloat(newProduct.price),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewProduct({ name: '', category: '', price: '' });
      setFormMessageType('success');
      setFormMessage('Producto creado correctamente.');
      fetchProducts();
      setTimeout(() => setFormMessage(''), 3000);
    } catch (error) {
      console.error('Error creating product:', error);
      setFormMessageType('error');
      setFormMessage('Error al crear el producto.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar este producto?');
    if (!confirmed) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const startEditingProduct = (product) => {
    setEditingProductId(product._id);
    setEditingProduct({ name: product.name, category: product.category, price: product.price.toString() });
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setEditingProduct({ name: '', category: '', price: '' });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.put(`/products/${editingProductId}`, {
        ...editingProduct,
        price: parseFloat(editingProduct.price),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      cancelEditing();
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      setFormMessageType('error');
      setFormMessage('Error al actualizar el producto.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Administrar Productos</h1>

      {/* Crear Producto */}
      <form onSubmit={handleCreateProduct} className="mb-6 space-y-4 p-4 rounded bg-gray-800">
        <h3 className="text-lg font-semibold mb-2 text-white">Crear Producto</h3>

        <input
          type="text"
          placeholder="Nombre del producto"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          required
          className="bg-gray-700 text-white border border-gray-600 px-3 py-2 w-full rounded"
        />
        <DropdownCustom
          options={[
            { label: 'Comida', value: 'Comida' },
            { label: 'Bebida', value: 'Bebida' },
          ]}
          value={newProduct.category}
          onChange={(value) => setNewProduct({ ...newProduct, category: value })}
          placeholder="Seleccionar categoría"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Precio"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          required
          className="bg-gray-700 text-white border border-gray-600 px-3 py-2 w-full rounded"
        />
        {formMessage && (
          <p className={formMessageType === 'error' ? 'text-red-400' : 'text-green-400'}>
            {formMessage}
          </p>
        )}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Crear Producto
        </button>
      </form>

      {/* Editar Producto */}
      {editingProductId && (
        <form onSubmit={handleUpdateProduct} className="mb-6 space-y-4 p-4 rounded bg-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-white">Editar producto</h3>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={editingProduct.name}
            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
            required
            className="bg-gray-700 text-white border border-gray-600 px-3 py-2 w-full rounded"
          />
          <DropdownCustom
            options={[
              { label: 'Comida', value: 'Comida' },
              { label: 'Bebida', value: 'Bebida' },
            ]}
            value={editingProduct.category}
            onChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
            placeholder="Seleccionar categoría"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={editingProduct.price}
            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
            required
            className="bg-gray-700 text-white border border-gray-600 px-3 py-2 w-full rounded"
          />
          <div className="flex space-x-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Guardar
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de productos */}
      <h2 className="text-xl font-semibold mb-2 text-white">Productos existentes:</h2>
      <ul className="space-y-2">
        {products.map((product) => (
          <li
            key={product._id}
            className="flex justify-between items-center bg-gray-700 px-4 py-2 rounded text-white"
          >
            <span>{product.name} - ${product.price.toFixed(2)} <small className="ml-2 text-gray-400">{product.category}</small></span>
            <div>
              <button
                onClick={() => startEditingProduct(product)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteProduct(product._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
