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

address constant ENS_NAME_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401;
address constant ENS_REGISTRY_WITH_FALLBACK = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;
IENS constant ENS = IENS(ENS_REGISTRY_WITH_FALLBACK);
bytes32 constant ADDR_REVERSE_NODE = 0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2; // namehash('addr.reverse')

contract OpenRenewalManager {
    constructor() {
        IReverseRegistrar reverseRegistrar = IReverseRegistrar(ENS.owner(ADDR_REVERSE_NODE));
        reverseRegistrar.claim(msg.sender);
    }
    function extendExpiry(bytes32 parentNode, bytes32 labelhash, uint64 expiry) external returns (uint64) {
        return INameWrapper(ENS_NAME_WRAPPER).extendExpiry(parentNode, labelhash, expiry);
    }
	function onERC1155Received(address, address, uint256, uint256, bytes memory) external view returns (bytes4) {
		require(msg.sender == ENS_NAME_WRAPPER, 'OpenRenewalManager: Only Wrapped ENS names are supported');
		return this.onERC1155Received.selector;
	}

	// when receiving wrapped ens tokens, make the last child immutable
	function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) external view returns (bytes4) {
		require(msg.sender == ENS_NAME_WRAPPER, 'OpenRenewalManager: Only Wrapped ENS names are supported');
		return this.onERC1155BatchReceived.selector;
	}
}
