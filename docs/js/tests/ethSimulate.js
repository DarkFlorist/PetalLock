import { EthSimulateV1Params } from './ethSimulate-types.js';
import * as funtypes from 'funtypes';
import { serialize } from './wire-types.js';
const JsonRpcSuccessResponse = funtypes.ReadonlyObject({
    jsonrpc: funtypes.Literal('2.0'),
    id: funtypes.Union(funtypes.String, funtypes.Number),
    result: funtypes.Unknown,
}).asReadonly();
export const JsonRpcErrorResponse = funtypes.ReadonlyObject({
    jsonrpc: funtypes.Literal('2.0'),
    id: funtypes.Union(funtypes.String, funtypes.Number),
    error: funtypes.ReadonlyObject({
        code: funtypes.Number,
        message: funtypes.String,
        data: funtypes.Unknown,
    }).asReadonly(),
}).asReadonly();
export const JsonRpcResponse = funtypes.Union(JsonRpcErrorResponse, JsonRpcSuccessResponse);
export const EthereumJsonRpcRequest = funtypes.Union(EthSimulateV1Params);
class ErrorWithData extends Error {
    data;
    constructor(message, data) {
        super(message);
        this.data = data;
    }
}
export class JsonRpcResponseError extends ErrorWithData {
    id;
    code;
    constructor(jsonRpcResponse) {
        super(jsonRpcResponse.error.message, jsonRpcResponse.error.data);
        this.code = jsonRpcResponse.error.code;
        this.id = jsonRpcResponse.id;
    }
}
export const jsonRpcRequest = async (url, rpcRequest) => {
    const serialized = serialize(EthereumJsonRpcRequest, rpcRequest);
    const payload = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, ...serialized })
    };
    const response = await fetch(url, payload);
    const responseObject = response.ok ? { responseState: 'success', response: await response.json() } : { responseState: 'failed', response };
    if (responseObject.responseState === 'failed') {
        throw new Error(`Query to RPC server failed with error code: ${responseObject.response.status} while quering for ${rpcRequest.method}.`);
    }
    const jsonRpcResponse = JsonRpcResponse.parse(responseObject.response);
    if ('error' in jsonRpcResponse)
        throw new JsonRpcResponseError(jsonRpcResponse);
    return jsonRpcResponse.result;
};
//# sourceMappingURL=ethSimulate.js.map