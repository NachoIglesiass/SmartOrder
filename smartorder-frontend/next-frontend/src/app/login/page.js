'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import api from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const res = await api.post('/users/login', { username, password });
      const data = res.data;

      console.log('✅ Login exitoso:', data);

      // Guardar token y rol
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);

      // Redirigir según rol
      switch (data.user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'waiter':
          router.push('/mozo');
          break;
        case 'bar':
          router.push('/barra');
          break;
        case 'kitchen':
          router.push('/cocina');
          break;
        case 'cashier':
          router.push('/caja');
          break;
        default:
          setErrorMessage('Rol desconocido.');
      }
    } catch (err) {
      console.error('❌ Error al iniciar sesión:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Error de conexión. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111] text-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="SmartOrder Logo"
            width={120}
            height={120}
            className="rounded-full object-contain"
            priority
          />
          <h1 className="text-3xl font-bold mt-4 tracking-wide text-center">SmartOrder</h1>
          <p className="text-sm text-gray-400 mt-1 text-center">Acceso al sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-300">Nombre de usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Ingrese su usuario"
              className="mt-1 w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Contraseña</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingrese su contraseña"
              className="mt-1 w-full p-3 pr-12 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-200 transition"
              aria-label="Mostrar/Ocultar contraseña"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white py-3 rounded-lg font-semibold shadow-md"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6">
          © {new Date().getFullYear()} SmartOrder. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
