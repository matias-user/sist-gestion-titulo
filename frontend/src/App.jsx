import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importación de vistas
import Login from './components/Login';
import RegistroUsuarios from './components/RegistroUsuarios';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const { usuario } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: Si ya está logueado y entra a /login, lo empujamos al Home */}
        <Route 
          path="/login" 
          element={usuario ? <Navigate to="/" replace /> : <Login />} 
        />

        {/* RUTAS PRIVADAS: Envueltas por el Guardián */}
        <Route element={<ProtectedRoute />}>
          {/* Home temporal hasta que creemos el dashboard real */}
          <Route path="/" element={<div style={{ padding: '2rem' }}><h1>Bienvenido al Home</h1></div>} />
          
          {/* Tu vista de registro de usuarios */}
          <Route path="/registro" element={<RegistroUsuarios />} />
        </Route>

        {/* Ruta comodín: Cualquier URL inventada redirige al Home (o al login si el guardián actúa) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}