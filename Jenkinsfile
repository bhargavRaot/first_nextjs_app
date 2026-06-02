pipeline {
    agent any

    parameters {
        string(name: 'KEYCLOAK_BASE_URL', defaultValue: 'http://104.197.232.216:30080', description: 'Keycloak base URL')
        string(name: 'KEYCLOAK_REALM', defaultValue: 'bhargav', description: 'Keycloak realm')
        string(name: 'KEYCLOAK_CLIENT_ID', defaultValue: 'nextjs_app', description: 'Keycloak client ID')
        password(name: 'KEYCLOAK_CLIENT_SECRET', defaultValue: '', description: 'Keycloak client secret')
        string(name: 'NEXT_PUBLIC_APP_URL', defaultValue: 'http://localhost:3000', description: 'Public app URL')
    }

    environment {
        KEYCLOAK_BASE_URL = "${params.KEYCLOAK_BASE_URL}"
        KEYCLOAK_REALM = "${params.KEYCLOAK_REALM}"
        KEYCLOAK_CLIENT_ID = "${params.KEYCLOAK_CLIENT_ID}"
        KEYCLOAK_CLIENT_SECRET = "${params.KEYCLOAK_CLIENT_SECRET}"
        NEXT_PUBLIC_APP_URL = "${params.NEXT_PUBLIC_APP_URL}"
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
                cat << 'EOF' > k8s/nextjs-app.yaml
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
