// https://dev.to/tylim88/typescript-generate-full-path-type-and-get-value-type-for-nested-object-4hi

export type OptionalIf<S, V> = S extends true ? V | null : V;

export type DeepKey<T, K extends keyof T = keyof T> = K extends string | number
  ? T[K] extends infer R
    ?
        | `${K}`
        | (R extends Record<string, unknown> ? `${K}.${DeepKey<R>}` : never)
    : never // impossible route
  : never; // impossible route

export type DeepValue<
  T,
  P extends DeepKey<T>,
  IsOptional extends boolean = false
> = P extends `${infer K}.${infer Rest}`
  ? T[(K extends `${infer R extends number}` ? R : K) & keyof T] extends infer S
    ? S extends never // make S distributive to work with union object
      ? never
      : Rest extends DeepKey<S>
      ? DeepValue<
          S,
          Rest,
          T[(K extends `${infer R extends number}` ? R : K) &
            keyof T] extends NonNullable<
            T[(K extends `${infer R extends number}` ? R : K) & keyof T]
          >
            ? false
            : true
        >
      : never // impossible route
    : never // impossible route
  : OptionalIf<
      IsOptional,
      T[(P extends `${infer R extends number}` ? R : P) & keyof T]
    >;
