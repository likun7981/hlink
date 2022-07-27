// modify from https://github.com/vitejs/vite/blob/main/scripts/publishCI.ts

import {
  args,
  getPackageInfo,
  getPackageList,
  publishPackage,
  step,
} from './releaseKit'

async function main() {
  const tag = args._[0]

  if (!tag) {
    throw new Error('No tag specified')
  }

  let version = tag

  if (version.startsWith('v')) version = version.slice(1)

  const { currentVersion } = getPackageInfo()
  if (currentVersion !== version)
    throw new Error(
      `Package version from tag "${version}" mismatches with current version "${currentVersion}"`
    )

  step('Publishing package...')
  const releaseTag = version.includes('beta')
    ? 'beta'
    : version.includes('alpha')
    ? 'alpha'
    : version.includes('next')
    ? 'next'
    : undefined
  await Promise.all(
    getPackageList().map(async (pkgDir) => {
      return publishPackage(pkgDir, releaseTag)
    })
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
