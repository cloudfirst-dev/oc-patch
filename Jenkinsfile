podTemplate(
  label: "nodejs-pod",
  cloud: "openshift",
  inheritFrom: "nodejs",
  containers: [
    containerTemplate(
      name: "jnlp",
      image: "registry.redhat.io/openshift3/jenkins-agent-nodejs-8-rhel7:v3.11",
      resourceRequestMemory: "4Gi",
      resourceLimitMemory: "4Gi",
      resourceRequestCpu: "100m",
      resourceLimitCpu: "2"
    )
  ],
  volumes: [
    secretVolume(
      mountPath: "/home/jenkins/mvn-settings",
      secretName: "maven"
    )
  ]
) {
  node('nodejs-pod') {
  stage('install pkg prereq') {
    sh 'npm install -g pkg'
  }
  
  // Checkout Source Code.
  stage('Checkout Source') {
    checkout scm
  }

  stage('build binary') {
    sh 'pkg index.js --out-path ./bin/'
  }

  stage('deploy') {
    sh 'node deploy.js'
  }
}