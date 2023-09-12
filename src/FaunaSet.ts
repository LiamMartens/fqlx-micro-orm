import { ZodObject, ZodRawShape, TypeOf, Schema } from 'zod';
import { Collection } from './Collection.js';
import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { FaunaDocument } from './FaunaDocument.js';
import { QueryValue, QueryValueObject } from 'fauna';
import { KeysOfItems, Projection } from './Projection.js';
import { FaunaPage } from './FaunaPage.js';

export class FaunaSet<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  C extends Collection<Schema, Name>,
  T extends QueryValue = NonNullable<FaunaDocument<Schema, Name, C>['fqlType']>
> extends FQLEntry {
  public collection: C;
  public operation: FaunaMethodCall<T[]>;

  public get fqlType(): T[] {
    throw new Error('Only used for typing');
  }

  public static paginate<C extends Collection<any, any>>(
    collection: C,
    cursor: string,
    count: number
  ) {
    type SchemaType = C extends Collection<infer Schema, any> ? Schema : never;
    type NameType = C extends Collection<any, infer Name> ? Name : never;
    type IndexesType = C extends Collection<any, any, infer Indexes>
      ? Indexes
      : never;
    const page = new FaunaPage<SchemaType, NameType, C>(collection);
    return page.link(
      new FaunaSet<SchemaType, NameType, C>(
        collection,
        new FaunaMethodCall('paginate', 'cursor', 'count').mergeArguments({
          cursor,
          count,
        })
      )
    );
  }

  constructor(collection: C, operation: FaunaMethodCall<T[]>) {
    super();
    this.collection = collection;
    this.operation = operation;
  }

  public paginate = (count?: number) => {
    type DocType = NonNullable<FaunaDocument<Schema, Name, C>['fqlType']>;
    const page = new FaunaPage<Schema, Name, C>(
      this.collection,
      typeof count === 'number'
        ? new FaunaMethodCall<DocType[]>('paginate', 'count').mergeArguments({
            count,
          })
        : new FaunaMethodCall<DocType[]>('paginate')
    );
    return page.link(this);
  };

  public first = () => {
    const doc = new FaunaDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('first')
    );
    return doc.link(this);
  };

  public last = () => {
    const doc = new FaunaDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('last')
    );
    return doc.link(this);
  };

  public any = (body: string) => {
    const call = new FaunaMethodCall<boolean>('any', body);
    return call.link(this);
  };

  public count = () => {
    const call = new FaunaMethodCall<number>('count');
    return call.link(this);
  };

  public isEmpty = () => {
    const call = new FaunaMethodCall<boolean>('isEmpty');
    return call.link(this);
  };

  public nonEmpty = () => {
    const call = new FaunaMethodCall<boolean>('nonEmpty');
    return call.link(this);
  };

  public distinct = () => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this.collection,
      new FaunaMethodCall('distinct')
    );
    return set.link(this);
  };

  public firstWhere = (body: string) => {
    const doc = new FaunaDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('firstWhere', body)
    );
    return doc.link(this);
  };

  public lastWhere = (body: string) => {
    const doc = new FaunaDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('lastWhere', body)
    );
    return doc.link(this);
  };

  public map = <T extends QueryValue>(body: string) => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>, T>(
      this.collection,
      new FaunaMethodCall('map', body)
    );
    return set.link(this);
  };

  public order = (ordering: string) => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this.collection,
      new FaunaMethodCall('order', ordering)
    );
    return set.link(this);
  };

  public reverse = () => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this.collection,
      new FaunaMethodCall('reverse')
    );
    return set.link(this);
  };

  public where = (body: string) => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this.collection,
      new FaunaMethodCall('where', body)
    );
    return set.link(this);
  };

  public project = <K extends KeysOfItems<T>>(pick: K[]) => {
    return new Projection<T[], K, {}>(pick).link(this);
  };

  public toFQL(): [string, QueryValueObject] {
    const [superQuery, superArgs] = super.toFQL();
    const [opQuery, opArgs] = this.operation.toFQL();
    return [
      `${this.chain.length === 0 ? 'Set' : superQuery}${opQuery}`,
      Object.assign(superArgs, opArgs, this.arguments),
    ];
  }
}
