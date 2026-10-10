# User Story: US-003 - Integración de Snyk Security Scan en Jenkins CI/CD
**Status**: IN_REFINEMENT | **Priority**: Must Have (MVP)

### As a DevOps / DevSecOps Engineer
### I want to ejecutar un análisis automatizado de seguridad de código y dependencias con Snyk en el pipeline de Jenkins antes de la etapa de build
### So that se bloquee tempranamente cualquier despliegue con vulnerabilidades de severidad High o Critical, se prevengan brechas de seguridad y se reporte el estado al dashboard central de Snyk

---

## ⚡ Non-Functional Requirements (Inherited from decisions.yml & DevSecOps Standards)
* **Target Latency / Pipeline Overhead**: p95 < 180s para la ejecución completa del stage de Snyk en el runner de Jenkins.
* **Security & Vulnerability Threshold**: 0 vulnerabilidades High o Critical admitidas (`--severity-threshold=high`). Bloqueo determinante ante hallazgos severos.
* **Secret Protection**: 100% de los tokens (`SNYK_TOKEN`) inyectados mediante `withCredentials` de Jenkins sin registrarse en texto claro en logs de consola ni en archivos del workspace.
* **Reliability & Idempotency**: Ejecución determinista sobre las dependencias del monorepo (`backend` y `frontend`).
* **Observability & Traceability**: Registro y monitoreo de proyectos reportados al dashboard central de Snyk (`snyk monitor`).

---

## 🔍 Discrepancy & Gap Discovery Audit

| Ítem Auditado | Diagnóstico / Pregunta | Resolución & Especificación de Requerimiento |
| :--- | :--- | :--- |
| **Punto de Ejecución (Stage Placement)** | ¿El escaneo debe ocurrir antes o después de compilar? | **Pre-Build**: Se ejecuta después de la instalación y pruebas/auditorías de dependencias (`Backend/Frontend: Install/Test`) y **antes** del stage `Frontend: Build`. Principio fail-fast: no invertir cómputo en builds vulnerables. |
| **Instalación de Snyk CLI** | ¿Cómo se provee Snyk en el agente de Jenkins? | El stage ejecuta `npm install -g snyk` o usa `npx snyk` en el entorno Node 24 provisto por el agente (`tools { nodejs 'Node_24' }`). Para portabilidad, validar si `snyk` ya está presente o instalarlo dinámicamente si falta. |
| **Gestión de Credenciales** | ¿Cuál es el ID del credential en Jenkins? | Se requiere `credentialsId: 'SNYK_API_TOKEN'` inyectado en la variable de entorno protegida `SNYK_TOKEN`. |
| **Autenticación en Jenkins** | ¿Cómo se autentica el CLI? | Ejecución de `snyk auth "${SNYK_TOKEN}"` utilizando comillas seguras en el bloque `withCredentials` o variable `SNYK_TOKEN` consumida directamente por el CLI de Snyk. |
| **Monorepo / Multi-proyecto** | ¿El repo tiene múltiples proyectos (frontend + backend)? | Se debe usar el flag `--all-projects` tanto en `snyk test` como en `snyk monitor` para abarcar `backend/package.json` y `frontend/package.json`. |
| **Política de Bloqueo** | ¿Qué ocurre si se detectan vulnerabilidades? | `snyk test --all-projects --severity-threshold=high` retorna código de salida distinto de cero si hay vulnerabilidades High o Critical, lo que detiene el pipeline de inmediato y marca el build como FAILED. |
| **Monitoreo Continuo** | ¿Cuándo se ejecuta `snyk monitor`? | Se ejecuta tras validar que el test pase (o de forma que registre el inventario de dependencias) para observabilidad continua de dependencias en el dashboard. |

---

## 📋 Acceptance Criteria Matrix

| ID | Criterion Category | Description | Verification Method |
|---|---|---|---|
| AC-1 | Stage Placement | El stage `Security Scan with Snyk` se posiciona inmediatamente antes de `Frontend: Build` y después de la verificación de dependencias | Inspección estructural de `Jenkinsfile` |
| AC-2 | Secure Credential Injection | El token se consume desde la credencial Jenkins `SNYK_API_TOKEN` mediante `withCredentials` | Traza de pipeline sin exposición de secretos en console output |
| AC-3 | Tool Availability | El CLI de Snyk se instala y autentica exitosamente en el entorno del agente | Verificación del comando `snyk auth` / versión en la consola de Jenkins |
| AC-4 | Vulnerability Gate (High/Critical) | El pipeline se interrumpe y falla si existen vulnerabilidades High o Critical en cualquier subproyecto | Exit code $\ne 0$ de `snyk test --all-projects --severity-threshold=high` |
| AC-5 | Pass Threshold | Si no hay vulnerabilidades High o Critical, el test es exitoso y el pipeline avanza hacia el build | Exit code $0$ y transición al stage `Frontend: Build` |
| AC-6 | Central Dashboard Sync | Los proyectos y dependencias se publican en el dashboard de Snyk para monitoreo continuo | Ejecución exitosa de `snyk monitor --all-projects` |

---

## 🧪 Concrete Scenarios (Gherkin / BDD)

### Scenario 1: Escaneo de Snyk exitoso sin vulnerabilidades severas (Happy Path)
* **Given** que el pipeline de Jenkins ha ejecutado los stages de checkout, linters y tests unitarios
* **And** la credencial de Jenkins `SNYK_API_TOKEN` está configurada válidamente
* **When** el stage `Security Scan with Snyk` se ejecuta antes de `Frontend: Build`
* **And** ejecuta `snyk test --all-projects --severity-threshold=high` sin encontrar vulnerabilidades High ni Critical
* **Then** el comando de Snyk finaliza con código de salida 0
* **And** ejecuta `snyk monitor --all-projects` registrando el snapshot en la nube de Snyk
* **And** el pipeline continúa normalmente hacia el stage `Frontend: Build`

### Scenario 2: Detección de vulnerabilidad High/Critical bloquea el pipeline (Fail-Fast Gate)
* **Given** que una dependencia en `backend` o `frontend` contiene una vulnerabilidad clasificada como High o Critical según Snyk
* **When** el pipeline ejecuta `snyk test --all-projects --severity-threshold=high`
* **Then** Snyk reporta las vulnerabilidades encontradas con su CVE/CWE correspondiente
* **And** el comando retorna un código de salida de error (exit code $\ne 0$)
* **And** el stage `Security Scan with Snyk` falla inmediatamente
* **And** la etapa `Frontend: Build` y los despliegues posteriores NO se ejecutan

### Scenario 3: Credencial SNYK_API_TOKEN faltante o inválida (Infra / Credential Guard)
* **Given** que la credencial `SNYK_API_TOKEN` no está configurada en Jenkins o está revocada
* **When** el stage intenta ejecutar la autenticación o test de Snyk
* **Then** el pipeline aborta con un mensaje de error descriptivo de credenciales
* **And** ningún secreto o cadena sensible se imprime en el log de consola del build

### Scenario 4: Análisis exhaustivo en estructura Monorepo
* **Given** el repositorio con subdirectorios independientes `backend/` y `frontend/`
* **When** se invoca el escaneo con el parámetro `--all-projects`
* **Then** Snyk audita concurrentemente o secuencialmente los manifiestos `backend/package.json` y `frontend/package.json`
* **And** genera reportes unificados para ambos paquetes
