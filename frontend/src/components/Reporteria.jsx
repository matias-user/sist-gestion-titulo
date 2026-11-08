import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Card, CardContent, Typography, 
  Button, MenuItem, Select, FormControl, InputLabel, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, FormHelperText 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

export default function Reporteria() {
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroTipoAsignacion, setFiltroTipoAsignacion] = useState('');
  
  const [usuarios, setUsuarios] = useState([]);
  const [tiposAsignacion, setTiposAsignacion] = useState([]);
  const [resultados, setResultados] = useState([]);

  const cargarCatalogos = async () => {
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const resUser = await fetch('http://localhost:8000/usuarios/', { headers });
      if (resUser.ok) setUsuarios(await resUser.json());

      const resTipos = await fetch('http://localhost:8000/catalogos/tipos-asignacion', { headers });
      if (resTipos.ok) setTiposAsignacion(await resTipos.json());
    } catch (err) {
      console.error("Error al cargar filtros del reporte:", err);
    }
  };

  const ejecutarConsulta = async () => {
    const token = localStorage.getItem('access_token');
    let params = new URLSearchParams();

    if (filtroUsuario) params.append('id_usuario', filtroUsuario);
    if (filtroTipoAsignacion) params.append('id_tipo_asignacion', filtroTipoAsignacion);

    try {
      const res = await fetch(`http://localhost:8000/reportes/asignaciones?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResultados(data);
      }
    } catch (err) {
      console.error("Error al solicitar información del reporte:", err);
    }
  };

  useEffect(() => {
    cargarCatalogos();
    ejecutarConsulta();
  }, []);

  const handleDescargarCSV = async () => {
    const token = localStorage.getItem('access_token');
    let params = new URLSearchParams();

    if (filtroUsuario) params.append('id_usuario', filtroUsuario);
    if (filtroTipoAsignacion) params.append('id_tipo_asignacion', filtroTipoAsignacion);

    try {
      const response = await fetch(`http://localhost:8000/reportes/asignaciones/csv?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Error en la descarga del archivo.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'informe_asignaciones.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar el documento:", err);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, mb: 5 }}>
        <Card sx={{ p: 3, mb: 4, boxShadow: 3, borderTop: '5px solid #1976d2' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
              <FilterAltIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 30 }} />
              Generación de Informes y Reportería Web
            </Typography>

            <Grid container spacing={3} alignItems="flex-start">
              {/* Filtro 1: Selección de Trabajador */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined" size="medium">
                  <InputLabel id="label-filtro-trabajador">Filtrar por Trabajador / Colaborador</InputLabel>
                  <Select 
                    labelId="label-filtro-trabajador"
                    id="select-filtro-trabajador"
                    value={filtroUsuario} 
                    onChange={(e) => setFiltroUsuario(e.target.value)} 
                    label="Filtrar por Trabajador / Colaborador"
                  >
                    <MenuItem value="">
                      <em>Todos los trabajadores</em>
                    </MenuItem>
                    {usuarios.map(u => (
                      <MenuItem key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Selecciona un colaborador específico para el reporte</FormHelperText>
                </FormControl>
              </Grid>

              {/* Filtro 2: Selección de Labor */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined" size="medium">
                  <InputLabel id="label-filtro-labor">Filtrar por Tipo de Labor / Categoría</InputLabel>
                  <Select 
                    labelId="label-filtro-labor"
                    id="select-filtro-labor"
                    value={filtroTipoAsignacion} 
                    onChange={(e) => setFiltroTipoAsignacion(e.target.value)} 
                    label="Filtrar por Tipo de Labor / Categoría"
                  >
                    <MenuItem value="">
                      <em>Todas las tareas / categorías</em>
                    </MenuItem>
                    {tiposAsignacion.map(t => (
                      <MenuItem key={t.id_tipo_asignacion} value={t.id_tipo_asignacion}>{t.nombre_tipo}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Filtra por la categoría o tipo de labor asignada</FormHelperText>
                </FormControl>
              </Grid>

              {/* Botonera de Acciones (Filtrar y Descargar) */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 2, pt: 0.5 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="large"
                    onClick={ejecutarConsulta}
                    sx={{ py: 1.5, fontWeight: 'bold' }}
                  >
                    Aplicar Filtros
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    color="success" 
                    fullWidth 
                    size="large"
                    startIcon={<DownloadIcon />} 
                    onClick={handleDescargarCSV}
                    sx={{ py: 1.5, fontWeight: 'bold' }}
                  >
                    Exportar CSV
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Vista Previa de la Tabla en Línea */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Vista Previa del Informe Solicitado
        </Typography>

        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trabajador</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tipo de Labor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No hay registros que coincidan con los criterios seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                resultados.map((row) => (
                  <TableRow key={row.id_asignacion}>
                    <TableCell>{row.id_asignacion}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.nombre_trabajador}</TableCell>
                    <TableCell>{row.tipo_labor}</TableCell>
                    <TableCell>{row.fecha_asignacion}</TableCell>
                    <TableCell>{row.estado}</TableCell>
                    <TableCell>{row.descripcion}</TableCell>
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