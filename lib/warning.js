const log = require('./log')
module.exports = (warning, message) => {
  if (warning) {
    log.warn(message)
    process.exit(0)
  }
}
