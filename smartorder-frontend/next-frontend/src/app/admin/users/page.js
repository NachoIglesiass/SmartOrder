'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api'; // 👈 tu helper que usa process.env.NEXT_PUBLIC_API_URL
import DropdownCustom from '@/components/DropdownCustom';

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: '',
  });

  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUser, setEditingUser] = useState({
    username: '',
    role: '',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al obtener usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/users/register', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al crear usuario');

      setNewUser({ username: '', password: '', role: '' });
      setFormMessageType('success');
      setFormMessage('Usuario creado correctamente.');
      fetchUsers();

      setTimeout(() => setFormMessage(''), 3000);
    } catch (error) {
      console.error('Error creating user:', error);
      setFormMessageType('error');
      setFormMessage('Error al crear el usuario.');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
    if (!confirmed) return;
    try {
      const token = localStorage.getItem('token');
      const res = await api.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al eliminar usuario');

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const startEditingUser = (user) => {
    setEditingUserId(user._id);
    setEditingUser({
      username: user.username,
      role: user.role,
      password: '',
    });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditingUser({ username: '', role: '', password: '' });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const dataToUpdate = {
        username: editingUser.username,
        role: editingUser.role,
      };
      if (editingUser.password.trim() !== '') {
        dataToUpdate.password = editingUser.password;
      }

      const res = await api.put(`/users/${editingUserId}`, dataToUpdate, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al actualizar usuario');

      cancelEditing();
      fetchUsers();
      setFormMessage('');
    } catch (error) {
      console.error('Error updating user:', error);
      setFormMessageType('error');
      setFormMessage('Error al actualizar el usuario.');
    }
  };

  const roleOptions = [
    { label: 'Mozo', value: 'waiter' },
    { label: 'Cocina', value: 'kitchen' },
    { label: 'Barra', value: 'bar' },
    { label: 'Caja', value: 'cashier' },
    { label: 'Admin', value: 'admin' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Administrar Usuarios</h1>

      <form onSubmit={handleCreateUser} className="mb-6 space-y-4 p-4 rounded bg-gray-800">
        <h3 className="text-lg font-semibold mb-2 text-white">Crear Usuario</h3>

        <input
          type="text"
          placeholder="Nombre de usuario"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          required
          className="bg-gray-700 text-white border border-gray-600 px-3 py-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Contraseña"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          required
          className="bg-gray-700 text-white border border-gray-600 px-3 py-2 w-full rounded"
        />
        <DropdownCustom
          options={roleOptions}
          value={newUser.role}
          onChange={(value) => setNewUser({ ...newUser, role: value })}
          placeholder="Seleccionar rol"
          required
        />
        {formMessage && (
          <p className={formMessageType === 'error' ? 'text-red-400' : 'text-green-400'}>
            {formMessage}
          </p>
        )}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Crear Usuario
        </button>
      </form>

      {editingUserId && (
        <form onSubmit={handleUpdateUser} className="mb-6 space-y-4 p-4 rounded bg-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-white">Editar usuario</h3>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={editingUser.username}
            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
            required
            className="bg-gray-700 text-white border border-gray-600 px-3 py-2 w-full rounded"
          />
          <DropdownCustom
            options={roleOptions}
            value={editingUser.role}
            onChange={(value) => setEditingUser({ ...editingUser, role: value })}
            placeholder="Seleccionar rol"
            required
          />
          <input
            type="text"
            placeholder="Nueva contraseña (dejar vacío para no cambiar)"
            value={editingUser.password}
            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
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
          {formMessage && (
            <p className={formMessageType === 'error' ? 'text-red-400' : 'text-green-400'}>
              {formMessage}
            </p>
          )}
        </form>
      )}

      <h2 className="text-xl font-semibold mb-2 text-white">Usuarios existentes:</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user._id}
            className="flex justify-between items-center bg-gray-700 px-4 py-2 rounded text-white"
          >
            <span>
              {user.username} - {user.role}
            </span>
            <div>
              <button
                onClick={() => startEditingUser(user)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteUser(user._id)}
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

