import micromatch from 'micromatch'

function supported(path: string, include: string[], exclude: string[]) {
  return micromatch.isMatch(path.toLowerCase(), include, {
    ignore: exclude,
    nocase: true,
  })
}

export default supported
