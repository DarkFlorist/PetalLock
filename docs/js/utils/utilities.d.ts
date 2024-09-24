export declare function sleep(milliseconds: number): Promise<void>;
export declare function jsonStringify(value: unknown, space?: string | number | undefined): string;
export declare function jsonParse(text: string): unknown;
export declare function ensureError(caught: unknown): Error;
export declare function dataString(data: Uint8Array | null): string;
export declare function dataStringWith0xStart(data: Uint8Array | null): `0x${string}`;
export declare function decodeEthereumNameServiceString(ens: string): string;
export declare function assertNever(value: never): never;
export declare function isSameAddress(address1: `0x${string}` | undefined, address2: `0x${string}` | undefined): boolean;
export declare const splitEnsStringToSubdomainPath: (input: string) => string[];
export declare const splitDomainToSubDomainAndParent: (domain: string) => [string, string];
export declare function bigIntToNumber(value: bigint): number;
//# sourceMappingURL=utilities.d.ts.map