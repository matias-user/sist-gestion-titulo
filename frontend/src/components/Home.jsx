import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Button, Box, Card, CardContent, Chip } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

export default function Home() {
  // Extraemos al usuario activo y la función de limpieza desde el cerebro central
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // 1. Destruye el token del storage y la memoria de React
    navigate('/login'); // 2. Expulsa instantáneamente al Login
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Card sx={{ boxShadow: 3, p: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bienvenido, {usuario?.nombre_completo}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
            <Chip label={`Rol ID: ${usuario?.id_rol}`} color="primary" />
            <Chip label={`Área ID: ${usuario?.id_area}`} color="secondary" />
          </Box>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>

            {/* GUARDIA VISUAL: Solo Super Admin (1) o Admin (2) verán este botón */}
            {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (
              <Button
                variant="outlined"
                startIcon={<GroupAddIcon />}
                onClick={() => navigate('/registro')}
              >
                Registrar Nuevos Usuarios
              </Button>

            )}
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/asignaciones')}
            >
              Ver Asignaciones
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}