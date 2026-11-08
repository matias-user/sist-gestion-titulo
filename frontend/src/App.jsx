import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './components/Login';
import RegistroUsuarios from './components/RegistroUsuarios';
import Asistencia from './components/Asistencia';
import ProtectedRoute from './components/ProtectedRoute';
import GestionCatalogos from './components/GestionCatalogos';
import Asignaciones from './components/Asignaciones';
import GestionProductos from './components/GestionProductos';
import Mermas from './components/Mermas';
import Home from './components/Home'; 

export default function App() {
  const { usuario } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<RegistroUsuarios />} />
          <Route path="/asistencia" element={<Asistencia />} />
          <Route path="/asignaciones" element={<Asignaciones />} />
          <Route path="/catalogos" element={<GestionCatalogos />} />
          <Route path="/mermas" element={<Mermas />} />
          <Route path="/productos" element={<GestionProductos />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}