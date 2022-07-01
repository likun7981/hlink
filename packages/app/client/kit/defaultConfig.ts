const DEFAULT_CONFIG = 'hlink_default_config'

const defaultConfig = {
  set(data: string) {
    localStorage.setItem(DEFAULT_CONFIG, data)
  },
  get() {
    return localStorage.getItem(DEFAULT_CONFIG) || ''
  },
}

export default defaultConfig
