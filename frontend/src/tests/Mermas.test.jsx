import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { AuthContext } from '../context/AuthContext';
import Mermas from '../components/Mermas';

describe('Módulo de Mermas e Inventario (Frontend)', () => {
  it('Debe renderizar el formulario transaccional para Administradores y la tabla de historial', () => {
    
    // 1. Simulamos el usuario en sesión con permisos de Administrador (Rol 2)
    const mockAuthContext = {
      usuario: { nombre_completo: "Admin Inventario", id_rol: 2 },
    };

    // 2. Renderizamos el componente envolviéndolo en su contexto
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Mermas />
      </AuthContext.Provider>
    );

    // 3. Verificaciones del Formulario
    expect(screen.getByText(/Declaración de Merma de Inventario/i)).toBeInTheDocument();
    
    // Usamos getAllByText para evitar el fallo por duplicidad de MUI en los labels
    const etiquetasProducto = screen.getAllByText(/Producto Afectado/i);
    expect(etiquetasProducto[0]).toBeInTheDocument();

    const etiquetasCausa = screen.getAllByText(/Causa de la Merma/i);
    expect(etiquetasCausa[0]).toBeInTheDocument();

    expect(screen.getByLabelText(/Cantidad a dar de baja/i)).toBeInTheDocument();
    
    // Validar presencia del botón transaccional
    const botonRegistrar = screen.getByRole('button', { name: /Registrar Pérdida y Descontar Stock/i });
    expect(botonRegistrar).toBeInTheDocument();

    // 4. Verificaciones de la Tabla Histórica
    expect(screen.getByText(/Registro Histórico de Mermas/i)).toBeInTheDocument();
    expect(screen.getByText(/ID Merma/i)).toBeInTheDocument();
  });
});