import * as funtypes from 'funtypes';
type UnionToIntersection<T> = (T extends unknown ? (k: T) => void : never) extends (k: infer I) => void ? I : never;
export declare const BytesParser: funtypes.ParsedValue<funtypes.String, Uint8Array>['config'];
export declare const LiteralConverterParserFactory: <TInput, TOutput>(input: TInput, output: TOutput) => funtypes.ParsedValue<funtypes.Runtype<TInput>, TOutput>['config'];
export declare const NonHexBigInt: funtypes.ParsedValue<funtypes.String, bigint>;
export type NonHexBigInt = funtypes.Static<typeof NonHexBigInt>;
export declare const EthereumQuantity: funtypes.ParsedValue<funtypes.String, bigint>;
export type EthereumQuantity = funtypes.Static<typeof EthereumQuantity>;
export declare const EthereumQuantitySmall: funtypes.ParsedValue<funtypes.String, bigint>;
export type EthereumQuantitySmall = funtypes.Static<typeof EthereumQuantitySmall>;
export declare const EthereumData: funtypes.ParsedValue<funtypes.String, Uint8Array>;
export type EthereumData = funtypes.Static<typeof EthereumData>;
export declare const EthereumAddress: funtypes.ParsedValue<funtypes.String, bigint>;
export type EthereumAddress = funtypes.Static<typeof EthereumAddress>;
export type OptionalEthereumAddress = funtypes.Static<typeof OptionalEthereumAddress>;
export declare const OptionalEthereumAddress: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<undefined>]>;
export declare const EthereumAddressOrMissing: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.ParsedValue<funtypes.Literal<"missing">, undefined>]>;
export type EthereumAddressOrMissing = funtypes.Static<typeof EthereumAddressOrMissing>;
export declare const EthereumBytes32: funtypes.ParsedValue<funtypes.String, bigint>;
export type EthereumBytes32 = funtypes.Static<typeof EthereumBytes32>;
export declare const EthereumBytes256: funtypes.ParsedValue<funtypes.String, bigint>;
export type EthereumBytes256 = funtypes.Static<typeof EthereumBytes256>;
export declare const EthereumTimestamp: funtypes.ParsedValue<funtypes.String, Date>;
export type EthereumTimestamp = funtypes.Static<typeof EthereumTimestamp>;
export declare const EthereumBlockTag: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<"latest">, funtypes.Literal<"pending">]>;
export type EthereumBlockTag = funtypes.Static<typeof EthereumBlockTag>;
export declare const EthereumInput: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
export type EthereumInput = funtypes.Static<typeof EthereumInput>;
export declare const EthereumAccessList: funtypes.ReadonlyArray<funtypes.Object<{
    address: funtypes.ParsedValue<funtypes.String, bigint>;
    storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
}, true>>;
export type EthereumAccessList = funtypes.Static<typeof EthereumAccessList>;
export type EthereumUnsignedTransaction1559 = funtypes.Static<typeof EthereumUnsignedTransaction1559>;
export declare const EthereumUnsignedTransaction1559: funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x2">, "1559">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>;
export type EthereumUnsignedTransaction = funtypes.Static<typeof EthereumUnsignedTransaction>;
export declare const EthereumUnsignedTransaction: funtypes.Union<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "legacy">, funtypes.ParsedValue<funtypes.Literal<undefined>, "legacy">]>;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
}, true>, funtypes.Partial<{
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x1">, "2930">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x2">, "1559">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x3">, "4844">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerBlobGas: funtypes.ParsedValue<funtypes.String, bigint>;
    blobVersionedHashes: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>]>;
export type OptionalEthereumUnsignedTransaction = funtypes.Static<typeof OptionalEthereumUnsignedTransaction>;
export declare const OptionalEthereumUnsignedTransaction: funtypes.Union<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "legacy">, funtypes.ParsedValue<funtypes.Literal<undefined>, "legacy">]>;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
}, true>, funtypes.Partial<{
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x1">, "2930">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x2">, "1559">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x3">, "4844">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerBlobGas: funtypes.ParsedValue<funtypes.String, bigint>;
    blobVersionedHashes: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
}, true>, funtypes.Partial<{
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>]>;
export type EthereumSignedTransaction1559 = funtypes.Static<typeof EthereumSignedTransaction1559>;
export declare const EthereumSignedTransaction1559: funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x2">, "1559">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    r: funtypes.ParsedValue<funtypes.String, bigint>;
    s: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Union<[funtypes.Object<{
    yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
}, true>, funtypes.Object<{
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>]>;
export type EthereumSignedTransaction = funtypes.Static<typeof EthereumSignedTransaction>;
export declare const EthereumSignedTransaction: funtypes.Union<[funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "legacy">, funtypes.ParsedValue<funtypes.Literal<undefined>, "legacy">]>;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
}, true>, funtypes.Partial<{
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    r: funtypes.ParsedValue<funtypes.String, bigint>;
    s: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Union<[funtypes.Object<{
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Object<{
    yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>]>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x1">, "2930">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    r: funtypes.ParsedValue<funtypes.String, bigint>;
    s: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Union<[funtypes.Object<{
    yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
}, true>, funtypes.Object<{
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>]>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x2">, "1559">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    r: funtypes.ParsedValue<funtypes.String, bigint>;
    s: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Union<[funtypes.Object<{
    yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
}, true>, funtypes.Object<{
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>]>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x3">, "4844">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerBlobGas: funtypes.ParsedValue<funtypes.String, bigint>;
    blobVersionedHashes: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    r: funtypes.ParsedValue<funtypes.String, bigint>;
    s: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Union<[funtypes.Object<{
    yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
}, true>, funtypes.Object<{
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>]>]>;
export type EthereumSignedTransactionWithBlockData = funtypes.Static<typeof EthereumSignedTransactionWithBlockData>;
export declare const EthereumSignedTransactionWithBlockData: funtypes.Intersect<[funtypes.Union<[funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "legacy">, funtypes.ParsedValue<funtypes.Literal<undefined>, "legacy">]>;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
}, true>, funtypes.Partial<{
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    r: funtypes.ParsedValue<funtypes.String, bigint>;
    s: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Union<[funtypes.Object<{
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Object<{
    yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>]>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x1">, "2930">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    r: funtypes.ParsedValue<funtypes.String, bigint>;
    s: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Union<[funtypes.Object<{
    yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
}, true>, funtypes.Object<{
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>]>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x2">, "1559">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    r: funtypes.ParsedValue<funtypes.String, bigint>;
    s: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Union<[funtypes.Object<{
    yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
}, true>, funtypes.Object<{
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>]>, funtypes.Object<{
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
    type: funtypes.ParsedValue<funtypes.Literal<"0x3">, "4844">;
    from: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
    gas: funtypes.ParsedValue<funtypes.String, bigint>;
    to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    value: funtypes.ParsedValue<funtypes.String, bigint>;
    input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    chainId: funtypes.ParsedValue<funtypes.String, bigint>;
    maxFeePerBlobGas: funtypes.ParsedValue<funtypes.String, bigint>;
    blobVersionedHashes: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
}, true>, funtypes.Partial<{
    accessList: funtypes.ReadonlyArray<funtypes.Object<{
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>>;
}, true>]>, funtypes.Intersect<[funtypes.Object<{
    r: funtypes.ParsedValue<funtypes.String, bigint>;
    s: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Union<[funtypes.Object<{
    yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
}, true>, funtypes.Object<{
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>]>, funtypes.Object<{
    gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>]>, funtypes.Object<{
    data: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    blockHash: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    blockNumber: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    transactionIndex: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
    v: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>]>;
export type EthereumBlockHeaderWithTransactionHashes = funtypes.Static<typeof EthereumBlockHeaderWithTransactionHashes>;
export declare const EthereumBlockHeaderWithTransactionHashes: funtypes.Union<[funtypes.Literal<null>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Partial<{
    author: funtypes.ParsedValue<funtypes.String, bigint>;
}, false>, funtypes.Intersect<[funtypes.Object<{
    difficulty: funtypes.ParsedValue<funtypes.String, bigint>;
    extraData: funtypes.ParsedValue<funtypes.String, Uint8Array>;
    gasLimit: funtypes.ParsedValue<funtypes.String, bigint>;
    gasUsed: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
    logsBloom: funtypes.ParsedValue<funtypes.String, bigint>;
    miner: funtypes.ParsedValue<funtypes.String, bigint>;
    mixHash: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    number: funtypes.ParsedValue<funtypes.String, bigint>;
    parentHash: funtypes.ParsedValue<funtypes.String, bigint>;
    receiptsRoot: funtypes.ParsedValue<funtypes.String, bigint>;
    sha3Uncles: funtypes.ParsedValue<funtypes.String, bigint>;
    stateRoot: funtypes.ParsedValue<funtypes.String, bigint>;
    timestamp: funtypes.ParsedValue<funtypes.String, Date>;
    size: funtypes.ParsedValue<funtypes.String, bigint>;
    totalDifficulty: funtypes.ParsedValue<funtypes.String, bigint>;
    uncles: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    baseFeePerGas: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<undefined>]>;
    transactionsRoot: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    excessBlobGas: funtypes.ParsedValue<funtypes.String, bigint>;
    blobGasUsed: funtypes.ParsedValue<funtypes.String, bigint>;
    parentBeaconBlockRoot: funtypes.ParsedValue<funtypes.String, bigint>;
    withdrawalsRoot: funtypes.ParsedValue<funtypes.String, bigint>;
    withdrawals: funtypes.ReadonlyArray<funtypes.Object<{
        index: funtypes.ParsedValue<funtypes.String, bigint>;
        validatorIndex: funtypes.ParsedValue<funtypes.String, bigint>;
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        amount: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>>;
}, true>]>]>, funtypes.Object<{
    transactions: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
}, true>]>]>;
export type EthereumBlockHeader = funtypes.Static<typeof EthereumBlockHeader>;
export declare const EthereumBlockHeader: funtypes.Intersect<[funtypes.Intersect<[funtypes.Partial<{
    author: funtypes.ParsedValue<funtypes.String, bigint>;
}, false>, funtypes.Intersect<[funtypes.Object<{
    difficulty: funtypes.ParsedValue<funtypes.String, bigint>;
    extraData: funtypes.ParsedValue<funtypes.String, Uint8Array>;
    gasLimit: funtypes.ParsedValue<funtypes.String, bigint>;
    gasUsed: funtypes.ParsedValue<funtypes.String, bigint>;
    hash: funtypes.ParsedValue<funtypes.String, bigint>;
    logsBloom: funtypes.ParsedValue<funtypes.String, bigint>;
    miner: funtypes.ParsedValue<funtypes.String, bigint>;
    mixHash: funtypes.ParsedValue<funtypes.String, bigint>;
    nonce: funtypes.ParsedValue<funtypes.String, bigint>;
    number: funtypes.ParsedValue<funtypes.String, bigint>;
    parentHash: funtypes.ParsedValue<funtypes.String, bigint>;
    receiptsRoot: funtypes.ParsedValue<funtypes.String, bigint>;
    sha3Uncles: funtypes.ParsedValue<funtypes.String, bigint>;
    stateRoot: funtypes.ParsedValue<funtypes.String, bigint>;
    timestamp: funtypes.ParsedValue<funtypes.String, Date>;
    size: funtypes.ParsedValue<funtypes.String, bigint>;
    totalDifficulty: funtypes.ParsedValue<funtypes.String, bigint>;
    uncles: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    baseFeePerGas: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<undefined>]>;
    transactionsRoot: funtypes.ParsedValue<funtypes.String, bigint>;
}, true>, funtypes.Partial<{
    excessBlobGas: funtypes.ParsedValue<funtypes.String, bigint>;
    blobGasUsed: funtypes.ParsedValue<funtypes.String, bigint>;
    parentBeaconBlockRoot: funtypes.ParsedValue<funtypes.String, bigint>;
    withdrawalsRoot: funtypes.ParsedValue<funtypes.String, bigint>;
    withdrawals: funtypes.ReadonlyArray<funtypes.Object<{
        index: funtypes.ParsedValue<funtypes.String, bigint>;
        validatorIndex: funtypes.ParsedValue<funtypes.String, bigint>;
        address: funtypes.ParsedValue<funtypes.String, bigint>;
        amount: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>>;
}, true>]>]>, funtypes.Object<{
    transactions: funtypes.ReadonlyArray<funtypes.Union<[funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
        type: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "legacy">, funtypes.ParsedValue<funtypes.Literal<undefined>, "legacy">]>;
        from: funtypes.ParsedValue<funtypes.String, bigint>;
        nonce: funtypes.ParsedValue<funtypes.String, bigint>;
        gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
        gas: funtypes.ParsedValue<funtypes.String, bigint>;
        to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
        value: funtypes.ParsedValue<funtypes.String, bigint>;
        input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
    }, true>, funtypes.Partial<{
        chainId: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>]>, funtypes.Intersect<[funtypes.Object<{
        r: funtypes.ParsedValue<funtypes.String, bigint>;
        s: funtypes.ParsedValue<funtypes.String, bigint>;
        hash: funtypes.ParsedValue<funtypes.String, bigint>;
        v: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>, funtypes.Union<[funtypes.Object<{
        v: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>, funtypes.Object<{
        yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
        chainId: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>]>]>]>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
        type: funtypes.ParsedValue<funtypes.Literal<"0x1">, "2930">;
        from: funtypes.ParsedValue<funtypes.String, bigint>;
        nonce: funtypes.ParsedValue<funtypes.String, bigint>;
        gasPrice: funtypes.ParsedValue<funtypes.String, bigint>;
        gas: funtypes.ParsedValue<funtypes.String, bigint>;
        to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
        value: funtypes.ParsedValue<funtypes.String, bigint>;
        input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
        chainId: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>, funtypes.Partial<{
        accessList: funtypes.ReadonlyArray<funtypes.Object<{
            address: funtypes.ParsedValue<funtypes.String, bigint>;
            storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
        }, true>>;
    }, true>]>, funtypes.Intersect<[funtypes.Object<{
        r: funtypes.ParsedValue<funtypes.String, bigint>;
        s: funtypes.ParsedValue<funtypes.String, bigint>;
        hash: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>, funtypes.Union<[funtypes.Object<{
        yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
    }, true>, funtypes.Object<{
        v: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>]>]>]>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
        type: funtypes.ParsedValue<funtypes.Literal<"0x2">, "1559">;
        from: funtypes.ParsedValue<funtypes.String, bigint>;
        nonce: funtypes.ParsedValue<funtypes.String, bigint>;
        maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
        maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
        gas: funtypes.ParsedValue<funtypes.String, bigint>;
        to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
        value: funtypes.ParsedValue<funtypes.String, bigint>;
        input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
        chainId: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>, funtypes.Partial<{
        accessList: funtypes.ReadonlyArray<funtypes.Object<{
            address: funtypes.ParsedValue<funtypes.String, bigint>;
            storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
        }, true>>;
    }, true>]>, funtypes.Intersect<[funtypes.Object<{
        r: funtypes.ParsedValue<funtypes.String, bigint>;
        s: funtypes.ParsedValue<funtypes.String, bigint>;
        hash: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>, funtypes.Union<[funtypes.Object<{
        yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
    }, true>, funtypes.Object<{
        v: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>]>]>]>, funtypes.Intersect<[funtypes.Intersect<[funtypes.Object<{
        type: funtypes.ParsedValue<funtypes.Literal<"0x3">, "4844">;
        from: funtypes.ParsedValue<funtypes.String, bigint>;
        nonce: funtypes.ParsedValue<funtypes.String, bigint>;
        maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
        maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
        gas: funtypes.ParsedValue<funtypes.String, bigint>;
        to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
        value: funtypes.ParsedValue<funtypes.String, bigint>;
        input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
        chainId: funtypes.ParsedValue<funtypes.String, bigint>;
        maxFeePerBlobGas: funtypes.ParsedValue<funtypes.String, bigint>;
        blobVersionedHashes: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
    }, true>, funtypes.Partial<{
        accessList: funtypes.ReadonlyArray<funtypes.Object<{
            address: funtypes.ParsedValue<funtypes.String, bigint>;
            storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
        }, true>>;
    }, true>]>, funtypes.Intersect<[funtypes.Object<{
        r: funtypes.ParsedValue<funtypes.String, bigint>;
        s: funtypes.ParsedValue<funtypes.String, bigint>;
        hash: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>, funtypes.Union<[funtypes.Object<{
        yParity: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "even">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "odd">]>;
    }, true>, funtypes.Object<{
        v: funtypes.ParsedValue<funtypes.String, bigint>;
    }, true>]>]>]>]>>;
}, true>]>;
export declare function serialize<T, U extends funtypes.Codec<T>>(funtype: U, value: T): ToWireType<U>;
type ToWireType<T> = T extends funtypes.Intersect<infer U> ? UnionToIntersection<{
    [I in keyof U]: ToWireType<U[I]>;
}[number]> : T extends funtypes.Union<infer U> ? {
    [I in keyof U]: ToWireType<U[I]>;
}[number] : T extends funtypes.Record<infer U, infer V> ? Record<funtypes.Static<U>, ToWireType<V>> : T extends funtypes.Partial<infer U, infer V> ? V extends true ? {
    readonly [K in keyof U]?: ToWireType<U[K]>;
} : {
    [K in keyof U]?: ToWireType<U[K]>;
} : T extends funtypes.Object<infer U, infer V> ? V extends true ? {
    readonly [K in keyof U]: ToWireType<U[K]>;
} : {
    [K in keyof U]: ToWireType<U[K]>;
} : T extends funtypes.Readonly<funtypes.Tuple<infer U>> ? {
    readonly [P in keyof U]: ToWireType<U[P]>;
} : T extends funtypes.Tuple<infer U> ? {
    [P in keyof U]: ToWireType<U[P]>;
} : T extends funtypes.ReadonlyArray<infer U> ? readonly ToWireType<U>[] : T extends funtypes.Array<infer U> ? ToWireType<U>[] : T extends funtypes.ParsedValue<infer U, infer _> ? ToWireType<U> : T extends funtypes.Codec<infer U> ? U : never;
export {};
//# sourceMappingURL=wire-types.d.ts.map