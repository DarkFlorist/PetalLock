import * as funtypes from 'funtypes';
export type JsonRpcErrorResponse = funtypes.Static<typeof JsonRpcErrorResponse>;
export declare const JsonRpcErrorResponse: funtypes.Object<{
    jsonrpc: funtypes.Literal<"2.0">;
    id: funtypes.Union<[funtypes.String, funtypes.Number]>;
    error: funtypes.Object<{
        code: funtypes.Number;
        message: funtypes.String;
        data: funtypes.Unknown;
    }, true>;
}, true>;
export type JsonRpcResponse = funtypes.Static<typeof JsonRpcResponse>;
export declare const JsonRpcResponse: funtypes.Union<[funtypes.Object<{
    jsonrpc: funtypes.Literal<"2.0">;
    id: funtypes.Union<[funtypes.String, funtypes.Number]>;
    error: funtypes.Object<{
        code: funtypes.Number;
        message: funtypes.String;
        data: funtypes.Unknown;
    }, true>;
}, true>, funtypes.Object<{
    jsonrpc: funtypes.Literal<"2.0">;
    id: funtypes.Union<[funtypes.String, funtypes.Number]>;
    result: funtypes.Unknown;
}, true>]>;
export type EthereumJsonRpcRequest = funtypes.Static<typeof EthereumJsonRpcRequest>;
export declare const EthereumJsonRpcRequest: funtypes.Union<[funtypes.Object<{
    method: funtypes.Literal<"eth_simulateV1">;
    params: funtypes.ReadonlyTuple<[funtypes.Object<{
        blockStateCalls: funtypes.ReadonlyArray<funtypes.Intersect<[funtypes.Object<{
            calls: funtypes.ReadonlyArray<funtypes.Partial<{
                type: funtypes.Union<[funtypes.ParsedValue<funtypes.Literal<"0x0">, "legacy">, funtypes.ParsedValue<funtypes.Literal<undefined>, "legacy">, funtypes.ParsedValue<funtypes.Literal<"0x1">, "2930">, funtypes.ParsedValue<funtypes.Literal<"0x2">, "1559">, funtypes.ParsedValue<funtypes.Literal<"0x3">, "4844">]>;
                from: funtypes.ParsedValue<funtypes.String, bigint>;
                nonce: funtypes.ParsedValue<funtypes.String, bigint>;
                maxFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
                maxPriorityFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
                gas: funtypes.ParsedValue<funtypes.String, bigint>;
                to: funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<null>]>;
                value: funtypes.ParsedValue<funtypes.String, bigint>;
                input: funtypes.ParsedValue<funtypes.Union<[funtypes.String, funtypes.Literal<undefined>]>, Uint8Array>;
                chainId: funtypes.ParsedValue<funtypes.String, bigint>;
                accessList: funtypes.ReadonlyArray<funtypes.Object<{
                    address: funtypes.ParsedValue<funtypes.String, bigint>;
                    storageKeys: funtypes.ReadonlyArray<funtypes.ParsedValue<funtypes.String, bigint>>;
                }, true>>;
            }, false>>;
        }, true>, funtypes.Partial<{
            stateOverrides: funtypes.ReadonlyRecord<funtypes.String, funtypes.Partial<{
                state: funtypes.ReadonlyRecord<funtypes.String, funtypes.ParsedValue<funtypes.String, bigint>>;
                stateDiff: funtypes.ReadonlyRecord<funtypes.String, funtypes.ParsedValue<funtypes.String, bigint>>;
                nonce: funtypes.ParsedValue<funtypes.String, bigint>;
                balance: funtypes.ParsedValue<funtypes.String, bigint>;
                code: funtypes.ParsedValue<funtypes.String, Uint8Array>;
                movePrecompileToAddress: funtypes.ParsedValue<funtypes.String, bigint>;
            }, true>>;
            blockOverrides: funtypes.Partial<{
                number: funtypes.ParsedValue<funtypes.String, bigint>;
                prevRandao: funtypes.ParsedValue<funtypes.String, bigint>;
                time: funtypes.ParsedValue<funtypes.String, Date>;
                gasLimit: funtypes.ParsedValue<funtypes.String, bigint>;
                feeRecipient: funtypes.ParsedValue<funtypes.String, bigint>;
                baseFeePerGas: funtypes.ParsedValue<funtypes.String, bigint>;
            }, true>;
        }, true>]>>;
        traceTransfers: funtypes.Boolean;
        validation: funtypes.Boolean;
    }, true>, funtypes.Union<[funtypes.ParsedValue<funtypes.String, bigint>, funtypes.ParsedValue<funtypes.String, bigint>, funtypes.Literal<"latest">, funtypes.Literal<"pending">]>]>;
}, true>]>;
declare class ErrorWithData extends Error {
    data: unknown;
    constructor(message: string, data: unknown);
}
export declare class JsonRpcResponseError extends ErrorWithData {
    readonly id: string | number;
    readonly code: number;
    constructor(jsonRpcResponse: JsonRpcErrorResponse);
}
export declare const jsonRpcRequest: (url: string, rpcRequest: EthereumJsonRpcRequest) => Promise<unknown>;
export {};
//# sourceMappingURL=ethSimulate.d.ts.map