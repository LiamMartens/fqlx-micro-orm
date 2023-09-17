import { TypeOf, ZodObject, ZodRawShape } from 'zod';
import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { QueryValueObject, TimeStub } from 'fauna';
import { FaunaNullDocument } from './FaunaNullDocument.js';
import { KeysOfItems, Projection } from './Projection.js';
import type { Collection, IndexesDefinition } from './Collection.js';

export class FaunaDocument<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  Indexes extends IndexesDefinition,
  C extends Collection<Schema, Name, Indexes>
> extends FQLEntry {
  public collection: C;
  public operation: FaunaMethodCall<
    FaunaDocument<Schema, Name, Indexes, C>['fqlType'] | null
  >;

  constructor(
    collection: C,
    operation: FaunaMethodCall<FaunaDocument<Schema, Name, Indexes, C>['fqlType'] | null>
  ) {
    super();
    this.collection = collection;
    this.operation = operation;
  }

  get fqlType(): TypeOf<C['completeSchema']> | null {
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

  public delete = (): FaunaNullDocument<Schema, Name, C> => {
    const doc = new FaunaNullDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('delete')
    );
    return doc.link(this);
  };

  public replace = <K extends string = 'data'>(data: {
    [key in K]: TypeOf<Schema>;
  }): FaunaDocument<Schema, Name, Indexes, C> => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument<Schema, Name, Indexes, C>(
      this.collection,
      new FaunaMethodCall('replace', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      })
    );
    return doc.link(this);
  };

  public replaceData = <K extends string = 'data'>(data: {
    [key in K]: TypeOf<Schema>;
  }): FaunaDocument<Schema, Name, Indexes, C> => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument<Schema, Name, Indexes, C>(
      this.collection,
      new FaunaMethodCall('replaceData', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      })
    );
    return doc.link(this);
  };

  public update = <K extends string = 'data'>(data: {
    [key in K]: Partial<TypeOf<Schema>> & {
      ttl?: string | TimeStub;
    };
  }): FaunaDocument<Schema, Name, Indexes, C> => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument<Schema, Name, Indexes, C>(
      this.collection,
      new FaunaMethodCall('update', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      } as QueryValueObject)
    );
    return doc.link(this);
  };

  public updateData = <K extends string = 'data'>(data: {
    [key in K]: Partial<TypeOf<Schema>>;
  }): FaunaDocument<Schema, Name, Indexes, C> => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument<Schema, Name, Indexes, C>(
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
