node('nodejs') {
  stage('install pkg prereq') {
    sh 'npm install -g pkg'
  }

  stage('build binary') {
    sh 'pkg index.js --out-path ./bin/'
  }
}