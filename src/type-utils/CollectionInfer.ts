import type { Collection } from '../Collection.js';

export type InferCollectionSchema<T> = T extends Collection<infer Schema, any>
  ? Schema
  : never;

export type InferCollectionName<T> = T extends Collection<any, infer Name>
  ? Name
  : never;

export type InferCollectionIndexes<T> = T extends Collection<
  any,
  any,
  infer Indexes
>
  ? Indexes
  : never;
