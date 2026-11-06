import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '@testing-library/jest-dom';
import Login from '../components/Login';

describe('Componente Login (Frontend - Carpeta Tests)', () => {
  it('Debe renderizar los campos de RUT y contraseña correctamente', () => {
    
    // 1. Creamos un contexto falso para que useAuth() no falle
    const mockAuthContext = {
      login: () => {}, 
      usuario: null
    };

    // 2. Renderizamos el Login envuelto en el Router y el Contexto
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // 3. Verificamos que los elementos existan en pantalla
    expect(screen.getByLabelText(/RUT/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
  });
});