import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Card, CardContent, TextField, Button, 
  Typography, Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GestionCatalogos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [nombreTipo, setNombreTipo] = useState('');
  const [tiposAsignacion, setTiposAsignacion] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Si un usuario Básico logra entrar aquí por URL, lo expulsamos al Home
  useEffect(() => {
    if (usuario && usuario.id_rol === 3) {
      navigate('/');
    } else {
      cargarTipos();
    }
  }, [usuario, navigate]);

  const cargarTipos = async () => {
    try {
      const response = await fetch('http://localhost:8000/catalogos/tipos-asignacion');
      if (response.ok) {
        const data = await response.json();
        setTiposAsignacion(data);
      }
    } catch (error) {
      console.error("Error al cargar los catálogos:", error);
    }
  };

  const handleSubmit = async (e) => {
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
        body: JSON.stringify({ nombre_tipo: nombreTipo }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la nueva categoría.');
      }

      setMensaje({ tipo: 'success', texto: '¡Categoría creada exitosamente!' });
      setNombreTipo('');
      cargarTipos(); // Refresca la tabla automáticamente

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5, mb: 5 }}>
        
        {/* Formulario de Creación */}
        <Card sx={{ p: 2, mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              <CategoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Gestión de Catálogos (Tipos de Asignación)
            </Typography>
            
            {mensaje.texto && (
              <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>{mensaje.texto}</Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
              <TextField
                label="Nombre de la nueva categoría (Ej. Aseo, Revisión Técnica)"
                required
                fullWidth
                value={nombreTipo}
                onChange={(e) => setNombreTipo(e.target.value)}
              />
              <Button type="submit" variant="contained" color="primary" sx={{ py: 1.5, px: 4, fontWeight: 'bold' }}>
                Guardar
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Tabla de Visualización */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Categorías Actuales en el Sistema
        </Typography>
        
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre de la Categoría</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tiposAsignacion.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">No hay categorías registradas.</TableCell>
                </TableRow>
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

      </Box>
    </Container>
  );
}