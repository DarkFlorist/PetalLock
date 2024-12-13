import { EthSimulateV1Result } from "./ethSimulate-types";
export declare const addressString: (address: bigint) => `0x${string}`;
export declare function bigintToUint8Array(value: bigint, numberOfBytes: number): Uint8Array;
export declare function stringToUint8Array(data: string): Uint8Array;
export declare function bytesToUnsigned(bytes: Uint8Array): bigint;
export declare const removeEthSuffix: (str: string) => string;
export declare const allSuccess: (result: EthSimulateV1Result) => boolean;
//# sourceMappingURL=test-utils.d.ts.map