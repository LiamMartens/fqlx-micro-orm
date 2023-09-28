import { DocumentSchema, documentSchemaFactory } from 'fauna-x-schemas';
import { TypeOf, ZodObject, ZodRawShape, objectUtil } from 'zod';
import { FQLEntry } from './FQLEntry.js';
import { QueryValue, QueryValueObject, TimeStub } from 'fauna';
import { FaunaSet } from './FaunaSet.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { FaunaDocument } from './FaunaDocument.js';
import { InferCollectionSchema } from './type-utils/CollectionInfer.js';

export type IndexesDefinition = Record<string, QueryValue[]>;

export type ByIdFn<C extends Collection<any, any, any>> = (
  id: string | number
) => FaunaDocument<C, true>;

export type CreateFn<
  K extends string,
  C extends Collection<any, any, any>
> = (data: {
  [key in K]: TypeOf<InferCollectionSchema<C>> & {
    id?: number;
    ttl?: string | TimeStub;
  };
}) => FaunaDocument<C>;

export abstract class Collection<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  Indexes extends IndexesDefinition = {}
> extends FQLEntry {
  public abstract name: Name;

  public abstract schema: Schema;

  get fqlType(): {
    coll: { name: 'Collection' };
    name: Name;
    ts: TimeStub;
  } {
    throw new Error('Only used for typing');
  }

  public get completeSchema(): ZodObject<
    objectUtil.MergeShapes<DocumentSchema<true, Name>['shape'], Schema['shape']>
  > {
    const base: DocumentSchema<true, Name> = documentSchemaFactory<Name>(
      this.name
    );
    return base.extend(this.schema.shape) as ZodObject<
      objectUtil.MergeShapes<
        DocumentSchema<true, Name>['shape'],
        Schema['shape']
      >
    >;
  }

  public toFQL = (): [string, QueryValueObject] => {
    const [superQuery, superArgs] = super.toFQL();
    return [`${superQuery}${this.name}`, superArgs];
  };

  public all = (): FaunaSet<typeof this> => {
    const set = new FaunaSet<typeof this>(this, new FaunaMethodCall('all'));
    return set.link(this);
  };

  public where = (body: string): FaunaSet<typeof this> => {
    const set = new FaunaSet<typeof this>(
      this,
      new FaunaMethodCall('where', body)
    );
    return set.link(this);
  };

  public index = <T extends keyof Indexes>(
    name: T extends string ? T : never,
    ...args: Indexes[T] | string[] // always allow string to be able to use variables
  ): FaunaSet<typeof this> => {
    const set = new FaunaSet<typeof this>(
      this,
      new FaunaMethodCall(name, ...args)
    );
    return set.link(this);
  };

  public firstWhere = (body: string): FaunaDocument<typeof this> => {
    const doc = new FaunaDocument<typeof this>(
      this,
      new FaunaMethodCall('firstWhere', body)
    );
    return doc.link(this);
  };

  public byId: ByIdFn<typeof this> = (id) => {
    const set = new FaunaDocument<typeof this, true>(
      this,
      new FaunaMethodCall(
        'byId',
        JSON.stringify(String(id).replace(/[^0-9]/, ''))
      )
    );
    return set.link(this);
  };

  public create = <K extends string>(data: {
    [key in K]: TypeOf<Schema> & {
      id?: number;
      ttl?: string | TimeStub;
    };
  }): ReturnType<CreateFn<K, typeof this>> => {
    const variableKey = Object.keys(data)[0] as K;
    const documentData = data[variableKey];
    const ttlValue =
      typeof documentData.ttl === 'string'
        ? TimeStub.from(documentData.ttl)
        : documentData.ttl;
    const mergedArgs = Object.assign(
      {},
      documentData,
      ttlValue ? { ttl: ttlValue } : {}
    );
    const doc = new FaunaDocument<typeof this>(
      this,
      new FaunaMethodCall('create', variableKey).mergeArguments({
        [variableKey]: mergedArgs,
      })
    );
    return doc.link(this);
  };
}
