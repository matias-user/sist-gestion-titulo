import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Card, CardContent, TextField, Button, 
  Typography, Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GestionProductos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [codigoSku, setCodigoSku] = useState('');
  const [nombreProducto, setNombreProducto] = useState('');
  const [stockActual, setStockActual] = useState('');
  
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Guardia RBAC visual: Solo admins
  useEffect(() => {
    if (usuario && usuario.id_rol === 3) {
      navigate('/');
    } else {
      cargarProductos();
    }
  }, [usuario, navigate]);

  const cargarProductos = async () => {
    try {
      const response = await fetch('http://localhost:8000/productos/');
      if (response.ok) {
        setProductos(await response.json());
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/productos/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo_sku: codigoSku,
          nombre_producto: nombreProducto,
          stock_actual: Number(stockActual)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el producto.');
      }

      setMensaje({ tipo: 'success', texto: '¡Producto creado exitosamente!' });
      setCodigoSku('');
      setNombreProducto('');
      setStockActual('');
      cargarProductos(); // Refrescar la tabla

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, mb: 5 }}>
        
        {mensaje.texto && (
          <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>{mensaje.texto}</Alert>
        )}

        {/* Formulario de Alta de Producto */}
        <Card sx={{ p: 2, mb: 4, boxShadow: 3, borderTop: '4px solid #2e7d32' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
              <Inventory2Icon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Gestión de Catálogo de Productos
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Código SKU"
                required fullWidth
                value={codigoSku}
                onChange={(e) => setCodigoSku(e.target.value)}
              />

              <TextField
                label="Nombre del Producto"
                required fullWidth
                value={nombreProducto}
                onChange={(e) => setNombreProducto(e.target.value)}
              />

              <TextField
                label="Stock Inicial"
                type="number"
                required fullWidth
                inputProps={{ step: "0.01", min: "0" }}
                value={stockActual}
                onChange={(e) => setStockActual(e.target.value)}
              />

              <Button type="submit" variant="contained" color="success" sx={{ py: 1.5, fontWeight: 'bold' }}>
                Guardar Producto en Inventario
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Tabla de Productos Registrados */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Productos en Sistema
        </Typography>

        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#e8f5e9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre del Producto</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Stock Actual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productos.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">No hay productos registrados.</TableCell></TableRow>
              ) : (
                productos.map((prod) => (
                  <TableRow key={prod.id_producto}>
                    <TableCell>{prod.id_producto}</TableCell>
                    <TableCell>{prod.codigo_sku}</TableCell>
                    <TableCell>{prod.nombre_producto}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: prod.stock_actual > 0 ? 'green' : 'red' }}>
                      {prod.stock_actual}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>
    </Container>
  );
}