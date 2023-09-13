import z from 'zod';
import { expect, test } from 'bun:test';
import { Collection } from '../src/Collection.js';
import { documentReferenceSchemaFactory } from 'fauna-x-schemas';

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

test('Collection.all', () => {
  const collection = new PersonCollection();
  const aa = collection.byId('awd').update({
    data: { firstName: '' },
  });
  const all = collection.all();
  expect(all.toFQL()).toEqual(['Person.all()', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof all.fqlType extends CompleteSchema[] ? true : false;
  const typeTest: Test = true;
});

test('Collection.where', () => {
  const collection = new PersonCollection();
  const where = collection.where('arg0 => arg0.id == "123"');
  expect(where.toFQL()).toEqual(['Person.where(arg0 => arg0.id == "123")', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof where.fqlType extends CompleteSchema[] ? true : false;
  const typeTest: Test = true;
});

test('Collection.index', () => {
  const collection = new PersonCollection();
  const where = collection.index('byFirstName', 'name');
  expect(where.toFQL()).toEqual(['Person.byFirstName(name)', {}]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof where.fqlType extends CompleteSchema[] ? true : false;
  const typeTest: Test = true;
});

test('Collection.firstWhere', () => {
  const collection = new PersonCollection();
  const where = collection.firstWhere('arg0 => arg0.firstName');
  expect(where.toFQL()).toEqual([
    'Person.firstWhere(arg0 => arg0.firstName)',
    {},
  ]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof where.fqlType extends CompleteSchema | null ? true : false;
  const typeTest: Test = true;
});

test('Collection.create', () => {
  const collection = new PersonCollection();
  const where = collection.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
    },
  });
  expect(where.toFQL()).toEqual([
    'Person.create(data)',
    {
      data: {
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  ]);

  type CompleteSchema = z.infer<PersonCollection['completeSchema']>;
  type Test = typeof where.fqlType extends CompleteSchema | null ? true : false;
  const typeTest: Test = true;
});
