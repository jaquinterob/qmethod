pipeline {
    agent any
    stages {
        stage('npm install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                echo 'Testing...'
                sh 'npm run build'
            }
        }
        stage('Copy files') {
            steps {
                echo 'Testing...'
                sh 'cp dist/qmethod /var/www/html'
            }
        }
    }
}
