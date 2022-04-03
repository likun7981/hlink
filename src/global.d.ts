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
    /**
     * @deprecated 废弃，请 使用 hlink rm 代替
     */
    delete?: boolean
    generateConfig: string
    removeConfig: boolean
    configPath: string
    help?: boolean

    /**
     * @description hlink rm 专用
     */
    watch?: boolean
    /**
     * @description hlink rm 专用；是否删除硬链关联的源文件
     */
    all?: boolean;
  }
}

declare module 'progress'
