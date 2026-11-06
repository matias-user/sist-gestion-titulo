import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Inicializamos el contexto
export const AuthContext = createContext();

// 2. Creamos el Proveedor que envolverá la aplicación
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); 

  // 3. Persistencia: Al recargar la página (F5), verificamos si ya hay una sesión guardada
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('access_token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  // 4. Acción de Login: Guarda el token/usuario en el storage y actualiza el estado de React
  const login = (datosUsuario, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  // 5. Acción de Logout: Destruye la sesión
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

// 6. Custom Hook puente para usar el contexto rápidamente en cualquier pantalla
export const useAuth = () => {
  return useContext(AuthContext);
};

