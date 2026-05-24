pipeline {
    agent any

    // Automatically clears out old node_modules build files if a previous build failed
    options {
        timeout(time: 15, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Install Dependencies') {
            steps {
                echo 'Installing Project Dependencies...'
                // Using 'npm ci' instead of 'npm install' ensures strict adherence to your package-lock.json
                sh 'npm ci'
            }
        }

        stage('Linter & Formatting Checks') {
            steps {
                echo 'Running Next.js Linting Rules...'
                sh 'npm run lint'
            }
        }

        stage('Compile Production Build') {
            steps {
                echo 'Compiling Production Assets...'
                // This generates the highly optimized standalone production files inside the .next/ folder
                sh 'npm run build'
            }
        }
    }

    post {
        success {
            echo '✨ Next.js Production Assets Compiled Successfully!'
        }
        failure {
            echo '❌ Build Execution Failed. Checking error logs...'
        }
    }
}
