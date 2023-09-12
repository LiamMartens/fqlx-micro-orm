import { ZodObject, ZodRawShape, TypeOf } from 'zod';
import { Collection } from './Collection.js';
import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { FaunaDocument } from './FaunaDocument.js';
import { QueryValue, QueryValueObject } from 'fauna';
import { KeysOfItems, Projection } from './Projection.js';

export class FaunaPage<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  C extends Collection<Schema, Name>,
  T extends QueryValue = NonNullable<FaunaDocument<Schema, Name, C>['fqlType']>
> extends FQLEntry {
  public collection: C;
  public operation?: FaunaMethodCall<T[]>;

  public get fqlType(): {
    data: T[];
    after?: string | null;
  } {
    throw new Error('Only used for typing');
  }

  constructor(collection: C, operation?: FaunaMethodCall<T[]>) {
    super();
    this.collection = collection;
    this.operation = operation;
  }

  public project = <K extends KeysOfItems<T>>(pick: K[]) => {
    return new Projection<T[], K, {}>(pick).link(this);
  };

  public toFQL(): [string, QueryValueObject] {
    const [superQuery, superArgs] = super.toFQL();
    const [opQuery, opArgs] = this.operation
      ? this.operation.toFQL()
      : ['', {}];
    return [
      `${superQuery}${opQuery}`,
      Object.assign(superArgs, opArgs, this.arguments),
    ];
  }
}
