var tmp = require('tmp');
var fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = class OpenShiftUtil {
  async apply(client, item, namespace) {
    try {
      await this.runOCCreate(JSON.stringify(item), namespace);
  
      //return create;
    } catch(err) {
      console.log(err);
      throw err;
    }
  }
  
  async deleteObject(client, item, namespace) {
    try {
      await this.runOCDelete(JSON.stringify(item), namespace);
  
      //return create;
    } catch(err) {
      console.log(err);
      throw err;
    }
  }

  runOCCreate(contents, namespace) {
    var writeTempFile = this.writeTempFile;

    return new Promise(function(resolve, reject) {
      writeTempFile(contents, function(path) {
        exec(`oc create -n ${namespace} -f ${path}`).then(resp => resolve(resp)).catch(ex => reject(ex));
      });
    });
  }
  
  runOCDelete(contents, namespace) {
    var writeTempFile = this.writeTempFile;

    return new Promise(function(resolve, reject) {
      writeTempFile(contents, function(path) {
        exec(`oc delete -n ${namespace} -f ${path}`).then(resp => resolve(resp)).catch(ex => reject(ex));
      });
    });
  }
  
  writeTempFile(contents, execFunc) {
      return tmp.file({prefix: 'create-', postfix: '.json'}, function (err, path, fd, cleanupCallback) {
        if (err) throw err;
        fs.writeFileSync(path, contents)
        execFunc(path);
      });
  }
}