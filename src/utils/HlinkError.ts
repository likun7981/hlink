class HlinkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HlinkError'
    this.stderr = message
  }
  stderr: string
}

export default HlinkError
