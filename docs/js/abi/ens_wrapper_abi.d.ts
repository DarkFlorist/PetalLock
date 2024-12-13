export declare const ENS_WRAPPER_ABI: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "contract ENS";
        readonly name: "_ens";
        readonly type: "address";
    }, {
        readonly internalType: "contract IBaseRegistrar";
        readonly name: "_registrar";
        readonly type: "address";
    }, {
        readonly internalType: "contract IMetadataService";
        readonly name: "_metadataService";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [];
    readonly name: "CannotUpgrade";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "IncompatibleParent";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "IncorrectTargetOwner";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "IncorrectTokenType";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "labelHash";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "expectedLabelhash";
        readonly type: "bytes32";
    }];
    readonly name: "LabelMismatch";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "label";
        readonly type: "string";
    }];
    readonly name: "LabelTooLong";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "LabelTooShort";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NameIsNotWrapped";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }];
    readonly name: "OperationProhibited";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "addr";
        readonly type: "address";
    }];
    readonly name: "Unauthorised";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "approved";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "uint256";
        readonly name: "tokenId";
        readonly type: "uint256";
    }];
    readonly name: "Approval";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "operator";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "approved";
        readonly type: "bool";
    }];
    readonly name: "ApprovalForAll";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "controller";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "active";
        readonly type: "bool";
    }];
    readonly name: "ControllerChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint64";
        readonly name: "expiry";
        readonly type: "uint64";
    }];
    readonly name: "ExpiryExtended";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint32";
        readonly name: "fuses";
        readonly type: "uint32";
    }];
    readonly name: "FusesSet";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "NameUnwrapped";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "bytes";
        readonly name: "name";
        readonly type: "bytes";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint32";
        readonly name: "fuses";
        readonly type: "uint32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint64";
        readonly name: "expiry";
        readonly type: "uint64";
    }];
    readonly name: "NameWrapped";
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
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "operator";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256[]";
        readonly name: "ids";
        readonly type: "uint256[]";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256[]";
        readonly name: "values";
        readonly type: "uint256[]";
    }];
    readonly name: "TransferBatch";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "operator";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "TransferSingle";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "value";
        readonly type: "string";
    }, {
        readonly indexed: true;
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly name: "URI";
    readonly type: "event";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "_tokens";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly internalType: "uint32";
        readonly name: "fuseMask";
        readonly type: "uint32";
    }];
    readonly name: "allFusesBurned";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "tokenId";
        readonly type: "uint256";
    }];
    readonly name: "approve";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address[]";
        readonly name: "accounts";
        readonly type: "address[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "ids";
        readonly type: "uint256[]";
    }];
    readonly name: "balanceOfBatch";
    readonly outputs: readonly [{
        readonly internalType: "uint256[]";
        readonly name: "";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "addr";
        readonly type: "address";
    }];
    readonly name: "canExtendSubnames";
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
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "addr";
        readonly type: "address";
    }];
    readonly name: "canModifyName";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "controllers";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "ens";
    readonly outputs: readonly [{
        readonly internalType: "contract ENS";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "parentNode";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "labelhash";
        readonly type: "bytes32";
    }, {
        readonly internalType: "uint64";
        readonly name: "expiry";
        readonly type: "uint64";
    }];
    readonly name: "extendExpiry";
    readonly outputs: readonly [{
        readonly internalType: "uint64";
        readonly name: "";
        readonly type: "uint64";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly name: "getApproved";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "operator";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly name: "getData";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "uint32";
        readonly name: "fuses";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint64";
        readonly name: "expiry";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "operator";
        readonly type: "address";
    }];
    readonly name: "isApprovedForAll";
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
        readonly name: "parentNode";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "labelhash";
        readonly type: "bytes32";
    }];
    readonly name: "isWrapped";
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
        readonly name: "node";
        readonly type: "bytes32";
    }];
    readonly name: "isWrapped";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "metadataService";
    readonly outputs: readonly [{
        readonly internalType: "contract IMetadataService";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "name";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly name: "names";
    readonly outputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "";
        readonly type: "bytes";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "tokenId";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "onERC721Received";
    readonly outputs: readonly [{
        readonly internalType: "bytes4";
        readonly name: "";
        readonly type: "bytes4";
    }];
    readonly stateMutability: "nonpayable";
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
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }];
    readonly name: "ownerOf";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
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
        readonly name: "label";
        readonly type: "string";
    }, {
        readonly internalType: "address";
        readonly name: "wrappedOwner";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "duration";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "resolver";
        readonly type: "address";
    }, {
        readonly internalType: "uint16";
        readonly name: "ownerControlledFuses";
        readonly type: "uint16";
    }];
    readonly name: "registerAndWrapETH2LD";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "registrarExpiry";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "registrar";
    readonly outputs: readonly [{
        readonly internalType: "contract IBaseRegistrar";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "tokenId";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "duration";
        readonly type: "uint256";
    }];
    readonly name: "renew";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "expires";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "renounceOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "ids";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "amounts";
        readonly type: "uint256[]";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "safeBatchTransferFrom";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "id";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly internalType: "bytes";
        readonly name: "data";
        readonly type: "bytes";
    }];
    readonly name: "safeTransferFrom";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "operator";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "approved";
        readonly type: "bool";
    }];
    readonly name: "setApprovalForAll";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "parentNode";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "labelhash";
        readonly type: "bytes32";
    }, {
        readonly internalType: "uint32";
        readonly name: "fuses";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint64";
        readonly name: "expiry";
        readonly type: "uint64";
    }];
    readonly name: "setChildFuses";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "controller";
        readonly type: "address";
    }, {
        readonly internalType: "bool";
        readonly name: "active";
        readonly type: "bool";
    }];
    readonly name: "setController";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly internalType: "uint16";
        readonly name: "ownerControlledFuses";
        readonly type: "uint16";
    }];
    readonly name: "setFuses";
    readonly outputs: readonly [{
        readonly internalType: "uint32";
        readonly name: "";
        readonly type: "uint32";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract IMetadataService";
        readonly name: "_metadataService";
        readonly type: "address";
    }];
    readonly name: "setMetadataService";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "resolver";
        readonly type: "address";
    }, {
        readonly internalType: "uint64";
        readonly name: "ttl";
        readonly type: "uint64";
    }];
    readonly name: "setRecord";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "resolver";
        readonly type: "address";
    }];
    readonly name: "setResolver";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "parentNode";
        readonly type: "bytes32";
    }, {
        readonly internalType: "string";
        readonly name: "label";
        readonly type: "string";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "uint32";
        readonly name: "fuses";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint64";
        readonly name: "expiry";
        readonly type: "uint64";
    }];
    readonly name: "setSubnodeOwner";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "parentNode";
        readonly type: "bytes32";
    }, {
        readonly internalType: "string";
        readonly name: "label";
        readonly type: "string";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "resolver";
        readonly type: "address";
    }, {
        readonly internalType: "uint64";
        readonly name: "ttl";
        readonly type: "uint64";
    }, {
        readonly internalType: "uint32";
        readonly name: "fuses";
        readonly type: "uint32";
    }, {
        readonly internalType: "uint64";
        readonly name: "expiry";
        readonly type: "uint64";
    }];
    readonly name: "setSubnodeRecord";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "node";
        readonly type: "bytes32";
    }, {
        readonly internalType: "uint64";
        readonly name: "ttl";
        readonly type: "uint64";
    }];
    readonly name: "setTTL";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "contract INameWrapperUpgrade";
        readonly name: "_upgradeAddress";
        readonly type: "address";
    }];
    readonly name: "setUpgradeContract";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes4";
        readonly name: "interfaceId";
        readonly type: "bytes4";
    }];
    readonly name: "supportsInterface";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
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
        readonly internalType: "bytes32";
        readonly name: "parentNode";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "labelhash";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "controller";
        readonly type: "address";
    }];
    readonly name: "unwrap";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "labelhash";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "registrant";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "controller";
        readonly type: "address";
    }];
    readonly name: "unwrapETH2LD";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "name";
        readonly type: "bytes";
    }, {
        readonly internalType: "bytes";
        readonly name: "extraData";
        readonly type: "bytes";
    }];
    readonly name: "upgrade";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "upgradeContract";
    readonly outputs: readonly [{
        readonly internalType: "contract INameWrapperUpgrade";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "tokenId";
        readonly type: "uint256";
    }];
    readonly name: "uri";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes";
        readonly name: "name";
        readonly type: "bytes";
    }, {
        readonly internalType: "address";
        readonly name: "wrappedOwner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "resolver";
        readonly type: "address";
    }];
    readonly name: "wrap";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "label";
        readonly type: "string";
    }, {
        readonly internalType: "address";
        readonly name: "wrappedOwner";
        readonly type: "address";
    }, {
        readonly internalType: "uint16";
        readonly name: "ownerControlledFuses";
        readonly type: "uint16";
    }, {
        readonly internalType: "address";
        readonly name: "resolver";
        readonly type: "address";
    }];
    readonly name: "wrapETH2LD";
    readonly outputs: readonly [{
        readonly internalType: "uint64";
        readonly name: "expiry";
        readonly type: "uint64";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
//# sourceMappingURL=ens_wrapper_abi.d.ts.map