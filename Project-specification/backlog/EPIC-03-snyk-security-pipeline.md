# Epic: EPIC-03 - Continuous Security Integration & Vulnerability Scanning in CI/CD

## 🌟 Business Vision & Goal
Garantizar la postura de seguridad y el cumplimiento DevSecOps en la plataforma telegram-messenger mediante la automatización de escaneos de vulnerabilidades de dependencias y código de terceros con Snyk dentro del pipeline de CI/CD de Jenkins. Esto permite detectar y bloquear tempranamente fallas críticas o altas antes de la fase de compilación/artefacto, minimizando riesgos de exploits en entornos productivos y registrando métricas en el dashboard central de seguridad.

## 👥 Target Personas
* DevOps / DevSecOps Engineer
* Platform Security Auditor
* Lead Developer & Maintainer

## 📌 Included User Stories
* [US-003]: Integración de Snyk Security Scan en Pipeline Jenkins (Priority: MUST)

## ⚡ Epic Non-Functional Requirements
* **Scan Latency & Pipeline Overhead**: El stage de escaneo y monitoreo de Snyk no debe añadir más de 3 minutos de overhead al tiempo de ejecución total del pipeline.
* **Security Enforcement (Quality Gate)**: 0 vulnerabilidades High o Critical toleradas en dependencias activas del monorepo (`--severity-threshold=high`).
* **Availability & Resilience**: Si la red o servicio externo de Snyk presenta fallo transitorio, registrar trazas de auditoría claras y fallar de manera segura según la política de seguridad corporativa.
* **Auditability & Traceability**: Los resultados deben sincronizarse automáticamente con el dashboard central de Snyk (`snyk monitor --all-projects`).
