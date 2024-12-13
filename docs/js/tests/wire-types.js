import * as funtypes from 'funtypes';
const BigIntParser = {
    parse: value => {
        if (!/^0x([a-fA-F0-9]{1,64})$/.test(value))
            return { success: false, message: `${value} is not a hex string encoded number.` };
        return { success: true, value: BigInt(value) };
    },
    serialize: value => {
        if (typeof value !== 'bigint')
            return { success: false, message: `${typeof value} is not a bigint.` };
        return { success: true, value: `0x${value.toString(16)}` };
    },
};
const SmallIntParser = {
    parse: value => {
        if (!/^0x([a-fA-F0-9]{1,64})$/.test(value))
            return { success: false, message: `${value} is not a hex string encoded number.` };
        if (BigInt(value) >= 2n ** 64n)
            return { success: false, message: `${value} must be smaller than 2^64.` };
        return { success: true, value: BigInt(value) };
    },
    serialize: value => {
        if (value >= 2n ** 64n)
            return { success: false, message: `${value} must be smaller than 2^64.` };
        if (typeof value !== 'bigint')
            return { success: false, message: `${typeof value} is not a bigint.` };
        return { success: true, value: `0x${value.toString(16)}` };
    },
};
const AddressParser = {
    parse: value => {
        if (!/^0x([a-fA-F0-9]{40})$/.test(value))
            return { success: false, message: `${value} is not a hex string encoded address.` };
        return { success: true, value: BigInt(value) };
    },
    serialize: value => {
        if (typeof value !== 'bigint')
            return { success: false, message: `${typeof value} is not a bigint.` };
        return { success: true, value: `0x${value.toString(16).padStart(40, '0')}` };
    },
};
const Bytes32Parser = {
    parse: value => {
        if (!/^0x([a-fA-F0-9]{64})$/.test(value))
            return { success: false, message: `${value} is not a hex string encoded 32 byte value.` };
        return { success: true, value: BigInt(value) };
    },
    serialize: value => {
        if (typeof value !== 'bigint')
            return { success: false, message: `${typeof value} is not a bigint.` };
        return { success: true, value: `0x${value.toString(16).padStart(64, '0')}` };
    },
};
const Bytes256Parser = {
    parse: value => {
        if (!/^0x([a-fA-F0-9]{512})$/.test(value))
            return { success: false, message: `${value} is not a hex string encoded 256 byte value.` };
        return { success: true, value: BigInt(value) };
    },
    serialize: value => {
        if (typeof value !== 'bigint')
            return { success: false, message: `${typeof value} is not a bigint.` };
        return { success: true, value: `0x${value.toString(16).padStart(512, '0')}` };
    },
};
const Bytes16Parser = {
    parse: value => {
        if (!/^0x([a-fA-F0-9]{16})$/.test(value))
            return { success: false, message: `${value} is not a hex string encoded 256 byte value.` };
        return { success: true, value: BigInt(value) };
    },
    serialize: value => {
        if (typeof value !== 'bigint')
            return { success: false, message: `${typeof value} is not a bigint.` };
        return { success: true, value: `0x${value.toString(16).padStart(16, '0')}` };
    },
};
export const BytesParser = {
    parse: value => {
        const match = /^(?:0x)?([a-fA-F0-9]*)$/.exec(value);
        if (match === null)
            return { success: false, message: `Expected a hex string encoded byte array with an optional '0x' prefix but received ${value}` };
        const normalized = match[1];
        if (normalized === undefined)
            return { success: false, message: `Expected a hex string encoded byte array with an optional '0x' prefix but received ${value}` };
        if (normalized.length % 2)
            return { success: false, message: 'Hex string encoded byte array must be an even number of charcaters long.' };
        const bytes = new Uint8Array(normalized.length / 2);
        for (let i = 0; i < normalized.length; i += 2) {
            bytes[i / 2] = Number.parseInt(`${normalized[i]}${normalized[i + 1]}`, 16);
        }
        return { success: true, value: new Uint8Array(bytes) };
    },
    serialize: value => {
        if (!(value instanceof Uint8Array))
            return { success: false, message: `${typeof value} is not a Uint8Array.` };
        let result = '';
        for (let i = 0; i < value.length; ++i) {
            const val = value[i];
            if (val === undefined)
                return { success: false, message: `${typeof value} is not a Uint8Array.` };
            result += ('0' + val.toString(16)).slice(-2);
        }
        return { success: true, value: `0x${result}` };
    }
};
const TimestampParser = {
    parse: value => {
        if (!/^0x([a-fA-F0-9]{0,8})$/.test(value))
            return { success: false, message: `${value} is not a hex string encoded timestamp.` };
        return { success: true, value: new Date(Number.parseInt(value, 16) * 1000) };
    },
    serialize: value => {
        if (!(value instanceof Date))
            return { success: false, message: `${typeof value} is not a Date.` };
        return { success: true, value: `0x${Math.floor(value.valueOf() / 1000).toString(16)}` };
    },
};
const OptionalBytesParser = {
    parse: value => BytesParser.parse(value || '0x'),
    serialize: value => BytesParser.serialize(value || new Uint8Array()),
};
export const LiteralConverterParserFactory = (input, output) => {
    return {
        parse: value => (value === input) ? { success: true, value: output } : { success: false, message: `${value} was expected to be literal.` },
        serialize: value => (value === output) ? { success: true, value: input } : { success: false, message: `${value} was expected to be literal.` }
    };
};
const BigIntParserNonHex = {
    parse: value => {
        if (!/^[0-9]+$/.test(value))
            return { success: false, message: `${value} is not a string encoded number.` };
        return { success: true, value: BigInt(value) };
    },
    serialize: value => {
        if (typeof value !== 'bigint')
            return { success: false, message: `${typeof value} is not a bigint.` };
        return { success: true, value: `${value.toString()}` };
    },
};
export const NonHexBigInt = funtypes.String.withParser(BigIntParserNonHex);
//
// Ethereum
//
export const EthereumQuantity = funtypes.String.withParser(BigIntParser);
export const EthereumQuantitySmall = funtypes.String.withParser(SmallIntParser);
export const EthereumData = funtypes.String.withParser(BytesParser);
export const EthereumAddress = funtypes.String.withParser(AddressParser);
export const OptionalEthereumAddress = funtypes.Union(EthereumAddress, funtypes.Undefined);
export const EthereumAddressOrMissing = funtypes.Union(EthereumAddress, funtypes.Literal('missing').withParser(LiteralConverterParserFactory('missing', undefined)));
export const EthereumBytes32 = funtypes.String.withParser(Bytes32Parser);
export const EthereumBytes256 = funtypes.String.withParser(Bytes256Parser);
const EthereumBytes16 = funtypes.String.withParser(Bytes16Parser);
export const EthereumTimestamp = funtypes.String.withParser(TimestampParser);
export const EthereumBlockTag = funtypes.Union(EthereumQuantitySmall, EthereumBytes32, funtypes.Literal('latest'), funtypes.Literal('pending'));
export const EthereumInput = funtypes.Union(funtypes.String, funtypes.Undefined).withParser(OptionalBytesParser);
export const EthereumAccessList = funtypes.ReadonlyArray(funtypes.ReadonlyObject({
    address: EthereumAddress,
    storageKeys: funtypes.ReadonlyArray(EthereumBytes32)
}).asReadonly());
const EthereumUnsignedTransactionLegacy = funtypes.Intersect(funtypes.ReadonlyObject({
    type: funtypes.Union(funtypes.Literal('0x0').withParser(LiteralConverterParserFactory('0x0', 'legacy')), funtypes.Literal(undefined).withParser(LiteralConverterParserFactory(undefined, 'legacy'))),
    from: EthereumAddress,
    nonce: EthereumQuantity,
    gasPrice: EthereumQuantity,
    gas: EthereumQuantity,
    to: funtypes.Union(EthereumAddress, funtypes.Null),
    value: EthereumQuantity,
    input: EthereumInput,
}).asReadonly(), funtypes.Partial({
    chainId: EthereumQuantity,
}).asReadonly());
const EthereumUnsignedTransaction2930 = funtypes.Intersect(funtypes.ReadonlyObject({
    type: funtypes.Literal('0x1').withParser(LiteralConverterParserFactory('0x1', '2930')),
    from: EthereumAddress,
    nonce: EthereumQuantity,
    gasPrice: EthereumQuantity,
    gas: EthereumQuantity,
    to: funtypes.Union(EthereumAddress, funtypes.Null),
    value: EthereumQuantity,
    input: EthereumInput,
    chainId: EthereumQuantity,
}).asReadonly(), funtypes.Partial({
    accessList: EthereumAccessList,
}).asReadonly());
export const EthereumUnsignedTransaction1559 = funtypes.Intersect(funtypes.ReadonlyObject({
    type: funtypes.Literal('0x2').withParser(LiteralConverterParserFactory('0x2', '1559')),
    from: EthereumAddress,
    nonce: EthereumQuantity,
    maxFeePerGas: EthereumQuantity,
    maxPriorityFeePerGas: EthereumQuantity,
    gas: EthereumQuantity,
    to: funtypes.Union(EthereumAddress, funtypes.Null),
    value: EthereumQuantity,
    input: EthereumInput,
    chainId: EthereumQuantity,
}).asReadonly(), funtypes.Partial({
    accessList: EthereumAccessList,
}).asReadonly());
const EthereumUnsignedTransaction4844 = funtypes.Intersect(funtypes.ReadonlyObject({
    type: funtypes.Literal('0x3').withParser(LiteralConverterParserFactory('0x3', '4844')),
    from: EthereumAddress,
    nonce: EthereumQuantity,
    maxFeePerGas: EthereumQuantity,
    maxPriorityFeePerGas: EthereumQuantity,
    gas: EthereumQuantity,
    to: funtypes.Union(EthereumAddress, funtypes.Null),
    value: EthereumQuantity,
    input: EthereumInput,
    chainId: EthereumQuantity,
    maxFeePerBlobGas: EthereumQuantity,
    blobVersionedHashes: funtypes.ReadonlyArray(EthereumBytes32),
}).asReadonly(), funtypes.Partial({
    accessList: EthereumAccessList,
}).asReadonly());
export const EthereumUnsignedTransaction = funtypes.Union(EthereumUnsignedTransactionLegacy, EthereumUnsignedTransaction2930, EthereumUnsignedTransaction1559, EthereumUnsignedTransaction4844);
const OptionalEthereumUnsignedTransaction1559 = funtypes.Intersect(funtypes.ReadonlyObject({
    type: funtypes.Literal('0x2').withParser(LiteralConverterParserFactory('0x2', '1559')),
    from: EthereumAddress,
    nonce: EthereumQuantity,
    to: funtypes.Union(EthereumAddress, funtypes.Null),
    value: EthereumQuantity,
    input: EthereumInput,
    chainId: EthereumQuantity,
}).asReadonly(), funtypes.Partial({
    gas: EthereumQuantity,
    maxFeePerGas: EthereumQuantity,
    maxPriorityFeePerGas: EthereumQuantity,
    accessList: EthereumAccessList,
}).asReadonly());
const OptionalEthereumUnsignedTransaction4844 = funtypes.Intersect(funtypes.ReadonlyObject({
    type: funtypes.Literal('0x3').withParser(LiteralConverterParserFactory('0x3', '4844')),
    from: EthereumAddress,
    nonce: EthereumQuantity,
    to: funtypes.Union(EthereumAddress, funtypes.Null),
    value: EthereumQuantity,
    input: EthereumInput,
    chainId: EthereumQuantity,
    maxFeePerBlobGas: EthereumQuantity,
    blobVersionedHashes: funtypes.ReadonlyArray(EthereumBytes32),
}).asReadonly(), funtypes.Partial({
    gas: EthereumQuantity,
    maxFeePerGas: EthereumQuantity,
    maxPriorityFeePerGas: EthereumQuantity,
    accessList: EthereumAccessList,
}).asReadonly());
export const OptionalEthereumUnsignedTransaction = funtypes.Union(EthereumUnsignedTransactionLegacy, EthereumUnsignedTransaction2930, OptionalEthereumUnsignedTransaction1559, OptionalEthereumUnsignedTransaction4844);
const EthereumTransaction2930And1559And4844Signature = funtypes.Intersect(funtypes.ReadonlyObject({
    r: EthereumQuantity,
    s: EthereumQuantity,
    hash: EthereumBytes32,
}), funtypes.Union(funtypes.ReadonlyObject({ yParity: funtypes.Union(funtypes.Literal('0x0').withParser(LiteralConverterParserFactory('0x0', 'even')), funtypes.Literal('0x1').withParser(LiteralConverterParserFactory('0x1', 'odd'))) }), funtypes.ReadonlyObject({ v: EthereumQuantity })));
const MessageSignature = funtypes.ReadonlyObject({
    r: EthereumQuantity,
    s: EthereumQuantity,
    hash: EthereumBytes32,
    v: EthereumQuantity,
});
const EthereumTransactionLegacySignature = funtypes.Intersect(MessageSignature, funtypes.Union(funtypes.ReadonlyObject({
    v: EthereumQuantity,
}), funtypes.ReadonlyObject({
    yParity: funtypes.Union(funtypes.Literal('0x0').withParser(LiteralConverterParserFactory('0x0', 'even')), funtypes.Literal('0x1').withParser(LiteralConverterParserFactory('0x1', 'odd'))),
    chainId: EthereumQuantity,
})));
const EthereumSignedTransactionLegacy = funtypes.Intersect(EthereumUnsignedTransactionLegacy, EthereumTransactionLegacySignature);
const EthereumSignedTransaction2930 = funtypes.Intersect(EthereumUnsignedTransaction2930, EthereumTransaction2930And1559And4844Signature);
export const EthereumSignedTransaction1559 = funtypes.Intersect(EthereumUnsignedTransaction1559, EthereumTransaction2930And1559And4844Signature);
const EthereumSignedTransaction4844 = funtypes.Intersect(EthereumUnsignedTransaction4844, EthereumTransaction2930And1559And4844Signature);
export const EthereumSignedTransaction = funtypes.Union(EthereumSignedTransactionLegacy, EthereumSignedTransaction2930, EthereumSignedTransaction1559, EthereumSignedTransaction4844);
export const EthereumSignedTransactionWithBlockData = funtypes.Intersect(funtypes.Union(EthereumSignedTransactionLegacy, EthereumSignedTransaction2930, funtypes.Intersect(EthereumSignedTransaction1559, funtypes.ReadonlyObject({ gasPrice: EthereumQuantity })), funtypes.Intersect(EthereumSignedTransaction4844, funtypes.ReadonlyObject({ gasPrice: EthereumQuantity }))), funtypes.ReadonlyObject({
    data: EthereumInput,
    blockHash: funtypes.Union(EthereumBytes32, funtypes.Null),
    blockNumber: funtypes.Union(EthereumQuantity, funtypes.Null),
    transactionIndex: funtypes.Union(EthereumQuantity, funtypes.Null),
    v: EthereumQuantity,
}));
const EthereumWithdrawal = funtypes.ReadonlyObject({
    index: EthereumQuantity,
    validatorIndex: EthereumQuantity,
    address: EthereumAddress,
    amount: EthereumQuantity,
});
const EthereumBlockHeaderWithoutTransactions = funtypes.Intersect(funtypes.MutablePartial({
    author: EthereumAddress,
}), funtypes.Intersect(funtypes.ReadonlyObject({
    difficulty: EthereumQuantity,
    extraData: EthereumData,
    gasLimit: EthereumQuantity,
    gasUsed: EthereumQuantity,
    hash: EthereumBytes32,
    logsBloom: EthereumBytes256,
    miner: EthereumAddress,
    mixHash: EthereumBytes32,
    nonce: EthereumBytes16,
    number: EthereumQuantity,
    parentHash: EthereumBytes32,
    receiptsRoot: EthereumBytes32,
    sha3Uncles: EthereumBytes32,
    stateRoot: EthereumBytes32,
    timestamp: EthereumTimestamp,
    size: EthereumQuantity,
    totalDifficulty: EthereumQuantity,
    uncles: funtypes.ReadonlyArray(EthereumBytes32),
    baseFeePerGas: funtypes.Union(EthereumQuantity, funtypes.Undefined),
    transactionsRoot: EthereumBytes32,
}), funtypes.ReadonlyPartial({
    excessBlobGas: EthereumQuantity,
    blobGasUsed: EthereumQuantity,
    parentBeaconBlockRoot: EthereumBytes32,
    withdrawalsRoot: EthereumBytes32, // missing from old block
    withdrawals: funtypes.ReadonlyArray(EthereumWithdrawal), // missing from old block
})));
export const EthereumBlockHeaderWithTransactionHashes = funtypes.Union(funtypes.Null, funtypes.Intersect(EthereumBlockHeaderWithoutTransactions, funtypes.ReadonlyObject({ transactions: funtypes.ReadonlyArray(EthereumBytes32) })));
export const EthereumBlockHeader = funtypes.Intersect(EthereumBlockHeaderWithoutTransactions, funtypes.ReadonlyObject({ transactions: funtypes.ReadonlyArray(EthereumSignedTransaction) }));
//
// Helpers
//
export function serialize(funtype, value) {
    return funtype.serialize(value);
}
//# sourceMappingURL=wire-types.js.map