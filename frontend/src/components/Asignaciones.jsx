import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Card, CardContent, TextField, Button, 
  Typography, Alert, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuth } from '../context/AuthContext';

export default function Asignaciones() {
  const { usuario } = useAuth();
  
  // Estados para el formulario (Solo Administradores)
  const [idUsuarioDestino, setIdUsuarioDestino] = useState('');
  const [idTipoAsignacion, setIdTipoAsignacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaAsignacion, setFechaAsignacion] = useState('');
  
  // Estados para la tabla y notificaciones
  const [asignaciones, setAsignaciones] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Función para cargar el historial de asignaciones
  const cargarAsignaciones = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://localhost:8000/asignaciones/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAsignaciones(data);
      }
    } catch (error) {
      console.error("Error al cargar asignaciones:", error);
    }
  };

  useEffect(() => {
    cargarAsignaciones();
  }, []);

  // Función para enviar el formulario (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/asignaciones/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_usuario: Number(idUsuarioDestino),
          id_tipo_asignacion: Number(idTipoAsignacion),
          descripcion,
          fecha_asignacion: fechaAsignacion
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la asignación.');
      }

      setMensaje({ tipo: 'success', texto: '¡Asignación creada exitosamente!' });
      
      // Limpiar formulario y refrescar tabla
      setIdUsuarioDestino('');
      setIdTipoAsignacion('');
      setDescripcion('');
      setFechaAsignacion('');
      cargarAsignaciones();

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, mb: 5 }}>
        
        {/* Renderizado Condicional: Formulario solo para roles 1 (SuperAdmin) y 2 (Admin) */}
        {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (
          <Card sx={{ p: 2, mb: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                <AssignmentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Nueva Asignación de Trabajo
              </Typography>
              
              {mensaje.texto && (
                <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>{mensaje.texto}</Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                
                {/* Nota: En un entorno real, estos Selects consumirían los endpoints de /usuarios y /tipos_asignacion */}
                <TextField
                  label="ID del Trabajador"
                  type="number"
                  required
                  value={idUsuarioDestino}
                  onChange={(e) => setIdUsuarioDestino(e.target.value)}
                />
                
                <TextField
                  label="ID del Tipo de Asignación (Ej. 1)"
                  type="number"
                  required
                  value={idTipoAsignacion}
                  onChange={(e) => setIdTipoAsignacion(e.target.value)}
                />

                <TextField
                  label="Descripción de la Tarea"
                  required
                  multiline
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />

                <TextField
                  label="Fecha de Asignación"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={fechaAsignacion}
                  onChange={(e) => setFechaAsignacion(e.target.value)}
                />

                <Button type="submit" variant="contained" color="primary" sx={{ py: 1.5, fontWeight: 'bold' }}>
                  Crear Asignación
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tabla de Asignaciones (Visible para todos) */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {(usuario?.id_rol === 1 || usuario?.id_rol === 2) ? "Historial Global de Asignaciones" : "Mis Asignaciones Diarias"}
        </Typography>
        
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID Asignación</TableCell>
                {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (
                  <TableCell sx={{ fontWeight: 'bold' }}>ID Trabajador</TableCell>
                )}
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asignaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No hay asignaciones registradas.</TableCell>
                </TableRow>
              ) : (
                asignaciones.map((asignacion) => (
                  <TableRow key={asignacion.id_asignacion}>
                    <TableCell>{asignacion.id_asignacion}</TableCell>
                    {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (
                      <TableCell>{asignacion.id_usuario}</TableCell>
                    )}
                    <TableCell>{asignacion.fecha_asignacion}</TableCell>
                    <TableCell>{asignacion.descripcion}</TableCell>
                    <TableCell>{asignacion.estado || 'Pendiente'}</TableCell>
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