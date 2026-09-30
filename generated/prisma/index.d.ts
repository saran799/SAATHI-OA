
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Worker
 * 
 */
export type Worker = $Result.DefaultSelection<Prisma.$WorkerPayload>
/**
 * Model Patient
 * 
 */
export type Patient = $Result.DefaultSelection<Prisma.$PatientPayload>
/**
 * Model ScreeningRecord
 * 
 */
export type ScreeningRecord = $Result.DefaultSelection<Prisma.$ScreeningRecordPayload>
/**
 * Model TestResult
 * 
 */
export type TestResult = $Result.DefaultSelection<Prisma.$TestResultPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Workers
 * const workers = await prisma.worker.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Workers
   * const workers = await prisma.worker.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.worker`: Exposes CRUD operations for the **Worker** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Workers
    * const workers = await prisma.worker.findMany()
    * ```
    */
  get worker(): Prisma.WorkerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.patient`: Exposes CRUD operations for the **Patient** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Patients
    * const patients = await prisma.patient.findMany()
    * ```
    */
  get patient(): Prisma.PatientDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.screeningRecord`: Exposes CRUD operations for the **ScreeningRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ScreeningRecords
    * const screeningRecords = await prisma.screeningRecord.findMany()
    * ```
    */
  get screeningRecord(): Prisma.ScreeningRecordDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.testResult`: Exposes CRUD operations for the **TestResult** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TestResults
    * const testResults = await prisma.testResult.findMany()
    * ```
    */
  get testResult(): Prisma.TestResultDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.10.0
   * Query Engine version: 0edf323efd1d98336f3f0a68684b56f689b900d3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Worker: 'Worker',
    Patient: 'Patient',
    ScreeningRecord: 'ScreeningRecord',
    TestResult: 'TestResult'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "worker" | "patient" | "screeningRecord" | "testResult"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Worker: {
        payload: Prisma.$WorkerPayload<ExtArgs>
        fields: Prisma.WorkerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload>
          }
          findFirst: {
            args: Prisma.WorkerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload>
          }
          findMany: {
            args: Prisma.WorkerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload>[]
          }
          create: {
            args: Prisma.WorkerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload>
          }
          createMany: {
            args: Prisma.WorkerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload>[]
          }
          delete: {
            args: Prisma.WorkerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload>
          }
          update: {
            args: Prisma.WorkerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload>
          }
          deleteMany: {
            args: Prisma.WorkerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WorkerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload>[]
          }
          upsert: {
            args: Prisma.WorkerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkerPayload>
          }
          aggregate: {
            args: Prisma.WorkerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorker>
          }
          groupBy: {
            args: Prisma.WorkerGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkerGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkerCountArgs<ExtArgs>
            result: $Utils.Optional<WorkerCountAggregateOutputType> | number
          }
        }
      }
      Patient: {
        payload: Prisma.$PatientPayload<ExtArgs>
        fields: Prisma.PatientFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PatientFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PatientFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          findFirst: {
            args: Prisma.PatientFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PatientFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          findMany: {
            args: Prisma.PatientFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>[]
          }
          create: {
            args: Prisma.PatientCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          createMany: {
            args: Prisma.PatientCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PatientCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>[]
          }
          delete: {
            args: Prisma.PatientDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          update: {
            args: Prisma.PatientUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          deleteMany: {
            args: Prisma.PatientDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PatientUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PatientUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>[]
          }
          upsert: {
            args: Prisma.PatientUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          aggregate: {
            args: Prisma.PatientAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePatient>
          }
          groupBy: {
            args: Prisma.PatientGroupByArgs<ExtArgs>
            result: $Utils.Optional<PatientGroupByOutputType>[]
          }
          count: {
            args: Prisma.PatientCountArgs<ExtArgs>
            result: $Utils.Optional<PatientCountAggregateOutputType> | number
          }
        }
      }
      ScreeningRecord: {
        payload: Prisma.$ScreeningRecordPayload<ExtArgs>
        fields: Prisma.ScreeningRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScreeningRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScreeningRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload>
          }
          findFirst: {
            args: Prisma.ScreeningRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScreeningRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload>
          }
          findMany: {
            args: Prisma.ScreeningRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload>[]
          }
          create: {
            args: Prisma.ScreeningRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload>
          }
          createMany: {
            args: Prisma.ScreeningRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScreeningRecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload>[]
          }
          delete: {
            args: Prisma.ScreeningRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload>
          }
          update: {
            args: Prisma.ScreeningRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload>
          }
          deleteMany: {
            args: Prisma.ScreeningRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScreeningRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ScreeningRecordUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload>[]
          }
          upsert: {
            args: Prisma.ScreeningRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScreeningRecordPayload>
          }
          aggregate: {
            args: Prisma.ScreeningRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateScreeningRecord>
          }
          groupBy: {
            args: Prisma.ScreeningRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScreeningRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScreeningRecordCountArgs<ExtArgs>
            result: $Utils.Optional<ScreeningRecordCountAggregateOutputType> | number
          }
        }
      }
      TestResult: {
        payload: Prisma.$TestResultPayload<ExtArgs>
        fields: Prisma.TestResultFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TestResultFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TestResultFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload>
          }
          findFirst: {
            args: Prisma.TestResultFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TestResultFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload>
          }
          findMany: {
            args: Prisma.TestResultFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload>[]
          }
          create: {
            args: Prisma.TestResultCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload>
          }
          createMany: {
            args: Prisma.TestResultCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TestResultCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload>[]
          }
          delete: {
            args: Prisma.TestResultDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload>
          }
          update: {
            args: Prisma.TestResultUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload>
          }
          deleteMany: {
            args: Prisma.TestResultDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TestResultUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TestResultUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload>[]
          }
          upsert: {
            args: Prisma.TestResultUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestResultPayload>
          }
          aggregate: {
            args: Prisma.TestResultAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTestResult>
          }
          groupBy: {
            args: Prisma.TestResultGroupByArgs<ExtArgs>
            result: $Utils.Optional<TestResultGroupByOutputType>[]
          }
          count: {
            args: Prisma.TestResultCountArgs<ExtArgs>
            result: $Utils.Optional<TestResultCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    worker?: WorkerOmit
    patient?: PatientOmit
    screeningRecord?: ScreeningRecordOmit
    testResult?: TestResultOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type WorkerCountOutputType
   */

  export type WorkerCountOutputType = {
    records: number
  }

  export type WorkerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | WorkerCountOutputTypeCountRecordsArgs
  }

  // Custom InputTypes
  /**
   * WorkerCountOutputType without action
   */
  export type WorkerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkerCountOutputType
     */
    select?: WorkerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WorkerCountOutputType without action
   */
  export type WorkerCountOutputTypeCountRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScreeningRecordWhereInput
  }


  /**
   * Count Type PatientCountOutputType
   */

  export type PatientCountOutputType = {
    records: number
  }

  export type PatientCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | PatientCountOutputTypeCountRecordsArgs
  }

  // Custom InputTypes
  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientCountOutputType
     */
    select?: PatientCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeCountRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScreeningRecordWhereInput
  }


  /**
   * Count Type ScreeningRecordCountOutputType
   */

  export type ScreeningRecordCountOutputType = {
    tests: number
  }

  export type ScreeningRecordCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tests?: boolean | ScreeningRecordCountOutputTypeCountTestsArgs
  }

  // Custom InputTypes
  /**
   * ScreeningRecordCountOutputType without action
   */
  export type ScreeningRecordCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecordCountOutputType
     */
    select?: ScreeningRecordCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ScreeningRecordCountOutputType without action
   */
  export type ScreeningRecordCountOutputTypeCountTestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestResultWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Worker
   */

  export type AggregateWorker = {
    _count: WorkerCountAggregateOutputType | null
    _min: WorkerMinAggregateOutputType | null
    _max: WorkerMaxAggregateOutputType | null
  }

  export type WorkerMinAggregateOutputType = {
    id: string | null
    username: string | null
    passwordHash: string | null
    name: string | null
    role: string | null
    createdAt: Date | null
  }

  export type WorkerMaxAggregateOutputType = {
    id: string | null
    username: string | null
    passwordHash: string | null
    name: string | null
    role: string | null
    createdAt: Date | null
  }

  export type WorkerCountAggregateOutputType = {
    id: number
    username: number
    passwordHash: number
    name: number
    role: number
    createdAt: number
    _all: number
  }


  export type WorkerMinAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    name?: true
    role?: true
    createdAt?: true
  }

  export type WorkerMaxAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    name?: true
    role?: true
    createdAt?: true
  }

  export type WorkerCountAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    name?: true
    role?: true
    createdAt?: true
    _all?: true
  }

  export type WorkerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Worker to aggregate.
     */
    where?: WorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Workers to fetch.
     */
    orderBy?: WorkerOrderByWithRelationInput | WorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Workers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Workers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Workers
    **/
    _count?: true | WorkerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkerMaxAggregateInputType
  }

  export type GetWorkerAggregateType<T extends WorkerAggregateArgs> = {
        [P in keyof T & keyof AggregateWorker]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorker[P]>
      : GetScalarType<T[P], AggregateWorker[P]>
  }




  export type WorkerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkerWhereInput
    orderBy?: WorkerOrderByWithAggregationInput | WorkerOrderByWithAggregationInput[]
    by: WorkerScalarFieldEnum[] | WorkerScalarFieldEnum
    having?: WorkerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkerCountAggregateInputType | true
    _min?: WorkerMinAggregateInputType
    _max?: WorkerMaxAggregateInputType
  }

  export type WorkerGroupByOutputType = {
    id: string
    username: string
    passwordHash: string
    name: string
    role: string
    createdAt: Date
    _count: WorkerCountAggregateOutputType | null
    _min: WorkerMinAggregateOutputType | null
    _max: WorkerMaxAggregateOutputType | null
  }

  type GetWorkerGroupByPayload<T extends WorkerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkerGroupByOutputType[P]>
            : GetScalarType<T[P], WorkerGroupByOutputType[P]>
        }
      >
    >


  export type WorkerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    records?: boolean | Worker$recordsArgs<ExtArgs>
    _count?: boolean | WorkerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["worker"]>

  export type WorkerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["worker"]>

  export type WorkerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["worker"]>

  export type WorkerSelectScalar = {
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
  }

  export type WorkerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "passwordHash" | "name" | "role" | "createdAt", ExtArgs["result"]["worker"]>
  export type WorkerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | Worker$recordsArgs<ExtArgs>
    _count?: boolean | WorkerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WorkerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type WorkerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $WorkerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Worker"
    objects: {
      records: Prisma.$ScreeningRecordPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      username: string
      passwordHash: string
      name: string
      role: string
      createdAt: Date
    }, ExtArgs["result"]["worker"]>
    composites: {}
  }

  type WorkerGetPayload<S extends boolean | null | undefined | WorkerDefaultArgs> = $Result.GetResult<Prisma.$WorkerPayload, S>

  type WorkerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WorkerCountAggregateInputType | true
    }

  export interface WorkerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Worker'], meta: { name: 'Worker' } }
    /**
     * Find zero or one Worker that matches the filter.
     * @param {WorkerFindUniqueArgs} args - Arguments to find a Worker
     * @example
     * // Get one Worker
     * const worker = await prisma.worker.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkerFindUniqueArgs>(args: SelectSubset<T, WorkerFindUniqueArgs<ExtArgs>>): Prisma__WorkerClient<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Worker that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkerFindUniqueOrThrowArgs} args - Arguments to find a Worker
     * @example
     * // Get one Worker
     * const worker = await prisma.worker.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkerFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkerClient<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Worker that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerFindFirstArgs} args - Arguments to find a Worker
     * @example
     * // Get one Worker
     * const worker = await prisma.worker.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkerFindFirstArgs>(args?: SelectSubset<T, WorkerFindFirstArgs<ExtArgs>>): Prisma__WorkerClient<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Worker that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerFindFirstOrThrowArgs} args - Arguments to find a Worker
     * @example
     * // Get one Worker
     * const worker = await prisma.worker.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkerFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkerFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkerClient<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Workers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Workers
     * const workers = await prisma.worker.findMany()
     * 
     * // Get first 10 Workers
     * const workers = await prisma.worker.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workerWithIdOnly = await prisma.worker.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkerFindManyArgs>(args?: SelectSubset<T, WorkerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Worker.
     * @param {WorkerCreateArgs} args - Arguments to create a Worker.
     * @example
     * // Create one Worker
     * const Worker = await prisma.worker.create({
     *   data: {
     *     // ... data to create a Worker
     *   }
     * })
     * 
     */
    create<T extends WorkerCreateArgs>(args: SelectSubset<T, WorkerCreateArgs<ExtArgs>>): Prisma__WorkerClient<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Workers.
     * @param {WorkerCreateManyArgs} args - Arguments to create many Workers.
     * @example
     * // Create many Workers
     * const worker = await prisma.worker.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkerCreateManyArgs>(args?: SelectSubset<T, WorkerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Workers and returns the data saved in the database.
     * @param {WorkerCreateManyAndReturnArgs} args - Arguments to create many Workers.
     * @example
     * // Create many Workers
     * const worker = await prisma.worker.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Workers and only return the `id`
     * const workerWithIdOnly = await prisma.worker.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkerCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Worker.
     * @param {WorkerDeleteArgs} args - Arguments to delete one Worker.
     * @example
     * // Delete one Worker
     * const Worker = await prisma.worker.delete({
     *   where: {
     *     // ... filter to delete one Worker
     *   }
     * })
     * 
     */
    delete<T extends WorkerDeleteArgs>(args: SelectSubset<T, WorkerDeleteArgs<ExtArgs>>): Prisma__WorkerClient<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Worker.
     * @param {WorkerUpdateArgs} args - Arguments to update one Worker.
     * @example
     * // Update one Worker
     * const worker = await prisma.worker.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkerUpdateArgs>(args: SelectSubset<T, WorkerUpdateArgs<ExtArgs>>): Prisma__WorkerClient<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Workers.
     * @param {WorkerDeleteManyArgs} args - Arguments to filter Workers to delete.
     * @example
     * // Delete a few Workers
     * const { count } = await prisma.worker.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkerDeleteManyArgs>(args?: SelectSubset<T, WorkerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Workers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Workers
     * const worker = await prisma.worker.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkerUpdateManyArgs>(args: SelectSubset<T, WorkerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Workers and returns the data updated in the database.
     * @param {WorkerUpdateManyAndReturnArgs} args - Arguments to update many Workers.
     * @example
     * // Update many Workers
     * const worker = await prisma.worker.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Workers and only return the `id`
     * const workerWithIdOnly = await prisma.worker.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WorkerUpdateManyAndReturnArgs>(args: SelectSubset<T, WorkerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Worker.
     * @param {WorkerUpsertArgs} args - Arguments to update or create a Worker.
     * @example
     * // Update or create a Worker
     * const worker = await prisma.worker.upsert({
     *   create: {
     *     // ... data to create a Worker
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Worker we want to update
     *   }
     * })
     */
    upsert<T extends WorkerUpsertArgs>(args: SelectSubset<T, WorkerUpsertArgs<ExtArgs>>): Prisma__WorkerClient<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Workers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerCountArgs} args - Arguments to filter Workers to count.
     * @example
     * // Count the number of Workers
     * const count = await prisma.worker.count({
     *   where: {
     *     // ... the filter for the Workers we want to count
     *   }
     * })
    **/
    count<T extends WorkerCountArgs>(
      args?: Subset<T, WorkerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Worker.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WorkerAggregateArgs>(args: Subset<T, WorkerAggregateArgs>): Prisma.PrismaPromise<GetWorkerAggregateType<T>>

    /**
     * Group by Worker.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WorkerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkerGroupByArgs['orderBy'] }
        : { orderBy?: WorkerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WorkerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Worker model
   */
  readonly fields: WorkerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Worker.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    records<T extends Worker$recordsArgs<ExtArgs> = {}>(args?: Subset<T, Worker$recordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Worker model
   */
  interface WorkerFieldRefs {
    readonly id: FieldRef<"Worker", 'String'>
    readonly username: FieldRef<"Worker", 'String'>
    readonly passwordHash: FieldRef<"Worker", 'String'>
    readonly name: FieldRef<"Worker", 'String'>
    readonly role: FieldRef<"Worker", 'String'>
    readonly createdAt: FieldRef<"Worker", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Worker findUnique
   */
  export type WorkerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
    /**
     * Filter, which Worker to fetch.
     */
    where: WorkerWhereUniqueInput
  }

  /**
   * Worker findUniqueOrThrow
   */
  export type WorkerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
    /**
     * Filter, which Worker to fetch.
     */
    where: WorkerWhereUniqueInput
  }

  /**
   * Worker findFirst
   */
  export type WorkerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
    /**
     * Filter, which Worker to fetch.
     */
    where?: WorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Workers to fetch.
     */
    orderBy?: WorkerOrderByWithRelationInput | WorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Workers.
     */
    cursor?: WorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Workers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Workers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Workers.
     */
    distinct?: WorkerScalarFieldEnum | WorkerScalarFieldEnum[]
  }

  /**
   * Worker findFirstOrThrow
   */
  export type WorkerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
    /**
     * Filter, which Worker to fetch.
     */
    where?: WorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Workers to fetch.
     */
    orderBy?: WorkerOrderByWithRelationInput | WorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Workers.
     */
    cursor?: WorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Workers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Workers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Workers.
     */
    distinct?: WorkerScalarFieldEnum | WorkerScalarFieldEnum[]
  }

  /**
   * Worker findMany
   */
  export type WorkerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
    /**
     * Filter, which Workers to fetch.
     */
    where?: WorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Workers to fetch.
     */
    orderBy?: WorkerOrderByWithRelationInput | WorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Workers.
     */
    cursor?: WorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Workers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Workers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Workers.
     */
    distinct?: WorkerScalarFieldEnum | WorkerScalarFieldEnum[]
  }

  /**
   * Worker create
   */
  export type WorkerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
    /**
     * The data needed to create a Worker.
     */
    data: XOR<WorkerCreateInput, WorkerUncheckedCreateInput>
  }

  /**
   * Worker createMany
   */
  export type WorkerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Workers.
     */
    data: WorkerCreateManyInput | WorkerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Worker createManyAndReturn
   */
  export type WorkerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * The data used to create many Workers.
     */
    data: WorkerCreateManyInput | WorkerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Worker update
   */
  export type WorkerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
    /**
     * The data needed to update a Worker.
     */
    data: XOR<WorkerUpdateInput, WorkerUncheckedUpdateInput>
    /**
     * Choose, which Worker to update.
     */
    where: WorkerWhereUniqueInput
  }

  /**
   * Worker updateMany
   */
  export type WorkerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Workers.
     */
    data: XOR<WorkerUpdateManyMutationInput, WorkerUncheckedUpdateManyInput>
    /**
     * Filter which Workers to update
     */
    where?: WorkerWhereInput
    /**
     * Limit how many Workers to update.
     */
    limit?: number
  }

  /**
   * Worker updateManyAndReturn
   */
  export type WorkerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * The data used to update Workers.
     */
    data: XOR<WorkerUpdateManyMutationInput, WorkerUncheckedUpdateManyInput>
    /**
     * Filter which Workers to update
     */
    where?: WorkerWhereInput
    /**
     * Limit how many Workers to update.
     */
    limit?: number
  }

  /**
   * Worker upsert
   */
  export type WorkerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
    /**
     * The filter to search for the Worker to update in case it exists.
     */
    where: WorkerWhereUniqueInput
    /**
     * In case the Worker found by the `where` argument doesn't exist, create a new Worker with this data.
     */
    create: XOR<WorkerCreateInput, WorkerUncheckedCreateInput>
    /**
     * In case the Worker was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkerUpdateInput, WorkerUncheckedUpdateInput>
  }

  /**
   * Worker delete
   */
  export type WorkerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
    /**
     * Filter which Worker to delete.
     */
    where: WorkerWhereUniqueInput
  }

  /**
   * Worker deleteMany
   */
  export type WorkerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Workers to delete
     */
    where?: WorkerWhereInput
    /**
     * Limit how many Workers to delete.
     */
    limit?: number
  }

  /**
   * Worker.records
   */
  export type Worker$recordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    where?: ScreeningRecordWhereInput
    orderBy?: ScreeningRecordOrderByWithRelationInput | ScreeningRecordOrderByWithRelationInput[]
    cursor?: ScreeningRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScreeningRecordScalarFieldEnum | ScreeningRecordScalarFieldEnum[]
  }

  /**
   * Worker without action
   */
  export type WorkerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Worker
     */
    select?: WorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Worker
     */
    omit?: WorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInclude<ExtArgs> | null
  }


  /**
   * Model Patient
   */

  export type AggregatePatient = {
    _count: PatientCountAggregateOutputType | null
    _avg: PatientAvgAggregateOutputType | null
    _sum: PatientSumAggregateOutputType | null
    _min: PatientMinAggregateOutputType | null
    _max: PatientMaxAggregateOutputType | null
  }

  export type PatientAvgAggregateOutputType = {
    age: number | null
    heightCm: number | null
    weightKg: number | null
  }

  export type PatientSumAggregateOutputType = {
    age: number | null
    heightCm: number | null
    weightKg: number | null
  }

  export type PatientMinAggregateOutputType = {
    id: string | null
    name: string | null
    age: number | null
    sex: string | null
    phone: string | null
    village: string | null
    phc: string | null
    healthId: string | null
    heightCm: number | null
    weightKg: number | null
    occupation: string | null
    priorInjury: boolean | null
    familyHistory: boolean | null
    createdAt: Date | null
  }

  export type PatientMaxAggregateOutputType = {
    id: string | null
    name: string | null
    age: number | null
    sex: string | null
    phone: string | null
    village: string | null
    phc: string | null
    healthId: string | null
    heightCm: number | null
    weightKg: number | null
    occupation: string | null
    priorInjury: boolean | null
    familyHistory: boolean | null
    createdAt: Date | null
  }

  export type PatientCountAggregateOutputType = {
    id: number
    name: number
    age: number
    sex: number
    phone: number
    village: number
    phc: number
    healthId: number
    heightCm: number
    weightKg: number
    occupation: number
    priorInjury: number
    familyHistory: number
    createdAt: number
    _all: number
  }


  export type PatientAvgAggregateInputType = {
    age?: true
    heightCm?: true
    weightKg?: true
  }

  export type PatientSumAggregateInputType = {
    age?: true
    heightCm?: true
    weightKg?: true
  }

  export type PatientMinAggregateInputType = {
    id?: true
    name?: true
    age?: true
    sex?: true
    phone?: true
    village?: true
    phc?: true
    healthId?: true
    heightCm?: true
    weightKg?: true
    occupation?: true
    priorInjury?: true
    familyHistory?: true
    createdAt?: true
  }

  export type PatientMaxAggregateInputType = {
    id?: true
    name?: true
    age?: true
    sex?: true
    phone?: true
    village?: true
    phc?: true
    healthId?: true
    heightCm?: true
    weightKg?: true
    occupation?: true
    priorInjury?: true
    familyHistory?: true
    createdAt?: true
  }

  export type PatientCountAggregateInputType = {
    id?: true
    name?: true
    age?: true
    sex?: true
    phone?: true
    village?: true
    phc?: true
    healthId?: true
    heightCm?: true
    weightKg?: true
    occupation?: true
    priorInjury?: true
    familyHistory?: true
    createdAt?: true
    _all?: true
  }

  export type PatientAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Patient to aggregate.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Patients
    **/
    _count?: true | PatientCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PatientAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PatientSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PatientMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PatientMaxAggregateInputType
  }

  export type GetPatientAggregateType<T extends PatientAggregateArgs> = {
        [P in keyof T & keyof AggregatePatient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePatient[P]>
      : GetScalarType<T[P], AggregatePatient[P]>
  }




  export type PatientGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PatientWhereInput
    orderBy?: PatientOrderByWithAggregationInput | PatientOrderByWithAggregationInput[]
    by: PatientScalarFieldEnum[] | PatientScalarFieldEnum
    having?: PatientScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PatientCountAggregateInputType | true
    _avg?: PatientAvgAggregateInputType
    _sum?: PatientSumAggregateInputType
    _min?: PatientMinAggregateInputType
    _max?: PatientMaxAggregateInputType
  }

  export type PatientGroupByOutputType = {
    id: string
    name: string
    age: number
    sex: string
    phone: string
    village: string
    phc: string
    healthId: string | null
    heightCm: number | null
    weightKg: number | null
    occupation: string
    priorInjury: boolean
    familyHistory: boolean
    createdAt: Date
    _count: PatientCountAggregateOutputType | null
    _avg: PatientAvgAggregateOutputType | null
    _sum: PatientSumAggregateOutputType | null
    _min: PatientMinAggregateOutputType | null
    _max: PatientMaxAggregateOutputType | null
  }

  type GetPatientGroupByPayload<T extends PatientGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PatientGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PatientGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PatientGroupByOutputType[P]>
            : GetScalarType<T[P], PatientGroupByOutputType[P]>
        }
      >
    >


  export type PatientSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    age?: boolean
    sex?: boolean
    phone?: boolean
    village?: boolean
    phc?: boolean
    healthId?: boolean
    heightCm?: boolean
    weightKg?: boolean
    occupation?: boolean
    priorInjury?: boolean
    familyHistory?: boolean
    createdAt?: boolean
    records?: boolean | Patient$recordsArgs<ExtArgs>
    _count?: boolean | PatientCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["patient"]>

  export type PatientSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    age?: boolean
    sex?: boolean
    phone?: boolean
    village?: boolean
    phc?: boolean
    healthId?: boolean
    heightCm?: boolean
    weightKg?: boolean
    occupation?: boolean
    priorInjury?: boolean
    familyHistory?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["patient"]>

  export type PatientSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    age?: boolean
    sex?: boolean
    phone?: boolean
    village?: boolean
    phc?: boolean
    healthId?: boolean
    heightCm?: boolean
    weightKg?: boolean
    occupation?: boolean
    priorInjury?: boolean
    familyHistory?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["patient"]>

  export type PatientSelectScalar = {
    id?: boolean
    name?: boolean
    age?: boolean
    sex?: boolean
    phone?: boolean
    village?: boolean
    phc?: boolean
    healthId?: boolean
    heightCm?: boolean
    weightKg?: boolean
    occupation?: boolean
    priorInjury?: boolean
    familyHistory?: boolean
    createdAt?: boolean
  }

  export type PatientOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "age" | "sex" | "phone" | "village" | "phc" | "healthId" | "heightCm" | "weightKg" | "occupation" | "priorInjury" | "familyHistory" | "createdAt", ExtArgs["result"]["patient"]>
  export type PatientInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | Patient$recordsArgs<ExtArgs>
    _count?: boolean | PatientCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PatientIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PatientIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PatientPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Patient"
    objects: {
      records: Prisma.$ScreeningRecordPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      age: number
      sex: string
      phone: string
      village: string
      phc: string
      healthId: string | null
      heightCm: number | null
      weightKg: number | null
      occupation: string
      priorInjury: boolean
      familyHistory: boolean
      createdAt: Date
    }, ExtArgs["result"]["patient"]>
    composites: {}
  }

  type PatientGetPayload<S extends boolean | null | undefined | PatientDefaultArgs> = $Result.GetResult<Prisma.$PatientPayload, S>

  type PatientCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PatientFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PatientCountAggregateInputType | true
    }

  export interface PatientDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Patient'], meta: { name: 'Patient' } }
    /**
     * Find zero or one Patient that matches the filter.
     * @param {PatientFindUniqueArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PatientFindUniqueArgs>(args: SelectSubset<T, PatientFindUniqueArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Patient that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PatientFindUniqueOrThrowArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PatientFindUniqueOrThrowArgs>(args: SelectSubset<T, PatientFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Patient that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientFindFirstArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PatientFindFirstArgs>(args?: SelectSubset<T, PatientFindFirstArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Patient that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientFindFirstOrThrowArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PatientFindFirstOrThrowArgs>(args?: SelectSubset<T, PatientFindFirstOrThrowArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Patients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Patients
     * const patients = await prisma.patient.findMany()
     * 
     * // Get first 10 Patients
     * const patients = await prisma.patient.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const patientWithIdOnly = await prisma.patient.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PatientFindManyArgs>(args?: SelectSubset<T, PatientFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Patient.
     * @param {PatientCreateArgs} args - Arguments to create a Patient.
     * @example
     * // Create one Patient
     * const Patient = await prisma.patient.create({
     *   data: {
     *     // ... data to create a Patient
     *   }
     * })
     * 
     */
    create<T extends PatientCreateArgs>(args: SelectSubset<T, PatientCreateArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Patients.
     * @param {PatientCreateManyArgs} args - Arguments to create many Patients.
     * @example
     * // Create many Patients
     * const patient = await prisma.patient.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PatientCreateManyArgs>(args?: SelectSubset<T, PatientCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Patients and returns the data saved in the database.
     * @param {PatientCreateManyAndReturnArgs} args - Arguments to create many Patients.
     * @example
     * // Create many Patients
     * const patient = await prisma.patient.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Patients and only return the `id`
     * const patientWithIdOnly = await prisma.patient.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PatientCreateManyAndReturnArgs>(args?: SelectSubset<T, PatientCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Patient.
     * @param {PatientDeleteArgs} args - Arguments to delete one Patient.
     * @example
     * // Delete one Patient
     * const Patient = await prisma.patient.delete({
     *   where: {
     *     // ... filter to delete one Patient
     *   }
     * })
     * 
     */
    delete<T extends PatientDeleteArgs>(args: SelectSubset<T, PatientDeleteArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Patient.
     * @param {PatientUpdateArgs} args - Arguments to update one Patient.
     * @example
     * // Update one Patient
     * const patient = await prisma.patient.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PatientUpdateArgs>(args: SelectSubset<T, PatientUpdateArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Patients.
     * @param {PatientDeleteManyArgs} args - Arguments to filter Patients to delete.
     * @example
     * // Delete a few Patients
     * const { count } = await prisma.patient.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PatientDeleteManyArgs>(args?: SelectSubset<T, PatientDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Patients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Patients
     * const patient = await prisma.patient.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PatientUpdateManyArgs>(args: SelectSubset<T, PatientUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Patients and returns the data updated in the database.
     * @param {PatientUpdateManyAndReturnArgs} args - Arguments to update many Patients.
     * @example
     * // Update many Patients
     * const patient = await prisma.patient.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Patients and only return the `id`
     * const patientWithIdOnly = await prisma.patient.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PatientUpdateManyAndReturnArgs>(args: SelectSubset<T, PatientUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Patient.
     * @param {PatientUpsertArgs} args - Arguments to update or create a Patient.
     * @example
     * // Update or create a Patient
     * const patient = await prisma.patient.upsert({
     *   create: {
     *     // ... data to create a Patient
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Patient we want to update
     *   }
     * })
     */
    upsert<T extends PatientUpsertArgs>(args: SelectSubset<T, PatientUpsertArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Patients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientCountArgs} args - Arguments to filter Patients to count.
     * @example
     * // Count the number of Patients
     * const count = await prisma.patient.count({
     *   where: {
     *     // ... the filter for the Patients we want to count
     *   }
     * })
    **/
    count<T extends PatientCountArgs>(
      args?: Subset<T, PatientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PatientCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Patient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PatientAggregateArgs>(args: Subset<T, PatientAggregateArgs>): Prisma.PrismaPromise<GetPatientAggregateType<T>>

    /**
     * Group by Patient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PatientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PatientGroupByArgs['orderBy'] }
        : { orderBy?: PatientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PatientGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPatientGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Patient model
   */
  readonly fields: PatientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Patient.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PatientClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    records<T extends Patient$recordsArgs<ExtArgs> = {}>(args?: Subset<T, Patient$recordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Patient model
   */
  interface PatientFieldRefs {
    readonly id: FieldRef<"Patient", 'String'>
    readonly name: FieldRef<"Patient", 'String'>
    readonly age: FieldRef<"Patient", 'Int'>
    readonly sex: FieldRef<"Patient", 'String'>
    readonly phone: FieldRef<"Patient", 'String'>
    readonly village: FieldRef<"Patient", 'String'>
    readonly phc: FieldRef<"Patient", 'String'>
    readonly healthId: FieldRef<"Patient", 'String'>
    readonly heightCm: FieldRef<"Patient", 'Float'>
    readonly weightKg: FieldRef<"Patient", 'Float'>
    readonly occupation: FieldRef<"Patient", 'String'>
    readonly priorInjury: FieldRef<"Patient", 'Boolean'>
    readonly familyHistory: FieldRef<"Patient", 'Boolean'>
    readonly createdAt: FieldRef<"Patient", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Patient findUnique
   */
  export type PatientFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient findUniqueOrThrow
   */
  export type PatientFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient findFirst
   */
  export type PatientFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Patients.
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Patients.
     */
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * Patient findFirstOrThrow
   */
  export type PatientFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Patients.
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Patients.
     */
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * Patient findMany
   */
  export type PatientFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patients to fetch.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Patients.
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Patients.
     */
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * Patient create
   */
  export type PatientCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * The data needed to create a Patient.
     */
    data: XOR<PatientCreateInput, PatientUncheckedCreateInput>
  }

  /**
   * Patient createMany
   */
  export type PatientCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Patients.
     */
    data: PatientCreateManyInput | PatientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Patient createManyAndReturn
   */
  export type PatientCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * The data used to create many Patients.
     */
    data: PatientCreateManyInput | PatientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Patient update
   */
  export type PatientUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * The data needed to update a Patient.
     */
    data: XOR<PatientUpdateInput, PatientUncheckedUpdateInput>
    /**
     * Choose, which Patient to update.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient updateMany
   */
  export type PatientUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Patients.
     */
    data: XOR<PatientUpdateManyMutationInput, PatientUncheckedUpdateManyInput>
    /**
     * Filter which Patients to update
     */
    where?: PatientWhereInput
    /**
     * Limit how many Patients to update.
     */
    limit?: number
  }

  /**
   * Patient updateManyAndReturn
   */
  export type PatientUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * The data used to update Patients.
     */
    data: XOR<PatientUpdateManyMutationInput, PatientUncheckedUpdateManyInput>
    /**
     * Filter which Patients to update
     */
    where?: PatientWhereInput
    /**
     * Limit how many Patients to update.
     */
    limit?: number
  }

  /**
   * Patient upsert
   */
  export type PatientUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * The filter to search for the Patient to update in case it exists.
     */
    where: PatientWhereUniqueInput
    /**
     * In case the Patient found by the `where` argument doesn't exist, create a new Patient with this data.
     */
    create: XOR<PatientCreateInput, PatientUncheckedCreateInput>
    /**
     * In case the Patient was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PatientUpdateInput, PatientUncheckedUpdateInput>
  }

  /**
   * Patient delete
   */
  export type PatientDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter which Patient to delete.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient deleteMany
   */
  export type PatientDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Patients to delete
     */
    where?: PatientWhereInput
    /**
     * Limit how many Patients to delete.
     */
    limit?: number
  }

  /**
   * Patient.records
   */
  export type Patient$recordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    where?: ScreeningRecordWhereInput
    orderBy?: ScreeningRecordOrderByWithRelationInput | ScreeningRecordOrderByWithRelationInput[]
    cursor?: ScreeningRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ScreeningRecordScalarFieldEnum | ScreeningRecordScalarFieldEnum[]
  }

  /**
   * Patient without action
   */
  export type PatientDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
  }


  /**
   * Model ScreeningRecord
   */

  export type AggregateScreeningRecord = {
    _count: ScreeningRecordCountAggregateOutputType | null
    _min: ScreeningRecordMinAggregateOutputType | null
    _max: ScreeningRecordMaxAggregateOutputType | null
  }

  export type ScreeningRecordMinAggregateOutputType = {
    id: string | null
    patientId: string | null
    joint: string | null
    side: string | null
    createdAt: Date | null
    followUpDate: Date | null
    workerId: string | null
  }

  export type ScreeningRecordMaxAggregateOutputType = {
    id: string | null
    patientId: string | null
    joint: string | null
    side: string | null
    createdAt: Date | null
    followUpDate: Date | null
    workerId: string | null
  }

  export type ScreeningRecordCountAggregateOutputType = {
    id: number
    patientId: number
    joint: number
    side: number
    answers: number
    movement: number
    result: number
    createdAt: number
    followUpDate: number
    workerId: number
    _all: number
  }


  export type ScreeningRecordMinAggregateInputType = {
    id?: true
    patientId?: true
    joint?: true
    side?: true
    createdAt?: true
    followUpDate?: true
    workerId?: true
  }

  export type ScreeningRecordMaxAggregateInputType = {
    id?: true
    patientId?: true
    joint?: true
    side?: true
    createdAt?: true
    followUpDate?: true
    workerId?: true
  }

  export type ScreeningRecordCountAggregateInputType = {
    id?: true
    patientId?: true
    joint?: true
    side?: true
    answers?: true
    movement?: true
    result?: true
    createdAt?: true
    followUpDate?: true
    workerId?: true
    _all?: true
  }

  export type ScreeningRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScreeningRecord to aggregate.
     */
    where?: ScreeningRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScreeningRecords to fetch.
     */
    orderBy?: ScreeningRecordOrderByWithRelationInput | ScreeningRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScreeningRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScreeningRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScreeningRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ScreeningRecords
    **/
    _count?: true | ScreeningRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScreeningRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScreeningRecordMaxAggregateInputType
  }

  export type GetScreeningRecordAggregateType<T extends ScreeningRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateScreeningRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScreeningRecord[P]>
      : GetScalarType<T[P], AggregateScreeningRecord[P]>
  }




  export type ScreeningRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScreeningRecordWhereInput
    orderBy?: ScreeningRecordOrderByWithAggregationInput | ScreeningRecordOrderByWithAggregationInput[]
    by: ScreeningRecordScalarFieldEnum[] | ScreeningRecordScalarFieldEnum
    having?: ScreeningRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScreeningRecordCountAggregateInputType | true
    _min?: ScreeningRecordMinAggregateInputType
    _max?: ScreeningRecordMaxAggregateInputType
  }

  export type ScreeningRecordGroupByOutputType = {
    id: string
    patientId: string
    joint: string
    side: string
    answers: JsonValue
    movement: JsonValue | null
    result: JsonValue
    createdAt: Date
    followUpDate: Date | null
    workerId: string
    _count: ScreeningRecordCountAggregateOutputType | null
    _min: ScreeningRecordMinAggregateOutputType | null
    _max: ScreeningRecordMaxAggregateOutputType | null
  }

  type GetScreeningRecordGroupByPayload<T extends ScreeningRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScreeningRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScreeningRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScreeningRecordGroupByOutputType[P]>
            : GetScalarType<T[P], ScreeningRecordGroupByOutputType[P]>
        }
      >
    >


  export type ScreeningRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    joint?: boolean
    side?: boolean
    answers?: boolean
    movement?: boolean
    result?: boolean
    createdAt?: boolean
    followUpDate?: boolean
    workerId?: boolean
    worker?: boolean | WorkerDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    tests?: boolean | ScreeningRecord$testsArgs<ExtArgs>
    _count?: boolean | ScreeningRecordCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["screeningRecord"]>

  export type ScreeningRecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    joint?: boolean
    side?: boolean
    answers?: boolean
    movement?: boolean
    result?: boolean
    createdAt?: boolean
    followUpDate?: boolean
    workerId?: boolean
    worker?: boolean | WorkerDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["screeningRecord"]>

  export type ScreeningRecordSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    joint?: boolean
    side?: boolean
    answers?: boolean
    movement?: boolean
    result?: boolean
    createdAt?: boolean
    followUpDate?: boolean
    workerId?: boolean
    worker?: boolean | WorkerDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["screeningRecord"]>

  export type ScreeningRecordSelectScalar = {
    id?: boolean
    patientId?: boolean
    joint?: boolean
    side?: boolean
    answers?: boolean
    movement?: boolean
    result?: boolean
    createdAt?: boolean
    followUpDate?: boolean
    workerId?: boolean
  }

  export type ScreeningRecordOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "patientId" | "joint" | "side" | "answers" | "movement" | "result" | "createdAt" | "followUpDate" | "workerId", ExtArgs["result"]["screeningRecord"]>
  export type ScreeningRecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    worker?: boolean | WorkerDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    tests?: boolean | ScreeningRecord$testsArgs<ExtArgs>
    _count?: boolean | ScreeningRecordCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ScreeningRecordIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    worker?: boolean | WorkerDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }
  export type ScreeningRecordIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    worker?: boolean | WorkerDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }

  export type $ScreeningRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ScreeningRecord"
    objects: {
      worker: Prisma.$WorkerPayload<ExtArgs>
      patient: Prisma.$PatientPayload<ExtArgs>
      tests: Prisma.$TestResultPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      patientId: string
      joint: string
      side: string
      answers: Prisma.JsonValue
      movement: Prisma.JsonValue | null
      result: Prisma.JsonValue
      createdAt: Date
      followUpDate: Date | null
      workerId: string
    }, ExtArgs["result"]["screeningRecord"]>
    composites: {}
  }

  type ScreeningRecordGetPayload<S extends boolean | null | undefined | ScreeningRecordDefaultArgs> = $Result.GetResult<Prisma.$ScreeningRecordPayload, S>

  type ScreeningRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ScreeningRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ScreeningRecordCountAggregateInputType | true
    }

  export interface ScreeningRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ScreeningRecord'], meta: { name: 'ScreeningRecord' } }
    /**
     * Find zero or one ScreeningRecord that matches the filter.
     * @param {ScreeningRecordFindUniqueArgs} args - Arguments to find a ScreeningRecord
     * @example
     * // Get one ScreeningRecord
     * const screeningRecord = await prisma.screeningRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScreeningRecordFindUniqueArgs>(args: SelectSubset<T, ScreeningRecordFindUniqueArgs<ExtArgs>>): Prisma__ScreeningRecordClient<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ScreeningRecord that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScreeningRecordFindUniqueOrThrowArgs} args - Arguments to find a ScreeningRecord
     * @example
     * // Get one ScreeningRecord
     * const screeningRecord = await prisma.screeningRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScreeningRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, ScreeningRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScreeningRecordClient<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScreeningRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreeningRecordFindFirstArgs} args - Arguments to find a ScreeningRecord
     * @example
     * // Get one ScreeningRecord
     * const screeningRecord = await prisma.screeningRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScreeningRecordFindFirstArgs>(args?: SelectSubset<T, ScreeningRecordFindFirstArgs<ExtArgs>>): Prisma__ScreeningRecordClient<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScreeningRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreeningRecordFindFirstOrThrowArgs} args - Arguments to find a ScreeningRecord
     * @example
     * // Get one ScreeningRecord
     * const screeningRecord = await prisma.screeningRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScreeningRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, ScreeningRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScreeningRecordClient<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ScreeningRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreeningRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ScreeningRecords
     * const screeningRecords = await prisma.screeningRecord.findMany()
     * 
     * // Get first 10 ScreeningRecords
     * const screeningRecords = await prisma.screeningRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const screeningRecordWithIdOnly = await prisma.screeningRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScreeningRecordFindManyArgs>(args?: SelectSubset<T, ScreeningRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ScreeningRecord.
     * @param {ScreeningRecordCreateArgs} args - Arguments to create a ScreeningRecord.
     * @example
     * // Create one ScreeningRecord
     * const ScreeningRecord = await prisma.screeningRecord.create({
     *   data: {
     *     // ... data to create a ScreeningRecord
     *   }
     * })
     * 
     */
    create<T extends ScreeningRecordCreateArgs>(args: SelectSubset<T, ScreeningRecordCreateArgs<ExtArgs>>): Prisma__ScreeningRecordClient<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ScreeningRecords.
     * @param {ScreeningRecordCreateManyArgs} args - Arguments to create many ScreeningRecords.
     * @example
     * // Create many ScreeningRecords
     * const screeningRecord = await prisma.screeningRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScreeningRecordCreateManyArgs>(args?: SelectSubset<T, ScreeningRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ScreeningRecords and returns the data saved in the database.
     * @param {ScreeningRecordCreateManyAndReturnArgs} args - Arguments to create many ScreeningRecords.
     * @example
     * // Create many ScreeningRecords
     * const screeningRecord = await prisma.screeningRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ScreeningRecords and only return the `id`
     * const screeningRecordWithIdOnly = await prisma.screeningRecord.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScreeningRecordCreateManyAndReturnArgs>(args?: SelectSubset<T, ScreeningRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ScreeningRecord.
     * @param {ScreeningRecordDeleteArgs} args - Arguments to delete one ScreeningRecord.
     * @example
     * // Delete one ScreeningRecord
     * const ScreeningRecord = await prisma.screeningRecord.delete({
     *   where: {
     *     // ... filter to delete one ScreeningRecord
     *   }
     * })
     * 
     */
    delete<T extends ScreeningRecordDeleteArgs>(args: SelectSubset<T, ScreeningRecordDeleteArgs<ExtArgs>>): Prisma__ScreeningRecordClient<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ScreeningRecord.
     * @param {ScreeningRecordUpdateArgs} args - Arguments to update one ScreeningRecord.
     * @example
     * // Update one ScreeningRecord
     * const screeningRecord = await prisma.screeningRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScreeningRecordUpdateArgs>(args: SelectSubset<T, ScreeningRecordUpdateArgs<ExtArgs>>): Prisma__ScreeningRecordClient<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ScreeningRecords.
     * @param {ScreeningRecordDeleteManyArgs} args - Arguments to filter ScreeningRecords to delete.
     * @example
     * // Delete a few ScreeningRecords
     * const { count } = await prisma.screeningRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScreeningRecordDeleteManyArgs>(args?: SelectSubset<T, ScreeningRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScreeningRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreeningRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ScreeningRecords
     * const screeningRecord = await prisma.screeningRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScreeningRecordUpdateManyArgs>(args: SelectSubset<T, ScreeningRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScreeningRecords and returns the data updated in the database.
     * @param {ScreeningRecordUpdateManyAndReturnArgs} args - Arguments to update many ScreeningRecords.
     * @example
     * // Update many ScreeningRecords
     * const screeningRecord = await prisma.screeningRecord.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ScreeningRecords and only return the `id`
     * const screeningRecordWithIdOnly = await prisma.screeningRecord.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ScreeningRecordUpdateManyAndReturnArgs>(args: SelectSubset<T, ScreeningRecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ScreeningRecord.
     * @param {ScreeningRecordUpsertArgs} args - Arguments to update or create a ScreeningRecord.
     * @example
     * // Update or create a ScreeningRecord
     * const screeningRecord = await prisma.screeningRecord.upsert({
     *   create: {
     *     // ... data to create a ScreeningRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ScreeningRecord we want to update
     *   }
     * })
     */
    upsert<T extends ScreeningRecordUpsertArgs>(args: SelectSubset<T, ScreeningRecordUpsertArgs<ExtArgs>>): Prisma__ScreeningRecordClient<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ScreeningRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreeningRecordCountArgs} args - Arguments to filter ScreeningRecords to count.
     * @example
     * // Count the number of ScreeningRecords
     * const count = await prisma.screeningRecord.count({
     *   where: {
     *     // ... the filter for the ScreeningRecords we want to count
     *   }
     * })
    **/
    count<T extends ScreeningRecordCountArgs>(
      args?: Subset<T, ScreeningRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScreeningRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ScreeningRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreeningRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ScreeningRecordAggregateArgs>(args: Subset<T, ScreeningRecordAggregateArgs>): Prisma.PrismaPromise<GetScreeningRecordAggregateType<T>>

    /**
     * Group by ScreeningRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreeningRecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ScreeningRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScreeningRecordGroupByArgs['orderBy'] }
        : { orderBy?: ScreeningRecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ScreeningRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScreeningRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ScreeningRecord model
   */
  readonly fields: ScreeningRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ScreeningRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScreeningRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    worker<T extends WorkerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WorkerDefaultArgs<ExtArgs>>): Prisma__WorkerClient<$Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    patient<T extends PatientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PatientDefaultArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    tests<T extends ScreeningRecord$testsArgs<ExtArgs> = {}>(args?: Subset<T, ScreeningRecord$testsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ScreeningRecord model
   */
  interface ScreeningRecordFieldRefs {
    readonly id: FieldRef<"ScreeningRecord", 'String'>
    readonly patientId: FieldRef<"ScreeningRecord", 'String'>
    readonly joint: FieldRef<"ScreeningRecord", 'String'>
    readonly side: FieldRef<"ScreeningRecord", 'String'>
    readonly answers: FieldRef<"ScreeningRecord", 'Json'>
    readonly movement: FieldRef<"ScreeningRecord", 'Json'>
    readonly result: FieldRef<"ScreeningRecord", 'Json'>
    readonly createdAt: FieldRef<"ScreeningRecord", 'DateTime'>
    readonly followUpDate: FieldRef<"ScreeningRecord", 'DateTime'>
    readonly workerId: FieldRef<"ScreeningRecord", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ScreeningRecord findUnique
   */
  export type ScreeningRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    /**
     * Filter, which ScreeningRecord to fetch.
     */
    where: ScreeningRecordWhereUniqueInput
  }

  /**
   * ScreeningRecord findUniqueOrThrow
   */
  export type ScreeningRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    /**
     * Filter, which ScreeningRecord to fetch.
     */
    where: ScreeningRecordWhereUniqueInput
  }

  /**
   * ScreeningRecord findFirst
   */
  export type ScreeningRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    /**
     * Filter, which ScreeningRecord to fetch.
     */
    where?: ScreeningRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScreeningRecords to fetch.
     */
    orderBy?: ScreeningRecordOrderByWithRelationInput | ScreeningRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScreeningRecords.
     */
    cursor?: ScreeningRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScreeningRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScreeningRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScreeningRecords.
     */
    distinct?: ScreeningRecordScalarFieldEnum | ScreeningRecordScalarFieldEnum[]
  }

  /**
   * ScreeningRecord findFirstOrThrow
   */
  export type ScreeningRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    /**
     * Filter, which ScreeningRecord to fetch.
     */
    where?: ScreeningRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScreeningRecords to fetch.
     */
    orderBy?: ScreeningRecordOrderByWithRelationInput | ScreeningRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScreeningRecords.
     */
    cursor?: ScreeningRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScreeningRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScreeningRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScreeningRecords.
     */
    distinct?: ScreeningRecordScalarFieldEnum | ScreeningRecordScalarFieldEnum[]
  }

  /**
   * ScreeningRecord findMany
   */
  export type ScreeningRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    /**
     * Filter, which ScreeningRecords to fetch.
     */
    where?: ScreeningRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScreeningRecords to fetch.
     */
    orderBy?: ScreeningRecordOrderByWithRelationInput | ScreeningRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ScreeningRecords.
     */
    cursor?: ScreeningRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScreeningRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScreeningRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScreeningRecords.
     */
    distinct?: ScreeningRecordScalarFieldEnum | ScreeningRecordScalarFieldEnum[]
  }

  /**
   * ScreeningRecord create
   */
  export type ScreeningRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    /**
     * The data needed to create a ScreeningRecord.
     */
    data: XOR<ScreeningRecordCreateInput, ScreeningRecordUncheckedCreateInput>
  }

  /**
   * ScreeningRecord createMany
   */
  export type ScreeningRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ScreeningRecords.
     */
    data: ScreeningRecordCreateManyInput | ScreeningRecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ScreeningRecord createManyAndReturn
   */
  export type ScreeningRecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * The data used to create many ScreeningRecords.
     */
    data: ScreeningRecordCreateManyInput | ScreeningRecordCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ScreeningRecord update
   */
  export type ScreeningRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    /**
     * The data needed to update a ScreeningRecord.
     */
    data: XOR<ScreeningRecordUpdateInput, ScreeningRecordUncheckedUpdateInput>
    /**
     * Choose, which ScreeningRecord to update.
     */
    where: ScreeningRecordWhereUniqueInput
  }

  /**
   * ScreeningRecord updateMany
   */
  export type ScreeningRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ScreeningRecords.
     */
    data: XOR<ScreeningRecordUpdateManyMutationInput, ScreeningRecordUncheckedUpdateManyInput>
    /**
     * Filter which ScreeningRecords to update
     */
    where?: ScreeningRecordWhereInput
    /**
     * Limit how many ScreeningRecords to update.
     */
    limit?: number
  }

  /**
   * ScreeningRecord updateManyAndReturn
   */
  export type ScreeningRecordUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * The data used to update ScreeningRecords.
     */
    data: XOR<ScreeningRecordUpdateManyMutationInput, ScreeningRecordUncheckedUpdateManyInput>
    /**
     * Filter which ScreeningRecords to update
     */
    where?: ScreeningRecordWhereInput
    /**
     * Limit how many ScreeningRecords to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ScreeningRecord upsert
   */
  export type ScreeningRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    /**
     * The filter to search for the ScreeningRecord to update in case it exists.
     */
    where: ScreeningRecordWhereUniqueInput
    /**
     * In case the ScreeningRecord found by the `where` argument doesn't exist, create a new ScreeningRecord with this data.
     */
    create: XOR<ScreeningRecordCreateInput, ScreeningRecordUncheckedCreateInput>
    /**
     * In case the ScreeningRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScreeningRecordUpdateInput, ScreeningRecordUncheckedUpdateInput>
  }

  /**
   * ScreeningRecord delete
   */
  export type ScreeningRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
    /**
     * Filter which ScreeningRecord to delete.
     */
    where: ScreeningRecordWhereUniqueInput
  }

  /**
   * ScreeningRecord deleteMany
   */
  export type ScreeningRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScreeningRecords to delete
     */
    where?: ScreeningRecordWhereInput
    /**
     * Limit how many ScreeningRecords to delete.
     */
    limit?: number
  }

  /**
   * ScreeningRecord.tests
   */
  export type ScreeningRecord$testsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    where?: TestResultWhereInput
    orderBy?: TestResultOrderByWithRelationInput | TestResultOrderByWithRelationInput[]
    cursor?: TestResultWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TestResultScalarFieldEnum | TestResultScalarFieldEnum[]
  }

  /**
   * ScreeningRecord without action
   */
  export type ScreeningRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScreeningRecord
     */
    select?: ScreeningRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScreeningRecord
     */
    omit?: ScreeningRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreeningRecordInclude<ExtArgs> | null
  }


  /**
   * Model TestResult
   */

  export type AggregateTestResult = {
    _count: TestResultCountAggregateOutputType | null
    _min: TestResultMinAggregateOutputType | null
    _max: TestResultMaxAggregateOutputType | null
  }

  export type TestResultMinAggregateOutputType = {
    id: string | null
    testId: string | null
    status: string | null
    completed: boolean | null
    quality: string | null
    timestamp: Date | null
    screeningRecordId: string | null
  }

  export type TestResultMaxAggregateOutputType = {
    id: string | null
    testId: string | null
    status: string | null
    completed: boolean | null
    quality: string | null
    timestamp: Date | null
    screeningRecordId: string | null
  }

  export type TestResultCountAggregateOutputType = {
    id: number
    testId: number
    status: number
    completed: number
    quality: number
    measurements: number
    observations: number
    technicalDetails: number
    timestamp: number
    screeningRecordId: number
    _all: number
  }


  export type TestResultMinAggregateInputType = {
    id?: true
    testId?: true
    status?: true
    completed?: true
    quality?: true
    timestamp?: true
    screeningRecordId?: true
  }

  export type TestResultMaxAggregateInputType = {
    id?: true
    testId?: true
    status?: true
    completed?: true
    quality?: true
    timestamp?: true
    screeningRecordId?: true
  }

  export type TestResultCountAggregateInputType = {
    id?: true
    testId?: true
    status?: true
    completed?: true
    quality?: true
    measurements?: true
    observations?: true
    technicalDetails?: true
    timestamp?: true
    screeningRecordId?: true
    _all?: true
  }

  export type TestResultAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TestResult to aggregate.
     */
    where?: TestResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestResults to fetch.
     */
    orderBy?: TestResultOrderByWithRelationInput | TestResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TestResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TestResults
    **/
    _count?: true | TestResultCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TestResultMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TestResultMaxAggregateInputType
  }

  export type GetTestResultAggregateType<T extends TestResultAggregateArgs> = {
        [P in keyof T & keyof AggregateTestResult]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTestResult[P]>
      : GetScalarType<T[P], AggregateTestResult[P]>
  }




  export type TestResultGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestResultWhereInput
    orderBy?: TestResultOrderByWithAggregationInput | TestResultOrderByWithAggregationInput[]
    by: TestResultScalarFieldEnum[] | TestResultScalarFieldEnum
    having?: TestResultScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TestResultCountAggregateInputType | true
    _min?: TestResultMinAggregateInputType
    _max?: TestResultMaxAggregateInputType
  }

  export type TestResultGroupByOutputType = {
    id: string
    testId: string
    status: string
    completed: boolean
    quality: string
    measurements: JsonValue | null
    observations: JsonValue | null
    technicalDetails: JsonValue | null
    timestamp: Date
    screeningRecordId: string
    _count: TestResultCountAggregateOutputType | null
    _min: TestResultMinAggregateOutputType | null
    _max: TestResultMaxAggregateOutputType | null
  }

  type GetTestResultGroupByPayload<T extends TestResultGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TestResultGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TestResultGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TestResultGroupByOutputType[P]>
            : GetScalarType<T[P], TestResultGroupByOutputType[P]>
        }
      >
    >


  export type TestResultSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    testId?: boolean
    status?: boolean
    completed?: boolean
    quality?: boolean
    measurements?: boolean
    observations?: boolean
    technicalDetails?: boolean
    timestamp?: boolean
    screeningRecordId?: boolean
    screeningRecord?: boolean | ScreeningRecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["testResult"]>

  export type TestResultSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    testId?: boolean
    status?: boolean
    completed?: boolean
    quality?: boolean
    measurements?: boolean
    observations?: boolean
    technicalDetails?: boolean
    timestamp?: boolean
    screeningRecordId?: boolean
    screeningRecord?: boolean | ScreeningRecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["testResult"]>

  export type TestResultSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    testId?: boolean
    status?: boolean
    completed?: boolean
    quality?: boolean
    measurements?: boolean
    observations?: boolean
    technicalDetails?: boolean
    timestamp?: boolean
    screeningRecordId?: boolean
    screeningRecord?: boolean | ScreeningRecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["testResult"]>

  export type TestResultSelectScalar = {
    id?: boolean
    testId?: boolean
    status?: boolean
    completed?: boolean
    quality?: boolean
    measurements?: boolean
    observations?: boolean
    technicalDetails?: boolean
    timestamp?: boolean
    screeningRecordId?: boolean
  }

  export type TestResultOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "testId" | "status" | "completed" | "quality" | "measurements" | "observations" | "technicalDetails" | "timestamp" | "screeningRecordId", ExtArgs["result"]["testResult"]>
  export type TestResultInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    screeningRecord?: boolean | ScreeningRecordDefaultArgs<ExtArgs>
  }
  export type TestResultIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    screeningRecord?: boolean | ScreeningRecordDefaultArgs<ExtArgs>
  }
  export type TestResultIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    screeningRecord?: boolean | ScreeningRecordDefaultArgs<ExtArgs>
  }

  export type $TestResultPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TestResult"
    objects: {
      screeningRecord: Prisma.$ScreeningRecordPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      testId: string
      status: string
      completed: boolean
      quality: string
      measurements: Prisma.JsonValue | null
      observations: Prisma.JsonValue | null
      technicalDetails: Prisma.JsonValue | null
      timestamp: Date
      screeningRecordId: string
    }, ExtArgs["result"]["testResult"]>
    composites: {}
  }

  type TestResultGetPayload<S extends boolean | null | undefined | TestResultDefaultArgs> = $Result.GetResult<Prisma.$TestResultPayload, S>

  type TestResultCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TestResultFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TestResultCountAggregateInputType | true
    }

  export interface TestResultDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TestResult'], meta: { name: 'TestResult' } }
    /**
     * Find zero or one TestResult that matches the filter.
     * @param {TestResultFindUniqueArgs} args - Arguments to find a TestResult
     * @example
     * // Get one TestResult
     * const testResult = await prisma.testResult.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TestResultFindUniqueArgs>(args: SelectSubset<T, TestResultFindUniqueArgs<ExtArgs>>): Prisma__TestResultClient<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TestResult that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TestResultFindUniqueOrThrowArgs} args - Arguments to find a TestResult
     * @example
     * // Get one TestResult
     * const testResult = await prisma.testResult.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TestResultFindUniqueOrThrowArgs>(args: SelectSubset<T, TestResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TestResultClient<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TestResult that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestResultFindFirstArgs} args - Arguments to find a TestResult
     * @example
     * // Get one TestResult
     * const testResult = await prisma.testResult.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TestResultFindFirstArgs>(args?: SelectSubset<T, TestResultFindFirstArgs<ExtArgs>>): Prisma__TestResultClient<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TestResult that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestResultFindFirstOrThrowArgs} args - Arguments to find a TestResult
     * @example
     * // Get one TestResult
     * const testResult = await prisma.testResult.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TestResultFindFirstOrThrowArgs>(args?: SelectSubset<T, TestResultFindFirstOrThrowArgs<ExtArgs>>): Prisma__TestResultClient<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TestResults that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TestResults
     * const testResults = await prisma.testResult.findMany()
     * 
     * // Get first 10 TestResults
     * const testResults = await prisma.testResult.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const testResultWithIdOnly = await prisma.testResult.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TestResultFindManyArgs>(args?: SelectSubset<T, TestResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TestResult.
     * @param {TestResultCreateArgs} args - Arguments to create a TestResult.
     * @example
     * // Create one TestResult
     * const TestResult = await prisma.testResult.create({
     *   data: {
     *     // ... data to create a TestResult
     *   }
     * })
     * 
     */
    create<T extends TestResultCreateArgs>(args: SelectSubset<T, TestResultCreateArgs<ExtArgs>>): Prisma__TestResultClient<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TestResults.
     * @param {TestResultCreateManyArgs} args - Arguments to create many TestResults.
     * @example
     * // Create many TestResults
     * const testResult = await prisma.testResult.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TestResultCreateManyArgs>(args?: SelectSubset<T, TestResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TestResults and returns the data saved in the database.
     * @param {TestResultCreateManyAndReturnArgs} args - Arguments to create many TestResults.
     * @example
     * // Create many TestResults
     * const testResult = await prisma.testResult.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TestResults and only return the `id`
     * const testResultWithIdOnly = await prisma.testResult.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TestResultCreateManyAndReturnArgs>(args?: SelectSubset<T, TestResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TestResult.
     * @param {TestResultDeleteArgs} args - Arguments to delete one TestResult.
     * @example
     * // Delete one TestResult
     * const TestResult = await prisma.testResult.delete({
     *   where: {
     *     // ... filter to delete one TestResult
     *   }
     * })
     * 
     */
    delete<T extends TestResultDeleteArgs>(args: SelectSubset<T, TestResultDeleteArgs<ExtArgs>>): Prisma__TestResultClient<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TestResult.
     * @param {TestResultUpdateArgs} args - Arguments to update one TestResult.
     * @example
     * // Update one TestResult
     * const testResult = await prisma.testResult.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TestResultUpdateArgs>(args: SelectSubset<T, TestResultUpdateArgs<ExtArgs>>): Prisma__TestResultClient<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TestResults.
     * @param {TestResultDeleteManyArgs} args - Arguments to filter TestResults to delete.
     * @example
     * // Delete a few TestResults
     * const { count } = await prisma.testResult.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TestResultDeleteManyArgs>(args?: SelectSubset<T, TestResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TestResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TestResults
     * const testResult = await prisma.testResult.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TestResultUpdateManyArgs>(args: SelectSubset<T, TestResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TestResults and returns the data updated in the database.
     * @param {TestResultUpdateManyAndReturnArgs} args - Arguments to update many TestResults.
     * @example
     * // Update many TestResults
     * const testResult = await prisma.testResult.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TestResults and only return the `id`
     * const testResultWithIdOnly = await prisma.testResult.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TestResultUpdateManyAndReturnArgs>(args: SelectSubset<T, TestResultUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TestResult.
     * @param {TestResultUpsertArgs} args - Arguments to update or create a TestResult.
     * @example
     * // Update or create a TestResult
     * const testResult = await prisma.testResult.upsert({
     *   create: {
     *     // ... data to create a TestResult
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TestResult we want to update
     *   }
     * })
     */
    upsert<T extends TestResultUpsertArgs>(args: SelectSubset<T, TestResultUpsertArgs<ExtArgs>>): Prisma__TestResultClient<$Result.GetResult<Prisma.$TestResultPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TestResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestResultCountArgs} args - Arguments to filter TestResults to count.
     * @example
     * // Count the number of TestResults
     * const count = await prisma.testResult.count({
     *   where: {
     *     // ... the filter for the TestResults we want to count
     *   }
     * })
    **/
    count<T extends TestResultCountArgs>(
      args?: Subset<T, TestResultCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TestResultCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TestResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TestResultAggregateArgs>(args: Subset<T, TestResultAggregateArgs>): Prisma.PrismaPromise<GetTestResultAggregateType<T>>

    /**
     * Group by TestResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestResultGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TestResultGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TestResultGroupByArgs['orderBy'] }
        : { orderBy?: TestResultGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TestResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTestResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TestResult model
   */
  readonly fields: TestResultFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TestResult.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TestResultClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    screeningRecord<T extends ScreeningRecordDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ScreeningRecordDefaultArgs<ExtArgs>>): Prisma__ScreeningRecordClient<$Result.GetResult<Prisma.$ScreeningRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TestResult model
   */
  interface TestResultFieldRefs {
    readonly id: FieldRef<"TestResult", 'String'>
    readonly testId: FieldRef<"TestResult", 'String'>
    readonly status: FieldRef<"TestResult", 'String'>
    readonly completed: FieldRef<"TestResult", 'Boolean'>
    readonly quality: FieldRef<"TestResult", 'String'>
    readonly measurements: FieldRef<"TestResult", 'Json'>
    readonly observations: FieldRef<"TestResult", 'Json'>
    readonly technicalDetails: FieldRef<"TestResult", 'Json'>
    readonly timestamp: FieldRef<"TestResult", 'DateTime'>
    readonly screeningRecordId: FieldRef<"TestResult", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TestResult findUnique
   */
  export type TestResultFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    /**
     * Filter, which TestResult to fetch.
     */
    where: TestResultWhereUniqueInput
  }

  /**
   * TestResult findUniqueOrThrow
   */
  export type TestResultFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    /**
     * Filter, which TestResult to fetch.
     */
    where: TestResultWhereUniqueInput
  }

  /**
   * TestResult findFirst
   */
  export type TestResultFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    /**
     * Filter, which TestResult to fetch.
     */
    where?: TestResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestResults to fetch.
     */
    orderBy?: TestResultOrderByWithRelationInput | TestResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TestResults.
     */
    cursor?: TestResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TestResults.
     */
    distinct?: TestResultScalarFieldEnum | TestResultScalarFieldEnum[]
  }

  /**
   * TestResult findFirstOrThrow
   */
  export type TestResultFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    /**
     * Filter, which TestResult to fetch.
     */
    where?: TestResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestResults to fetch.
     */
    orderBy?: TestResultOrderByWithRelationInput | TestResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TestResults.
     */
    cursor?: TestResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TestResults.
     */
    distinct?: TestResultScalarFieldEnum | TestResultScalarFieldEnum[]
  }

  /**
   * TestResult findMany
   */
  export type TestResultFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    /**
     * Filter, which TestResults to fetch.
     */
    where?: TestResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestResults to fetch.
     */
    orderBy?: TestResultOrderByWithRelationInput | TestResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TestResults.
     */
    cursor?: TestResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TestResults.
     */
    distinct?: TestResultScalarFieldEnum | TestResultScalarFieldEnum[]
  }

  /**
   * TestResult create
   */
  export type TestResultCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    /**
     * The data needed to create a TestResult.
     */
    data: XOR<TestResultCreateInput, TestResultUncheckedCreateInput>
  }

  /**
   * TestResult createMany
   */
  export type TestResultCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TestResults.
     */
    data: TestResultCreateManyInput | TestResultCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TestResult createManyAndReturn
   */
  export type TestResultCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * The data used to create many TestResults.
     */
    data: TestResultCreateManyInput | TestResultCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TestResult update
   */
  export type TestResultUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    /**
     * The data needed to update a TestResult.
     */
    data: XOR<TestResultUpdateInput, TestResultUncheckedUpdateInput>
    /**
     * Choose, which TestResult to update.
     */
    where: TestResultWhereUniqueInput
  }

  /**
   * TestResult updateMany
   */
  export type TestResultUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TestResults.
     */
    data: XOR<TestResultUpdateManyMutationInput, TestResultUncheckedUpdateManyInput>
    /**
     * Filter which TestResults to update
     */
    where?: TestResultWhereInput
    /**
     * Limit how many TestResults to update.
     */
    limit?: number
  }

  /**
   * TestResult updateManyAndReturn
   */
  export type TestResultUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * The data used to update TestResults.
     */
    data: XOR<TestResultUpdateManyMutationInput, TestResultUncheckedUpdateManyInput>
    /**
     * Filter which TestResults to update
     */
    where?: TestResultWhereInput
    /**
     * Limit how many TestResults to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TestResult upsert
   */
  export type TestResultUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    /**
     * The filter to search for the TestResult to update in case it exists.
     */
    where: TestResultWhereUniqueInput
    /**
     * In case the TestResult found by the `where` argument doesn't exist, create a new TestResult with this data.
     */
    create: XOR<TestResultCreateInput, TestResultUncheckedCreateInput>
    /**
     * In case the TestResult was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TestResultUpdateInput, TestResultUncheckedUpdateInput>
  }

  /**
   * TestResult delete
   */
  export type TestResultDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
    /**
     * Filter which TestResult to delete.
     */
    where: TestResultWhereUniqueInput
  }

  /**
   * TestResult deleteMany
   */
  export type TestResultDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TestResults to delete
     */
    where?: TestResultWhereInput
    /**
     * Limit how many TestResults to delete.
     */
    limit?: number
  }

  /**
   * TestResult without action
   */
  export type TestResultDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestResult
     */
    select?: TestResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestResult
     */
    omit?: TestResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestResultInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const WorkerScalarFieldEnum: {
    id: 'id',
    username: 'username',
    passwordHash: 'passwordHash',
    name: 'name',
    role: 'role',
    createdAt: 'createdAt'
  };

  export type WorkerScalarFieldEnum = (typeof WorkerScalarFieldEnum)[keyof typeof WorkerScalarFieldEnum]


  export const PatientScalarFieldEnum: {
    id: 'id',
    name: 'name',
    age: 'age',
    sex: 'sex',
    phone: 'phone',
    village: 'village',
    phc: 'phc',
    healthId: 'healthId',
    heightCm: 'heightCm',
    weightKg: 'weightKg',
    occupation: 'occupation',
    priorInjury: 'priorInjury',
    familyHistory: 'familyHistory',
    createdAt: 'createdAt'
  };

  export type PatientScalarFieldEnum = (typeof PatientScalarFieldEnum)[keyof typeof PatientScalarFieldEnum]


  export const ScreeningRecordScalarFieldEnum: {
    id: 'id',
    patientId: 'patientId',
    joint: 'joint',
    side: 'side',
    answers: 'answers',
    movement: 'movement',
    result: 'result',
    createdAt: 'createdAt',
    followUpDate: 'followUpDate',
    workerId: 'workerId'
  };

  export type ScreeningRecordScalarFieldEnum = (typeof ScreeningRecordScalarFieldEnum)[keyof typeof ScreeningRecordScalarFieldEnum]


  export const TestResultScalarFieldEnum: {
    id: 'id',
    testId: 'testId',
    status: 'status',
    completed: 'completed',
    quality: 'quality',
    measurements: 'measurements',
    observations: 'observations',
    technicalDetails: 'technicalDetails',
    timestamp: 'timestamp',
    screeningRecordId: 'screeningRecordId'
  };

  export type TestResultScalarFieldEnum = (typeof TestResultScalarFieldEnum)[keyof typeof TestResultScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    
  /**
   * Deep Input Types
   */


  export type WorkerWhereInput = {
    AND?: WorkerWhereInput | WorkerWhereInput[]
    OR?: WorkerWhereInput[]
    NOT?: WorkerWhereInput | WorkerWhereInput[]
    id?: StringFilter<"Worker"> | string
    username?: StringFilter<"Worker"> | string
    passwordHash?: StringFilter<"Worker"> | string
    name?: StringFilter<"Worker"> | string
    role?: StringFilter<"Worker"> | string
    createdAt?: DateTimeFilter<"Worker"> | Date | string
    records?: ScreeningRecordListRelationFilter
  }

  export type WorkerOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    records?: ScreeningRecordOrderByRelationAggregateInput
  }

  export type WorkerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    username?: string
    AND?: WorkerWhereInput | WorkerWhereInput[]
    OR?: WorkerWhereInput[]
    NOT?: WorkerWhereInput | WorkerWhereInput[]
    passwordHash?: StringFilter<"Worker"> | string
    name?: StringFilter<"Worker"> | string
    role?: StringFilter<"Worker"> | string
    createdAt?: DateTimeFilter<"Worker"> | Date | string
    records?: ScreeningRecordListRelationFilter
  }, "id" | "username">

  export type WorkerOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    _count?: WorkerCountOrderByAggregateInput
    _max?: WorkerMaxOrderByAggregateInput
    _min?: WorkerMinOrderByAggregateInput
  }

  export type WorkerScalarWhereWithAggregatesInput = {
    AND?: WorkerScalarWhereWithAggregatesInput | WorkerScalarWhereWithAggregatesInput[]
    OR?: WorkerScalarWhereWithAggregatesInput[]
    NOT?: WorkerScalarWhereWithAggregatesInput | WorkerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Worker"> | string
    username?: StringWithAggregatesFilter<"Worker"> | string
    passwordHash?: StringWithAggregatesFilter<"Worker"> | string
    name?: StringWithAggregatesFilter<"Worker"> | string
    role?: StringWithAggregatesFilter<"Worker"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Worker"> | Date | string
  }

  export type PatientWhereInput = {
    AND?: PatientWhereInput | PatientWhereInput[]
    OR?: PatientWhereInput[]
    NOT?: PatientWhereInput | PatientWhereInput[]
    id?: StringFilter<"Patient"> | string
    name?: StringFilter<"Patient"> | string
    age?: IntFilter<"Patient"> | number
    sex?: StringFilter<"Patient"> | string
    phone?: StringFilter<"Patient"> | string
    village?: StringFilter<"Patient"> | string
    phc?: StringFilter<"Patient"> | string
    healthId?: StringNullableFilter<"Patient"> | string | null
    heightCm?: FloatNullableFilter<"Patient"> | number | null
    weightKg?: FloatNullableFilter<"Patient"> | number | null
    occupation?: StringFilter<"Patient"> | string
    priorInjury?: BoolFilter<"Patient"> | boolean
    familyHistory?: BoolFilter<"Patient"> | boolean
    createdAt?: DateTimeFilter<"Patient"> | Date | string
    records?: ScreeningRecordListRelationFilter
  }

  export type PatientOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    phone?: SortOrder
    village?: SortOrder
    phc?: SortOrder
    healthId?: SortOrderInput | SortOrder
    heightCm?: SortOrderInput | SortOrder
    weightKg?: SortOrderInput | SortOrder
    occupation?: SortOrder
    priorInjury?: SortOrder
    familyHistory?: SortOrder
    createdAt?: SortOrder
    records?: ScreeningRecordOrderByRelationAggregateInput
  }

  export type PatientWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PatientWhereInput | PatientWhereInput[]
    OR?: PatientWhereInput[]
    NOT?: PatientWhereInput | PatientWhereInput[]
    name?: StringFilter<"Patient"> | string
    age?: IntFilter<"Patient"> | number
    sex?: StringFilter<"Patient"> | string
    phone?: StringFilter<"Patient"> | string
    village?: StringFilter<"Patient"> | string
    phc?: StringFilter<"Patient"> | string
    healthId?: StringNullableFilter<"Patient"> | string | null
    heightCm?: FloatNullableFilter<"Patient"> | number | null
    weightKg?: FloatNullableFilter<"Patient"> | number | null
    occupation?: StringFilter<"Patient"> | string
    priorInjury?: BoolFilter<"Patient"> | boolean
    familyHistory?: BoolFilter<"Patient"> | boolean
    createdAt?: DateTimeFilter<"Patient"> | Date | string
    records?: ScreeningRecordListRelationFilter
  }, "id">

  export type PatientOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    phone?: SortOrder
    village?: SortOrder
    phc?: SortOrder
    healthId?: SortOrderInput | SortOrder
    heightCm?: SortOrderInput | SortOrder
    weightKg?: SortOrderInput | SortOrder
    occupation?: SortOrder
    priorInjury?: SortOrder
    familyHistory?: SortOrder
    createdAt?: SortOrder
    _count?: PatientCountOrderByAggregateInput
    _avg?: PatientAvgOrderByAggregateInput
    _max?: PatientMaxOrderByAggregateInput
    _min?: PatientMinOrderByAggregateInput
    _sum?: PatientSumOrderByAggregateInput
  }

  export type PatientScalarWhereWithAggregatesInput = {
    AND?: PatientScalarWhereWithAggregatesInput | PatientScalarWhereWithAggregatesInput[]
    OR?: PatientScalarWhereWithAggregatesInput[]
    NOT?: PatientScalarWhereWithAggregatesInput | PatientScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Patient"> | string
    name?: StringWithAggregatesFilter<"Patient"> | string
    age?: IntWithAggregatesFilter<"Patient"> | number
    sex?: StringWithAggregatesFilter<"Patient"> | string
    phone?: StringWithAggregatesFilter<"Patient"> | string
    village?: StringWithAggregatesFilter<"Patient"> | string
    phc?: StringWithAggregatesFilter<"Patient"> | string
    healthId?: StringNullableWithAggregatesFilter<"Patient"> | string | null
    heightCm?: FloatNullableWithAggregatesFilter<"Patient"> | number | null
    weightKg?: FloatNullableWithAggregatesFilter<"Patient"> | number | null
    occupation?: StringWithAggregatesFilter<"Patient"> | string
    priorInjury?: BoolWithAggregatesFilter<"Patient"> | boolean
    familyHistory?: BoolWithAggregatesFilter<"Patient"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Patient"> | Date | string
  }

  export type ScreeningRecordWhereInput = {
    AND?: ScreeningRecordWhereInput | ScreeningRecordWhereInput[]
    OR?: ScreeningRecordWhereInput[]
    NOT?: ScreeningRecordWhereInput | ScreeningRecordWhereInput[]
    id?: StringFilter<"ScreeningRecord"> | string
    patientId?: StringFilter<"ScreeningRecord"> | string
    joint?: StringFilter<"ScreeningRecord"> | string
    side?: StringFilter<"ScreeningRecord"> | string
    answers?: JsonFilter<"ScreeningRecord">
    movement?: JsonNullableFilter<"ScreeningRecord">
    result?: JsonFilter<"ScreeningRecord">
    createdAt?: DateTimeFilter<"ScreeningRecord"> | Date | string
    followUpDate?: DateTimeNullableFilter<"ScreeningRecord"> | Date | string | null
    workerId?: StringFilter<"ScreeningRecord"> | string
    worker?: XOR<WorkerScalarRelationFilter, WorkerWhereInput>
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    tests?: TestResultListRelationFilter
  }

  export type ScreeningRecordOrderByWithRelationInput = {
    id?: SortOrder
    patientId?: SortOrder
    joint?: SortOrder
    side?: SortOrder
    answers?: SortOrder
    movement?: SortOrderInput | SortOrder
    result?: SortOrder
    createdAt?: SortOrder
    followUpDate?: SortOrderInput | SortOrder
    workerId?: SortOrder
    worker?: WorkerOrderByWithRelationInput
    patient?: PatientOrderByWithRelationInput
    tests?: TestResultOrderByRelationAggregateInput
  }

  export type ScreeningRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ScreeningRecordWhereInput | ScreeningRecordWhereInput[]
    OR?: ScreeningRecordWhereInput[]
    NOT?: ScreeningRecordWhereInput | ScreeningRecordWhereInput[]
    patientId?: StringFilter<"ScreeningRecord"> | string
    joint?: StringFilter<"ScreeningRecord"> | string
    side?: StringFilter<"ScreeningRecord"> | string
    answers?: JsonFilter<"ScreeningRecord">
    movement?: JsonNullableFilter<"ScreeningRecord">
    result?: JsonFilter<"ScreeningRecord">
    createdAt?: DateTimeFilter<"ScreeningRecord"> | Date | string
    followUpDate?: DateTimeNullableFilter<"ScreeningRecord"> | Date | string | null
    workerId?: StringFilter<"ScreeningRecord"> | string
    worker?: XOR<WorkerScalarRelationFilter, WorkerWhereInput>
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    tests?: TestResultListRelationFilter
  }, "id">

  export type ScreeningRecordOrderByWithAggregationInput = {
    id?: SortOrder
    patientId?: SortOrder
    joint?: SortOrder
    side?: SortOrder
    answers?: SortOrder
    movement?: SortOrderInput | SortOrder
    result?: SortOrder
    createdAt?: SortOrder
    followUpDate?: SortOrderInput | SortOrder
    workerId?: SortOrder
    _count?: ScreeningRecordCountOrderByAggregateInput
    _max?: ScreeningRecordMaxOrderByAggregateInput
    _min?: ScreeningRecordMinOrderByAggregateInput
  }

  export type ScreeningRecordScalarWhereWithAggregatesInput = {
    AND?: ScreeningRecordScalarWhereWithAggregatesInput | ScreeningRecordScalarWhereWithAggregatesInput[]
    OR?: ScreeningRecordScalarWhereWithAggregatesInput[]
    NOT?: ScreeningRecordScalarWhereWithAggregatesInput | ScreeningRecordScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ScreeningRecord"> | string
    patientId?: StringWithAggregatesFilter<"ScreeningRecord"> | string
    joint?: StringWithAggregatesFilter<"ScreeningRecord"> | string
    side?: StringWithAggregatesFilter<"ScreeningRecord"> | string
    answers?: JsonWithAggregatesFilter<"ScreeningRecord">
    movement?: JsonNullableWithAggregatesFilter<"ScreeningRecord">
    result?: JsonWithAggregatesFilter<"ScreeningRecord">
    createdAt?: DateTimeWithAggregatesFilter<"ScreeningRecord"> | Date | string
    followUpDate?: DateTimeNullableWithAggregatesFilter<"ScreeningRecord"> | Date | string | null
    workerId?: StringWithAggregatesFilter<"ScreeningRecord"> | string
  }

  export type TestResultWhereInput = {
    AND?: TestResultWhereInput | TestResultWhereInput[]
    OR?: TestResultWhereInput[]
    NOT?: TestResultWhereInput | TestResultWhereInput[]
    id?: StringFilter<"TestResult"> | string
    testId?: StringFilter<"TestResult"> | string
    status?: StringFilter<"TestResult"> | string
    completed?: BoolFilter<"TestResult"> | boolean
    quality?: StringFilter<"TestResult"> | string
    measurements?: JsonNullableFilter<"TestResult">
    observations?: JsonNullableFilter<"TestResult">
    technicalDetails?: JsonNullableFilter<"TestResult">
    timestamp?: DateTimeFilter<"TestResult"> | Date | string
    screeningRecordId?: StringFilter<"TestResult"> | string
    screeningRecord?: XOR<ScreeningRecordScalarRelationFilter, ScreeningRecordWhereInput>
  }

  export type TestResultOrderByWithRelationInput = {
    id?: SortOrder
    testId?: SortOrder
    status?: SortOrder
    completed?: SortOrder
    quality?: SortOrder
    measurements?: SortOrderInput | SortOrder
    observations?: SortOrderInput | SortOrder
    technicalDetails?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    screeningRecordId?: SortOrder
    screeningRecord?: ScreeningRecordOrderByWithRelationInput
  }

  export type TestResultWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    screeningRecordId_testId?: TestResultScreeningRecordIdTestIdCompoundUniqueInput
    AND?: TestResultWhereInput | TestResultWhereInput[]
    OR?: TestResultWhereInput[]
    NOT?: TestResultWhereInput | TestResultWhereInput[]
    testId?: StringFilter<"TestResult"> | string
    status?: StringFilter<"TestResult"> | string
    completed?: BoolFilter<"TestResult"> | boolean
    quality?: StringFilter<"TestResult"> | string
    measurements?: JsonNullableFilter<"TestResult">
    observations?: JsonNullableFilter<"TestResult">
    technicalDetails?: JsonNullableFilter<"TestResult">
    timestamp?: DateTimeFilter<"TestResult"> | Date | string
    screeningRecordId?: StringFilter<"TestResult"> | string
    screeningRecord?: XOR<ScreeningRecordScalarRelationFilter, ScreeningRecordWhereInput>
  }, "id" | "screeningRecordId_testId">

  export type TestResultOrderByWithAggregationInput = {
    id?: SortOrder
    testId?: SortOrder
    status?: SortOrder
    completed?: SortOrder
    quality?: SortOrder
    measurements?: SortOrderInput | SortOrder
    observations?: SortOrderInput | SortOrder
    technicalDetails?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    screeningRecordId?: SortOrder
    _count?: TestResultCountOrderByAggregateInput
    _max?: TestResultMaxOrderByAggregateInput
    _min?: TestResultMinOrderByAggregateInput
  }

  export type TestResultScalarWhereWithAggregatesInput = {
    AND?: TestResultScalarWhereWithAggregatesInput | TestResultScalarWhereWithAggregatesInput[]
    OR?: TestResultScalarWhereWithAggregatesInput[]
    NOT?: TestResultScalarWhereWithAggregatesInput | TestResultScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TestResult"> | string
    testId?: StringWithAggregatesFilter<"TestResult"> | string
    status?: StringWithAggregatesFilter<"TestResult"> | string
    completed?: BoolWithAggregatesFilter<"TestResult"> | boolean
    quality?: StringWithAggregatesFilter<"TestResult"> | string
    measurements?: JsonNullableWithAggregatesFilter<"TestResult">
    observations?: JsonNullableWithAggregatesFilter<"TestResult">
    technicalDetails?: JsonNullableWithAggregatesFilter<"TestResult">
    timestamp?: DateTimeWithAggregatesFilter<"TestResult"> | Date | string
    screeningRecordId?: StringWithAggregatesFilter<"TestResult"> | string
  }

  export type WorkerCreateInput = {
    id?: string
    username: string
    passwordHash: string
    name: string
    role?: string
    createdAt?: Date | string
    records?: ScreeningRecordCreateNestedManyWithoutWorkerInput
  }

  export type WorkerUncheckedCreateInput = {
    id?: string
    username: string
    passwordHash: string
    name: string
    role?: string
    createdAt?: Date | string
    records?: ScreeningRecordUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type WorkerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    records?: ScreeningRecordUpdateManyWithoutWorkerNestedInput
  }

  export type WorkerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    records?: ScreeningRecordUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type WorkerCreateManyInput = {
    id?: string
    username: string
    passwordHash: string
    name: string
    role?: string
    createdAt?: Date | string
  }

  export type WorkerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientCreateInput = {
    id?: string
    name: string
    age: number
    sex: string
    phone: string
    village: string
    phc: string
    healthId?: string | null
    heightCm?: number | null
    weightKg?: number | null
    occupation: string
    priorInjury: boolean
    familyHistory: boolean
    createdAt?: Date | string
    records?: ScreeningRecordCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateInput = {
    id?: string
    name: string
    age: number
    sex: string
    phone: string
    village: string
    phc: string
    healthId?: string | null
    heightCm?: number | null
    weightKg?: number | null
    occupation: string
    priorInjury: boolean
    familyHistory: boolean
    createdAt?: Date | string
    records?: ScreeningRecordUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    age?: IntFieldUpdateOperationsInput | number
    sex?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    village?: StringFieldUpdateOperationsInput | string
    phc?: StringFieldUpdateOperationsInput | string
    healthId?: NullableStringFieldUpdateOperationsInput | string | null
    heightCm?: NullableFloatFieldUpdateOperationsInput | number | null
    weightKg?: NullableFloatFieldUpdateOperationsInput | number | null
    occupation?: StringFieldUpdateOperationsInput | string
    priorInjury?: BoolFieldUpdateOperationsInput | boolean
    familyHistory?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    records?: ScreeningRecordUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    age?: IntFieldUpdateOperationsInput | number
    sex?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    village?: StringFieldUpdateOperationsInput | string
    phc?: StringFieldUpdateOperationsInput | string
    healthId?: NullableStringFieldUpdateOperationsInput | string | null
    heightCm?: NullableFloatFieldUpdateOperationsInput | number | null
    weightKg?: NullableFloatFieldUpdateOperationsInput | number | null
    occupation?: StringFieldUpdateOperationsInput | string
    priorInjury?: BoolFieldUpdateOperationsInput | boolean
    familyHistory?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    records?: ScreeningRecordUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type PatientCreateManyInput = {
    id?: string
    name: string
    age: number
    sex: string
    phone: string
    village: string
    phc: string
    healthId?: string | null
    heightCm?: number | null
    weightKg?: number | null
    occupation: string
    priorInjury: boolean
    familyHistory: boolean
    createdAt?: Date | string
  }

  export type PatientUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    age?: IntFieldUpdateOperationsInput | number
    sex?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    village?: StringFieldUpdateOperationsInput | string
    phc?: StringFieldUpdateOperationsInput | string
    healthId?: NullableStringFieldUpdateOperationsInput | string | null
    heightCm?: NullableFloatFieldUpdateOperationsInput | number | null
    weightKg?: NullableFloatFieldUpdateOperationsInput | number | null
    occupation?: StringFieldUpdateOperationsInput | string
    priorInjury?: BoolFieldUpdateOperationsInput | boolean
    familyHistory?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    age?: IntFieldUpdateOperationsInput | number
    sex?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    village?: StringFieldUpdateOperationsInput | string
    phc?: StringFieldUpdateOperationsInput | string
    healthId?: NullableStringFieldUpdateOperationsInput | string | null
    heightCm?: NullableFloatFieldUpdateOperationsInput | number | null
    weightKg?: NullableFloatFieldUpdateOperationsInput | number | null
    occupation?: StringFieldUpdateOperationsInput | string
    priorInjury?: BoolFieldUpdateOperationsInput | boolean
    familyHistory?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScreeningRecordCreateInput = {
    id?: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    worker: WorkerCreateNestedOneWithoutRecordsInput
    patient: PatientCreateNestedOneWithoutRecordsInput
    tests?: TestResultCreateNestedManyWithoutScreeningRecordInput
  }

  export type ScreeningRecordUncheckedCreateInput = {
    id?: string
    patientId: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    workerId: string
    tests?: TestResultUncheckedCreateNestedManyWithoutScreeningRecordInput
  }

  export type ScreeningRecordUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    worker?: WorkerUpdateOneRequiredWithoutRecordsNestedInput
    patient?: PatientUpdateOneRequiredWithoutRecordsNestedInput
    tests?: TestResultUpdateManyWithoutScreeningRecordNestedInput
  }

  export type ScreeningRecordUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    workerId?: StringFieldUpdateOperationsInput | string
    tests?: TestResultUncheckedUpdateManyWithoutScreeningRecordNestedInput
  }

  export type ScreeningRecordCreateManyInput = {
    id?: string
    patientId: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    workerId: string
  }

  export type ScreeningRecordUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ScreeningRecordUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type TestResultCreateInput = {
    id?: string
    testId: string
    status: string
    completed: boolean
    quality: string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
    screeningRecord: ScreeningRecordCreateNestedOneWithoutTestsInput
  }

  export type TestResultUncheckedCreateInput = {
    id?: string
    testId: string
    status: string
    completed: boolean
    quality: string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
    screeningRecordId: string
  }

  export type TestResultUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    testId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    quality?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    screeningRecord?: ScreeningRecordUpdateOneRequiredWithoutTestsNestedInput
  }

  export type TestResultUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    testId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    quality?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    screeningRecordId?: StringFieldUpdateOperationsInput | string
  }

  export type TestResultCreateManyInput = {
    id?: string
    testId: string
    status: string
    completed: boolean
    quality: string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
    screeningRecordId: string
  }

  export type TestResultUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    testId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    quality?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestResultUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    testId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    quality?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    screeningRecordId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ScreeningRecordListRelationFilter = {
    every?: ScreeningRecordWhereInput
    some?: ScreeningRecordWhereInput
    none?: ScreeningRecordWhereInput
  }

  export type ScreeningRecordOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WorkerCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type WorkerMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type WorkerMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PatientCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    phone?: SortOrder
    village?: SortOrder
    phc?: SortOrder
    healthId?: SortOrder
    heightCm?: SortOrder
    weightKg?: SortOrder
    occupation?: SortOrder
    priorInjury?: SortOrder
    familyHistory?: SortOrder
    createdAt?: SortOrder
  }

  export type PatientAvgOrderByAggregateInput = {
    age?: SortOrder
    heightCm?: SortOrder
    weightKg?: SortOrder
  }

  export type PatientMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    phone?: SortOrder
    village?: SortOrder
    phc?: SortOrder
    healthId?: SortOrder
    heightCm?: SortOrder
    weightKg?: SortOrder
    occupation?: SortOrder
    priorInjury?: SortOrder
    familyHistory?: SortOrder
    createdAt?: SortOrder
  }

  export type PatientMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    phone?: SortOrder
    village?: SortOrder
    phc?: SortOrder
    healthId?: SortOrder
    heightCm?: SortOrder
    weightKg?: SortOrder
    occupation?: SortOrder
    priorInjury?: SortOrder
    familyHistory?: SortOrder
    createdAt?: SortOrder
  }

  export type PatientSumOrderByAggregateInput = {
    age?: SortOrder
    heightCm?: SortOrder
    weightKg?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type WorkerScalarRelationFilter = {
    is?: WorkerWhereInput
    isNot?: WorkerWhereInput
  }

  export type PatientScalarRelationFilter = {
    is?: PatientWhereInput
    isNot?: PatientWhereInput
  }

  export type TestResultListRelationFilter = {
    every?: TestResultWhereInput
    some?: TestResultWhereInput
    none?: TestResultWhereInput
  }

  export type TestResultOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ScreeningRecordCountOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    joint?: SortOrder
    side?: SortOrder
    answers?: SortOrder
    movement?: SortOrder
    result?: SortOrder
    createdAt?: SortOrder
    followUpDate?: SortOrder
    workerId?: SortOrder
  }

  export type ScreeningRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    joint?: SortOrder
    side?: SortOrder
    createdAt?: SortOrder
    followUpDate?: SortOrder
    workerId?: SortOrder
  }

  export type ScreeningRecordMinOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    joint?: SortOrder
    side?: SortOrder
    createdAt?: SortOrder
    followUpDate?: SortOrder
    workerId?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ScreeningRecordScalarRelationFilter = {
    is?: ScreeningRecordWhereInput
    isNot?: ScreeningRecordWhereInput
  }

  export type TestResultScreeningRecordIdTestIdCompoundUniqueInput = {
    screeningRecordId: string
    testId: string
  }

  export type TestResultCountOrderByAggregateInput = {
    id?: SortOrder
    testId?: SortOrder
    status?: SortOrder
    completed?: SortOrder
    quality?: SortOrder
    measurements?: SortOrder
    observations?: SortOrder
    technicalDetails?: SortOrder
    timestamp?: SortOrder
    screeningRecordId?: SortOrder
  }

  export type TestResultMaxOrderByAggregateInput = {
    id?: SortOrder
    testId?: SortOrder
    status?: SortOrder
    completed?: SortOrder
    quality?: SortOrder
    timestamp?: SortOrder
    screeningRecordId?: SortOrder
  }

  export type TestResultMinOrderByAggregateInput = {
    id?: SortOrder
    testId?: SortOrder
    status?: SortOrder
    completed?: SortOrder
    quality?: SortOrder
    timestamp?: SortOrder
    screeningRecordId?: SortOrder
  }

  export type ScreeningRecordCreateNestedManyWithoutWorkerInput = {
    create?: XOR<ScreeningRecordCreateWithoutWorkerInput, ScreeningRecordUncheckedCreateWithoutWorkerInput> | ScreeningRecordCreateWithoutWorkerInput[] | ScreeningRecordUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutWorkerInput | ScreeningRecordCreateOrConnectWithoutWorkerInput[]
    createMany?: ScreeningRecordCreateManyWorkerInputEnvelope
    connect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
  }

  export type ScreeningRecordUncheckedCreateNestedManyWithoutWorkerInput = {
    create?: XOR<ScreeningRecordCreateWithoutWorkerInput, ScreeningRecordUncheckedCreateWithoutWorkerInput> | ScreeningRecordCreateWithoutWorkerInput[] | ScreeningRecordUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutWorkerInput | ScreeningRecordCreateOrConnectWithoutWorkerInput[]
    createMany?: ScreeningRecordCreateManyWorkerInputEnvelope
    connect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ScreeningRecordUpdateManyWithoutWorkerNestedInput = {
    create?: XOR<ScreeningRecordCreateWithoutWorkerInput, ScreeningRecordUncheckedCreateWithoutWorkerInput> | ScreeningRecordCreateWithoutWorkerInput[] | ScreeningRecordUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutWorkerInput | ScreeningRecordCreateOrConnectWithoutWorkerInput[]
    upsert?: ScreeningRecordUpsertWithWhereUniqueWithoutWorkerInput | ScreeningRecordUpsertWithWhereUniqueWithoutWorkerInput[]
    createMany?: ScreeningRecordCreateManyWorkerInputEnvelope
    set?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    disconnect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    delete?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    connect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    update?: ScreeningRecordUpdateWithWhereUniqueWithoutWorkerInput | ScreeningRecordUpdateWithWhereUniqueWithoutWorkerInput[]
    updateMany?: ScreeningRecordUpdateManyWithWhereWithoutWorkerInput | ScreeningRecordUpdateManyWithWhereWithoutWorkerInput[]
    deleteMany?: ScreeningRecordScalarWhereInput | ScreeningRecordScalarWhereInput[]
  }

  export type ScreeningRecordUncheckedUpdateManyWithoutWorkerNestedInput = {
    create?: XOR<ScreeningRecordCreateWithoutWorkerInput, ScreeningRecordUncheckedCreateWithoutWorkerInput> | ScreeningRecordCreateWithoutWorkerInput[] | ScreeningRecordUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutWorkerInput | ScreeningRecordCreateOrConnectWithoutWorkerInput[]
    upsert?: ScreeningRecordUpsertWithWhereUniqueWithoutWorkerInput | ScreeningRecordUpsertWithWhereUniqueWithoutWorkerInput[]
    createMany?: ScreeningRecordCreateManyWorkerInputEnvelope
    set?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    disconnect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    delete?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    connect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    update?: ScreeningRecordUpdateWithWhereUniqueWithoutWorkerInput | ScreeningRecordUpdateWithWhereUniqueWithoutWorkerInput[]
    updateMany?: ScreeningRecordUpdateManyWithWhereWithoutWorkerInput | ScreeningRecordUpdateManyWithWhereWithoutWorkerInput[]
    deleteMany?: ScreeningRecordScalarWhereInput | ScreeningRecordScalarWhereInput[]
  }

  export type ScreeningRecordCreateNestedManyWithoutPatientInput = {
    create?: XOR<ScreeningRecordCreateWithoutPatientInput, ScreeningRecordUncheckedCreateWithoutPatientInput> | ScreeningRecordCreateWithoutPatientInput[] | ScreeningRecordUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutPatientInput | ScreeningRecordCreateOrConnectWithoutPatientInput[]
    createMany?: ScreeningRecordCreateManyPatientInputEnvelope
    connect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
  }

  export type ScreeningRecordUncheckedCreateNestedManyWithoutPatientInput = {
    create?: XOR<ScreeningRecordCreateWithoutPatientInput, ScreeningRecordUncheckedCreateWithoutPatientInput> | ScreeningRecordCreateWithoutPatientInput[] | ScreeningRecordUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutPatientInput | ScreeningRecordCreateOrConnectWithoutPatientInput[]
    createMany?: ScreeningRecordCreateManyPatientInputEnvelope
    connect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ScreeningRecordUpdateManyWithoutPatientNestedInput = {
    create?: XOR<ScreeningRecordCreateWithoutPatientInput, ScreeningRecordUncheckedCreateWithoutPatientInput> | ScreeningRecordCreateWithoutPatientInput[] | ScreeningRecordUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutPatientInput | ScreeningRecordCreateOrConnectWithoutPatientInput[]
    upsert?: ScreeningRecordUpsertWithWhereUniqueWithoutPatientInput | ScreeningRecordUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: ScreeningRecordCreateManyPatientInputEnvelope
    set?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    disconnect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    delete?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    connect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    update?: ScreeningRecordUpdateWithWhereUniqueWithoutPatientInput | ScreeningRecordUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: ScreeningRecordUpdateManyWithWhereWithoutPatientInput | ScreeningRecordUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: ScreeningRecordScalarWhereInput | ScreeningRecordScalarWhereInput[]
  }

  export type ScreeningRecordUncheckedUpdateManyWithoutPatientNestedInput = {
    create?: XOR<ScreeningRecordCreateWithoutPatientInput, ScreeningRecordUncheckedCreateWithoutPatientInput> | ScreeningRecordCreateWithoutPatientInput[] | ScreeningRecordUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutPatientInput | ScreeningRecordCreateOrConnectWithoutPatientInput[]
    upsert?: ScreeningRecordUpsertWithWhereUniqueWithoutPatientInput | ScreeningRecordUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: ScreeningRecordCreateManyPatientInputEnvelope
    set?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    disconnect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    delete?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    connect?: ScreeningRecordWhereUniqueInput | ScreeningRecordWhereUniqueInput[]
    update?: ScreeningRecordUpdateWithWhereUniqueWithoutPatientInput | ScreeningRecordUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: ScreeningRecordUpdateManyWithWhereWithoutPatientInput | ScreeningRecordUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: ScreeningRecordScalarWhereInput | ScreeningRecordScalarWhereInput[]
  }

  export type WorkerCreateNestedOneWithoutRecordsInput = {
    create?: XOR<WorkerCreateWithoutRecordsInput, WorkerUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: WorkerCreateOrConnectWithoutRecordsInput
    connect?: WorkerWhereUniqueInput
  }

  export type PatientCreateNestedOneWithoutRecordsInput = {
    create?: XOR<PatientCreateWithoutRecordsInput, PatientUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: PatientCreateOrConnectWithoutRecordsInput
    connect?: PatientWhereUniqueInput
  }

  export type TestResultCreateNestedManyWithoutScreeningRecordInput = {
    create?: XOR<TestResultCreateWithoutScreeningRecordInput, TestResultUncheckedCreateWithoutScreeningRecordInput> | TestResultCreateWithoutScreeningRecordInput[] | TestResultUncheckedCreateWithoutScreeningRecordInput[]
    connectOrCreate?: TestResultCreateOrConnectWithoutScreeningRecordInput | TestResultCreateOrConnectWithoutScreeningRecordInput[]
    createMany?: TestResultCreateManyScreeningRecordInputEnvelope
    connect?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
  }

  export type TestResultUncheckedCreateNestedManyWithoutScreeningRecordInput = {
    create?: XOR<TestResultCreateWithoutScreeningRecordInput, TestResultUncheckedCreateWithoutScreeningRecordInput> | TestResultCreateWithoutScreeningRecordInput[] | TestResultUncheckedCreateWithoutScreeningRecordInput[]
    connectOrCreate?: TestResultCreateOrConnectWithoutScreeningRecordInput | TestResultCreateOrConnectWithoutScreeningRecordInput[]
    createMany?: TestResultCreateManyScreeningRecordInputEnvelope
    connect?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type WorkerUpdateOneRequiredWithoutRecordsNestedInput = {
    create?: XOR<WorkerCreateWithoutRecordsInput, WorkerUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: WorkerCreateOrConnectWithoutRecordsInput
    upsert?: WorkerUpsertWithoutRecordsInput
    connect?: WorkerWhereUniqueInput
    update?: XOR<XOR<WorkerUpdateToOneWithWhereWithoutRecordsInput, WorkerUpdateWithoutRecordsInput>, WorkerUncheckedUpdateWithoutRecordsInput>
  }

  export type PatientUpdateOneRequiredWithoutRecordsNestedInput = {
    create?: XOR<PatientCreateWithoutRecordsInput, PatientUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: PatientCreateOrConnectWithoutRecordsInput
    upsert?: PatientUpsertWithoutRecordsInput
    connect?: PatientWhereUniqueInput
    update?: XOR<XOR<PatientUpdateToOneWithWhereWithoutRecordsInput, PatientUpdateWithoutRecordsInput>, PatientUncheckedUpdateWithoutRecordsInput>
  }

  export type TestResultUpdateManyWithoutScreeningRecordNestedInput = {
    create?: XOR<TestResultCreateWithoutScreeningRecordInput, TestResultUncheckedCreateWithoutScreeningRecordInput> | TestResultCreateWithoutScreeningRecordInput[] | TestResultUncheckedCreateWithoutScreeningRecordInput[]
    connectOrCreate?: TestResultCreateOrConnectWithoutScreeningRecordInput | TestResultCreateOrConnectWithoutScreeningRecordInput[]
    upsert?: TestResultUpsertWithWhereUniqueWithoutScreeningRecordInput | TestResultUpsertWithWhereUniqueWithoutScreeningRecordInput[]
    createMany?: TestResultCreateManyScreeningRecordInputEnvelope
    set?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
    disconnect?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
    delete?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
    connect?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
    update?: TestResultUpdateWithWhereUniqueWithoutScreeningRecordInput | TestResultUpdateWithWhereUniqueWithoutScreeningRecordInput[]
    updateMany?: TestResultUpdateManyWithWhereWithoutScreeningRecordInput | TestResultUpdateManyWithWhereWithoutScreeningRecordInput[]
    deleteMany?: TestResultScalarWhereInput | TestResultScalarWhereInput[]
  }

  export type TestResultUncheckedUpdateManyWithoutScreeningRecordNestedInput = {
    create?: XOR<TestResultCreateWithoutScreeningRecordInput, TestResultUncheckedCreateWithoutScreeningRecordInput> | TestResultCreateWithoutScreeningRecordInput[] | TestResultUncheckedCreateWithoutScreeningRecordInput[]
    connectOrCreate?: TestResultCreateOrConnectWithoutScreeningRecordInput | TestResultCreateOrConnectWithoutScreeningRecordInput[]
    upsert?: TestResultUpsertWithWhereUniqueWithoutScreeningRecordInput | TestResultUpsertWithWhereUniqueWithoutScreeningRecordInput[]
    createMany?: TestResultCreateManyScreeningRecordInputEnvelope
    set?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
    disconnect?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
    delete?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
    connect?: TestResultWhereUniqueInput | TestResultWhereUniqueInput[]
    update?: TestResultUpdateWithWhereUniqueWithoutScreeningRecordInput | TestResultUpdateWithWhereUniqueWithoutScreeningRecordInput[]
    updateMany?: TestResultUpdateManyWithWhereWithoutScreeningRecordInput | TestResultUpdateManyWithWhereWithoutScreeningRecordInput[]
    deleteMany?: TestResultScalarWhereInput | TestResultScalarWhereInput[]
  }

  export type ScreeningRecordCreateNestedOneWithoutTestsInput = {
    create?: XOR<ScreeningRecordCreateWithoutTestsInput, ScreeningRecordUncheckedCreateWithoutTestsInput>
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutTestsInput
    connect?: ScreeningRecordWhereUniqueInput
  }

  export type ScreeningRecordUpdateOneRequiredWithoutTestsNestedInput = {
    create?: XOR<ScreeningRecordCreateWithoutTestsInput, ScreeningRecordUncheckedCreateWithoutTestsInput>
    connectOrCreate?: ScreeningRecordCreateOrConnectWithoutTestsInput
    upsert?: ScreeningRecordUpsertWithoutTestsInput
    connect?: ScreeningRecordWhereUniqueInput
    update?: XOR<XOR<ScreeningRecordUpdateToOneWithWhereWithoutTestsInput, ScreeningRecordUpdateWithoutTestsInput>, ScreeningRecordUncheckedUpdateWithoutTestsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ScreeningRecordCreateWithoutWorkerInput = {
    id?: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    patient: PatientCreateNestedOneWithoutRecordsInput
    tests?: TestResultCreateNestedManyWithoutScreeningRecordInput
  }

  export type ScreeningRecordUncheckedCreateWithoutWorkerInput = {
    id?: string
    patientId: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    tests?: TestResultUncheckedCreateNestedManyWithoutScreeningRecordInput
  }

  export type ScreeningRecordCreateOrConnectWithoutWorkerInput = {
    where: ScreeningRecordWhereUniqueInput
    create: XOR<ScreeningRecordCreateWithoutWorkerInput, ScreeningRecordUncheckedCreateWithoutWorkerInput>
  }

  export type ScreeningRecordCreateManyWorkerInputEnvelope = {
    data: ScreeningRecordCreateManyWorkerInput | ScreeningRecordCreateManyWorkerInput[]
    skipDuplicates?: boolean
  }

  export type ScreeningRecordUpsertWithWhereUniqueWithoutWorkerInput = {
    where: ScreeningRecordWhereUniqueInput
    update: XOR<ScreeningRecordUpdateWithoutWorkerInput, ScreeningRecordUncheckedUpdateWithoutWorkerInput>
    create: XOR<ScreeningRecordCreateWithoutWorkerInput, ScreeningRecordUncheckedCreateWithoutWorkerInput>
  }

  export type ScreeningRecordUpdateWithWhereUniqueWithoutWorkerInput = {
    where: ScreeningRecordWhereUniqueInput
    data: XOR<ScreeningRecordUpdateWithoutWorkerInput, ScreeningRecordUncheckedUpdateWithoutWorkerInput>
  }

  export type ScreeningRecordUpdateManyWithWhereWithoutWorkerInput = {
    where: ScreeningRecordScalarWhereInput
    data: XOR<ScreeningRecordUpdateManyMutationInput, ScreeningRecordUncheckedUpdateManyWithoutWorkerInput>
  }

  export type ScreeningRecordScalarWhereInput = {
    AND?: ScreeningRecordScalarWhereInput | ScreeningRecordScalarWhereInput[]
    OR?: ScreeningRecordScalarWhereInput[]
    NOT?: ScreeningRecordScalarWhereInput | ScreeningRecordScalarWhereInput[]
    id?: StringFilter<"ScreeningRecord"> | string
    patientId?: StringFilter<"ScreeningRecord"> | string
    joint?: StringFilter<"ScreeningRecord"> | string
    side?: StringFilter<"ScreeningRecord"> | string
    answers?: JsonFilter<"ScreeningRecord">
    movement?: JsonNullableFilter<"ScreeningRecord">
    result?: JsonFilter<"ScreeningRecord">
    createdAt?: DateTimeFilter<"ScreeningRecord"> | Date | string
    followUpDate?: DateTimeNullableFilter<"ScreeningRecord"> | Date | string | null
    workerId?: StringFilter<"ScreeningRecord"> | string
  }

  export type ScreeningRecordCreateWithoutPatientInput = {
    id?: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    worker: WorkerCreateNestedOneWithoutRecordsInput
    tests?: TestResultCreateNestedManyWithoutScreeningRecordInput
  }

  export type ScreeningRecordUncheckedCreateWithoutPatientInput = {
    id?: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    workerId: string
    tests?: TestResultUncheckedCreateNestedManyWithoutScreeningRecordInput
  }

  export type ScreeningRecordCreateOrConnectWithoutPatientInput = {
    where: ScreeningRecordWhereUniqueInput
    create: XOR<ScreeningRecordCreateWithoutPatientInput, ScreeningRecordUncheckedCreateWithoutPatientInput>
  }

  export type ScreeningRecordCreateManyPatientInputEnvelope = {
    data: ScreeningRecordCreateManyPatientInput | ScreeningRecordCreateManyPatientInput[]
    skipDuplicates?: boolean
  }

  export type ScreeningRecordUpsertWithWhereUniqueWithoutPatientInput = {
    where: ScreeningRecordWhereUniqueInput
    update: XOR<ScreeningRecordUpdateWithoutPatientInput, ScreeningRecordUncheckedUpdateWithoutPatientInput>
    create: XOR<ScreeningRecordCreateWithoutPatientInput, ScreeningRecordUncheckedCreateWithoutPatientInput>
  }

  export type ScreeningRecordUpdateWithWhereUniqueWithoutPatientInput = {
    where: ScreeningRecordWhereUniqueInput
    data: XOR<ScreeningRecordUpdateWithoutPatientInput, ScreeningRecordUncheckedUpdateWithoutPatientInput>
  }

  export type ScreeningRecordUpdateManyWithWhereWithoutPatientInput = {
    where: ScreeningRecordScalarWhereInput
    data: XOR<ScreeningRecordUpdateManyMutationInput, ScreeningRecordUncheckedUpdateManyWithoutPatientInput>
  }

  export type WorkerCreateWithoutRecordsInput = {
    id?: string
    username: string
    passwordHash: string
    name: string
    role?: string
    createdAt?: Date | string
  }

  export type WorkerUncheckedCreateWithoutRecordsInput = {
    id?: string
    username: string
    passwordHash: string
    name: string
    role?: string
    createdAt?: Date | string
  }

  export type WorkerCreateOrConnectWithoutRecordsInput = {
    where: WorkerWhereUniqueInput
    create: XOR<WorkerCreateWithoutRecordsInput, WorkerUncheckedCreateWithoutRecordsInput>
  }

  export type PatientCreateWithoutRecordsInput = {
    id?: string
    name: string
    age: number
    sex: string
    phone: string
    village: string
    phc: string
    healthId?: string | null
    heightCm?: number | null
    weightKg?: number | null
    occupation: string
    priorInjury: boolean
    familyHistory: boolean
    createdAt?: Date | string
  }

  export type PatientUncheckedCreateWithoutRecordsInput = {
    id?: string
    name: string
    age: number
    sex: string
    phone: string
    village: string
    phc: string
    healthId?: string | null
    heightCm?: number | null
    weightKg?: number | null
    occupation: string
    priorInjury: boolean
    familyHistory: boolean
    createdAt?: Date | string
  }

  export type PatientCreateOrConnectWithoutRecordsInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutRecordsInput, PatientUncheckedCreateWithoutRecordsInput>
  }

  export type TestResultCreateWithoutScreeningRecordInput = {
    id?: string
    testId: string
    status: string
    completed: boolean
    quality: string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
  }

  export type TestResultUncheckedCreateWithoutScreeningRecordInput = {
    id?: string
    testId: string
    status: string
    completed: boolean
    quality: string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
  }

  export type TestResultCreateOrConnectWithoutScreeningRecordInput = {
    where: TestResultWhereUniqueInput
    create: XOR<TestResultCreateWithoutScreeningRecordInput, TestResultUncheckedCreateWithoutScreeningRecordInput>
  }

  export type TestResultCreateManyScreeningRecordInputEnvelope = {
    data: TestResultCreateManyScreeningRecordInput | TestResultCreateManyScreeningRecordInput[]
    skipDuplicates?: boolean
  }

  export type WorkerUpsertWithoutRecordsInput = {
    update: XOR<WorkerUpdateWithoutRecordsInput, WorkerUncheckedUpdateWithoutRecordsInput>
    create: XOR<WorkerCreateWithoutRecordsInput, WorkerUncheckedCreateWithoutRecordsInput>
    where?: WorkerWhereInput
  }

  export type WorkerUpdateToOneWithWhereWithoutRecordsInput = {
    where?: WorkerWhereInput
    data: XOR<WorkerUpdateWithoutRecordsInput, WorkerUncheckedUpdateWithoutRecordsInput>
  }

  export type WorkerUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkerUncheckedUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientUpsertWithoutRecordsInput = {
    update: XOR<PatientUpdateWithoutRecordsInput, PatientUncheckedUpdateWithoutRecordsInput>
    create: XOR<PatientCreateWithoutRecordsInput, PatientUncheckedCreateWithoutRecordsInput>
    where?: PatientWhereInput
  }

  export type PatientUpdateToOneWithWhereWithoutRecordsInput = {
    where?: PatientWhereInput
    data: XOR<PatientUpdateWithoutRecordsInput, PatientUncheckedUpdateWithoutRecordsInput>
  }

  export type PatientUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    age?: IntFieldUpdateOperationsInput | number
    sex?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    village?: StringFieldUpdateOperationsInput | string
    phc?: StringFieldUpdateOperationsInput | string
    healthId?: NullableStringFieldUpdateOperationsInput | string | null
    heightCm?: NullableFloatFieldUpdateOperationsInput | number | null
    weightKg?: NullableFloatFieldUpdateOperationsInput | number | null
    occupation?: StringFieldUpdateOperationsInput | string
    priorInjury?: BoolFieldUpdateOperationsInput | boolean
    familyHistory?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientUncheckedUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    age?: IntFieldUpdateOperationsInput | number
    sex?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    village?: StringFieldUpdateOperationsInput | string
    phc?: StringFieldUpdateOperationsInput | string
    healthId?: NullableStringFieldUpdateOperationsInput | string | null
    heightCm?: NullableFloatFieldUpdateOperationsInput | number | null
    weightKg?: NullableFloatFieldUpdateOperationsInput | number | null
    occupation?: StringFieldUpdateOperationsInput | string
    priorInjury?: BoolFieldUpdateOperationsInput | boolean
    familyHistory?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestResultUpsertWithWhereUniqueWithoutScreeningRecordInput = {
    where: TestResultWhereUniqueInput
    update: XOR<TestResultUpdateWithoutScreeningRecordInput, TestResultUncheckedUpdateWithoutScreeningRecordInput>
    create: XOR<TestResultCreateWithoutScreeningRecordInput, TestResultUncheckedCreateWithoutScreeningRecordInput>
  }

  export type TestResultUpdateWithWhereUniqueWithoutScreeningRecordInput = {
    where: TestResultWhereUniqueInput
    data: XOR<TestResultUpdateWithoutScreeningRecordInput, TestResultUncheckedUpdateWithoutScreeningRecordInput>
  }

  export type TestResultUpdateManyWithWhereWithoutScreeningRecordInput = {
    where: TestResultScalarWhereInput
    data: XOR<TestResultUpdateManyMutationInput, TestResultUncheckedUpdateManyWithoutScreeningRecordInput>
  }

  export type TestResultScalarWhereInput = {
    AND?: TestResultScalarWhereInput | TestResultScalarWhereInput[]
    OR?: TestResultScalarWhereInput[]
    NOT?: TestResultScalarWhereInput | TestResultScalarWhereInput[]
    id?: StringFilter<"TestResult"> | string
    testId?: StringFilter<"TestResult"> | string
    status?: StringFilter<"TestResult"> | string
    completed?: BoolFilter<"TestResult"> | boolean
    quality?: StringFilter<"TestResult"> | string
    measurements?: JsonNullableFilter<"TestResult">
    observations?: JsonNullableFilter<"TestResult">
    technicalDetails?: JsonNullableFilter<"TestResult">
    timestamp?: DateTimeFilter<"TestResult"> | Date | string
    screeningRecordId?: StringFilter<"TestResult"> | string
  }

  export type ScreeningRecordCreateWithoutTestsInput = {
    id?: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    worker: WorkerCreateNestedOneWithoutRecordsInput
    patient: PatientCreateNestedOneWithoutRecordsInput
  }

  export type ScreeningRecordUncheckedCreateWithoutTestsInput = {
    id?: string
    patientId: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    workerId: string
  }

  export type ScreeningRecordCreateOrConnectWithoutTestsInput = {
    where: ScreeningRecordWhereUniqueInput
    create: XOR<ScreeningRecordCreateWithoutTestsInput, ScreeningRecordUncheckedCreateWithoutTestsInput>
  }

  export type ScreeningRecordUpsertWithoutTestsInput = {
    update: XOR<ScreeningRecordUpdateWithoutTestsInput, ScreeningRecordUncheckedUpdateWithoutTestsInput>
    create: XOR<ScreeningRecordCreateWithoutTestsInput, ScreeningRecordUncheckedCreateWithoutTestsInput>
    where?: ScreeningRecordWhereInput
  }

  export type ScreeningRecordUpdateToOneWithWhereWithoutTestsInput = {
    where?: ScreeningRecordWhereInput
    data: XOR<ScreeningRecordUpdateWithoutTestsInput, ScreeningRecordUncheckedUpdateWithoutTestsInput>
  }

  export type ScreeningRecordUpdateWithoutTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    worker?: WorkerUpdateOneRequiredWithoutRecordsNestedInput
    patient?: PatientUpdateOneRequiredWithoutRecordsNestedInput
  }

  export type ScreeningRecordUncheckedUpdateWithoutTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type ScreeningRecordCreateManyWorkerInput = {
    id?: string
    patientId: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
  }

  export type ScreeningRecordUpdateWithoutWorkerInput = {
    id?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    patient?: PatientUpdateOneRequiredWithoutRecordsNestedInput
    tests?: TestResultUpdateManyWithoutScreeningRecordNestedInput
  }

  export type ScreeningRecordUncheckedUpdateWithoutWorkerInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tests?: TestResultUncheckedUpdateManyWithoutScreeningRecordNestedInput
  }

  export type ScreeningRecordUncheckedUpdateManyWithoutWorkerInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ScreeningRecordCreateManyPatientInput = {
    id?: string
    joint: string
    side: string
    answers: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    followUpDate?: Date | string | null
    workerId: string
  }

  export type ScreeningRecordUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    worker?: WorkerUpdateOneRequiredWithoutRecordsNestedInput
    tests?: TestResultUpdateManyWithoutScreeningRecordNestedInput
  }

  export type ScreeningRecordUncheckedUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    workerId?: StringFieldUpdateOperationsInput | string
    tests?: TestResultUncheckedUpdateManyWithoutScreeningRecordNestedInput
  }

  export type ScreeningRecordUncheckedUpdateManyWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    joint?: StringFieldUpdateOperationsInput | string
    side?: StringFieldUpdateOperationsInput | string
    answers?: JsonNullValueInput | InputJsonValue
    movement?: NullableJsonNullValueInput | InputJsonValue
    result?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followUpDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type TestResultCreateManyScreeningRecordInput = {
    id?: string
    testId: string
    status: string
    completed: boolean
    quality: string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
  }

  export type TestResultUpdateWithoutScreeningRecordInput = {
    id?: StringFieldUpdateOperationsInput | string
    testId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    quality?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestResultUncheckedUpdateWithoutScreeningRecordInput = {
    id?: StringFieldUpdateOperationsInput | string
    testId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    quality?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestResultUncheckedUpdateManyWithoutScreeningRecordInput = {
    id?: StringFieldUpdateOperationsInput | string
    testId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    quality?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    observations?: NullableJsonNullValueInput | InputJsonValue
    technicalDetails?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}