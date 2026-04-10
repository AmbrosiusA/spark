// db.js - Conexión y queries a MariaDB
// NOTA: Este código tiene problemas intencionales de performance

const mysql = require('mysql2');

// Conexión sin pool (PROBLEMA 1: No usa connection pooling)
const connection = mysql.createPool({
    host: 'localhost',
    user: 'sms_user',
    password: 'password123',
    database: 'sms_db',
    waitForConnections: true,
    connectionLimit: 10
});

connection.connect();

// PROBLEMA 2: Query sin índices, hace full table scan
async function obtenerMensajesPendientes() {
    const query = `
        SELECT m.*, u.nombre, u.email, u.saldo_sms
        FROM mensajes m
        JOIN usuarios u ON m.usuario_id = u.id
        WHERE m.estado = 'pendiente'
        ORDER BY m.created_at DESC
    `;
    
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            if (error) throw error;  // PROBLEMA 3: No maneja errores correctamente
            resolve(results);
        });
    });
}

// PROBLEMA 4: N+1 queries - Ineficiente
async function obtenerUsuariosConMensajes() {
    const usuarios = await new Promise((resolve, reject) => {
        connection.query('SELECT * FROM usuarios WHERE activo = 1', (error, results) => {
            if (error) throw error;
            resolve(results);
        });
    });
    //hacer un join con la tabla mensajes
    //una columna que devuelva como json el resultado del query de abajo mediante un join
    
    // Hace una query por cada usuario (N+1 problem)
    for (let usuario of usuarios) {
        const mensajes = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM mensajes WHERE usuario_id = ?', 
                [usuario.id], 
                (error, results) => {
                    if (error) throw error;
                    resolve(results);
                }
            );
        });
        usuario.mensajes = mensajes;
    }
    
    return usuarios;
}

// PROBLEMA 5: Query muy lento sin optimización
async function obtenerEstadisticas(usuarioId, fechaInicio, fechaFin) {
    const query = `
        SELECT 
            u.nombre,
            COUNT(m.id) as total_mensajes,
            SUM(CASE WHEN m.estado = 'enviado' THEN 1 ELSE 0 END) as enviados,
            SUM(CASE WHEN m.estado = 'fallido' THEN 1 ELSE 0 END) as fallidos,
            SUM(m.costo) as costo_total,
            p.nombre as proveedor
        FROM usuarios u
        LEFT JOIN mensajes m ON u.id = m.usuario_id
        LEFT JOIN proveedores p ON m.proveedor_id = p.id
        WHERE u.id = ${usuarioId}  -- PROBLEMA 6: SQL Injection vulnerable
        AND m.created_at BETWEEN '${fechaInicio}' AND '${fechaFin}'
        GROUP BY u.id, p.nombre
    `;

    const query2 = `SELECT 
            u.nombre,
            COUNT(m.id) as total_mensajes,
            SUM(CASE WHEN m.estado = 'enviado' THEN 1 ELSE 0 END) as enviados,
            SUM(CASE WHEN m.estado = 'fallido' THEN 1 ELSE 0 END) as fallidos,
            SUM(m.costo) as costo_total,
            p.nombre as proveedor
        FROM usuarios u
        LEFT JOIN mensajes m ON u.id = m.usuario_id
        LEFT JOIN proveedores p ON m.proveedor_id = p.id
        WHERE u.id = ?  -- PROBLEMA 6: SQL Injection vulnerable
        AND m.created_at BETWEEN '?' AND '?'
        GROUP BY u.id, p.nombre
    `;

    const params = [usuarioId,fechaInicio,fechaFin];
    
    return new Promise((resolve, reject) => {
        connection.execute(query2, params, (error, results) => {
            if (error) throw error;
            resolve(results);
        });
    });
}

// Función para insertar mensaje (usado por API)
async function insertarMensaje(usuarioId, telefonoDestino, mensaje) {
    const query = `
        INSERT INTO mensajes (usuario_id, telefono_destino, mensaje, estado)
        VALUES (?, ?, ?, 'pendiente')
    `;
    
    return new Promise((resolve, reject) => {
        connection.query(query, [usuarioId, telefonoDestino, mensaje], (error, results) => {
            if (error) throw error;
            resolve(results);
        });
    });
}

// PROBLEMA 7: No verifica saldo antes de insertar
async function verificarSaldoUsuario(usuarioId) {
    const query = 'SELECT saldo_sms FROM usuarios WHERE id = ?';
    
    return new Promise((resolve, reject) => {
        connection.query(query, [usuarioId], (error, results) => {
            if (error) throw error;
            resolve(results[0]);
        });
    });
}

module.exports = {
    obtenerMensajesPendientes,
    obtenerUsuariosConMensajes,
    obtenerEstadisticas,
    insertarMensaje,
    verificarSaldoUsuario
};
