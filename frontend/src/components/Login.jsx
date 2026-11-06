import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  // Eliminamos const [success, setSuccess] porque ya no lo necesitamos
  
  const navigate = useNavigate();
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
      
      // Guardamos la sesión global y redirigimos instantáneamente al Home
      login(data.usuario, data.access_token);
      navigate('/'); 
      
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
            
            {/* Solo mantenemos la alerta de error */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField 
                margin="normal" required fullWidth label="RUT" 
                value={rut} onChange={(e) => setRut(e.target.value)} 
              />
              <TextField 
                margin="normal" required fullWidth label="Contraseña" type="password" 
                value={password} onChange={(e) => setPassword(e.target.value)} 
              />
              <Button 
                type="submit" fullWidth variant="contained" 
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