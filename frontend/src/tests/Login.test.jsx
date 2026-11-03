// front/src/tests/Login.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
// Subimos un nivel (../) para entrar a components
import Login from '../components/Login';

describe('Componente Login (Frontend - Carpeta Tests)', () => {
  it('Debe renderizar los campos de RUT y contraseña correctamente', () => {
    render(<Login />);
    
    // Verifica que el campo RUT esté presente en pantalla
    expect(screen.getByLabelText(/RUT/i)).toBeInTheDocument();
    
    // Verifica que el campo Contraseña esté presente en pantalla
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    
    // Verifica que el botón de ingresar exista
    expect(screen.getByRole('button', { name: /Ingresar|Probar Conexión/i })).toBeInTheDocument();
  });
});