// api.js - API REST para envío de SMS
// NOTA: Este código tiene múltiples problemas que deben identificarse y corregirse

const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

// PROBLEMA 1: No valida inputs, no maneja errores correctamente
app.post('/api/sms/enviar', async (req, res) => {
    const { usuario_id, telefono, mensaje } = req.body;
    
    // PROBLEMA 2: No valida formato de teléfono
    // PROBLEMA 3: No valida longitud del mensaje
    // PROBLEMA 4: No verifica si el usuario existe o tiene saldo
    
    // PROBLEMA 5: No maneja errores de BD
    const result = await db.insertarMensaje(usuario_id, telefono, mensaje);
    
    // PROBLEMA 6: No implementa cola para alto tráfico
    // En picos de 1000 req/seg esto colapsaría la BD
    
    // PROBLEMA 7: Response sin estructura estándar
    res.send({ ok: true, id: result.insertId });
});

// PROBLEMA 8: Endpoint sin paginación que puede retornar miles de registros
app.get('/api/mensajes/pendientes', async (req, res) => {
    const mensajes = await db.obtenerMensajesPendientes();
    res.json(mensajes);
});

// PROBLEMA 9: Endpoint lento con N+1 queries
app.get('/api/usuarios/con-mensajes', async (req, res) => {
    const usuarios = await db.obtenerUsuariosConMensajes();
    res.json(usuarios);
});

// PROBLEMA 10: Vulnerable a SQL injection
app.get('/api/estadisticas/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;
    
    // No valida fechas ni el formato del usuarioId
    const stats = await db.obtenerEstadisticas(usuarioId, fecha_inicio, fecha_fin);
    
    res.json(stats);
});

// PROBLEMA 11: No implementa health check
// PROBLEMA 12: No tiene logging de errores
// PROBLEMA 13: No tiene rate limiting
// PROBLEMA 14: No maneja CORS correctamente para producción

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API corriendo en puerto ${PORT}`);
});

module.exports = app;
