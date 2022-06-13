declare namespace IHlink {
  type Rule = {
    exts?: Array<string>
    globs?: Array<string>
  }
  interface Options {
    include?: Rule
    exclude?: Rule
  }
}
