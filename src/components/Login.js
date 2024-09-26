import React, { useState } from 'react';
import users from '../../users';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <form onSubmit={handleSubmit} className="p-6 bg-gray-900 rounded-xl shadow-md">
        <h2 className="text-2xl mb-4">Iniciar sesión</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}

export default Login;