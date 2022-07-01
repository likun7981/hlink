import chalk from 'chalk'
import updateNotifier from 'update-notifier'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs-extra'

const pkg = fs.readJSONSync(
  path.resolve(fileURLToPath(import.meta.url), '../../package.json')
)

const notifier = updateNotifier({
  pkg,
})

function updater() {
  notifier.notify({
    isGlobal: true,
    message:
      '有版本可更新 ' +
      chalk.dim('{currentVersion}') +
      chalk.reset(' → ') +
      chalk.green('{latestVersion}') +
      ' \n使用命令 ' +
      chalk.cyan('{updateCommand}') +
      ' 进行更新，更新日志：' +
      '\nhttps://github.com/likun7981/hlink/releases',
  })
}

export default updater
