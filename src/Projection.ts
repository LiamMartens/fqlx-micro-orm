import { FQLEntry } from './FQLEntry.js';
import type { QueryValue, QueryValueObject } from 'fauna';
import type { DeepKey, DeepValue } from './type-utils/Deep.js';
import type { TypeOf } from 'zod';
import type { Collection } from './Collection.js';

export type ProjectionValue = QueryValue | QueryValue[];
export type ActualItemType<T> = NonNullable<T extends Array<infer V> ? V : T>;
export type KeysOfItems<T> = T extends Array<infer V> ? keyof V : keyof T;
export type DeepKeysOfItems<T> = DeepKey<ActualItemType<T>>;
export type PickFromProjectionValue<
  T extends ProjectionValue,
  K extends KeysOfItems<T>
> = T extends Array<any>
  ? Pick<T[number], K>[]
  : T extends NonNullable<T>
  ? Pick<T, K>
  : Pick<NonNullable<T>, K> | null;
export type OptionalIf<T, V> = T extends NonNullable<T> ? V : V | null;
export type ArrayIf<T, V> = T extends Array<any> ? V[] : V;
export type ExtractRefCollName<T> = T extends { coll: { name: infer Name } }
  ? Name extends string
    ? Name
    : never
  : never;

export class Projection<
  In extends ProjectionValue,
  Keys extends KeysOfItems<In> = KeysOfItems<In>,
  Subprojections extends Record<string, any> = {},
  IsSetProjection extends boolean = false
> extends FQLEntry {
  constructor(
    public pick: Keys[],
    public path: string | null = null,
    public subprojections?: Record<string, string | Projection<any, any, any, false>>
  ) {
    super();
  }

  get fqlType(): OptionalIf<
    In,
    PickFromProjectionValue<In, Keys> & {
      [K in keyof Subprojections]: Subprojections[K];
    }
  > {
    throw new Error('Only used for typing');
  }

  public alias = <
    K extends string,
    Subkey extends DeepKeysOfItems<In>,
    SelectedValue extends DeepValue<ActualItemType<In>, Subkey> = DeepValue<
      ActualItemType<In>,
      Subkey
    >,
    MergedSubprojections extends Subprojections & {
      [key in K]: SelectedValue;
    } = Subprojections & {
      [key in K]: SelectedValue;
    }
  >(
    key: K,
    path: Subkey
  ): Projection<In, Keys, MergedSubprojections> => {
    const proj = new Projection<In, Keys, MergedSubprojections, IsSetProjection>(
      this.pick,
      this.path,
      {
        [key]: `.${path}`,
      }
    );

    if (this.chain.length === 0) return proj;
    return proj.link(this.chain[this.chain.length - 1]);
  };

  public resolve = <
    K extends string,
    Subkey extends DeepKeysOfItems<In>,
    PickKeys extends keyof TypeOf<C['completeSchema']>,
    C extends Collection<any, CollectionName>,
    SelectedValue extends DeepValue<ActualItemType<In>, Subkey> = DeepValue<
      ActualItemType<In>,
      Subkey
    >,
    CollectionName extends ExtractRefCollName<
      ActualItemType<SelectedValue>
    > = ExtractRefCollName<ActualItemType<SelectedValue>>,
    PickedValue extends Pick<TypeOf<C['completeSchema']>, PickKeys> = Pick<
      TypeOf<C['completeSchema']>,
      PickKeys
    >,
    MergedSubprojections extends Subprojections & {
      [key in K]: OptionalIf<
        SelectedValue,
        ArrayIf<NonNullable<SelectedValue>, PickedValue | null>
      >;
    } = Subprojections & {
      [key in K]: OptionalIf<
        SelectedValue,
        ArrayIf<NonNullable<SelectedValue>, PickedValue | null>
      >;
    }
  >(
    key: K,
    path: Subkey,
    keys: PickKeys[],
    collection: C
  ): Projection<In, Keys, MergedSubprojections, IsSetProjection> => {
    const proj = new Projection<In, Keys, MergedSubprojections, IsSetProjection>(
      this.pick,
      this.path,
      {
        [key]: `.${path} {${keys.join(',')}}`,
      }
    );

    if (this.chain.length === 0) return proj;
    return proj.link(this.chain[this.chain.length - 1]);
  };

  public nest = <
    K extends string,
    Subkey extends DeepKeysOfItems<In>,
    SelectedValue extends DeepValue<ActualItemType<In>, Subkey> = DeepValue<
      ActualItemType<In>,
      Subkey
    >,
    NormalSelectedValue extends OptionalIf<
      SelectedValue,
      NonNullable<SelectedValue>
    > = OptionalIf<SelectedValue, NonNullable<SelectedValue>>,
    PickKeys extends KeysOfItems<NormalSelectedValue> = KeysOfItems<NormalSelectedValue>,
    MergedSubprojections extends Subprojections & {
      [key in K]: ArrayIf<
        NonNullable<NormalSelectedValue>,
        OptionalIf<
          NormalSelectedValue,
          Pick<NonNullable<NormalSelectedValue>, PickKeys>
        >
      >;
    } = Subprojections & {
      [key in K]: ArrayIf<
        NonNullable<NormalSelectedValue>,
        OptionalIf<
          NormalSelectedValue,
          Pick<NonNullable<NormalSelectedValue>, PickKeys>
        >
      >;
    }
  >(
    key: K,
    path: Subkey,
    pick: PickKeys[]
  ): Projection<In, Keys, MergedSubprojections, IsSetProjection> => {
    const proj = new Projection<In, Keys, MergedSubprojections, IsSetProjection>(
      this.pick,
      this.path,
      {
        [key]: new Projection<NormalSelectedValue, PickKeys, {}>(pick, path),
      }
    );

    if (this.chain.length === 0) return proj;
    return proj.link(this.chain[this.chain.length - 1]);
  };

  public toFQL(): [string, QueryValueObject] {
    const [superQuery, superArgs] = super.toFQL();
    const pickFields = this.pick.join(',');
    const subqueryFields = Object.entries(this.subprojections ?? {})
      .map(
        ([key, projection]) =>
          `${key}:${
            typeof projection === 'string' ? projection : projection.toFQL()[0]
          }`
      )
      .join(',');

    return [
      `${superQuery}${this.path ? `.${this.path}` : ''}{${[
        pickFields,
        subqueryFields,
      ]
        .filter(Boolean)
        .join(',')}}`,
      Object.assign(superArgs, this.arguments),
    ];
  }
}
