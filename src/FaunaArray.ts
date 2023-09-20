import { FQLEntry } from './FQLEntry.js';
import { FaunaMethodCall } from './FaunaMethodCall.js';
import { FaunaDocument } from './FaunaDocument.js';
import { QueryValue, QueryValueObject } from 'fauna';
import { KeysOfItems, Projection } from './Projection.js';

export class FaunaArray<
  T extends QueryValue
> extends FQLEntry {
  public operation: FaunaMethodCall<T[]>;

  public get fqlType(): T[] {
    throw new Error('Only used for typing');
  }

  constructor(operation: FaunaMethodCall<T[]>) {
    super();
    this.operation = operation;
  }

  public forceOperation = () => {
    this.operation.forced();
    return this;
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

  public firstWhere = (body: string): FaunaMethodCall<T> => {
    const doc = new FaunaMethodCall('firstWhere', body);
    return doc.link(this);
  };

  public lastWhere = (body: string): FaunaMethodCall<T> => {
    const doc = new FaunaMethodCall('lastWhere', body);
    return doc.link(this);
  };

  public distinct = (): FaunaArray<T> => {
    const set = new FaunaArray<T>(
      new FaunaMethodCall('distinct')
    );
    return set.link(this);
  };

  public map = <T extends QueryValue>(body: string): FaunaArray<T> => {
    const set = new FaunaArray<T>(
      new FaunaMethodCall('map', body)
    );
    return set.link(this);
  };

  public order = (ordering: string): FaunaArray<T> => {
    const set = new FaunaArray<T>(
      new FaunaMethodCall('order', ordering)
    );
    return set.link(this);
  };

  public reverse = (): FaunaArray<T> => {
    const set = new FaunaArray<T>(
      new FaunaMethodCall('reverse')
    );
    return set.link(this);
  };

  public where = (body: string): FaunaArray<T> => {
    const set = new FaunaArray<T>(
      new FaunaMethodCall('where', body)
    );
    return set.link(this);
  };

  public project = <K extends KeysOfItems<T>>(
    pick: K[]
  ): Projection<T[], K, {}, true> => {
    return new Projection<T[], K, {}, true>(pick).link(this);
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
