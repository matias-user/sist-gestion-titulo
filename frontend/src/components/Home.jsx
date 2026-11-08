import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Button, Box, Card, CardContent, Chip } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CategoryIcon from '@mui/icons-material/Category';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Mapeos estáticos basados en los registros maestros (Seeds) de la BBDD
const MAPA_ROLES = {
  1: 'Super Administrador',
  2: 'Administrador',
  3: 'Básico'
};

const MAPA_AREAS = {
  1: 'Informática',
  2: 'Producción',
  3: 'Personas'
};

export default function Home() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Obtener los nombres a partir de los IDs
  const nombreRol = MAPA_ROLES[usuario?.id_rol] || `Rol #${usuario?.id_rol}`;
  const nombreArea = MAPA_AREAS[usuario?.id_area] || `Área #${usuario?.id_area}`;

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Card sx={{ boxShadow: 3, p: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bienvenido, {usuario?.nombre_completo}
          </Typography>

          {/* Badges / Chips con nombres legibles */}
          <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
            <Chip label={`Rol: ${nombreRol}`} color="primary" sx={{ fontWeight: 'bold' }} />
            <Chip label={`Área: ${nombreArea}`} color="secondary" sx={{ fontWeight: 'bold' }} />
          </Box>

          {/* Contenedor flexible de botones */}
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              width: '100%',
              alignItems: 'center'
            }}
          >
            <Button
              variant="contained"
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>

            {/* Acciones restringidas por perfil (RBAC) */}
            {(usuario?.id_rol === 1 || usuario?.id_rol === 2) && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<GroupAddIcon />}
                  onClick={() => navigate('/registro')}
                >
                  Registrar Usuarios
                </Button>

                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<CategoryIcon />}
                  onClick={() => navigate('/catalogos')}
                >
                  Gestión de Catálogos
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<WarningAmberIcon />}
                  onClick={() => navigate('/mermas')}
                >
                  Registro de Mermas
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Inventory2Icon />}
                  onClick={() => navigate('/productos')}
                >
                  Gestión de Productos
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/reportes')}
                >
                  Reportería Web
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}