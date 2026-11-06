import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Card, CardContent, Button, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert 
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../context/AuthContext'; // Asumiendo que mantienes tu contexto de autenticación

export default function Asistencia() {
  const [entradas, setEntradas] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const { usuario } = useAuth();

  // Función para obtener el historial (GET)
  const cargarHistorial = async () => {
    const token = localStorage.getItem('access_token'); // Extraemos el token JWT
    try {
      const response = await fetch('http://localhost:8000/entradas/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEntradas(data);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  // Cargar la tabla al montar el componente
  useEffect(() => {
    cargarHistorial();
  }, []);

  // Función para marcar la asistencia (POST)
  const registrarEntrada = async () => {
    setMensaje({ tipo: '', texto: '' });
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch('http://localhost:8000/entradas/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al comunicar con el servidor para registrar la entrada.');
      }
      
      setMensaje({ tipo: 'success', texto: '¡Entrada registrada exitosamente!' });
      cargarHistorial(); // Refrescamos la tabla instantáneamente
      
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5, mb: 5 }}>
        
        {/* Panel de Acción */}
        <Card sx={{ p: 2, mb: 4, boxShadow: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Control de Asistencia
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Trabajador: {usuario?.nombre_completo}
            </Typography>

            {mensaje.texto && (
              <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>
                {mensaje.texto}
              </Alert>
            )}

            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<AccessTimeIcon />}
              onClick={registrarEntrada}
              sx={{ py: 1.5, px: 4, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              Registrar Mi Entrada
            </Button>
          </CardContent>
        </Card>

        {/* Tabla de Historial */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Mi Historial de Marcajes
        </Typography>
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID Registro</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha y Hora Exacta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No tienes registros de entradas aún.
                  </TableCell>
                </TableRow>
              ) : (
                entradas.map((entrada) => (
                  <TableRow key={entrada.id_entrada}>
                    <TableCell>{entrada.id_entrada}</TableCell>
                    <TableCell>
                      {new Date(entrada.fecha_hora).toLocaleString('es-CL')}
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