import { TypeOf } from 'zod';
import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { NullDocument, QueryValueObject, TimeStub } from 'fauna';
import { FaunaNullDocument } from './FaunaNullDocument.js';
import { KeysOfItems, Projection } from './Projection.js';
import type { Collection } from './Collection.js';
import { InferCollectionSchema } from './type-utils/CollectionInfer.js';

export class FaunaDocument<
  C extends Collection<any, any, any>,
  AlwaysReturn extends boolean = false
> extends FQLEntry {
  public collection: C;
  public operation: FaunaMethodCall<FaunaDocument<C>['fqlType'] | null>;

  constructor(
    collection: C,
    operation: FaunaMethodCall<FaunaDocument<C>['fqlType'] | null>
  ) {
    super();
    this.collection = collection;
    this.operation = operation;
  }

  get fqlType():
    | TypeOf<C['completeSchema']>
    | (AlwaysReturn extends true ? NullDocument : null) {
    throw new Error('Only for typing');
  }

  public forceOperation = () => {
    this.operation.forced();
    return this;
  };

  public exists = (): FaunaMethodCall<boolean> => {
    const call = new FaunaMethodCall<boolean>('exists');
    return call.link(this);
  };

  public delete = (): FaunaNullDocument<C> => {
    const doc = new FaunaNullDocument<C>(
      this.collection,
      new FaunaMethodCall('delete')
    );
    return doc.link(this);
  };

  public replace = <K extends string = 'data'>(data: {
    [key in K]: TypeOf<InferCollectionSchema<C>>;
  }): FaunaDocument<C> => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument<C>(
      this.collection,
      new FaunaMethodCall('replace', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      })
    );
    return doc.link(this);
  };

  public replaceData = <K extends string = 'data'>(data: {
    [key in K]: TypeOf<InferCollectionSchema<C>>;
  }): FaunaDocument<C> => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument<C>(
      this.collection,
      new FaunaMethodCall('replaceData', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      })
    );
    return doc.link(this);
  };

  public update = <K extends string = 'data'>(data: {
    [key in K]: Partial<TypeOf<InferCollectionSchema<C>>> & {
      ttl?: string | TimeStub;
    };
  }): FaunaDocument<C> => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument<C>(
      this.collection,
      new FaunaMethodCall('update', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      } as QueryValueObject)
    );
    return doc.link(this);
  };

  public updateData = <K extends string = 'data'>(data: {
    [key in K]: Partial<TypeOf<InferCollectionSchema<C>>>;
  }): FaunaDocument<C> => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument<C>(
      this.collection,
      new FaunaMethodCall('replaceData', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      } as QueryValueObject)
    );
    return doc.link(this);
  };

  public project = <K extends KeysOfItems<TypeOf<C['completeSchema']>>>(
    pick: K[]
  ): Projection<TypeOf<C['completeSchema']> | null, K, {}> => {
    type ObjectType = TypeOf<C['completeSchema']> | null;
    return new Projection<ObjectType, K, {}>(pick).link(this);
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
