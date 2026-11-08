import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Card, CardContent, TextField, Button, 
  Typography, Alert, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAuth } from '../context/AuthContext';

export default function Mermas() {
  const { usuario } = useAuth();
  
  const [idProducto, setIdProducto] = useState('');
  const [idTipoMerma, setIdTipoMerma] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [observacion, setObservacion] = useState('');
  
  const [productos, setProductos] = useState([]);
  const [tiposMerma, setTiposMerma] = useState([]);
  const [historialMermas, setHistorialMermas] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const cargarDatos = async () => {
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // Cargar historial de mermas
      const resMermas = await fetch('http://localhost:8000/mermas/', { headers });
      if (resMermas.ok) setHistorialMermas(await resMermas.json());

      // Cargar productos para el selector
      const resProductos = await fetch('http://localhost:8000/mermas/productos', { headers });
      if (resProductos.ok) setProductos(await resProductos.json());

      // Cargar catálogo de tipos de merma (Asumiendo que creaste el endpoint /catalogos/tipos-merma)
      const resTipos = await fetch('http://localhost:8000/catalogos/tipos-merma', { headers });
      if (resTipos.ok) setTiposMerma(await resTipos.json());
      
    } catch (error) {
      console.error("Error al cargar datos del inventario:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/mermas/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_producto: Number(idProducto),
          id_tipo_merma: Number(idTipoMerma),
          cantidad: Number(cantidad),
          observacion
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar la merma.');
      }

      setMensaje({ tipo: 'success', texto: '¡Merma registrada y stock actualizado con éxito!' });
      
      setIdProducto('');
      setIdTipoMerma('');
      setCantidad('');
      setObservacion('');
      cargarDatos(); // Refrescar tablas y nuevo stock

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, mb: 5 }}>
        
        {/* Formulario de Registro (Solo Administradores) */}
        {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (
          <Card sx={{ p: 2, mb: 4, boxShadow: 3, borderTop: '4px solid #ed6c02' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                <WarningAmberIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Declaración de Merma de Inventario
              </Typography>
              
              {mensaje.texto && (
                <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>{mensaje.texto}</Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                
                <FormControl fullWidth required>
                  <InputLabel>Producto Afectado</InputLabel>
                  <Select value={idProducto} label="Producto Afectado" onChange={(e) => setIdProducto(e.target.value)}>
                    {productos.map((prod) => (
                      <MenuItem key={prod.id_producto} value={prod.id_producto}>
                        {prod.codigo_sku} - {prod.nombre_producto} (Stock: {prod.stock_actual})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth required>
                  <InputLabel>Causa de la Merma</InputLabel>
                  <Select value={idTipoMerma} label="Causa de la Merma" onChange={(e) => setIdTipoMerma(e.target.value)}>
                    {tiposMerma.map((tipo) => (
                      <MenuItem key={tipo.id_tipo_merma} value={tipo.id_tipo_merma}>
                        {tipo.descripcion_tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Cantidad a dar de baja"
                  type="number"
                  required
                  inputProps={{ step: "0.01", min: "0.01" }}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />

                <TextField
                  label="Observaciones (Opcional)"
                  multiline
                  rows={2}
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                />

                <Button type="submit" variant="contained" color="warning" sx={{ py: 1.5, fontWeight: 'bold' }}>
                  Registrar Pérdida y Descontar Stock
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tabla de Historial */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Registro Histórico de Mermas
        </Typography>
        
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID Merma</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ID Producto</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cantidad</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Admin (ID)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historialMermas.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No hay mermas registradas.</TableCell></TableRow>
              ) : (
                historialMermas.map((m) => (
                  <TableRow key={m.id_merma}>
                    <TableCell>{m.id_merma}</TableCell>
                    <TableCell>{m.id_producto}</TableCell>
                    <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>-{m.cantidad}</TableCell>
                    <TableCell>{new Date(m.fecha_registro).toLocaleString('es-CL')}</TableCell>
                    <TableCell>{m.id_usuario_admin}</TableCell>
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