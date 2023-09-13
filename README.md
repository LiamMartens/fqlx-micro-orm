# FQLx Micro ORM
This library was created to interact with the FQLx API in a more type-safe way.
This library will not execute the actual queries but provides a way of interacting with the [Fauna Driver](https://www.npmjs.com/package/fauna)

## Usage

### Define Collections
You will start by creating a `Collection` class, which will mirror the collection in your database.
For example, the code below defines a collection class for `Address` and one for `Person`. Both of which are tied to a [zod](npmjs.com/package/zod) schema.
*Note: the schemas aren't used for validation, but rather for type inference. However they will be helpful as schema definitions in your codebase*

```js
import z from 'zod';
import { Collection } from 'fqlx-micro-orm';
import { documentReferenceSchemaFactory } from 'fauna-x-schemas';

const addressSchema = z.object({
  street: z.string(),
  zip: z.string(),
});

const personSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  address: documentReferenceSchemaFactory('Address').optional(),
});

class AddressCollection extends Collection<typeof addressSchema, 'Address'> {
  public name = 'Address' as const;
  public schema = addressSchema;
}

class PersonCollection extends Collection<
  typeof personSchema,
  'Person',
  { byFirstName: [string] } // index defintions
> {
  public name = 'Person' as const;
  public schema = personSchema;
}
```

### Build query
Once you have the collections set-up you can use them to build a typed query.
For the best experience you should use the built-in `query` method. This is because Fauna implicitly auto-paginates sets.
This behavior is handled by the query method.

```js
import { Client } from 'fauna';
import { query } from 'fqlx-micro-orm';

const client = new Client();
const user = new PersonCollection()
  .index('byFirstName', 'John')
  .project(['firstName', 'lastName'])
  .resolve('address', 'address', ['street', 'zip'], new AddressCollection());

// type-safe!
const data = await query(client, user);
```
