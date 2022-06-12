import Koa from 'koa'

const app = new Koa()

app.use((ctx) => {
  ctx.body = 'hello koa'
})

app.listen(9090)
