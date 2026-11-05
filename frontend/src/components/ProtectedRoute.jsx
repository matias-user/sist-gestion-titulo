import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { usuario, cargando } = useAuth();

  // Si el Contexto aún está validando el localStorage al recargar (F5), no hacemos nada todavía
  if (cargando) return null; 

  // Si no hay usuario en la memoria global, lo devolvemos al Login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si existe, le permitimos ver las rutas hijas (Outlet)
  return <Outlet />;
}