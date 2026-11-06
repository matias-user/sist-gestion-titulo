import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom'; 
import { AuthContext } from '../context/AuthContext';
import Asistencia from '../components/Asistencia';

describe('Módulo de Asistencia (Frontend)', () => {
  it('Debe renderizar la vista de Control de Asistencia y la tabla histórica', () => {
    
    // 1. Simulamos el usuario en sesión desde el Context API
    const mockAuthContext = {
      usuario: { nombre_completo: "Trabajador Test", id_rol: 3 },
    };

    // 2. Renderizamos el componente envolviéndolo en su contexto
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Asistencia />
      </AuthContext.Provider>
    );

    // 3. Verificaciones de Renderizado
    expect(screen.getByText(/Control de Asistencia/i)).toBeInTheDocument();
    expect(screen.getByText(/Trabajador Test/i)).toBeInTheDocument();
    
    // Verifica que el botón de acción principal esté habilitado y presente
    const botonMarcar = screen.getByRole('button', { name: /Registrar Mi Entrada/i });
    expect(botonMarcar).toBeInTheDocument();
    
    // Verifica que las columnas de la tabla de historial existan
    expect(screen.getByText(/ID Registro/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha y Hora Exacta/i)).toBeInTheDocument();
  });
});