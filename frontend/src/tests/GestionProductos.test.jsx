import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { AuthContext } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import GestionProductos from '../components/GestionProductos';

describe('Módulo de Gestión de Productos (Frontend)', () => {
  it('Debe renderizar los campos del formulario y la tabla de inventario para Administradores', () => {
    
    // 1. Simulación del usuario Administrador en sesión
    const mockAuthContext = {
      usuario: { nombre_completo: "Admin Sistema", id_rol: 1 },
    };

    // 2. Renderizado envuelto en el proveedor de contexto y router
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <GestionProductos />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // 3. Verificaciones de los elementos del Formulario
    expect(screen.getByText(/Gestión de Catálogo de Productos/i)).toBeInTheDocument();
    
    // Verificación de inputs por sus labels utilizando getAllByText para evitar ambigüedades de MUI
    const etiquetasSku = screen.getAllByText(/Código SKU/i);
    expect(etiquetasSku[0]).toBeInTheDocument();

    const etiquetasNombre = screen.getAllByText(/Nombre del Producto/i);
    expect(etiquetasNombre[0]).toBeInTheDocument();

    const etiquetasStock = screen.getAllByText(/Stock Inicial/i);
    expect(etiquetasStock[0]).toBeInTheDocument();

    // Verificación del botón de guardado
    const botonGuardar = screen.getByRole('button', { name: /Guardar Producto en Inventario/i });
    expect(botonGuardar).toBeInTheDocument();

    // 4. Verificación de la estructura de la Tabla
    expect(screen.getByText(/Productos en Sistema/i)).toBeInTheDocument();
    expect(screen.getByText(/Stock Actual/i)).toBeInTheDocument();
  });
});