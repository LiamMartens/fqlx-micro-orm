import z from 'zod';
import { test } from 'bun:test';
import { Collection } from '../src/Collection.js';
import { Client, QueryOptions } from 'fauna';
import { FQLEntry, query } from '../src/index.js';

const chargingSpotSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

class ChargingSpotCollection extends Collection<
  typeof chargingSpotSchema,
  'ChargingSpot'
> {
  public name = 'ChargingSpot' as const;
  public schema = chargingSpotSchema;
}

const collection = new ChargingSpotCollection();

test('Set should be auto-paginated', async () => {
  const client = new Client({
    secret: '',
  });
  const all = collection.all();

  class GenericStub<T extends FQLEntry> {
    query(
      client: Client,
      entry: T,
      options?: QueryOptions
    ) {
      return query<T>(client, entry, options);
    }
  }

  type Result = Awaited<ReturnType<GenericStub<typeof all>['query']>>['data']
  type TestType = Result extends {
    data: any[]
    after?: string | null
  } ? true : false;
  const test: TestType = true;
});
