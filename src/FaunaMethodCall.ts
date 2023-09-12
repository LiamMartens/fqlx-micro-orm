import { QueryValue, QueryValueObject } from 'fauna';
import { FQLEntry } from './FQLEntry.js';

export class FaunaMethodCall<T extends QueryValue> extends FQLEntry {
  public args: QueryValue[];
  public force: boolean = false;

  constructor(public name: string, ...args: QueryValue[]) {
    super();
    this.args = args ?? [];
  }

  get fqlType(): T {
    throw new Error('Only used for typing');
  }

  public forced() {
    this.force = true;
    return this;
  }

  public toFQL(): [string, QueryValueObject] {
    const [superQuery, superArgs] = super.toFQL();
    const fnArgs = this.args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
      .join(',');
    return [`${superQuery}${this.force ? '!' : ''}.${this.name}(${fnArgs})`, superArgs];
  }
}
