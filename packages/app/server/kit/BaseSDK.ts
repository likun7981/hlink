import db, { TDBType } from '../db.js'

class BaseSDK<T extends keyof TDBType> {
  private name: T
  constructor(name: T) {
    this.name = name
  }
  get db() {
    return db.chain.get(this.name)
  }

  write() {
    return db.write()
  }
}

export default BaseSDK
