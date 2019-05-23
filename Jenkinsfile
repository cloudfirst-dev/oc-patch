podTemplate(
  label: "maven-pod",
  cloud: "openshift",
  inheritFrom: "maven",
  containers: [
    containerTemplate(
      name: "jnlp",
      image: "registry.redhat.io/openshift3/jenkins-agent-maven-35-rhel7:v3.11",
    )
  ],
  volumes: [
    secretVolume(
      mountPath: "/home/jenkins/mvn-settings",
      secretName: "maven"
    )
  ]
) {
  node('nodejs') {
    stage('install pkg prereq') {
      sh 'npm install -g pkg'
      sh 'npm install'
    }
    
    // Checkout Source Code.
    stage('Checkout Source') {
      checkout scm
    }

    stage('build binary') {
      sh 'pkg index.js --out-path ./bin/'
      sh 'ls'
      sh 'ls bin'
      stash name: 'binary', includes: 'bin/*'
    }
  }

  node('maven-pod') {
    def mvnCmd = "mvn -Dsettings.security=/home/jenkins/mvn-settings/settings-security.xml -s /home/jenkins/mvn-settings/settings.xml"
	  
    stage('deploy') {
      unstash 'binary'
      sh "ls"
      sh "${mvnCmd} -B deploy:deploy-file -Dpackaging=exec -Dfile=bin/index-linux -DgroupId=dev.cloudfirst.openshift -DartifactId=ocpatch-linux -Dversion=1.0.0-SNAPSHOT -DgeneratePom=true -DrepositoryId=nexus-ci.apps.idsysapps.com -Durl=http://nexus:8081/repository/cloudfirst-snapshot/"
      sh "${mvnCmd} -B deploy:deploy-file -Dpackaging=exec -Dfile=bin/index-macos -DgroupId=dev.cloudfirst.openshift -DartifactId=ocpatch-macos -Dversion=1.0.0-SNAPSHOT -DgeneratePom=true -DrepositoryId=nexus-ci.apps.idsysapps.com -Durl=http://nexus:8081/repository/cloudfirst-snapshot/"
      sh "${mvnCmd} -B deploy:deploy-file -Dpackaging=exe -Dfile=bin/index-win.exe -DgroupId=dev.cloudfirst.openshift -DartifactId=ocpatch-win -Dversion=1.0.0-SNAPSHOT -DgeneratePom=true -DrepositoryId=nexus-ci.apps.idsysapps.com -Durl=http://nexus:8081/repository/cloudfirst-snapshot/"
    }
  }
}