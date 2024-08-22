// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// ENS contracts
address constant ENS_PUBLIC_RESOLVER = 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63;
address constant ENS_TOKEN_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401;
address constant ENS_REGISTRY_WITH_FALLBACK = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;

// ENS Fuses
uint16 constant CANNOT_UNWRAP = 1;
uint16 constant CANNOT_BURN_FUSES = 2;
uint16 constant CANNOT_TRANSFER = 4;
uint16 constant CANNOT_SET_RESOLVER = 8;
uint16 constant CANNOT_SET_TTL = 16;
uint16 constant CANNOT_CREATE_SUBDOMAIN = 32;
uint16 constant CANNOT_APPROVE = 64;
uint32 constant PARENT_CANNOT_CONTROL = 1 << 16;
uint32 constant IS_DOT_ETH = 1 << 17;
uint32 constant CAN_EXTEND_EXPIRY = 1 << 18;
uint16 constant CAN_DO_EVERYTHING = 0;

// interfaces
interface IEnsRegistryWithFallBack {
	function recordExists(bytes32 node) external view returns (bool);
}

interface IEnsTokenWrapper {
	function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes memory _data) external;
	function safeBatchTransferFrom(address from, address to, uint256[] memory tokenId, uint256[] memory amount, bytes memory _data) external;
	function setSubnodeRecord(bytes32 parentNode, string memory label, address owner, address resolver, uint64 ttl, uint32 fuses, uint64 expiry) external returns(bytes32 node);
	function getData(uint256 id) external view returns (address, uint32, uint64);
	function setChildFuses(bytes32 parentNode, bytes32 labelhash, uint32 fuses, uint64 expiry) external;
	function isWrapped(bytes32 node) external view returns (bool);
	function setFuses(bytes32 node, uint16 fuses) external returns (uint32);
}

interface IEnsPublicResolver {
	function setContenthash(bytes32 node, bytes calldata hash) external;
}

IEnsRegistryWithFallBack constant ensRegistry = IEnsRegistryWithFallBack(ENS_REGISTRY_WITH_FALLBACK);
IEnsTokenWrapper constant ensTokenWrapper = IEnsTokenWrapper(ENS_TOKEN_WRAPPER);
IEnsPublicResolver constant ensPublicResolver = IEnsPublicResolver(ENS_PUBLIC_RESOLVER);

// fuse combinations
uint32 constant PARENT_FUSES_TO_BURN = CANNOT_UNWRAP + PARENT_CANNOT_CONTROL;
uint32 constant FINAL_CHILD_FUSES_TO_BURN = CANNOT_UNWRAP + CANNOT_BURN_FUSES + CANNOT_SET_RESOLVER + CANNOT_SET_TTL + CANNOT_CREATE_SUBDOMAIN + PARENT_CANNOT_CONTROL + CANNOT_APPROVE + CAN_EXTEND_EXPIRY;
address constant burnAddress = 0xdeaDDeADDEaDdeaDdEAddEADDEAdDeadDEADDEaD;

// check that tokenId exists in an array
function exists(uint256 tokenId, bytes32[] memory subdomainRouteNodes) pure returns (bool) {
	for (uint256 i = 0; i < subdomainRouteNodes.length; i++) {
		if (uint256(subdomainRouteNodes[i]) == tokenId) return true;
	}
	return false;
}

contract PetalLock {
	function makeImmutable(address originalOwner, string[] memory labels, bytes32[] memory subdomainRouteNodes, bytes memory contenthash) private {
		require(labels.length == subdomainRouteNodes.length, 'input array length mismatch');
		uint256 finalChildIndex = subdomainRouteNodes.length - 1;

		// handle parents
		for (uint256 i = 0; i < labels.length; i++) {
			bytes32 node = subdomainRouteNodes[i];
			// 1) check that the record exists, if not, lets create it
			if (!ensRegistry.recordExists(node)) {
				require(i > 0, 'first record need to exist');
				(,, uint64 parentExpiry) = ensTokenWrapper.getData(uint256(subdomainRouteNodes[i - 1]));
				bytes32 parentNameHash = subdomainRouteNodes[i - 1];
				if (i == finalChildIndex) {
					// do not burn childs fuses here yet as we still need to make modifications to the child
					ensTokenWrapper.setSubnodeRecord(parentNameHash, labels[i], address(this), ENS_PUBLIC_RESOLVER, 0, 0, parentExpiry);
				} else {
					ensTokenWrapper.setSubnodeRecord(parentNameHash, labels[i], address(this), ENS_PUBLIC_RESOLVER, 0, PARENT_FUSES_TO_BURN, parentExpiry);
				}
			} else if (i == finalChildIndex) {
				// if final child is created, the rest of the final child logic is handled later
				continue;
			} else {
				// 2) the node needs to be wraped
				require(ensTokenWrapper.isWrapped(node), 'node not wrapped');
				// 3) check that 'Cannot Unwrap Name' is burned for top level parent or paren cannot control and cannot wrap is burnt otherwise
				(, uint32 newFuses,) = ensTokenWrapper.getData(uint256(subdomainRouteNodes[i]));
				if (i == 0) {
					if (newFuses & CANNOT_UNWRAP != CANNOT_UNWRAP) {
						ensTokenWrapper.setFuses(subdomainRouteNodes[i], CANNOT_UNWRAP);
					}
				} else {
					if (newFuses & PARENT_FUSES_TO_BURN != PARENT_FUSES_TO_BURN) {
						(,, uint64 parentExpiry) = ensTokenWrapper.getData(uint256(subdomainRouteNodes[i - 1])); // set childs expiry to be the same as parent, as it cannot be set any longer than that
						ensTokenWrapper.setChildFuses(subdomainRouteNodes[i - 1], keccak256(abi.encodePacked(labels[i])), PARENT_FUSES_TO_BURN, parentExpiry);
					}
				}
			}
		}
		
		ensPublicResolver.setContenthash(subdomainRouteNodes[finalChildIndex], contenthash);
		(,, uint64 finalChildsParentExpiry) = ensTokenWrapper.getData(uint256(subdomainRouteNodes[finalChildIndex - 1]));
		
		// burn child fuses
		ensTokenWrapper.setChildFuses(subdomainRouteNodes[finalChildIndex - 1], keccak256(abi.encodePacked(labels[finalChildIndex])), FINAL_CHILD_FUSES_TO_BURN, finalChildsParentExpiry);
		
		// burn child owner
		ensTokenWrapper.safeTransferFrom(address(this), burnAddress, uint256(subdomainRouteNodes[finalChildIndex]), 1, bytes(''));
		
		// return rest of the tokens to the sender
		uint256[] memory returnableTokens = new uint256[](subdomainRouteNodes.length - 1);
		uint256[] memory returnableAmounts = new uint256[](returnableTokens.length);
		for (uint256 i = 0; i < returnableTokens.length; i++) {
			returnableTokens[i] = uint256(subdomainRouteNodes[i]);
			returnableAmounts[i] = 1;
		}
		
		ensTokenWrapper.safeBatchTransferFrom(address(this), originalOwner, returnableTokens, returnableAmounts, bytes(''));
	}
	
	// allow only minting wraped ENS tokens here (required as we are minting them here)
	function onERC1155Received(address operator, address from, uint256, uint256, bytes memory) public view returns (bytes4) {
		require(from == address(0x0) && operator == address(this) && msg.sender == ENS_TOKEN_WRAPPER, 'Do not send tokens to PetalLock');
		return this.onERC1155Received.selector;
	}

	// when receiving wrapped ens tokens, make the last child immutable
	function onERC1155BatchReceived(address, address from, uint256[] memory ids, uint256[] memory, bytes memory data) public returns (bytes4) {
		require(msg.sender == ENS_TOKEN_WRAPPER, 'Supports only Wrapped ENS');
		(string[] memory labels, bytes32[] memory subdomainRouteNodes, bytes memory contenthash) = abi.decode(data, (string[], bytes32[], bytes));
		
		for (uint256 idIndex = 0; idIndex < ids.length; idIndex++) {	
			require(exists(ids[idIndex], subdomainRouteNodes), 'Sent token does not exist in subdomainRouteNodes');
		}
		
		makeImmutable(from, labels, subdomainRouteNodes, contenthash);
		return this.onERC1155BatchReceived.selector;
	}
}
