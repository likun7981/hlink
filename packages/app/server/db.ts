import { join } from 'path'
import { Low, JSONFile } from 'lowdb'
import { hlinkHomeDir } from '@hlink/core'
import lodash from 'lodash'
import { TConfig, TTask } from '../types/shim'
import lodashId from 'lodash-id'

lodash.mixin(lodashId)

let baseDir = hlinkHomeDir

export type TDBType = { configs: TConfig[]; tasks: TTask[] }

class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}

lodash.id = 'name'

// Use JSON file for storage
const file = join(baseDir, 'db.json')
const adapter = new JSONFile<TDBType>(file)
const db = new LowWithLodash<TDBType>(adapter)

await db.read()

db.data ||= { configs: [], tasks: [] }

export default db
