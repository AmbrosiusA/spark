-- Base de datos para sistema de envío de SMS
-- MariaDB 10.6+

CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    saldo_sms DECIMAL(10,2) DEFAULT 0.00,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mensajes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL, --añadir indice en columna usuario_id
    telefono_destino VARCHAR(20) NOT NULL,
    mensaje TEXT NOT NULL,
    estado ENUM('pendiente', 'enviado', 'fallido') DEFAULT 'pendiente',--catalogo id foreign key relacionado a otra tabla
    proveedor_id INT,
    intentos INT DEFAULT 0,
    costo DECIMAL(6,3) DEFAULT 0.050,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enviado_at TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS proveedores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    prioridad INT DEFAULT 1,
    capacidad_max INT DEFAULT 100,
    activo TINYINT(1) DEFAULT 1,
    costo_por_sms DECIMAL(6,3) DEFAULT 0.050
);

CREATE TABLE IF NOT EXISTS dids (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(20) NOT NULL UNIQUE,
    proveedor_id INT NOT NULL,
    bloqueado TINYINT(1) DEFAULT 0,
    uso_count INT DEFAULT 0,
    ultima_rotacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- Datos de ejemplo
INSERT INTO usuarios (nombre, email, telefono, saldo_sms) VALUES
('Juan Perez', 'juan@example.com', '+521234567890', 100.00),
('Maria Lopez', 'maria@example.com', '+521234567891', 50.00),
('Carlos Ruiz', 'carlos@example.com', '+521234567892', 25.00);

INSERT INTO proveedores (nombre, prioridad, capacidad_max, costo_por_sms) VALUES
('VIVA', 1, 1000, 0.045),
('Telcel', 2, 500, 0.055),
('ATT', 3, 300, 0.060);

INSERT INTO dids (numero, proveedor_id, uso_count) VALUES
('+5215512345001', 1, 150),
('+5215512345002', 1, 80),
('+5215512345003', 2, 200),
('+5215512345004', 2, 50),
('+5215512345005', 3, 300);
