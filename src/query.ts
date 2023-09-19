import { Client, QueryOptions, QueryValue, fql } from 'fauna';
import { FQLEntry } from './FQLEntry.js';
import { FaunaSet } from './FaunaSet.js';
import { FaunaPage } from './FaunaPage.js';
import { Projection } from './Projection.js';

export function query<T extends FQLEntry>(
  client: Client,
  entry: T,
  options?: QueryOptions
) {
  type ValueType = T extends FaunaSet<infer S, infer N, infer I, infer C>
    ? FaunaPage<S, N, I, C, T['fqlType'][number]>['fqlType']
    : T extends Projection<infer In, infer Keys, infer Subp, infer IsSet>
    ? IsSet extends true
      ? { data: T['fqlType']; after?: string }
      : T
    : T;
  const actualValue =
    entry instanceof FaunaSet
      ? new FaunaPage(entry.collection).link(entry)
      : entry;
  const [query, args] = actualValue.toFQL();

  return client.query<ValueType extends QueryValue ? ValueType : never>(
    fql([`${query}`]),
    {
      ...options,
      arguments: { ...args, ...options?.arguments },
    }
  );
}
