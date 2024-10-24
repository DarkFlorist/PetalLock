// SPDX-License-Identifier: MIT
// modified from https://github.com/ensdomains/ens-contracts/pull/263/files
pragma solidity 0.8.26;

interface INameWrapper {
    function extendExpiry(bytes32 node, bytes32 labelhash, uint64 expiry) external returns (uint64);
}

interface IENS {
    function owner(bytes32 node) external view returns (address);
}

address constant ENS_NAME_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401;

contract OpenRenewalManager {
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
