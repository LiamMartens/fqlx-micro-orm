import { TypeOf, ZodObject, ZodRawShape } from 'zod';
import { Collection } from './Collection.js';
import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { QueryValueObject } from 'fauna';
import { InferCollectionName } from './type-utils/CollectionInfer.js';

export class FaunaNullDocument<
  C extends Collection<any, any>
> extends FQLEntry {
  public collection: C;
  public operation: FaunaMethodCall<FaunaNullDocument<C>['fqlType'] | null>;

  constructor(
    collection: C,
    operation: FaunaMethodCall<FaunaNullDocument<C>['fqlType'] | null>
  ) {
    super();
    this.collection = collection;
    this.operation = operation;
  }

  get fqlType(): {
    ref: { coll: { name: InferCollectionName<C> } };
    cause: string;
  } | null {
    throw new Error('Only for typing');
  }

  public forceOperation = () => {
    this.operation.forced();
    return this;
  };

  public toFQL(): [string, QueryValueObject] {
    const [superQuery, superArgs] = super.toFQL();
    const [opQuery, opArgs] = this.operation.toFQL();
    return [
      `${superQuery}${opQuery}`,
      Object.assign(superArgs, opArgs, this.arguments),
    ];
  }
}
