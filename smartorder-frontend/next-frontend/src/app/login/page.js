'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import api from '@/utils/api'; // 👈 nueva línea

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
    const res = await api.post('/users/login', {
      username,
      password
    });

    console.log('✅ Login exitoso, respuesta:', res); // 👈

    const data = res.data;
    console.log('📦 Datos recibidos:', data); // 👈

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.user.role);

    // Redirección según el rol
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
        router.push('/login'); // fallback
    }

  } catch (err) {
    console.error('❌ Error al hacer login:', err); // 👈 importante

    if (err.response && err.response.data?.message) {
      setErrorMessage(err.response.data.message);
    } else {
      setErrorMessage('Error de conexión. Intenta nuevamente.');
    }
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111] text-white rounded-2xl shadow-lg p-8 space-y-6">

        {/* Logo y título */}
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

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Usuario */}
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

          {/* Contraseña */}
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
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mensaje de error */}
          {errorMessage && (
            <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
          )}

          {/* Botón iniciar sesión */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white py-3 rounded-lg font-semibold shadow-md"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 mt-6">
          © {new Date().getFullYear()} SmartOrder. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
