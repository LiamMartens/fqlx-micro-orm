import z, { TypeOf } from 'zod';
import { expect, test } from 'bun:test';
import { Collection } from '../src/Collection.js';
import { FaunaSet } from '../src/FaunaSet.js';
import { documentReferenceSchemaFactory } from 'fauna-x-schemas';
import { Projection } from '../src/Projection.js';

const personSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  address: z.object({
    street: z.string(),
    zip: z.string(),
  }).optional(),
  children: z.array(documentReferenceSchemaFactory('Person')),
});

class PersonCollection extends Collection<typeof personSchema, 'Person'> {
  public name = 'Person' as const;
  public schema = personSchema;
}

test('Raw projection', () => {
  type ObjectType = TypeOf<typeof personSchema>;
  const projection = new Projection<ObjectType, 'firstName', {}>(['firstName']);

  type TestType = typeof projection.fqlType.firstName;
  const test: TestType = 'John';
});

test('Simple projection', () => {
  const collection = new PersonCollection();
  const user = collection.byId(123).project(['firstName', 'lastName']).nest('address', 'address', ['street']);

  expect(user.toFQL()).toEqual([`Person.byId("123"){firstName,lastName,address:.address{street}}`, {}]);

  type TestType = typeof user.fqlType extends
    | {
        firstName: string;
        lastName: string;
      }
    | null
    ? true
    : never;
  const test: TestType = true;
});

test('Alias projection', () => {
  const collection = new PersonCollection();
  const user = collection
    .byId(123)
    .project(['firstName', 'lastName'])
    .alias('familyName', 'lastName');

  expect(user.toFQL()).toEqual([
    `Person.byId("123"){firstName,lastName,familyName:.lastName}`,
    {},
  ]);

  type TestType = typeof user.fqlType extends
    | {
        firstName: string;
        lastName: string;
        familyName: string;
      }
    | null
    ? true
    : never;
  const test: TestType = true;
});

test('Resolved projection', () => {
  const collection = new PersonCollection();
  const user = collection
    .byId(123)
    .project(['firstName', 'lastName'])
    .resolve('children', 'children', ['firstName', 'lastName'], collection);

  expect(user.toFQL()).toEqual([
    `Person.byId("123"){firstName,lastName,children:.children {firstName,lastName}}`,
    {},
  ]);

  type TestType = typeof user.fqlType extends
    | {
        firstName: string;
        lastName: string;
        children: ({
          firstName: string;
          lastName: string;
        } | null)[]
      }
    | null
    ? true
    : never;
  const test: TestType = true;
});

test('Set projection', () => {
  const collection = new PersonCollection();
  const user = collection.all().project(['firstName', 'lastName']);

  expect(user.toFQL()).toEqual([`Person.all(){firstName,lastName}`, {}]);

  type TestType = typeof user.fqlType extends
    | {
        firstName: string;
        lastName: string;
      }[]
    ? true
    : never;
  const test: TestType = true;
});
