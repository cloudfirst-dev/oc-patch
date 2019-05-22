module.exports = class OpenShiftMigrations {
  constructor(client) {
    this.client = client;
  }

  async getMigrations(namespace, appName) {
    var migrations = await this.client.apis['openshift.cloudfirst.dev'].v1.namespaces(namespace).migrations().get();

    return migrations.body.items.filter(e => this.matchesAppName(e.metadata.name, appName));
  }

  async getMigrationMap(namespace, appName) {
    var migrations = await this.getMigrations(namespace, appName);
    var output = {};

    migrations.forEach(e => {
      output[e.metadata.name] = e;
    })

    return output;
  }

  async getLastestDeployedMigration(namespace, appName) { 
    var migrations = await this.getMigrations(namespace, appName);

    // get and sort migrations
    var deployedVersions = [];
    
    migrations.forEach(m => {
      deployedVersions.push(this.getMigrationVersion(m.metadata.name, appName));
    });

    //sort deployed versions alpha
    deployedVersions.sort();
    
    return deployedVersions[deployedVersions.length - 1] === undefined ?  0 : deployedVersions[deployedVersions.length - 1];
  }

  getMigrationVersion(migrationName, appName) {
    var migrationVersionRegex = new RegExp(`${appName}-(\\d)`);

    return migrationName.match(migrationVersionRegex)[1];
  }

  matchesAppName(migrationName, appName) {
    var migrationVersionRegex = new RegExp(`${appName}-(\\d)`);

    return migrationName.match(migrationVersionRegex).length > 0;
  }

  async saveMigration(namespace, migration) {
    await this.client.apis['openshift.cloudfirst.dev'].v1.namespaces(namespace).migrations.post(
      {
        body: migration
      }
    );
  }

  async deleteMigration(namespace, migration) {
    await this.client.apis['openshift.cloudfirst.dev'].v1.namespaces(namespace).migrations(migration).delete();
  }
}