var fs = require('fs');
var OpenShiftClientFactory = require('../client/os-client');
var OpenShiftMigrations = require('../client/migrations');
var OpenShiftUtil = require('../client/oc-client');
var Migration = require('../migrations/Migration');

module.exports = async (args) => {
  var path = args._[1];
  var namespace = args.namespace;
  var appName = args.appName;
  var client = await new OpenShiftClientFactory().getOSClient();
  var openShiftMigrations = new OpenShiftMigrations(client);
  var openShiftUtil = new OpenShiftUtil();

  var latestDeployedVersion = await openShiftMigrations.getLastestDeployedMigration(namespace, appName);

  console.log(`Currently deployed migration version : ${latestDeployedVersion}`)
  console.log("Deploying migrations from " + path);

  fs.readdir(path, async function(err, items) {
    for (var i=0; i<items.length; i++) {
        const migration = new Migration(items[i]);

        // determine if we should apply
        if(migration.version > latestDeployedVersion) {
          // read migration file
          console.log(`Applying migration ${migration.filename}`);
          var migrationFile = yaml.safeLoad(fs.readFileSync(`${path}/${migration.filename}`, 'utf8'));

          for (var mI=0; mI<migrationFile.rollForward.length; mI++) {
            switch(migrationFile.rollForward[mI].action) {
              case 'create':
                const create = await openShiftUtil.apply(client, migrationFile.rollForward[mI].spec, namespace);
                console.log(create);
                break;
              case 'delete':
                const deleteResult = await openShiftUtil.deleteObject(client, migrationFile.rollForward[mI].spec, namespace);
                console.log(deleteResult);
                break;
              default:
                break;
            }
          }

          await openShiftMigrations.saveMigration(namespace, {
            "kind":"migration",
            "apiVersion": "openshift.cloudfirst.dev/v1",
            "metadata":
            {
              "name":`${appName}-${migration.version}`,
              "annotations":
              {
                "lastUpdated":new Date()
              }
            }
          });
        }
    }
  });
}