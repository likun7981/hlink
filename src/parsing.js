var execa = require('execa');
var path = require('path');


try {

  execa.sync('ln', ['~/a'])
} catch (e) {
  console.log(e instanceof Error)
  console.log(typeof e)
}

