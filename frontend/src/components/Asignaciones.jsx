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

  // Estados para el formulario
  const [idUsuarioDestino, setIdUsuarioDestino] = useState('');
  const [idTipoAsignacion, setIdTipoAsignacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaAsignacion, setFechaAsignacion] = useState('');

  // Estados para las listas desplegables y la tabla
  const [usuariosList, setUsuariosList] = useState([]);
  const [tiposAsignacion, setTiposAsignacion] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Función unificada para cargar todos los datos iniciales
  const cargarDatos = async () => {
    const token = localStorage.getItem('access_token');
    try {
      // 1. Cargar Historial de Asignaciones
      const resAsignaciones = await fetch('http://localhost:8000/asignaciones/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resAsignaciones.ok) setAsignaciones(await resAsignaciones.json());

      // 2. Cargar Catálogo de Tipos (Solo si es Admin)
      if (usuario?.id_rol === 1 || usuario?.id_rol === 2) {
        const resTipos = await fetch('http://localhost:8000/catalogos/tipos-asignacion');
        if (resTipos.ok) setTiposAsignacion(await resTipos.json());

        // 3. Cargar Usuarios para asignarles tareas
        const resUsuarios = await fetch('http://localhost:8000/usuarios/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resUsuarios.ok) setUsuariosList(await resUsuarios.json());
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [usuario]);

  // Enviar el formulario (POST)
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

      // Limpiar formulario y refrescar la tabla
      setIdUsuarioDestino('');
      setIdTipoAsignacion('');
      setDescripcion('');
      setFechaAsignacion('');
      cargarDatos();

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  };

  const marcarCompletada = async (idAsignacion) => {
    setMensaje({ tipo: '', texto: '' });
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`http://localhost:8000/asignaciones/${idAsignacion}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: 'Completada' })
      });

      if (!response.ok) throw new Error('Error al actualizar el estado.');

      setMensaje({ tipo: 'success', texto: '¡Tarea marcada como completada!' });
      cargarDatos(); // Refresca la tabla automáticamente

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, mb: 5 }}>

        {/* Formulario solo para Administradores */}
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

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>

                {/* Select Dinámico: Usuarios */}
                <FormControl fullWidth required>
                  <InputLabel id="usuario-destino-label">Trabajador</InputLabel>
                  <Select
                    labelId="usuario-destino-label"
                    value={idUsuarioDestino}
                    label="Trabajador"
                    onChange={(e) => setIdUsuarioDestino(e.target.value)}
                  >
                    {usuariosList.map((user) => (
                      <MenuItem key={user.id_usuario} value={user.id_usuario}>
                        {user.nombre_completo} (RUT: {user.rut})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Select Dinámico: Tipos de Asignación */}
                <FormControl fullWidth required>
                  <InputLabel id="tipo-asignacion-label">Categoría de la Tarea</InputLabel>
                  <Select
                    labelId="tipo-asignacion-label"
                    value={idTipoAsignacion}
                    label="Categoría de la Tarea"
                    onChange={(e) => setIdTipoAsignacion(e.target.value)}
                  >
                    {tiposAsignacion.map((tipo) => (
                      <MenuItem key={tipo.id_tipo_asignacion} value={tipo.id_tipo_asignacion}>
                        {tipo.nombre_tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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

        {/* Tabla de Asignaciones */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {(usuario?.id_rol === 1 || usuario?.id_rol === 2) ? "Historial Global de Asignaciones" : "Mis Asignaciones Diarias"}
        </Typography>

        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (
                  <TableCell sx={{ fontWeight: 'bold' }}>ID Trabajador</TableCell>
                )}
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell> {/* Nueva Columna */}
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
                    <TableCell>
                      {asignacion.estado !== 'Completada' ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => marcarCompletada(asignacion.id_asignacion)}
                        >
                          Completar
                        </Button>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold' }}>
                          ✓ Lista
                        </Typography>
                      )}
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