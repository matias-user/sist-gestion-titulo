import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Card, CardContent, TextField, Button, 
  Typography, Alert, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';

export default function RegistroUsuarios() {
  const [rut, setRut] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [password, setPassword] = useState('');
  const [idRol, setIdRol] = useState('');
  const [idArea, setIdArea] = useState('');
  
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar catalogos de Roles y Áreas desde el Backend al montar el componente
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const resRoles = await fetch('http://localhost:8000/catalogos/roles');
        const dataRoles = await resRoles.json();
        setRoles(dataRoles);

        const resAreas = await fetch('http://localhost:8000/catalogos/areas');
        const dataAreas = await resAreas.json();
        setAreas(dataAreas);
      } catch (err) {
        console.error("Error cargando roles o áreas:", err);
      }
    };
    cargarCatalogos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('access_token'); // Token obtenido en el Login

    try {
      const response = await fetch('http://localhost:8000/usuarios/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rut,
          nombre_completo: nombreCompleto,
          password,
          id_rol: Number(idRol),
          id_area: Number(idArea)
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al registrar el usuario.');
      }

      const data = await response.json();
      setSuccess(`Usuario ${data.nombre_completo} registrado exitosamente con ID ${data.id_usuario}`);
      
      // Limpiar el formulario
      setRut('');
      setNombreCompleto('');
      setPassword('');
      setIdRol('');
      setIdArea('');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, mb: 5 }}>
        <Card sx={{ p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              Registro de Usuarios y Asignación de Perfiles
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
              Asigne los roles (Super Admin, Admin, Básico) según la delimitación por área.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal" required fullWidth label="RUT" value={rut}
                onChange={(e) => setRut(e.target.value)}
              />
              <TextField
                margin="normal" required fullWidth label="Nombre Completo" value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
              />
              <TextField
                margin="normal" required fullWidth label="Contraseña" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Selector de Rol */}
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="rol-label">Perfil / Rol</InputLabel>
                <Select
                  labelId="rol-label"
                  value={idRol}
                  label="Perfil / Rol"
                  onChange={(e) => setIdRol(e.target.value)}
                >
                  {roles.map((rol) => (
                    <MenuItem key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre_rol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selector de Área */}
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="area-label">Área Organizacional</InputLabel>
                <Select
                  labelId="area-label"
                  value={idArea}
                  label="Área Organizacional"
                  onChange={(e) => setIdArea(e.target.value)}
                >
                  {areas.map((area) => (
                    <MenuItem key={area.id_area} value={area.id_area}>
                      {area.nombre_area}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit" fullWidth variant="contained"
                sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
              >
                Registrar Usuario
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}