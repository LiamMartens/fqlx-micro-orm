import { TypeOf, ZodObject, ZodRawShape } from 'zod';
import { Collection } from './Collection.js';
import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { QueryValueObject } from 'fauna';
import { FaunaNullDocument } from './FaunaNullDocument.js';
import { KeysOfItems, Projection } from './Projection.js';

export class FaunaDocument<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  C extends Collection<Schema, Name>
> extends FQLEntry {
  public collection: C;
  public operation: FaunaMethodCall<
    FaunaDocument<Schema, Name, C>['fqlType'] | null
  >;

  constructor(
    collection: C,
    operation: FaunaMethodCall<FaunaDocument<Schema, Name, C>['fqlType'] | null>
  ) {
    super();
    this.collection = collection;
    this.operation = operation;
  }

  get fqlType(): TypeOf<C['completeSchema']> | null {
    throw new Error('Only for typing');
  }

  public exists = () => {
    const call = new FaunaMethodCall<boolean>('exists');
    return call.link(this);
  };

  public delete = () => {
    const doc = new FaunaNullDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('delete')
    );
    return doc.link(this);
  };

  public replace = <K extends string>(data: {
    [key in K]: TypeOf<Schema>;
  }) => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument(
      this.collection,
      new FaunaMethodCall('replace', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      })
    );
    return doc.link(this);
  };

  public replaceData = <K extends string>(data: {
    [key in K]: TypeOf<Schema>;
  }) => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument(
      this.collection,
      new FaunaMethodCall('replaceData', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      })
    );
    return doc.link(this);
  };

  public update = <K extends string>(data: {
    [key in K]: Partial<TypeOf<Schema>>;
  }) => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument(
      this.collection,
      new FaunaMethodCall('update', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      } as QueryValueObject)
    );
    return doc.link(this);
  };

  public updateData = <K extends string>(data: {
    [key in K]: Partial<TypeOf<Schema>>;
  }) => {
    const variableKey = Object.keys(data)[0] as K;
    const doc = new FaunaDocument(
      this.collection,
      new FaunaMethodCall('replaceData', variableKey).mergeArguments({
        [variableKey]: data[variableKey],
      } as QueryValueObject)
    );
    return doc.link(this);
  };

  public project = <K extends KeysOfItems<TypeOf<C['completeSchema']>>>(
    pick: K[]
  ) => {
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
