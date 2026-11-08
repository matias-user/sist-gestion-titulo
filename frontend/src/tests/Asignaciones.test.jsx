import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { AuthContext } from '../context/AuthContext';
import Asistencia from '../components/Asistencia';

describe('Módulo Transaccional de Asistencia (Frontend)', () => {
  it('Debe renderizar el título de control de asistencia y el botón de marcaje', () => {
    
    // 1. Mock del contexto global de autenticación
    const mockAuthContext = {
      usuario: { nombre_completo: "Colaborador Operativo", id_rol: 3 },
    };

    // 2. Renderizado del componente envuelto en su proveedor de contexto
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Asistencia />
      </AuthContext.Provider>
    );

    // 3. Verificaciones visuales de la interfaz
    expect(screen.getByText(/Control de Asistencia/i)).toBeInTheDocument();
    expect(screen.getByText(/Colaborador Operativo/i)).toBeInTheDocument();
    
    // Validar presencia del botón transaccional
    const botonMarcar = screen.getByRole('button', { name: /Registrar Mi Entrada/i });
    expect(botonMarcar).toBeInTheDocument();
    
    // Validar estructura de la tabla histórica
    expect(screen.getByText(/ID Registro/i)).toBeInTheDocument();
  });
});