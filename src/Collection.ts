import { documentSchemaFactory } from 'fauna-x-schemas';
import { TypeOf, ZodObject, ZodRawShape } from 'zod';
import { FQLEntry } from './FQLEntry.js';
import { QueryValue, QueryValueObject, TimeStub } from 'fauna';
import { FaunaSet } from './FaunaSet.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { FaunaDocument } from './FaunaDocument.js';

export type IndexesDefinition = Record<string, QueryValue[]>;

export type ByIdFn<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  Indexes extends IndexesDefinition = {}
> = (
  id: string | number
) => FaunaDocument<Schema, Name, Collection<Schema, Name, Indexes>>;

export type CreateFn<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  Indexes extends IndexesDefinition,
  K extends string
> = (data: {
  [key in K]: TypeOf<Schema> & {
    id?: number;
    ttl?: string | TimeStub;
  };
}) => FaunaDocument<Schema, Name, Collection<Schema, Name, Indexes>>;

export interface ICollection<
  Schema extends ZodObject<ZodRawShape>,
  Name extends string,
  Indexes extends IndexesDefinition = {}
> {
  byId: ByIdFn<Schema, Name, Indexes>;
}

export abstract class Collection<
    Schema extends ZodObject<ZodRawShape>,
    Name extends string,
    Indexes extends IndexesDefinition = {}
  >
  extends FQLEntry
  implements ICollection<Schema, Name, Indexes>
{
  public abstract name: Name;

  public abstract schema: Schema;

  get fqlType(): {
    coll: { name: 'Collection' };
    name: Name;
    ts: TimeStub;
  } {
    throw new Error('Only used for typing');
  }

  public get completeSchema() {
    return documentSchemaFactory<Name>(this.name).merge(this.schema);
  }

  public toFQL = (): [string, QueryValueObject] => {
    const [superQuery, superArgs] = super.toFQL();
    return [`${superQuery}${this.name}`, superArgs];
  };

  public all = (): FaunaSet<Schema, Name, Collection<Schema, Name>> => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this,
      new FaunaMethodCall('all')
    );
    return set.link(this);
  };

  public where = (
    body: string
  ): FaunaSet<Schema, Name, Collection<Schema, Name>> => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this,
      new FaunaMethodCall('where', body)
    );
    return set.link(this);
  };

  public index = <T extends keyof Indexes>(
    name: T extends string ? T : never,
    ...args: Indexes[T]
  ): FaunaSet<Schema, Name, Collection<Schema, Name>> => {
    const set = new FaunaSet<Schema, Name, Collection<Schema, Name>>(
      this,
      new FaunaMethodCall(name, ...args)
    );
    return set.link(this);
  };

  public firstWhere = (
    body: string
  ): FaunaDocument<Schema, Name, Collection<Schema, Name, Indexes>> => {
    const doc = new FaunaDocument<
      Schema,
      Name,
      Collection<Schema, Name, Indexes>
    >(this, new FaunaMethodCall('firstWhere', body));
    return doc.link(this);
  };

  public byId: ByIdFn<Schema, Name, Indexes> = (id) => {
    const set = new FaunaDocument<
      Schema,
      Name,
      Collection<Schema, Name, Indexes>
    >(
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
  }): ReturnType<CreateFn<Schema, Name, Indexes, K>> => {
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
    const doc = new FaunaDocument<
      Schema,
      Name,
      Collection<Schema, Name, Indexes>
    >(
      this,
      new FaunaMethodCall('create', variableKey).mergeArguments({
        [variableKey]: mergedArgs,
      })
    );
    return doc.link(this);
  };
}
