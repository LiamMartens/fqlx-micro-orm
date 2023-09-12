import { TypeOf, ZodObject, ZodRawShape } from 'zod';
import { Collection } from './Collection.js';
import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { QueryValueObject } from 'fauna';

export class FaunaNullDocument<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  C extends Collection<Schema, Name>
> extends FQLEntry {
  public collection: C;
  public operation: FaunaMethodCall<
    FaunaNullDocument<Schema, Name, C>['fqlType'] | null
  >;

  constructor(
    collection: C,
    operation: FaunaMethodCall<
      FaunaNullDocument<Schema, Name, C>['fqlType'] | null
    >
  ) {
    super();
    this.collection = collection;
    this.operation = operation;
  }

  get fqlType(): {
    ref: { coll: { name: Name } };
    cause: string;
  } | null {
    throw new Error('Only for typing');
  }

  public toFQL(): [string, QueryValueObject] {
    const [superQuery, superArgs] = super.toFQL();
    const [opQuery, opArgs] = this.operation.toFQL();
    return [
      `${superQuery}${opQuery}`,
      Object.assign(superArgs, opArgs, this.arguments),
    ];
  }
}
