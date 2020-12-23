const log = require('./log')
module.exports = (warning, message) => {
  if (warning) {
    log.warn(message)
    console.log()
    process.exit(0)
  }
}
