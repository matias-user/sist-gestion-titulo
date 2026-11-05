import React, { useState } from 'react';
import { Container, Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';

export default function Login() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Extraemos la función login de nuestro contexto global
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Credenciales inválidas.');
      }

      const data = await response.json();
      
      // Inyectamos los datos recibidos del backend en la memoria global de React
      login(data.usuario, data.access_token);
      
      alert(`¡Bienvenido ${data.usuario.nombre_completo}!`);
      // Aquí el siguiente paso será redirigir al Home en lugar de lanzar una alerta

    } catch (err) {
      setError(err.message);
    }
  };  

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              Sistema de Gestión
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
              Inicia sesión con tus credenciales
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="rut"
                label="RUT"
                name="rut"
                autoComplete="rut"
                autoFocus
                value={rut}
                onChange={(e) => setRut(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
              >
                Ingresar
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}