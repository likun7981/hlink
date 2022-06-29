import { IHlink } from './IHlink.js'

import { IOptions as IPruneOptions, default as prune } from './prune/index.js'

import { IOptions, default as main } from './main/index.js'

export { default as config } from './config/index.js'

export { default as getPruneFiles } from './prune/getRmFiles.js'
export { default as deleteEmptyDir } from './prune/deleteEmptyDir.js'

export * from './utils/index.js'
export * from './utils/paths.js'

export { IPruneOptions, IOptions, prune, main }

export type TAllConfig = IPruneOptions & IOptions & IHlink.Options
