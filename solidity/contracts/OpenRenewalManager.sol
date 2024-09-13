// SPDX-License-Identifier: MIT
// modified from https://github.com/ensdomains/ens-contracts/pull/263/files
pragma solidity 0.8.26;

interface INameWrapper {
    function extendExpiry(bytes32 node, bytes32 labelhash, uint64 expiry) external returns (uint64);
}

interface IReverseRegistrar {
    function claim(address owner) external returns (bytes32);
}

interface IENS {
    function owner(bytes32 node) external view returns (address);
}

contract ReverseClaimer {
    // namehash('addr.reverse')
    bytes32 constant ADDR_REVERSE_NODE = 0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2;

    constructor(IENS ens, address claimant) {
        IReverseRegistrar reverseRegistrar = IReverseRegistrar(ens.owner(ADDR_REVERSE_NODE));
        reverseRegistrar.claim(claimant);
    }
}

address constant ENS_TOKEN_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401;
address constant ENS_REGISTRY_WITH_FALLBACK = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;

contract OpenRenewalManager is ReverseClaimer {
    constructor() ReverseClaimer(IENS(ENS_REGISTRY_WITH_FALLBACK), msg.sender) {

    }
    function extendExpiry(bytes32 parentNode, bytes32 labelhash, uint64 expiry) external returns (uint64) {
        return INameWrapper(ENS_TOKEN_WRAPPER).extendExpiry(parentNode, labelhash, expiry);
    }
	function onERC1155Received(address, address, uint256, uint256, bytes memory) external view returns (bytes4) {
		require(msg.sender == ENS_TOKEN_WRAPPER, 'OpenRenewalManager: Only Wrapped ENS tokens are supported');
		return this.onERC1155Received.selector;
	}

	// when receiving wrapped ens tokens, make the last child immutable
	function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) external view returns (bytes4) {
		require(msg.sender == ENS_TOKEN_WRAPPER, 'OpenRenewalManager: Only Wrapped ENS tokens are supported');
		return this.onERC1155BatchReceived.selector;
	}
}
