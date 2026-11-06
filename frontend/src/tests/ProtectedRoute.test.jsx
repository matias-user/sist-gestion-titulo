import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom'; // Importación obligatoria para corregir el error "toBeInTheDocument"
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import ProtectedRoute from '../components/ProtectedRoute';

describe('Guardián de Navegación (ProtectedRoute)', () => {
  it('Debe interceptar el acceso a /registro y redirigir al Login si no hay sesión', () => {
    
    // Simulamos que no hay ningún usuario en la memoria global
    const mockContextValue = {
      usuario: null,
      cargando: false
    };

    render(
      <AuthContext.Provider value={mockContextValue}>
        <MemoryRouter initialEntries={['/registro']}>
          <Routes>
            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/registro" element={<h1>Módulo de Registro (Protegido)</h1>} />
            </Route>
            {/* Ruta pública */}
            <Route path="/login" element={<h1>Pantalla de Login (Pública)</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Verificamos que el contenido de /registro fue bloqueado
    expect(screen.queryByText(/Módulo de Registro/i)).not.toBeInTheDocument();
    
    // Verificamos que el guardián forzó el renderizado de /login
    expect(screen.getByText(/Pantalla de Login/i)).toBeInTheDocument();
  });
});