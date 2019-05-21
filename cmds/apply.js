var fs = require('fs');
const openshiftRestClient = require('openshift-rest-client').OpenshiftClient;
yaml = require('js-yaml');
var tmp = require('tmp');
var fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);


module.exports = async (args) => {
  var path = args._[1];
  var namespace = args.namespace;
  var appName = args.appName;

  var doc = yaml.safeLoad(fs.readFileSync('openshift/crd.yml', 'utf8'));

  // get the current version deployed
  var client = await openshiftRestClient();

  client.addCustomResourceDefinition(doc);

  var migrations = await client.apis['openshift.cloudfirst.dev'].v1.namespaces(namespace).migrations().get();

  // get and sort migrations
  var migrationVersionRegex = new RegExp(`${appName}-(\\d)`);
  var deployedVersions = [];
  
  migrations.body.items.forEach(m => {
    var entry = m.metadata.name.match(migrationVersionRegex);
    deployedVersions.push(entry[1]);
  });

  //sort deployed versions alpha
  deployedVersions.sort();
  var latestDeployedVersion = deployedVersions[deployedVersions.length - 1] === undefined ?  0 : deployedVersions[deployedVersions.length - 1];

  console.log(`Currently deployed migration version : ${latestDeployedVersion}`)
  console.log("Deploying migrations from " + path);

  fs.readdir(path, async function(err, items) {
    for (var i=0; i<items.length; i++) {
        const version = getVersion(items[i]);

        // determine if we should apply
        if(version.version > latestDeployedVersion) {
          // read migration file
          console.log(`Applying migration ${version.filename}`);
          var migrationFile = yaml.safeLoad(fs.readFileSync(`${path}/${version.filename}`, 'utf8'));

          for (var mI=0; mI<migrationFile.rollForward.length; mI++) {
            switch(migrationFile.rollForward[mI].action) {
              case 'create':
                const create = apply(client, migrationFile.rollForward[mI].spec, namespace);
                console.log(create);
                break;
              case 'delete':
                const deleteResult = deleteObject(client, migrationFile.rollForward[mI].spec, namespace);
                console.log(deleteResult);
                break;
              default:
                break;
            }
          }

          // add migration to namespace
          await client.apis['openshift.cloudfirst.dev'].v1.namespaces(namespace).migrations.post({body: {"kind":"migration", "apiVersion": "openshift.cloudfirst.dev/v1", "metadata":{"name":`${appName}-${version.version}`, "annotations":{"lastUpdated":new Date()}}}});
        }
    }
  });
}

async function apply(client, item, namespace) {
  try {
    await runOCCreate(JSON.stringify(item), namespace);

    //return create;
  } catch(err) {
    console.log(err);
    throw err;
  }
}

async function deleteObject(client, item, namespace) {
  try {
    await runOCDelete(JSON.stringify(item), namespace);

    //return create;
  } catch(err) {
    console.log(err);
    throw err;
  }
}

// get version
function getVersion(filename) {
  const regex = /v(\d)__(\w*).yml/gm;
  var output =
  {
    version: null,
    name: null,
    filename: null
  }

  while ((m = regex.exec(filename)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }

    output.filename = m[0];
    output.version = m[1];
    output.name = m[2];
  }

  return output;
}

function runOCCreate(contents, namespace) {
  return new Promise(function(resolve, reject) {
    writeTempFile(contents, function(path) {
      exec(`oc create -n ${namespace} -f ${path}`).then(resp => resolve(resp)).catch(ex => reject(ex));
    });
  });
}

function runOCDelete(contents, namespace) {
  return new Promise(function(resolve, reject) {
    writeTempFile(contents, function(path) {
      exec(`oc delete -n ${namespace} -f ${path}`).then(resp => resolve(resp)).catch(ex => reject(ex));
    });
  });
}

function writeTempFile(contents, execFunc) {
    return tmp.file({prefix: 'create-', postfix: '.json'}, function (err, path, fd, cleanupCallback) {
      if (err) throw err;
      fs.writeFileSync(path, contents)
      execFunc(path);
    });
}