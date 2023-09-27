import z from 'zod';
import { expect, test } from 'bun:test';
import { Collection } from '../src/Collection.js';
import { FaunaNullDocument } from '../src/FaunaNullDocument.js';

const personSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

class PersonCollection extends Collection<
  typeof personSchema,
  'Person',
  {
    byFirstName: [string];
  }
> {
  public name = 'Person' as const;
  public schema = personSchema;
}

test('Collection.byId.exists', () => {
  const collection = new PersonCollection();
  const all = collection.byId(100).exists();
  expect(all.toFQL()).toEqual(['Person.byId(100).exists()', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends boolean ? true : false;
  const typeTest: Test = true;
});

test('Collection.byId.delete', () => {
  const collection = new PersonCollection();
  const del = collection.byId(100).delete();
  del.operation.forced();
  expect(del.toFQL()).toEqual(['Person.byId(100)!.delete()', {}]);

  type Test = typeof del.fqlType extends {
    ref: { coll: { name: 'Person' } };
    cause: string;
  } | null
    ? true
    : false;
  const typeTest: Test = true;
});
