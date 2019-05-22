module.exports = class Migration {
  constructor(filename) {
    this.setVersion(filename);
  }

  setVersion(filename) {
    var m = null;
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
  
      this.filename = m[0];
      this.version = m[1];
      this.name = m[2];
    }
  }
}