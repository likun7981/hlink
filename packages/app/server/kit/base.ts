import OriginalKoa from 'koa'
import OriginalKoaRouter from '@koa/router'

export class Koa extends OriginalKoa {}
export class Router extends OriginalKoaRouter {}

export type Middleware<
  StateT = OriginalKoa.DefaultState,
  ContextT = OriginalKoa.DefaultContext
> = OriginalKoa.Middleware<StateT, ContextT>
