const openshiftRestClient = require('openshift-rest-client').OpenshiftClient;
yaml = require('js-yaml');
var fs = require('fs');

module.exports = class OpenShiftClientFactory {
  async getOSClient() {
    // get the migration CRD
    var migrationCRD = yaml.safeLoad(fs.readFileSync('openshift/crd.yml', 'utf8'));

    // get the current version deployed
    var client = await openshiftRestClient();

    client.addCustomResourceDefinition(migrationCRD);

    return client;
  }
}