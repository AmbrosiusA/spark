# Prueba Técnica SR Full Stack - Sistema de SMS

## Contexto

Tienes un sistema de envío de SMS que está presentando problemas de performance en producción. El sistema debe manejar hasta 1,000 requests por segundo durante horas pico, pero actualmente colapsa con 100 req/seg.

## Tu misión (30-35 minutos)

### PARTE 1: Optimización de Base de Datos (10 min)

**Archivo:** `db.js`

1. **Identificar queries lentos** que hacen full table scan
2. **Proponer y escribir** los índices necesarios en `schema.sql`
3. **Corregir el problema N+1 queries** en `obtenerUsuariosConMensajes()`
4. **Implementar connection pooling** correctamente
5. **Arreglar SQL injection** en `obtenerEstadisticas()`

**Pista:** Piensa en qué columnas se usan en WHERE, JOIN y ORDER BY

---

### PARTE 2: API - Validaciones y Manejo de Errores (10 min)

**Archivo:** `api.js`

1. **Agregar validaciones** al endpoint `/api/sms/enviar`:
  - Formato de teléfono (10 dígitos, formato +52XXXXXXXXXX)
  - Longitud del mensaje (máximo 160 caracteres)
  - Usuario existe y está activo
  - Usuario tiene saldo suficiente (costo: $0.05 por SMS)
2. **Implementar manejo de errores** consistente:
  - Try-catch en todos los endpoints
  - Responses con estructura estándar: `{ success, data, error }`
  - Códigos HTTP correctos (400, 404, 500, etc.)
3. **Agregar endpoint de health check** (`/health`)

---

### PARTE 3: Implementar Sistema de Colas (15 min)

**Objetivo:** Evitar saturación de BD durante picos de tráfico

**Tareas:**

1. **Diseñar** cómo implementarías una cola (puedes usar pseudocódigo si no conoces una librería específica)
2. **Modificar** el endpoint `/api/sms/enviar` para:
  - Si el sistema está bajo carga normal → insertar directo a BD
  - Si hay más de 100 requests/seg → encolar el mensaje
3. **Explicar** cómo procesarías los mensajes de la cola

**Preguntas clave a responder:**

- ¿Qué pasa si el worker que procesa la cola falla?
- ¿Cómo garantizas que no se pierdan mensajes?
- ¿Usarías una cola en memoria (Redis) o persistente (RabbitMQ)? ¿por que?

redis - gestor de colas y usando libreria p-queue

load balancer -
- valida el numero de requests
- tiempo de respuesta

workers
consuma la cola y haga los inserts en intervalos de tiempo

---

### BONUS: Optimizaciones Adicionales (5-10 min)

Si terminas antes, considera:

- Paginación en endpoints que retornan muchos registros
- Rate limiting por usuario
- Logging estructurado
- Métricas de performance (tiempo de respuesta)

---

## Criterios de Evaluación

✅ **Optimización DB:** Índices correctos, queries eficientes, no SQL injection  
✅ **Validaciones:** Input sanitization, verificación de negocio  
✅ **Arquitectura:** Uso de colas, pensamiento en escalabilidad  
✅ **Código limpio:** Async/await, manejo de errores, estructura clara  
✅ **Comunicación:** Explica tus decisiones mientras codificas  

---

## Setup (ya está listo)

```bash
# Base de datos
mysql -u root -p < schema.sql

# Dependencias
npm install express mysql2

# Correr API
node api.js
```

---

## Notas

- **Pregunta todo lo que necesites**
- **Piensa en voz alta** mientras codificas
- **No es necesario que todo funcione perfecto**, queremos ver tu proceso de pensamiento
- **Prioriza lo más crítico primero**

¡Éxito! 