// for @types/lodashId
import { ListIterateeCustom, CollectionChain } from 'lodash'

type Part<T> = Partial<T>
type MergeId<T> = T & { id?: string }

// declare function getById<T>(array: Array<T>, id: string): CollectionChain<T>;
// declare function createId(): string;
// declare function upsert<T>(array: Array<T>, doc: MergeId<T>): CollectionChain<T>;
// declare function insert<T>(array: Array<T>, doc: T): CollectionChain<T>;
// declare function updateById<T>(array: Array<T>, id: string, attrs: Part<T>): CollectionChain<T>;
// declare function updateWhere<T>(array: Array<T>, predicate: ListIterateeCustom<T, boolean>, attrs: Part<T>): CollectionChain<T[]>;
// declare function replaceById<T>(array: Array<T>, id: string, attrs: Part<T>): CollectionChain<T>;
// declare function removeById<T>(array: Array<T>, id: string): CollectionChain<T>;
// declare function removeWhere<T>(array: Array<T>, predicate: ListIterateeCustom<T, boolean>): CollectionChain<T[]>;

declare module 'lodash' {
  interface LoDashStatic {
    id: string
    getById: <T>(array: Array<T>, id: string) => ObjectChain<T>
    createId: <T>(array: Array<T>, doc: T) => StringChain
    insert: <T>(array: Array<T>, doc: T) => ObjectChain<T>
    updateById: <T>(
      array: Array<T>,
      id: string,
      attrs: Part<T>
    ) => ObjectChain<T>
    updateWhere: <T>(
      array: Array<T>,
      predicate: ListIterateeCustom<T, boolean>,
      attrs: Part<T>
    ) => CollectionChain<T[]>
    upsert: <T>(array: Array<T>, doc: MergeId<T>) => ObjectChain<T>
    removeById: <T>(
      array: Array<T>,
      id: string,
      attrs: Part<T>
    ) => ObjectChain<T>
    replaceById: <T>(array: Array<T>, id: string) => ObjectChain<T>
    removeWhere: <T>(
      array: Array<T>,
      predicate: ListIterateeCustom<T, boolean>
    ) => CollectionChain<T[]>
  }
  interface CollectionChain<T> {
    getById(id: string): ObjectChain<T>
    createId<T>(doc: T): StringChain
    upsert(doc: MergeId<T>): ObjectChain<T>
    insert(doc: T): ObjectChain<T>
    updateById(id: string, attrs: Part<T>): ObjectChain<T>
    updateWhere(
      predicate: ListIterateeCustom<T, boolean>,
      attrs: Part<T>
    ): CollectionChain<T[]>
    replaceById(id: string, attrs: Part<T>): ObjectChain<T>
    removeById(id: string): ObjectChain<T>
    removeWhere(predicate: ListIterateeCustom<T, boolean>): CollectionChain<T[]>
  }
}

// export {
//   getById,
//   createId,
//   insert,
//   updateById,
//   updateWhere,
//   upsert,
//   removeById,
//   replaceById,
//   removeWhere,
// }

// for lodashId
// import { ListIterateeCustom, CollectionChain } from 'lodash';

// type Part<T> = Partial<T>

// type MergeId<T> = T & { id?: string }

// declare module "lodash" {
//   interface LoDashStatic extends TLodashId {}
//   interface CollectionChain<T> {
//     getById(id: string): CollectionChain<T>;
//     createId(): string;
//     upsert(doc: MergeId<T>): CollectionChain<T>;
//     insert(doc: T): CollectionChain<T>;
//     updateById(id: string, attrs: Part<T>): CollectionChain<T>;
//     updateWhere(predicate: ListIterateeCustom<T, boolean>, attrs: Part<T>): CollectionChain<T[]>;
//     replaceById(id: string, attrs: Part<T>): CollectionChain<T>;
//     removeById(id: string): CollectionChain<T>;
//     removeWhere(predicate: ListIterateeCustom<T, boolean>): CollectionChain<T[]>;
//   }
// }

// type TLodashId = {
//   id: string;
//   getById: <T>(array: Array<T>, id: string) => CollectionChain<T>,
//   createId: () => string,
//   insert: <T>(array: Array<T>, doc: T) => CollectionChain<T>,
//   updateById: <T>(array: Array<T>, id: string, attrs: Part<T>) => CollectionChain<T>,
//   updateWhere: <T>(array: Array<T>, predicate: ListIterateeCustom<T, boolean>, attrs: Part<T>) => CollectionChain<T[]>
//   upsert: <T>(array: Array<T>, doc: MergeId<T>) => CollectionChain<T>,
//   removeById: <T>(array: Array<T>, id: string, attrs: Part<T>) => CollectionChain<T>,
//   replaceById: <T>(array: Array<T>, id: string) => CollectionChain<T>,
//   removeWhere: <T>(array: Array<T>, predicate: ListIterateeCustom<T, boolean>) => CollectionChain<T[]>,
// }

// declare const lodashId: TLodashId

// export default lodashId
