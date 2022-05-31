declare namespace IHlink {
  interface Flags {
    saveMode: number
    includeExtname: string
    excludeExtname: string
    include: {
      extensions: Array<string>
      globs: Array<string>
    }
    exclude: {
      extensions: Array<string>
      globs: Array<string>
    }
    openCache?: boolean
    mkdirIfSingle?: boolean
    /**
     * @deprecated 废弃
     */
    del?: boolean
    generateConfig: string
    removeConfig: boolean
    configPath: string
    help?: boolean

    /**
     * @description prune命令专用
     */
    pruneDir?: boolean
    /**
     * @description prune命令专用
     */
    withoutConfirm?: boolean
    /**
     * @description prune命令专用
     */
    reverse?: boolean
  }
}
