import { Client, QueryOptions, QueryValue, fql } from 'fauna';
import { FQLEntry } from './FQLEntry.js';
import { FaunaSet } from './FaunaSet.js';
import { FaunaPage } from './FaunaPage.js';

export function query<T extends FQLEntry>(
  client: Client,
  entry: T,
  options?: QueryOptions
) {
  type ValueType = T extends FaunaSet<infer S, infer N, infer C>
    ? FaunaPage<S, N, C, T['fqlType'][number]>['fqlType']
    : T['fqlType'];
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
