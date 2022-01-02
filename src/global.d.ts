declare module NodeJS {
  interface Global {
    printOnExit: () => void
  }
}

declare namespace IHlink {
  interface Flags {
    saveMode: number
    includeExtname: string
    excludeExtname: string
    openCache?: boolean
    mkdirIfSingle?: boolean
    delete?: boolean
    generateConfig: string
    removeConfig: boolean
    configPath: string
    watch?: boolean
    help?: boolean
  }
}

declare module 'progress'
