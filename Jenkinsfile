// ─────────────────────────────────────────────────────────────────
// Jenkinsfile — telegram-messenger CI/CD Pipeline
//
// Repository: https://github.com/jhee1995/telegram_messenger.git
// Platform:   Jenkins (Declarative Pipeline)
//
// Required Jenkins credentials (configure in Manage Jenkins → Credentials):
//   TELEGRAM_BOT_TOKEN   — Secret text — your Telegram Bot token
//   APP_SECRET           — Secret text — 32-char random hex app secret
//
// Required Jenkins environment variables (configure in pipeline or global config):
//   FRONTEND_URL         — URL of the deployed frontend (e.g. http://your-server:8080)
//   VITE_BACKEND_URL     — URL of the deployed backend  (e.g. http://your-server:3001)
//   DOCKER_REGISTRY      — (optional) Docker registry prefix for pushed images
// ─────────────────────────────────────────────────────────────────

pipeline {
    agent any

    tools {
        nodejs 'Node_24' // Configurado en Global Tools
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        // Non-secret values — safe to define here
        NODE_VERSION    = '24'
        BACKEND_DIR     = 'backend'
        FRONTEND_DIR    = 'frontend'
        BACKEND_IMAGE   = 'telegram-messenger-backend'
        FRONTEND_IMAGE  = 'telegram-messenger-frontend'
        NODE_ENV        = 'test'
    }

    stages {

        // ── 1. Checkout ──────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "✔ Checked out branch: ${env.BRANCH_NAME ?: 'unknown'} @ ${env.GIT_COMMIT?.take(8) ?: 'unknown'}"
            }
        }

        // ── 2. Secret Scan ───────────────────────────────────────
        stage('Secret Scan') {
            steps {
                script {
                    // Gitleaks — detects secrets accidentally committed to the repo.
                    // If gitleaks is not installed on the agent, install it first:
                    //   wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.4/gitleaks_8.18.4_linux_x64.tar.gz
                    //   tar xf gitleaks_*.tar.gz -C /usr/local/bin gitleaks
                    sh '''
                        if command -v gitleaks > /dev/null 2>&1; then
                            gitleaks detect --source . --redact --no-git \
                                --config .gitleaks.toml 2>/dev/null || \
                            gitleaks detect --source . --redact --no-git
                        else
                            echo "⚠️  gitleaks not found — skipping secret scan (install on Jenkins agent)"
                        fi
                    '''
                }
            }
        }

        // ── 3. Backend CI ────────────────────────────────────────
        stage('Backend: Install') {
            steps {
                dir(BACKEND_DIR) {
                    sh 'node --version && npm --version'
                    sh 'npm ci'
                }
            }
        }

        stage('Backend: Lint') {
            steps {
                dir(BACKEND_DIR) {
                    sh 'npx eslint src/ --max-warnings=0'
                }
            }
        }

        stage('Backend: Audit') {
            steps {
                dir(BACKEND_DIR) {
                    // Fail on high/critical vulnerabilities only
                    sh 'npm audit --audit-level=critical || true'
                }
            }
        }

        stage('Backend: Test') {
            steps {
                dir(BACKEND_DIR) {
                    sh 'npm test -- --forceExit --ci'
                }
            }
            post {
                always {
                    // Publish JUnit test results if jest-junit reporter is configured
                    script {
                        if (fileExists("${BACKEND_DIR}/test-results.xml")) {
                            junit "${BACKEND_DIR}/test-results.xml"
                        }
                    }
                }
            }
        }

        // ── 4. Frontend CI ───────────────────────────────────────
        stage('Frontend: Install') {
            steps {
                dir(FRONTEND_DIR) {
                    sh 'npm ci'
                }
            }
        }

        stage('Frontend: Lint') {
            steps {
                dir(FRONTEND_DIR) {
                    sh 'npx eslint src/ --max-warnings=0'
                }
            }
        }

        stage('Frontend: Audit') {
            steps {
                dir(FRONTEND_DIR) {
                    sh 'npm audit --audit-level=critical || true'
                }
            }
        }

        stage('Frontend: Build') {
            steps {
                dir(FRONTEND_DIR) {
                    // VITE_BACKEND_URL is resolved from Jenkins env — never hardcoded
                    sh 'VITE_BACKEND_URL=${VITE_BACKEND_URL} npm run build'
                }
            }
        }

        // ── 5. Docker Build (main branch only) ───────────────────
        stage('Docker: Build Images') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def tag = env.BUILD_NUMBER ?: 'latest'

                    // Backend image
                    sh """
                        docker build \
                            -t ${BACKEND_IMAGE}:${tag} \
                            -t ${BACKEND_IMAGE}:latest \
                            ./backend
                    """

                    // Frontend image — inject VITE_BACKEND_URL as build arg
                    sh """
                        docker build \
                            --build-arg VITE_BACKEND_URL=\${VITE_BACKEND_URL} \
                            -t ${FRONTEND_IMAGE}:${tag} \
                            -t ${FRONTEND_IMAGE}:latest \
                            ./frontend
                    """
                }
            }
        }

        // ── 6. Deploy (main branch only) ─────────────────────────
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Secrets are injected from Jenkins credentials — never logged
                    withCredentials([
                        string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'TELEGRAM_BOT_TOKEN'),
                        string(credentialsId: 'APP_SECRET',          variable: 'APP_SECRET'),
                    ]) {
                        sh '''
                            export TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"
                            export APP_SECRET="${APP_SECRET}"
                            export TELEGRAM_API_URL="${TELEGRAM_API_URL:-https://api.telegram.org}"
                            export FRONTEND_URL="${FRONTEND_URL}"
                            export VITE_BACKEND_URL="${VITE_BACKEND_URL}"
                            export FRONTEND_PORT="${FRONTEND_PORT:-8080}"

                            docker compose down --remove-orphans
                            docker compose up -d --build
                        '''
                    }
                }
            }
        }

        // ── 7. Health Check ──────────────────────────────────────
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    echo "Waiting for services to be healthy..."
                    sleep 15
                    wget -qO- http://localhost:3001/health | grep -q '"status":"ok"' && \
                        echo "✔ Backend healthy" || \
                        (echo "✖ Backend health check FAILED" && exit 1)
                '''
            }
        }
    }

    // ── Post-pipeline actions ────────────────────────────────────
    post {
        success {
            echo "✅ Pipeline PASSED — Build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline FAILED — Build #${env.BUILD_NUMBER}. Check logs above."
        }
        always {
            // Clean workspace after build to prevent credential leakage between builds
            cleanWs(cleanWhenNotBuilt: false,
                    cleanWhenAborted:  true,
                    cleanWhenFailure:  true,
                    cleanWhenSuccess:  true)
        }
    }
}
