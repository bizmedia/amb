import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models";
import { type PrismaClient } from "./class";
export type * from '../models';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
/**
 * Prisma Errors
 */
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
/**
 * Re-export of sql-template-tag
 */
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
/**
 * Decimal.js
 */
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
/**
* Extensions
*/
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
/**
 * Prisma Client JS version: 7.3.0
 * Query Engine version: 9d6ad21cbbceab97458517b147a6a09ff43aa735
 */
export declare const prismaVersion: PrismaVersion;
/**
 * Utility Types
 */
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: runtime.DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: runtime.JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
/**
 * Subset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
 */
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
/**
 * SelectSubset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
 * Additionally, it validates, if both select and include are present. If the case, it errors.
 */
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
/**
 * Subset + Intersection
 * @desc From `T` pick properties that exist in `U` and intersect `K`
 */
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
/**
 * XOR is needed to have a real mutually exclusive union type
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 */
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
/**
 * Is T a Record?
 */
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
/**
 * If it's T[], return T
 */
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
/**
 * From ts-toolbelt
 */
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
/** Helper Types for "Merge" **/
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
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
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
/** End Helper Types for "Merge" **/
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
/**
 * Convert tuple to union
 */
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
/**
 * Like `Pick`, but additionally can also accept an array of keys
 */
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
/**
 * Exclude all keys with underscores
 */
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly Agent: "Agent";
    readonly Thread: "Thread";
    readonly Message: "Message";
    readonly Tenant: "Tenant";
    readonly User: "User";
    readonly Project: "Project";
    readonly Sprint: "Sprint";
    readonly Epic: "Epic";
    readonly ProjectToken: "ProjectToken";
    readonly ProjectTokenAudit: "ProjectTokenAudit";
    readonly Task: "Task";
    readonly MessageTaskLink: "MessageTaskLink";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "agent" | "thread" | "message" | "tenant" | "user" | "project" | "sprint" | "epic" | "projectToken" | "projectTokenAudit" | "task" | "messageTaskLink";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        Agent: {
            payload: Prisma.$AgentPayload<ExtArgs>;
            fields: Prisma.AgentFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AgentFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AgentFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload>;
                };
                findFirst: {
                    args: Prisma.AgentFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AgentFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload>;
                };
                findMany: {
                    args: Prisma.AgentFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload>[];
                };
                create: {
                    args: Prisma.AgentCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload>;
                };
                createMany: {
                    args: Prisma.AgentCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AgentCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload>[];
                };
                delete: {
                    args: Prisma.AgentDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload>;
                };
                update: {
                    args: Prisma.AgentUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload>;
                };
                deleteMany: {
                    args: Prisma.AgentDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AgentUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AgentUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload>[];
                };
                upsert: {
                    args: Prisma.AgentUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AgentPayload>;
                };
                aggregate: {
                    args: Prisma.AgentAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAgent>;
                };
                groupBy: {
                    args: Prisma.AgentGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AgentGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AgentCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AgentCountAggregateOutputType> | number;
                };
            };
        };
        Thread: {
            payload: Prisma.$ThreadPayload<ExtArgs>;
            fields: Prisma.ThreadFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ThreadFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ThreadFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload>;
                };
                findFirst: {
                    args: Prisma.ThreadFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ThreadFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload>;
                };
                findMany: {
                    args: Prisma.ThreadFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload>[];
                };
                create: {
                    args: Prisma.ThreadCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload>;
                };
                createMany: {
                    args: Prisma.ThreadCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ThreadCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload>[];
                };
                delete: {
                    args: Prisma.ThreadDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload>;
                };
                update: {
                    args: Prisma.ThreadUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload>;
                };
                deleteMany: {
                    args: Prisma.ThreadDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ThreadUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ThreadUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload>[];
                };
                upsert: {
                    args: Prisma.ThreadUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadPayload>;
                };
                aggregate: {
                    args: Prisma.ThreadAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateThread>;
                };
                groupBy: {
                    args: Prisma.ThreadGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ThreadGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ThreadCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ThreadCountAggregateOutputType> | number;
                };
            };
        };
        Message: {
            payload: Prisma.$MessagePayload<ExtArgs>;
            fields: Prisma.MessageFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MessageFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MessageFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload>;
                };
                findFirst: {
                    args: Prisma.MessageFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MessageFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload>;
                };
                findMany: {
                    args: Prisma.MessageFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload>[];
                };
                create: {
                    args: Prisma.MessageCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload>;
                };
                createMany: {
                    args: Prisma.MessageCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MessageCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload>[];
                };
                delete: {
                    args: Prisma.MessageDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload>;
                };
                update: {
                    args: Prisma.MessageUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload>;
                };
                deleteMany: {
                    args: Prisma.MessageDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MessageUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MessageUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload>[];
                };
                upsert: {
                    args: Prisma.MessageUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagePayload>;
                };
                aggregate: {
                    args: Prisma.MessageAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMessage>;
                };
                groupBy: {
                    args: Prisma.MessageGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MessageGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MessageCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MessageCountAggregateOutputType> | number;
                };
            };
        };
        Tenant: {
            payload: Prisma.$TenantPayload<ExtArgs>;
            fields: Prisma.TenantFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TenantFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                findFirst: {
                    args: Prisma.TenantFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                findMany: {
                    args: Prisma.TenantFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>[];
                };
                create: {
                    args: Prisma.TenantCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                createMany: {
                    args: Prisma.TenantCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>[];
                };
                delete: {
                    args: Prisma.TenantDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                update: {
                    args: Prisma.TenantUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                deleteMany: {
                    args: Prisma.TenantDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TenantUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>[];
                };
                upsert: {
                    args: Prisma.TenantUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                aggregate: {
                    args: Prisma.TenantAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTenant>;
                };
                groupBy: {
                    args: Prisma.TenantGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TenantGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TenantCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TenantCountAggregateOutputType> | number;
                };
            };
        };
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
        Project: {
            payload: Prisma.$ProjectPayload<ExtArgs>;
            fields: Prisma.ProjectFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ProjectFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ProjectFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload>;
                };
                findFirst: {
                    args: Prisma.ProjectFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ProjectFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload>;
                };
                findMany: {
                    args: Prisma.ProjectFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload>[];
                };
                create: {
                    args: Prisma.ProjectCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload>;
                };
                createMany: {
                    args: Prisma.ProjectCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ProjectCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload>[];
                };
                delete: {
                    args: Prisma.ProjectDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload>;
                };
                update: {
                    args: Prisma.ProjectUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload>;
                };
                deleteMany: {
                    args: Prisma.ProjectDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ProjectUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ProjectUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload>[];
                };
                upsert: {
                    args: Prisma.ProjectUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectPayload>;
                };
                aggregate: {
                    args: Prisma.ProjectAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateProject>;
                };
                groupBy: {
                    args: Prisma.ProjectGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProjectGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ProjectCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProjectCountAggregateOutputType> | number;
                };
            };
        };
        Sprint: {
            payload: Prisma.$SprintPayload<ExtArgs>;
            fields: Prisma.SprintFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SprintFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SprintFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload>;
                };
                findFirst: {
                    args: Prisma.SprintFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SprintFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload>;
                };
                findMany: {
                    args: Prisma.SprintFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload>[];
                };
                create: {
                    args: Prisma.SprintCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload>;
                };
                createMany: {
                    args: Prisma.SprintCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SprintCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload>[];
                };
                delete: {
                    args: Prisma.SprintDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload>;
                };
                update: {
                    args: Prisma.SprintUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload>;
                };
                deleteMany: {
                    args: Prisma.SprintDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SprintUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SprintUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload>[];
                };
                upsert: {
                    args: Prisma.SprintUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SprintPayload>;
                };
                aggregate: {
                    args: Prisma.SprintAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSprint>;
                };
                groupBy: {
                    args: Prisma.SprintGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SprintGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SprintCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SprintCountAggregateOutputType> | number;
                };
            };
        };
        Epic: {
            payload: Prisma.$EpicPayload<ExtArgs>;
            fields: Prisma.EpicFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EpicFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EpicFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload>;
                };
                findFirst: {
                    args: Prisma.EpicFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EpicFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload>;
                };
                findMany: {
                    args: Prisma.EpicFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload>[];
                };
                create: {
                    args: Prisma.EpicCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload>;
                };
                createMany: {
                    args: Prisma.EpicCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EpicCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload>[];
                };
                delete: {
                    args: Prisma.EpicDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload>;
                };
                update: {
                    args: Prisma.EpicUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload>;
                };
                deleteMany: {
                    args: Prisma.EpicDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EpicUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EpicUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload>[];
                };
                upsert: {
                    args: Prisma.EpicUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EpicPayload>;
                };
                aggregate: {
                    args: Prisma.EpicAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEpic>;
                };
                groupBy: {
                    args: Prisma.EpicGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EpicGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EpicCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EpicCountAggregateOutputType> | number;
                };
            };
        };
        ProjectToken: {
            payload: Prisma.$ProjectTokenPayload<ExtArgs>;
            fields: Prisma.ProjectTokenFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ProjectTokenFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ProjectTokenFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload>;
                };
                findFirst: {
                    args: Prisma.ProjectTokenFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ProjectTokenFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload>;
                };
                findMany: {
                    args: Prisma.ProjectTokenFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload>[];
                };
                create: {
                    args: Prisma.ProjectTokenCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload>;
                };
                createMany: {
                    args: Prisma.ProjectTokenCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ProjectTokenCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload>[];
                };
                delete: {
                    args: Prisma.ProjectTokenDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload>;
                };
                update: {
                    args: Prisma.ProjectTokenUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload>;
                };
                deleteMany: {
                    args: Prisma.ProjectTokenDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ProjectTokenUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ProjectTokenUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload>[];
                };
                upsert: {
                    args: Prisma.ProjectTokenUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenPayload>;
                };
                aggregate: {
                    args: Prisma.ProjectTokenAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateProjectToken>;
                };
                groupBy: {
                    args: Prisma.ProjectTokenGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProjectTokenGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ProjectTokenCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProjectTokenCountAggregateOutputType> | number;
                };
            };
        };
        ProjectTokenAudit: {
            payload: Prisma.$ProjectTokenAuditPayload<ExtArgs>;
            fields: Prisma.ProjectTokenAuditFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ProjectTokenAuditFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ProjectTokenAuditFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload>;
                };
                findFirst: {
                    args: Prisma.ProjectTokenAuditFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ProjectTokenAuditFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload>;
                };
                findMany: {
                    args: Prisma.ProjectTokenAuditFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload>[];
                };
                create: {
                    args: Prisma.ProjectTokenAuditCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload>;
                };
                createMany: {
                    args: Prisma.ProjectTokenAuditCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ProjectTokenAuditCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload>[];
                };
                delete: {
                    args: Prisma.ProjectTokenAuditDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload>;
                };
                update: {
                    args: Prisma.ProjectTokenAuditUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload>;
                };
                deleteMany: {
                    args: Prisma.ProjectTokenAuditDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ProjectTokenAuditUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ProjectTokenAuditUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload>[];
                };
                upsert: {
                    args: Prisma.ProjectTokenAuditUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProjectTokenAuditPayload>;
                };
                aggregate: {
                    args: Prisma.ProjectTokenAuditAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateProjectTokenAudit>;
                };
                groupBy: {
                    args: Prisma.ProjectTokenAuditGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProjectTokenAuditGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ProjectTokenAuditCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProjectTokenAuditCountAggregateOutputType> | number;
                };
            };
        };
        Task: {
            payload: Prisma.$TaskPayload<ExtArgs>;
            fields: Prisma.TaskFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TaskFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TaskFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload>;
                };
                findFirst: {
                    args: Prisma.TaskFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TaskFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload>;
                };
                findMany: {
                    args: Prisma.TaskFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload>[];
                };
                create: {
                    args: Prisma.TaskCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload>;
                };
                createMany: {
                    args: Prisma.TaskCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TaskCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload>[];
                };
                delete: {
                    args: Prisma.TaskDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload>;
                };
                update: {
                    args: Prisma.TaskUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload>;
                };
                deleteMany: {
                    args: Prisma.TaskDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TaskUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TaskUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload>[];
                };
                upsert: {
                    args: Prisma.TaskUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TaskPayload>;
                };
                aggregate: {
                    args: Prisma.TaskAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTask>;
                };
                groupBy: {
                    args: Prisma.TaskGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TaskGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TaskCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TaskCountAggregateOutputType> | number;
                };
            };
        };
        MessageTaskLink: {
            payload: Prisma.$MessageTaskLinkPayload<ExtArgs>;
            fields: Prisma.MessageTaskLinkFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MessageTaskLinkFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MessageTaskLinkFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload>;
                };
                findFirst: {
                    args: Prisma.MessageTaskLinkFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MessageTaskLinkFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload>;
                };
                findMany: {
                    args: Prisma.MessageTaskLinkFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload>[];
                };
                create: {
                    args: Prisma.MessageTaskLinkCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload>;
                };
                createMany: {
                    args: Prisma.MessageTaskLinkCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MessageTaskLinkCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload>[];
                };
                delete: {
                    args: Prisma.MessageTaskLinkDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload>;
                };
                update: {
                    args: Prisma.MessageTaskLinkUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload>;
                };
                deleteMany: {
                    args: Prisma.MessageTaskLinkDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MessageTaskLinkUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MessageTaskLinkUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload>[];
                };
                upsert: {
                    args: Prisma.MessageTaskLinkUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessageTaskLinkPayload>;
                };
                aggregate: {
                    args: Prisma.MessageTaskLinkAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMessageTaskLink>;
                };
                groupBy: {
                    args: Prisma.MessageTaskLinkGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MessageTaskLinkGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MessageTaskLinkCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MessageTaskLinkCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
/**
 * Enums
 */
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const AgentScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly projectId: "projectId";
    readonly name: "name";
    readonly role: "role";
    readonly status: "status";
    readonly capabilities: "capabilities";
    readonly createdAt: "createdAt";
    readonly lastSeen: "lastSeen";
};
export type AgentScalarFieldEnum = (typeof AgentScalarFieldEnum)[keyof typeof AgentScalarFieldEnum];
export declare const ThreadScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly projectId: "projectId";
    readonly title: "title";
    readonly status: "status";
    readonly createdAt: "createdAt";
};
export type ThreadScalarFieldEnum = (typeof ThreadScalarFieldEnum)[keyof typeof ThreadScalarFieldEnum];
export declare const MessageScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly projectId: "projectId";
    readonly threadId: "threadId";
    readonly fromAgentId: "fromAgentId";
    readonly toAgentId: "toAgentId";
    readonly payload: "payload";
    readonly status: "status";
    readonly retries: "retries";
    readonly parentId: "parentId";
    readonly createdAt: "createdAt";
};
export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum];
export declare const TenantScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly slug: "slug";
    readonly createdAt: "createdAt";
};
export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly displayName: "displayName";
    readonly roles: "roles";
    readonly isActive: "isActive";
    readonly lastLoginAt: "lastLoginAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const ProjectScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly name: "name";
    readonly slug: "slug";
    readonly taskPrefix: "taskPrefix";
    readonly taskSequence: "taskSequence";
    readonly createdAt: "createdAt";
};
export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum];
export declare const SprintScalarFieldEnum: {
    readonly id: "id";
    readonly projectId: "projectId";
    readonly name: "name";
    readonly goal: "goal";
    readonly startDate: "startDate";
    readonly endDate: "endDate";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SprintScalarFieldEnum = (typeof SprintScalarFieldEnum)[keyof typeof SprintScalarFieldEnum];
export declare const EpicScalarFieldEnum: {
    readonly id: "id";
    readonly projectId: "projectId";
    readonly title: "title";
    readonly description: "description";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type EpicScalarFieldEnum = (typeof EpicScalarFieldEnum)[keyof typeof EpicScalarFieldEnum];
export declare const ProjectTokenScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly projectId: "projectId";
    readonly name: "name";
    readonly tokenHash: "tokenHash";
    readonly issuedBy: "issuedBy";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly lastUsedAt: "lastUsedAt";
    readonly expiresAt: "expiresAt";
    readonly revokedAt: "revokedAt";
};
export type ProjectTokenScalarFieldEnum = (typeof ProjectTokenScalarFieldEnum)[keyof typeof ProjectTokenScalarFieldEnum];
export declare const ProjectTokenAuditScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly projectId: "projectId";
    readonly tokenId: "tokenId";
    readonly event: "event";
    readonly actorType: "actorType";
    readonly actorId: "actorId";
    readonly metadata: "metadata";
    readonly createdAt: "createdAt";
};
export type ProjectTokenAuditScalarFieldEnum = (typeof ProjectTokenAuditScalarFieldEnum)[keyof typeof ProjectTokenAuditScalarFieldEnum];
export declare const TaskScalarFieldEnum: {
    readonly id: "id";
    readonly projectId: "projectId";
    readonly key: "key";
    readonly title: "title";
    readonly description: "description";
    readonly state: "state";
    readonly priority: "priority";
    readonly assigneeId: "assigneeId";
    readonly epicId: "epicId";
    readonly sprintId: "sprintId";
    readonly dueDate: "dueDate";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TaskScalarFieldEnum = (typeof TaskScalarFieldEnum)[keyof typeof TaskScalarFieldEnum];
export declare const MessageTaskLinkScalarFieldEnum: {
    readonly messageId: "messageId";
    readonly taskId: "taskId";
    readonly projectId: "projectId";
    readonly tenantId: "tenantId";
    readonly createdAt: "createdAt";
};
export type MessageTaskLinkScalarFieldEnum = (typeof MessageTaskLinkScalarFieldEnum)[keyof typeof MessageTaskLinkScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const JsonNullValueInput: {
    readonly JsonNull: runtime.JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const JsonNullValueFilter: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
    readonly AnyNull: runtime.AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
/**
 * Field references
 */
/**
 * Reference to a field of type 'String'
 */
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
/**
 * Reference to a field of type 'String[]'
 */
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
/**
 * Reference to a field of type 'Json'
 */
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
/**
 * Reference to a field of type 'QueryMode'
 */
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
/**
 * Reference to a field of type 'DateTime'
 */
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
/**
 * Reference to a field of type 'DateTime[]'
 */
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
/**
 * Reference to a field of type 'Int'
 */
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
/**
 * Reference to a field of type 'Int[]'
 */
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
/**
 * Reference to a field of type 'Boolean'
 */
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
/**
 * Reference to a field of type 'SprintStatus'
 */
export type EnumSprintStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SprintStatus'>;
/**
 * Reference to a field of type 'SprintStatus[]'
 */
export type ListEnumSprintStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SprintStatus[]'>;
/**
 * Reference to a field of type 'EpicStatus'
 */
export type EnumEpicStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EpicStatus'>;
/**
 * Reference to a field of type 'EpicStatus[]'
 */
export type ListEnumEpicStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EpicStatus[]'>;
/**
 * Reference to a field of type 'TaskState'
 */
export type EnumTaskStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaskState'>;
/**
 * Reference to a field of type 'TaskState[]'
 */
export type ListEnumTaskStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaskState[]'>;
/**
 * Reference to a field of type 'TaskPriority'
 */
export type EnumTaskPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaskPriority'>;
/**
 * Reference to a field of type 'TaskPriority[]'
 */
export type ListEnumTaskPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaskPriority[]'>;
/**
 * Reference to a field of type 'Float'
 */
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
/**
 * Reference to a field of type 'Float[]'
 */
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
/**
 * Batch Payload for updateMany & deleteMany & createMany
 */
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-pg`.
     */
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl: string;
    adapter?: never;
}) & {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
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
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
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
    omit?: GlobalOmitConfig;
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
    comments?: runtime.SqlCommenterPlugin[];
};
export type GlobalOmitConfig = {
    agent?: Prisma.AgentOmit;
    thread?: Prisma.ThreadOmit;
    message?: Prisma.MessageOmit;
    tenant?: Prisma.TenantOmit;
    user?: Prisma.UserOmit;
    project?: Prisma.ProjectOmit;
    sprint?: Prisma.SprintOmit;
    epic?: Prisma.EpicOmit;
    projectToken?: Prisma.ProjectTokenOmit;
    projectTokenAudit?: Prisma.ProjectTokenAuditOmit;
    task?: Prisma.TaskOmit;
    messageTaskLink?: Prisma.MessageTaskLinkOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
/**
 * `PrismaClient` proxy available in interactive transactions.
 */
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
//# sourceMappingURL=prismaNamespace.d.ts.map