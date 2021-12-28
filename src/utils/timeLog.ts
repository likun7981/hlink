import chalk from "chalk";
import { log } from ".";

function createTimeLog() {
  let startTime = Date.now()
  return {
    start() {
      startTime = Date.now();
    },
    end() {
      log.info(
        '共计耗时',
        chalk.cyan(Math.ceil((Date.now() - startTime) / 1000)),
        '秒'
      )
    }
  }
}

export default createTimeLog;
