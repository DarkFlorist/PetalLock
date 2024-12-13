export declare const ENS_REGISTRAR_CONTROLLER_ABI: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "contract BaseRegistrarImplementation";
        readonly name: "_base";
        readonly type: "address";
    }, {
        readonly internalType: "contract IPriceOracle";
        readonly name: "_prices";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_minCommitmentAge";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "_maxCommitmentAge";
        readonly type: "uint256";
    }, {
        readonly internalType: "contract ReverseRegistrar";
        readonly name: "_reverseRegistrar";
        readonly type: "address";
    }, {
        readonly internalType: "contract INameWrapper";
        readonly name: "_nameWrapper";
        readonly type: "address";
    }, {
        readonly internalType: "contract ENS";
        readonly name: "_ens";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "commitment";
        readonly type: "bytes32";
    }];
    readonly name: "CommitmentTooNew";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "commitment";
        readonly type: "bytes32";
    }];
    readonly name: "CommitmentTooOld";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "duration";
        readonly type: "uint256";
    }];
    readonly name: "DurationTooShort";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InsufficientValue";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "MaxCommitmentAgeTooHigh";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "MaxCommitmentAgeTooLow";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }];
    readonly name: "NameNotAvailable";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "ResolverRequiredWhenDataSupplied";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "commitment";
        readonly type: "bytes32";
    }];
    readonly name: "UnexpiredCommitmentExists";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }, {
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "label";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "baseCost";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "premium";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "expires";
        readonly type: "uint256";
    }];
    readonly name: "NameRegistered";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }, {
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "label";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "cost";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "expires";
        readonly type: "uint256";
    }];
    readonly name: "NameRenewed";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "previousOwner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "OwnershipTransferred";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "MIN_REGISTRATION_DURATION";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }];
    readonly name: "available";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "commitment";
        readonly type: "bytes32";
    }];
    readonly name: "commit";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly name: "commitments";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "duration";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes32";
        readonly name: "secret";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "resolver";
        readonly type: "address";
    }, {
        readonly internalType: "bytes[]";
        readonly name: "data";
        readonly type: "bytes[]";
    }, {
        readonly internalType: "bool";
        readonly name: "reverseRecord";
        readonly type: "bool";
    }, {
        readonly internalType: "uint16";
        readonly name: "ownerControlledFuses";
        readonly type: "uint16";
    }];
    readonly name: "makeCommitment";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "pure";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "maxCommitmentAge";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "minCommitmentAge";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "nameWrapper";
    readonly outputs: readonly [{
        readonly internalType: "contract INameWrapper";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "owner";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "prices";
    readonly outputs: readonly [{
        readonly internalType: "contract IPriceOracle";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "_token";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "_to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "_amount";
        readonly type: "uint256";
    }];
    readonly name: "recoverFunds";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "duration";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes32";
        readonly name: "secret";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "resolver";
        readonly type: "address";
    }, {
        readonly internalType: "bytes[]";
        readonly name: "data";
        readonly type: "bytes[]";
    }, {
        readonly internalType: "bool";
        readonly name: "reverseRecord";
        readonly type: "bool";
    }, {
        readonly internalType: "uint16";
        readonly name: "ownerControlledFuses";
        readonly type: "uint16";
    }];
    readonly name: "register";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }, {
        readonly internalType: "uint256";
        readonly name: "duration";
        readonly type: "uint256";
    }];
    readonly name: "renew";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "renounceOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }, {
        readonly internalType: "uint256";
        readonly name: "duration";
        readonly type: "uint256";
    }];
    readonly name: "rentPrice";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "uint256";
            readonly name: "base";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "premium";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IPriceOracle.Price";
        readonly name: "price";
        readonly type: "tuple";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "reverseRegistrar";
    readonly outputs: readonly [{
        readonly internalType: "contract ReverseRegistrar";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes4";
        readonly name: "interfaceID";
        readonly type: "bytes4";
    }];
    readonly name: "supportsInterface";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "pure";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "transferOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }];
    readonly name: "valid";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "pure";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "withdraw";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
//# sourceMappingURL=ens_registrar_controller_abi.d.ts.map