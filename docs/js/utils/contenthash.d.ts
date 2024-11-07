export declare const codeToName: {
    readonly 227: "ipfs";
    readonly 228: "swarm";
    readonly 229: "ipns";
    readonly 444: "onion";
    readonly 445: "onion3";
    readonly 11639056: "skynet";
    readonly 11704592: "arweave";
};
export declare const nameToCode: {
    readonly ipfs: 227;
    readonly swarm: 228;
    readonly ipns: 229;
    readonly onion: 444;
    readonly onion3: 445;
    readonly skynet: 11639056;
    readonly arweave: 11704592;
};
export declare const encodeContentHash: (name: string, value: string) => `0x${string}`;
export declare const decodeContentHash: (contentHash: string) => string;
export declare const tryDecodeContentHash: (contentHash: string) => string | undefined;
export declare const tryEncodeContentHash: (contentHash: string) => `0x${string}` | undefined;
export declare const isValidContentHashString: (input: string) => boolean;
//# sourceMappingURL=contenthash.d.ts.map