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
    del?: boolean
    generateConfig: string
    removeConfig: boolean
    configPath: string
    help?: boolean

    /**
     * @description hlink rm 专用
     */
    watch?: boolean
    /**
     * @description hlink rm 专用；删除硬链的同时是否删除源文件
     */
    all: boolean
  }
}
