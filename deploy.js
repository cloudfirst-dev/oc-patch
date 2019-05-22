var maven = require('maven-deploy');
var config = {
  "groupId"      : "dev.cloudfirst.openshift",    // required - the Maven group id.
  "artifactId"   : "ocpatch",         // the Maven artifact id.
  "buildDir"     : "bin",           // project build directory.
  "finalName"    : "ocpatch",         // the final name of the file created when the built project is packaged.
  "type"         : "war",            // type of package. "war" or "jar" supported.
  "fileEncoding" : "utf-8",          // file encoding when traversing the file system, default is UTF-8
  "generatePom"  : true,             // generate a POM based on the configuration
  "pomFile"      : "pom.xml",        // use this existing pom.xml instead of generating one (generatePom must be false)
  "settings"     : "/home/jenkins/mvn-settings/settings.xml",    // override mvn settings file. ignore this field to use default
  "repositories" : [                 // array of repositories, each with id and url to a Maven repository.
    {
      "id": "nexus-ci.apps.idsysapps.com",
      "url": "https://nexus-ci.apps.idsysapps.com/repository/cloudfirst-snapshot/"
    }
  ]
};

maven.config(config);
maven.deploy('nexus-ci.apps.idsysapps.com', 'bin/index-linux');
maven.deploy('nexus-ci.apps.idsysapps.com', 'bin/index-macos');
maven.deploy('nexus-ci.apps.idsysapps.com', 'bin/index-win.exe');