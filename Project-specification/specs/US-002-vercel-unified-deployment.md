# User Story: US-002 - Despliegue Unificado Serverless en Vercel (Opción A)
**Status**: APPROVED_SPEC | **Priority**: Must Have

### As a DevOps Engineer & System User
### I want to deploy both frontend and backend within a unified Vercel project
### So that users can interact with the Telegram messenger UI and trigger messages without cross-origin issues or managing standalone servers.

---

## ⚡ Non-Functional Requirements (Inherited from decisions.yml & Vercel Serverless)
* **Target Latency**: p95 < 250ms (excluyendo cold-starts iniciales de Vercel Node runtime).
* **Cold Start Tolerance**: <= 1500ms en el primer arranque de la función serverless.
* **Target Concurrency / RPS**: 50 RPS (capacidad suficiente para herramienta interna de mensajería).
* **Availability**: 99.9% uptime garantizado por Vercel Edge Network.
* **Error Rate Tolerance**: < 0.1% de fallos de infraestructura no atribuibles a límites de la API de Telegram.
* **Security & Secret Compliance**: Cero credenciales expuestas en frontend o en el repositorio Git (`.gitleaks.toml` compliant).

---

## 🔍 Discrepancy & Feasibility Audit (Opción A: Monorepo Serverless)

| Ítem Auditado | Diagnóstico / Hallazgo | Resolución & Requerimiento |
| :--- | :--- | :--- |
| **Punto de Entrada Serverless** | Express normalmente escucha en un puerto (`server.js`). Vercel Serverless requiere exportar la función/app. | Crear adaptador `api/index.js` en la raíz que exporte `createApp()`. |
| **Configuración de Vercel** | El `vercel.json` actual usa `"services": { ... }`, sintaxis no operativa para serverless en Vercel. | Actualizar `vercel.json` a Vercel Builds v2 con `@vercel/static-build` para `frontend` y `@vercel/node` para `api/index.js`. |
| **CORS & Enrutamiento** | Al usar mismo dominio (`/api/*` y `/*`), CORS externo deja de ser bloqueante para el navegador. | Mantener CORS permisivo en desarrollo y alineado con el dominio de Vercel en producción. |
| **In-Memory Rate Limiting** | `express-rate-limit` por defecto almacena en memoria de la instancia. En serverless, las instancias son efímeras. | Aceptable para volumen actual / uso interno. Si se requiere estricto rate limiting global, delegar en Vercel Firewall o KV store. |
| **Frontend Base URL** | En `frontend/src/services/api.js`, `VITE_BACKEND_URL` lanza error si está vacío. | En Vercel, configurar `VITE_BACKEND_URL` con la URL asignada del deployment o permitir URL relativa si se adapta el service. |

---

## 📋 Acceptance Criteria Matrix

| ID | Criterion Category | Description | Verification Method |
|---|---|---|---|
| AC-1 | Static UI Delivery | El frontend React/Vite compila y se sirve como activo estático desde Vercel CDN | HTTP 200 al acceder a la raíz `/` con HTML y bundles JS/CSS cargados |
| AC-2 | Health Check | El endpoint `/health` responde estado operativo a través de la función serverless | `GET /api/health` o `GET /health` responde HTTP 200 `{"status":"ok"}` |
| AC-3 | Happy Path Mensajería | El endpoint `/api/send-message` procesa payloads válidos y envía el mensaje a Telegram | `POST /api/send-message` con `chatId` y `message` válidos devuelve HTTP 200 con `success: true` |
| AC-4 | Validación de Entrada | Payload inválido o incompleto es rechazado inmediatamente con error explicativo | HTTP 400 Bad Request con descripción del campo faltante |
| AC-5 | Manejo de Errores Telegram | Errores 4xx/5xx de la API de Telegram son capturados y devueltos al frontend | HTTP 400 o 502/500 con `success: false` y mensaje amigable |
| AC-6 | Cero Secretos Expuestos | `TELEGRAM_BOT_TOKEN` nunca es accesible ni expuesto en el bundle JS del cliente | Inspección del bundle estático del frontend en `dist/` |

---

## 🧪 Concrete Scenarios (Gherkin / BDD)

### Scenario 1: Acceso a la interfaz web unificada
* **Given** que el proyecto está desplegado en Vercel en `https://<app>.vercel.app`
* **When** un usuario visita `https://<app>.vercel.app/` en su navegador
* **Then** la aplicación web carga sin errores de script ni dependencias faltantes
* **And** el formulario para enviar mensajes está disponible e interactivo

### Scenario 2: Envío exitoso de mensaje a Telegram (Same-Origin)
* **Given** que el usuario ingresa un `chatId` válido (ej. `"123456789"`) y un mensaje de texto (ej. `"Notificación de prueba"`)
* **When** presiona el botón "Enviar mensaje"
* **Then** el cliente emite una petición `POST /api/send-message` hacia la misma instancia
* **And** la función Serverless de Vercel ejecuta la lógica de `sendMessageController`
* **And** el sistema responde con HTTP 200 `{ "success": true, "messageId": 999 }`
* **And** la interfaz muestra el estado de éxito sin advertencias de CORS en la consola

### Scenario 3: Rechazo por validación de campos obligatorios
* **Given** que un cliente envía una petición `POST /api/send-message` omitiendo el campo `message`
* **When** la Serverless Function procesa la solicitud
* **Then** el sistema responde con HTTP 400 Bad Request
* **And** el payload JSON incluye `{ "success": false, "error": "El mensaje es requerido." }`

### Scenario 4: Verificación de salud del servicio (Health Check)
* **Given** una sonda o monitor de estado externo
* **When** se envía una petición `GET` a `/api/health`
* **Then** la función serverless responde con HTTP 200
* **And** el cuerpo de la respuesta contiene `{ "status": "ok" }`
