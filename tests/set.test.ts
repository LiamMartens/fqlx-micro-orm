import z from 'zod';
import { expect, test } from 'bun:test';
import { Collection } from '../src/Collection.js';
import { FaunaSet } from '../src/FaunaSet.js';

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

test('Set.paginate', () => {
  const collection = new PersonCollection();
  const page = FaunaSet.paginate(collection, 'after-cursor', 100);
  expect(page.toFQL()).toEqual([
    'Set.paginate(cursor,count)',
    {
      cursor: 'after-cursor',
      count: 100,
    },
  ]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof page.fqlType extends {
    data: CompleteSchema[];
    after?: string | null;
  }
    ? true
    : false;
  const typeTest: Test = true;
});

test('Collection.all.paginate', () => {
  const collection = new PersonCollection();
  const all = collection.all().paginate(100);
  expect(all.toFQL()).toEqual([
    'Person.all().paginate(count)',
    {
      count: 100,
    },
  ]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends {
    data: CompleteSchema[];
    after?: string | null;
  }
    ? true
    : false;
  const typeTest: Test = true;
});

test('Collection.all.first', () => {
  const collection = new PersonCollection();
  const all = collection.all().first();
  expect(all.toFQL()).toEqual(['Person.all().first()', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends CompleteSchema | null ? true : false;
  const typeTest: Test = true;
});

test('Collection.all.any', () => {
  const collection = new PersonCollection();
  const all = collection.all().any('arg0 => arg0.firstName == "John"');
  expect(all.toFQL()).toEqual([
    'Person.all().any(arg0 => arg0.firstName == "John")',
    {},
  ]);

  type Test = typeof all.fqlType extends boolean ? true : false;
  const typeTest: Test = true;
});

test('Collection.all.count', () => {
  const collection = new PersonCollection();
  const all = collection.all().count();
  expect(all.toFQL()).toEqual(['Person.all().count()', {}]);

  type Test = typeof all.fqlType extends number ? true : false;
  const typeTest: Test = true;
});

test('Collection.all.distinct', () => {
  const collection = new PersonCollection();
  const all = collection.all().distinct();
  expect(all.toFQL()).toEqual(['Person.all().distinct()', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends CompleteSchema[]
    ? true
    : false;
  const typeTest: Test = true;
});

test('Collection.all.firstWhere', () => {
  const collection = new PersonCollection();
  const all = collection.all().firstWhere('arg0 => arg0.firstName == "John"');
  expect(all.toFQL()).toEqual([
    'Person.all().firstWhere(arg0 => arg0.firstName == "John")',
    {},
  ]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends CompleteSchema | null ? true : false;
  const typeTest: Test = true;
});

test('Collection.all.isEmpty', () => {
  const collection = new PersonCollection();
  const all = collection.all().isEmpty();
  expect(all.toFQL()).toEqual(['Person.all().isEmpty()', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends boolean ? true : false;
  const typeTest: Test = true;
});

test('Collection.all.lastWhere', () => {
  const collection = new PersonCollection();
  const all = collection.all().lastWhere('arg0 => arg0.firstName == "John"');
  expect(all.toFQL()).toEqual([
    'Person.all().lastWhere(arg0 => arg0.firstName == "John")',
    {},
  ]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends CompleteSchema | null ? true : false;
  const typeTest: Test = true;
});

test('Collection.all.last', () => {
  const collection = new PersonCollection();
  const all = collection.all().last();
  expect(all.toFQL()).toEqual(['Person.all().last()', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends CompleteSchema | null ? true : false;
  const typeTest: Test = true;
});

test('Collection.all.map', () => {
  const collection = new PersonCollection();
  const all = collection.all().map<boolean>('arg0 => true');
  expect(all.toFQL()).toEqual(['Person.all().map(arg0 => true)', {}]);

  type Test = typeof all.fqlType extends boolean[]
    ? true
    : false;
  const typeTest: Test = true;
});

test('Collection.all.map', () => {
  const collection = new PersonCollection();
  const all = collection.all().order('desc(.firstName)');
  expect(all.toFQL()).toEqual(['Person.all().order(desc(.firstName))', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends CompleteSchema[]
    ? true
    : false;
  const typeTest: Test = true;
});

test('Collection.all.reverse', () => {
  const collection = new PersonCollection();
  const all = collection.all().reverse();
  expect(all.toFQL()).toEqual(['Person.all().reverse()', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends CompleteSchema[]
    ? true
    : false;
  const typeTest: Test = true;
});


test('Collection.all.where', () => {
  const collection = new PersonCollection();
  const all = collection.all().where('arg0 => arg0.firstName == "John"');
  expect(all.toFQL()).toEqual(['Person.all().where(arg0 => arg0.firstName == "John")', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends CompleteSchema[]
    ? true
    : false;
  const typeTest: Test = true;
});