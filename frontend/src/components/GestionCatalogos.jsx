import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Card, CardContent, TextField, Button, 
  Typography, Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Divider 
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GestionCatalogos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  
  // Estados para Tipos de Asignación
  const [nombreTipoAsignacion, setNombreTipoAsignacion] = useState('');
  const [tiposAsignacion, setTiposAsignacion] = useState([]);
  
  // Estados para Tipos de Merma
  const [descripcionMerma, setDescripcionMerma] = useState('');
  const [tiposMerma, setTiposMerma] = useState([]);

  // Estado general para notificaciones
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Guardia de ruta
  useEffect(() => {
    if (usuario && usuario.id_rol === 3) {
      navigate('/');
    } else {
      cargarCatalogos();
    }
  }, [usuario, navigate]);

  const cargarCatalogos = async () => {
    try {
      const resAsignaciones = await fetch('http://localhost:8000/catalogos/tipos-asignacion');
      if (resAsignaciones.ok) setTiposAsignacion(await resAsignaciones.json());

      const resMermas = await fetch('http://localhost:8000/catalogos/tipos-merma');
      if (resMermas.ok) setTiposMerma(await resMermas.json());
    } catch (error) {
      console.error("Error al cargar los catálogos:", error);
    }
  };

  // Submit para Asignaciones
  const handleAsignacionSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/catalogos/tipos-asignacion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_tipo: nombreTipoAsignacion }),
      });

      if (!response.ok) throw new Error('Error al crear categoría de asignación.');

      setMensaje({ tipo: 'success', texto: '¡Categoría de Asignación creada exitosamente!' });
      setNombreTipoAsignacion('');
      cargarCatalogos();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  };

  // Submit para Mermas
  const handleMermaSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/catalogos/tipos-merma', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ descripcion_tipo: descripcionMerma }),
      });

      if (!response.ok) throw new Error('Error al crear categoría de merma.');

      setMensaje({ tipo: 'success', texto: '¡Causa de Merma creada exitosamente!' });
      setDescripcionMerma('');
      cargarCatalogos();
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

        {/* --- SECCIÓN 1: TIPOS DE ASIGNACIÓN --- */}
        <Card sx={{ p: 2, mb: 6, boxShadow: 3, borderTop: '4px solid #1976d2' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              <CategoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Categorías de Asignaciones (Tareas)
            </Typography>
            
            <Box component="form" onSubmit={handleAsignacionSubmit} sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, alignItems: 'center' }}>
              <TextField
                label="Nueva categoría de tarea (Ej. Aseo, Revisión)"
                required fullWidth value={nombreTipoAsignacion}
                onChange={(e) => setNombreTipoAsignacion(e.target.value)}
              />
              <Button type="submit" variant="contained" color="primary" sx={{ py: 1.5, px: 4, fontWeight: 'bold' }}>
                Guardar
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre de la Categoría</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tiposAsignacion.length === 0 ? (
                    <TableRow><TableCell colSpan={2} align="center">No hay categorías registradas.</TableCell></TableRow>
                  ) : (
                    tiposAsignacion.map((tipo) => (
                      <TableRow key={tipo.id_tipo_asignacion}>
                        <TableCell>{tipo.id_tipo_asignacion}</TableCell>
                        <TableCell>{tipo.nombre_tipo}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* --- SECCIÓN 2: TIPOS DE MERMA --- */}
        <Card sx={{ p: 2, mb: 4, boxShadow: 3, borderTop: '4px solid #ed6c02' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
              <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Causas de Mermas de Inventario
            </Typography>
            
            <Box component="form" onSubmit={handleMermaSubmit} sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, alignItems: 'center' }}>
              <TextField
                label="Nueva causa de merma (Ej. Vencimiento, Daño)"
                required fullWidth value={descripcionMerma}
                onChange={(e) => setDescripcionMerma(e.target.value)}
              />
              <Button type="submit" variant="contained" color="warning" sx={{ py: 1.5, px: 4, fontWeight: 'bold' }}>
                Guardar
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#fff3e0' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descripción de la Causa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tiposMerma.length === 0 ? (
                    <TableRow><TableCell colSpan={2} align="center">No hay causas registradas.</TableCell></TableRow>
                  ) : (
                    tiposMerma.map((tipo) => (
                      <TableRow key={tipo.id_tipo_merma}>
                        <TableCell>{tipo.id_tipo_merma}</TableCell>
                        <TableCell>{tipo.descripcion_tipo}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

      </Box>
    </Container>
  );
}