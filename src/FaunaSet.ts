import { ZodObject, ZodRawShape, TypeOf, Schema } from 'zod';
import { Collection } from './Collection.js';
import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { FaunaDocument } from './FaunaDocument.js';
import { QueryValue, QueryValueObject } from 'fauna';
import { KeysOfItems, Projection } from './Projection.js';
import { FaunaPage } from './FaunaPage.js';
import {
  InferCollectionName,
  InferCollectionSchema,
} from './type-utils/CollectionInfer.js';

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
  ): FaunaPage<InferCollectionSchema<C>, InferCollectionName<C>, C> {
    type SchemaType = InferCollectionSchema<C>;
    type NameType = InferCollectionName<C>;
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

  public paginate = (count?: number): FaunaPage<Schema, Name, C> => {
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

  public first = (): FaunaDocument<Schema, Name, C> => {
    const doc = new FaunaDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('first')
    );
    return doc.link(this);
  };

  public last = (): FaunaDocument<Schema, Name, C> => {
    const doc = new FaunaDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('last')
    );
    return doc.link(this);
  };

  public any = (body: string): FaunaMethodCall<boolean> => {
    const call = new FaunaMethodCall<boolean>('any', body);
    return call.link(this);
  };

  public count = (): FaunaMethodCall<number> => {
    const call = new FaunaMethodCall<number>('count');
    return call.link(this);
  };

  public isEmpty = (): FaunaMethodCall<boolean> => {
    const call = new FaunaMethodCall<boolean>('isEmpty');
    return call.link(this);
  };

  public nonEmpty = (): FaunaMethodCall<boolean> => {
    const call = new FaunaMethodCall<boolean>('nonEmpty');
    return call.link(this);
  };

  public distinct = (): FaunaSet<Schema, Name, C> => {
    const set = new FaunaSet<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('distinct')
    );
    return set.link(this);
  };

  public firstWhere = (body: string): FaunaDocument<Schema, Name, C> => {
    const doc = new FaunaDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('firstWhere', body)
    );
    return doc.link(this);
  };

  public lastWhere = (body: string): FaunaDocument<Schema, Name, C> => {
    const doc = new FaunaDocument<Schema, Name, C>(
      this.collection,
      new FaunaMethodCall('lastWhere', body)
    );
    return doc.link(this);
  };

  public map = <T extends QueryValue>(
    body: string
  ): FaunaSet<Schema, Name, Collection<Schema, Name>, T> => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>, T>(
      this.collection,
      new FaunaMethodCall('map', body)
    );
    return set.link(this);
  };

  public order = (
    ordering: string
  ): FaunaSet<Schema, Name, Collection<Schema, Name>> => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this.collection,
      new FaunaMethodCall('order', ordering)
    );
    return set.link(this);
  };

  public reverse = (): FaunaSet<Schema, Name, Collection<Schema, Name>> => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this.collection,
      new FaunaMethodCall('reverse')
    );
    return set.link(this);
  };

  public where = (
    body: string
  ): FaunaSet<Schema, Name, Collection<Schema, Name>> => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this.collection,
      new FaunaMethodCall('where', body)
    );
    return set.link(this);
  };

  public project = <K extends KeysOfItems<T>>(pick: K[]): Projection<T[], K, {}> => {
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
