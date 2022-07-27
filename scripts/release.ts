// modify from https://github.com/vitejs/vite/blob/main/scripts/release.ts

import prompts from 'prompts'
import semver from 'semver'
import colors from 'chalk'
import {
  args,
  getPackageInfo,
  getPackageList,
  getVersionChoices,
  isDryRun,
  logRecentCommits,
  packages,
  run,
  runIfNotDry,
  step,
  updateVersions,
} from './releaseKit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

async function main(): Promise<void> {
  let targetVersion: string | undefined

  await logRecentCommits()

  const { currentVersion } = getPackageInfo()

  if (!targetVersion) {
    const { release }: { release: string } = await prompts({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: getVersionChoices(currentVersion),
    })

    if (release === 'custom') {
      const res: { version: string } = await prompts({
        type: 'text',
        name: 'version',
        message: 'Input custom version',
        initial: currentVersion,
      })
      targetVersion = res.version
    } else {
      targetVersion = release
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  const tag = `v${targetVersion}`

  if (targetVersion.includes('beta') && !args.tag) {
    args.tag = 'beta'
  }
  if (targetVersion.includes('alpha') && !args.tag) {
    args.tag = 'alpha'
  }
  if (targetVersion.includes('next') && !args.tag) {
    args.tag = 'next'
  }

  const { yes }: { yes: boolean } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing ${colors.yellow(tag)} Confirm?`,
  })

  if (!yes) {
    return
  }

  step('\nUpdating package version...')
  const list = getPackageList()
  updateVersions(list, targetVersion)

  step('\nGenerating changelog...')
  const changelogArgs = [
    'conventional-changelog',
    '-p',
    'angular',
    '-i',
    'CHANGELOG.md',
    '-s',
    '--commit-path',
    '.',
  ]
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  await run('npx', changelogArgs, { cwd: path.join(__dirname, '..') })

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    await runIfNotDry('git', ['add', '-A'])
    await runIfNotDry('git', ['commit', '-m', `release: ${tag}`])
    await runIfNotDry('git', ['tag', tag])
  } else {
    console.log('No changes to commit.')
    return
  }

  step('\nPushing to GitHub...')
  await runIfNotDry('git', ['push', 'origin', `refs/tags/${tag}`])
  await runIfNotDry('git', ['push'])

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`)
  } else {
    console.log(
      colors.green(
        '\nPushed, publishing should starts shortly on CI.\nhttps://github.com/likun7981/hlink/actions/workflows/publish.yml'
      )
    )
  }

  console.log()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
