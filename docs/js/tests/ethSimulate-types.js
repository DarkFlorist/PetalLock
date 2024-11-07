import { EthereumAccessList, EthereumAddress, EthereumBlockTag, EthereumBytes32, EthereumData, EthereumInput, EthereumQuantity, EthereumQuantitySmall, EthereumTimestamp, LiteralConverterParserFactory } from './wire-types.js';
import * as funtypes from 'funtypes';
const AccountOverride = funtypes.ReadonlyPartial({
    state: funtypes.ReadonlyRecord(funtypes.String, EthereumBytes32),
    stateDiff: funtypes.ReadonlyRecord(funtypes.String, EthereumBytes32),
    nonce: EthereumQuantitySmall,
    balance: EthereumQuantity,
    code: EthereumData,
    movePrecompileToAddress: EthereumAddress,
});
const BlockOverride = funtypes.Partial({
    number: EthereumQuantity,
    prevRandao: EthereumQuantity,
    time: EthereumTimestamp,
    gasLimit: EthereumQuantitySmall,
    feeRecipient: EthereumAddress,
    baseFeePerGas: EthereumQuantity,
}).asReadonly();
export const BlockCall = funtypes.Partial({
    type: funtypes.Union(funtypes.Literal('0x0').withParser(LiteralConverterParserFactory('0x0', 'legacy')), funtypes.Literal(undefined).withParser(LiteralConverterParserFactory(undefined, 'legacy')), funtypes.Literal('0x1').withParser(LiteralConverterParserFactory('0x1', '2930')), funtypes.Literal('0x2').withParser(LiteralConverterParserFactory('0x2', '1559')), funtypes.Literal('0x3').withParser(LiteralConverterParserFactory('0x3', '4844'))),
    from: EthereumAddress,
    nonce: EthereumQuantity,
    maxFeePerGas: EthereumQuantity,
    maxPriorityFeePerGas: EthereumQuantity,
    gas: EthereumQuantity,
    to: funtypes.Union(EthereumAddress, funtypes.Null),
    value: EthereumQuantity,
    input: EthereumInput,
    chainId: EthereumQuantity,
    accessList: EthereumAccessList,
});
export const StateOverrides = funtypes.ReadonlyRecord(funtypes.String, AccountOverride);
export const BlockCalls = funtypes.Intersect(funtypes.ReadonlyObject({
    calls: funtypes.ReadonlyArray(BlockCall),
}), funtypes.ReadonlyPartial({
    stateOverrides: StateOverrides,
    blockOverrides: BlockOverride,
}));
const EthSimulateV1ParamObject = funtypes.ReadonlyObject({
    blockStateCalls: funtypes.ReadonlyArray(BlockCalls),
    traceTransfers: funtypes.Boolean,
    validation: funtypes.Boolean,
});
export const EthSimulateV1Params = funtypes.ReadonlyObject({
    method: funtypes.Literal('eth_simulateV1'),
    params: funtypes.ReadonlyTuple(EthSimulateV1ParamObject, EthereumBlockTag),
});
export const EthereumEvent = funtypes.ReadonlyObject({
    address: EthereumAddress,
    data: EthereumInput,
    topics: funtypes.ReadonlyArray(EthereumBytes32),
}).asReadonly();
const CallResultLog = funtypes.Intersect(EthereumEvent, funtypes.ReadonlyObject({
    logIndex: EthereumQuantity,
    blockHash: EthereumBytes32,
    blockNumber: EthereumQuantity,
}), funtypes.ReadonlyPartial({
    transactionHash: EthereumBytes32,
    transactionIndex: EthereumQuantity,
}));
const CallResultLogs = funtypes.ReadonlyArray(CallResultLog);
const EthSimulateCallResultFailure = funtypes.ReadonlyObject({
    status: funtypes.Literal('0x0').withParser(LiteralConverterParserFactory('0x0', 'failure')),
    returnData: EthereumData,
    gasUsed: EthereumQuantitySmall,
    error: funtypes.ReadonlyObject({
        code: funtypes.Number,
        message: funtypes.String,
        data: funtypes.String
    })
});
const EthSimulateCallResultSuccess = funtypes.ReadonlyObject({
    returnData: EthereumData,
    gasUsed: EthereumQuantitySmall,
    status: funtypes.Literal('0x1').withParser(LiteralConverterParserFactory('0x1', 'success')),
    logs: CallResultLogs
});
export const EthSimulateV1CallResult = funtypes.Union(EthSimulateCallResultFailure, EthSimulateCallResultSuccess);
export const EthSimulateV1CallResults = funtypes.ReadonlyArray(EthSimulateV1CallResult);
const EthSimulateV1BlockResult = funtypes.ReadonlyObject({
    number: EthereumQuantity,
    hash: EthereumBytes32,
    timestamp: EthereumQuantity,
    gasLimit: EthereumQuantitySmall,
    gasUsed: EthereumQuantitySmall,
    baseFeePerGas: EthereumQuantity,
    calls: EthSimulateV1CallResults,
});
export const EthSimulateV1Result = funtypes.ReadonlyArray(EthSimulateV1BlockResult);
//# sourceMappingURL=ethSimulate-types.js.map