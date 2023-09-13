import { ZodObject, ZodRawShape, TypeOf } from 'zod';
import { Collection, IndexesDefinition } from './Collection.js';
import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { FaunaDocument } from './FaunaDocument.js';
import { QueryValue, QueryValueObject } from 'fauna';
import { KeysOfItems, Projection } from './Projection.js';

export class FaunaPage<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  Indexes extends IndexesDefinition,
  C extends Collection<Schema, Name, Indexes>,
  T extends QueryValue = NonNullable<FaunaDocument<Schema, Name, Indexes, C>['fqlType']>
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

  public forceOperation = () => {
    this.operation?.forced();
    return this;
  }

  public project = <K extends KeysOfItems<this['fqlType']>>(
    pick: K[]
  ): Projection<this['fqlType'][], K, {}> => {
    return new Projection<this['fqlType'][], K, {}>(pick).link(this);
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
