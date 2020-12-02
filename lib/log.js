const chalk = require("chalk");
const logHead = "HLINK";
const log = {
  info: function(...args) {
    console.log(chalk.cyan(`[${logHead} INFO]:`), ...args);
  },
  warn: function(...args) {
    console.log(chalk.yellow(`[${logHead} WARN]:`), ...args);
  },
  error: function(...args) {
    console.log(chalk.red(`[${logHead} ERROR]:`), ...args);
  },
  success: function(...args) {
    console.log(chalk.green(`[${logHead} SUCCESS]:`), ...args);
  }
};

module.exports = log;
