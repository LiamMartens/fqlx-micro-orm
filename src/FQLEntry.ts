import { QueryValue, QueryValueObject } from 'fauna';

export abstract class FQLEntry {
  abstract get fqlType(): unknown;

  // chain is reversed -> goes from last item to first
  public chain: FQLEntry[] = [];

  public arguments: QueryValueObject = {};

  public link<T extends typeof this>(entry: FQLEntry): T {
    this.chain.push(entry);
    return this as unknown as T;
  }

  public mergeArguments<T extends typeof this>(next: QueryValueObject): T {
    Object.assign(this.arguments, next);
    return this as unknown as T;
  }

  public toFQL(): [string, QueryValueObject] {
    let fql = '';
    let merged: QueryValueObject = {};
    this.chain.forEach((entry) => {
      const [entryQuery, entryArgs] = entry.toFQL();
      fql = entryQuery + fql;
      Object.assign(merged, entryArgs);
    });
    Object.assign(merged, this.arguments);
    return [fql, merged];
  }
}
