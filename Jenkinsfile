pipeline {
    agent any

    parameters {
        string(name: 'KEYCLOAK_BASE_URL', defaultValue: 'http://104.197.232.216:30080', description: 'Keycloak base URL')
        string(name: 'KEYCLOAK_REALM', defaultValue: 'bhargav', description: 'Keycloak realm')
        string(name: 'KEYCLOAK_CLIENT_ID', defaultValue: 'nextjs_app', description: 'Keycloak client ID')
        password(name: 'KEYCLOAK_CLIENT_SECRET', defaultValue: '', description: 'Keycloak client secret')
        string(name: 'NEXT_PUBLIC_APP_URL', defaultValue: 'http://localhost:3000', description: 'Public app URL')
        string(name: 'DB_HOST', defaultValue: 'localhost', description: 'Database host')
        string(name: 'DB_USER', defaultValue: 'root', description: 'Database user')
        password(name: 'DB_PASS', defaultValue: '', description: 'Database password')
        string(name: 'DB_NAME', defaultValue: 'nextjs_app', description: 'Database name')
        string(name: 'DB_PORT', defaultValue: '3306', description: 'Database port')
    }

    environment {
        KEYCLOAK_BASE_URL = "${params.KEYCLOAK_BASE_URL}"
        KEYCLOAK_REALM = "${params.KEYCLOAK_REALM}"
        KEYCLOAK_CLIENT_ID = "${params.KEYCLOAK_CLIENT_ID}"
        KEYCLOAK_CLIENT_SECRET = "${params.KEYCLOAK_CLIENT_SECRET}"
        NEXT_PUBLIC_APP_URL = "${params.NEXT_PUBLIC_APP_URL}"
        DB_HOST = "${params.DB_HOST}"
        DB_USER = "${params.DB_USER}"
        DB_PASS = "${params.DB_PASS}"
        DB_NAME = "${params.DB_NAME}"
        DB_PORT = "${params.DB_PORT}"
    }

    // Automatically clears out old node_modules build files if a previous build failed
    options {
        timeout(time: 15, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Initialize Cluster Config') {
            steps {
                sh '''
                mkdir -p .kube
                sudo cp /etc/rancher/k3s/k3s.yaml .kube/config
                sudo chown -R jenkins:jenkins .kube/
                chmod 600 .kube/config
                '''
            }
        }

        stage('Generate Runtime Environment') {
            steps {
                echo 'Writing runtime environment file for Next.js...'
                sh '''
                cat > .env.local <<EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_NAME=$DB_NAME
DB_PORT=$DB_PORT
KEYCLOAK_BASE_URL=$KEYCLOAK_BASE_URL
KEYCLOAK_REALM=$KEYCLOAK_REALM
KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID
KEYCLOAK_CLIENT_SECRET=$KEYCLOAK_CLIENT_SECRET
NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
EOF
                '''
            }
        }

        stage('Debug Environment') {
            steps {
                echo 'Checking injected Keycloak and Database environment values...'
                sh '''
                echo "=== Keycloak Variables ==="
                echo "KEYCLOAK_BASE_URL=$KEYCLOAK_BASE_URL"
                echo "KEYCLOAK_REALM=$KEYCLOAK_REALM"
                echo "KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID"
                echo "KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_CLIENT_SECRET:+*****}"
                echo "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL"
                echo "=== Database Variables ==="
                echo "DB_HOST=$DB_HOST"
                echo "DB_USER=$DB_USER"
                echo "DB_PASS=${DB_PASS:+*****}"
                echo "DB_NAME=$DB_NAME"
                echo "DB_PORT=$DB_PORT"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Project Dependencies...'
                sh 'npm ci'
            }
        }

        stage('Compile Production Build') {
            steps {
                echo 'Compiling Production Assets...'
                sh 'npm run build'
            }
        }

        stage('Create Kubernetes Manifests') {
            steps {
                echo 'Generating Application Deployment Specs...'
                sh '''
                mkdir -p k8s
                cat <<EOF > k8s/nextjs-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
  namespace: default
  labels:
    app: nextjs-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nextjs-app
  template:
    metadata:
      labels:
        app: nextjs-app
    spec:
      containers:
      - name: nextjs-app
        image: node:20-alpine
        command: ["/bin/sh", "-c"]
        args: ["cd /app && npm run start"]
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: DB_HOST
          value: "$DB_HOST"
        - name: DB_USER
          value: "$DB_USER"
        - name: DB_PASS
          value: "$DB_PASS"
        - name: DB_NAME
          value: "$DB_NAME"
        - name: DB_PORT
          value: "$DB_PORT"
        - name: KEYCLOAK_BASE_URL
          value: "$KEYCLOAK_BASE_URL"
        - name: KEYCLOAK_REALM
          value: "$KEYCLOAK_REALM"
        - name: KEYCLOAK_CLIENT_ID
          value: "$KEYCLOAK_CLIENT_ID"
        - name: KEYCLOAK_CLIENT_SECRET
          value: "$KEYCLOAK_CLIENT_SECRET"
        - name: NEXT_PUBLIC_APP_URL
          value: "$NEXT_PUBLIC_APP_URL"
        volumeMounts:
        - name: app-source
          mountPath: /app
      volumes:
      - name: app-source
        hostPath:
          path: /var/lib/jenkins/workspace/nextjs-app-build
          type: Directory
---
apiVersion: v1
kind: Service
metadata:
  name: nextjs-app-service
  namespace: default
spec:
  type: NodePort
  selector:
    app: nextjs-app
  ports:
  - name: http
    port: 3000
    targetPort: 3000
    nodePort: 30090
EOF
                '''
            }
        }

        stage('Deploy to Kubernetes Node') {
            steps {
                sh '''
                export KUBECONFIG="${WORKSPACE}/.kube/config"
                kubectl apply -f k8s/nextjs-app.yaml
                '''
            }
        }

        stage('Verify Rollout Status') {
            steps {
                sh '''
                export KUBECONFIG="${WORKSPACE}/.kube/config"
                kubectl rollout restart deployment/nextjs-app
                kubectl rollout status deployment/nextjs-app --timeout=120s
                kubectl get pods -l app=nextjs-app
                '''
            }
        }
    }

    post {
        success {
            echo '🚀 Next.js Application is deployed and exposed publicly!'
        }
        failure {
            echo '❌ Pipeline failed. Checking logs...'
        }
    }
}
