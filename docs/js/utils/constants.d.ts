export declare const MOCK_ADDRESS = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
export declare const ENS_PUBLIC_RESOLVER = "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63";
export declare const ENS_NAME_WRAPPER = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401";
export declare const ENS_ETH_REGISTRAR_CONTROLLER = "0x253553366Da8546fC250F225fe3d25d0C782303b";
export declare const ENS_ETHEREUM_NAME_SERVICE = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
export declare const ENS_PUBLIC_RESOLVER_2 = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41";
export declare const ENS_REGISTRY_WITH_FALLBACK = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
export declare const ENS_REVERSE_REGISTRAR = "0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb";
export declare const CANNOT_UNWRAP = 1n;
export declare const CANNOT_BURN_FUSES = 2n;
export declare const CANNOT_TRANSFER = 4n;
export declare const CANNOT_SET_RESOLVER = 8n;
export declare const CANNOT_SET_TTL = 16n;
export declare const CANNOT_CREATE_SUBDOMAIN = 32n;
export declare const CANNOT_APPROVE = 64n;
export declare const PARENT_CANNOT_CONTROL: bigint;
export declare const IS_DOT_ETH: bigint;
export declare const CAN_EXTEND_EXPIRY: bigint;
export declare const CAN_DO_EVERYTHING = 0n;
export declare const ENS_FLAGS: readonly [{
    readonly name: "Cannot Unwrap Name";
    readonly value: 1n;
}, {
    readonly name: "Cannot Burn Fuses";
    readonly value: 2n;
}, {
    readonly name: "Cannot Transfer";
    readonly value: 4n;
}, {
    readonly name: "Cannot Set Resolver";
    readonly value: 8n;
}, {
    readonly name: "Cannot Set Time To Live";
    readonly value: 16n;
}, {
    readonly name: "Cannot Create Subdomain";
    readonly value: 32n;
}, {
    readonly name: "Cannot Approve";
    readonly value: 64n;
}, {
    readonly name: "Parent Domain Cannot Control";
    readonly value: bigint;
}, {
    readonly name: "Is .eth domain";
    readonly value: bigint;
}, {
    readonly name: "Can Extend Expiry";
    readonly value: bigint;
}, {
    readonly name: "Can Do Everything";
    readonly value: 0n;
}];
export declare const FINAL_CHILD_FUSES: readonly ["Parent Domain Cannot Control", "Can Extend Expiry"];
export declare const SINGLE_DOMAIN_FUSES: readonly ["Cannot Unwrap Name"];
export declare const TOP_PARENT_FUSES: readonly ["Cannot Unwrap Name", "Cannot Approve"];
export declare const MID_PARENT_FUSES: readonly ["Cannot Unwrap Name", "Parent Domain Cannot Control", "Cannot Approve"];
//# sourceMappingURL=constants.d.ts.map