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
	function extendExpiry(bytes32 node, bytes32 labelhash, uint64 expiry) external returns (uint64);
	function approve(address to, uint256 tokenId) external;
}

interface IEnsPublicResolver {
	function setContenthash(bytes32 node, bytes calldata hash) external;
	function setAddr(bytes32 node, address resolutionAddress) external;
}

IEnsRegistryWithFallBack constant ensRegistry = IEnsRegistryWithFallBack(ENS_REGISTRY_WITH_FALLBACK);
IEnsTokenWrapper constant ensTokenWrapper = IEnsTokenWrapper(ENS_TOKEN_WRAPPER);
IEnsPublicResolver constant ensPublicResolver = IEnsPublicResolver(ENS_PUBLIC_RESOLVER);

// fuse combinations
uint16 constant TOP_PARENT_FUSES_TO_BURN = CANNOT_UNWRAP & CANNOT_APPROVE;
uint32 constant PARENT_FUSES_TO_BURN = CANNOT_UNWRAP & PARENT_CANNOT_CONTROL & CANNOT_APPROVE;
uint32 constant FINAL_CHILD_FUSES_TO_BURN = CANNOT_UNWRAP & CANNOT_BURN_FUSES & CANNOT_SET_RESOLVER & CANNOT_SET_TTL & CANNOT_CREATE_SUBDOMAIN & PARENT_CANNOT_CONTROL & CANNOT_APPROVE & CAN_EXTEND_EXPIRY;
address constant OPEN_RENEWAL_MANAGER = 0xfd1B30F74FD0d96aa70075e1EFDe41c702ba4042;
uint64 constant MAX_UINT64 = type(uint64).max;

// check that tokenId exists in an array
function exists(uint256 tokenId, SubDomainLabelNode[] memory pathToChild) pure returns (bool) {
	for (uint256 i = 0; i < pathToChild.length; i++) {
		if (uint256(pathToChild[i].node) == tokenId) return true;
	}
	return false;
}

struct SubDomainLabelNode { 
	string label;
	bytes32 node;
}

contract PetalLock {
	function makeImmutable(address originalOwner, SubDomainLabelNode[] memory pathToChild, bytes memory contenthash, address resolutionAddress) private {
		uint256 finalChildIndex = pathToChild.length - 1;

		// handle parents, set fuses and create child if needed
		for (uint256 i = 0; i < pathToChild.length; i++) {
			bytes32 node = pathToChild[i].node;
			// check that the record exists, if not, lets create it
			if (!ensRegistry.recordExists(node)) {
				require(i > 0, 'PetalLock: The first record need to exist');
				bytes32 parentNameHash = pathToChild[i - 1].node;
				if (i == finalChildIndex) {
					ensTokenWrapper.setSubnodeRecord(parentNameHash, pathToChild[i].label, address(this), ENS_PUBLIC_RESOLVER, 0, FINAL_CHILD_FUSES_TO_BURN, MAX_UINT64);
				} else {
					ensTokenWrapper.setSubnodeRecord(parentNameHash, pathToChild[i].label, address(this), ENS_PUBLIC_RESOLVER, 0, 0, MAX_UINT64);
					ensTokenWrapper.approve(OPEN_RENEWAL_MANAGER, uint256(pathToChild[i].node));
					ensTokenWrapper.setChildFuses(parentNameHash, keccak256(abi.encodePacked(pathToChild[i].label)), PARENT_FUSES_TO_BURN, MAX_UINT64);
				}
			} else if (i == finalChildIndex) {
				if (i == 0) { // only one node in the data
					ensTokenWrapper.setFuses(pathToChild[i].node, CANNOT_UNWRAP + CANNOT_BURN_FUSES + CANNOT_SET_RESOLVER + CANNOT_CREATE_SUBDOMAIN + CANNOT_APPROVE);
				} else {
					// burn child fuses
					ensTokenWrapper.setChildFuses(pathToChild[i - 1].node, keccak256(abi.encodePacked(pathToChild[i].label)), FINAL_CHILD_FUSES_TO_BURN, MAX_UINT64);
				}
			} else {
				// the node needs to be wraped
				require(ensTokenWrapper.isWrapped(node), 'PetalLock: Node not wrapped');
				// check that 'Cannot Unwrap Name' is burned for top level parent or paren cannot control and cannot wrap is burnt otherwise
				(, uint32 newFuses,) = ensTokenWrapper.getData(uint256(pathToChild[i].node));
				if (i == 0) {
					if (newFuses & TOP_PARENT_FUSES_TO_BURN != TOP_PARENT_FUSES_TO_BURN) {
						ensTokenWrapper.approve(OPEN_RENEWAL_MANAGER, uint256(pathToChild[i].node));
						ensTokenWrapper.setFuses(pathToChild[i].node, TOP_PARENT_FUSES_TO_BURN);
					}
				} else {
					if (newFuses & PARENT_FUSES_TO_BURN != PARENT_FUSES_TO_BURN) {
						ensTokenWrapper.approve(OPEN_RENEWAL_MANAGER, uint256(pathToChild[i].node));
						ensTokenWrapper.setChildFuses(pathToChild[i - 1].node, keccak256(abi.encodePacked(pathToChild[i].label)), PARENT_FUSES_TO_BURN, MAX_UINT64);
					}
				}
			}
		}
		
		// set content hash
		if (contenthash.length != 0) { ensPublicResolver.setContenthash(pathToChild[finalChildIndex].node, contenthash); }
		if (resolutionAddress != address(0x0)) { ensPublicResolver.setAddr(pathToChild[finalChildIndex].node, resolutionAddress); }

		// move the final child to renewal manager, so it can be renewed by anyone (otherwise its technically burned)
		ensTokenWrapper.safeTransferFrom(address(this), OPEN_RENEWAL_MANAGER, uint256(pathToChild[finalChildIndex].node), 1, bytes(''));
		
		// return rest of the tokens to the sender
		uint256[] memory returnableTokens = new uint256[](pathToChild.length - 1);
		uint256[] memory returnableAmounts = new uint256[](returnableTokens.length);
		for (uint256 i = 0; i < returnableTokens.length; i++) {
			returnableTokens[i] = uint256(pathToChild[i].node);
			returnableAmounts[i] = 1;
		}
		
		ensTokenWrapper.safeBatchTransferFrom(address(this), originalOwner, returnableTokens, returnableAmounts, bytes(''));
	}
	
	// allow only minting wraped ENS tokens here (required as we are minting them here)
	function onERC1155Received(address operator, address from, uint256, uint256, bytes memory) public view returns (bytes4) {
		require(from == address(0x0) && operator == address(this) && msg.sender == ENS_TOKEN_WRAPPER, 'PetalLock: Do not send tokens to PetalLock');
		return this.onERC1155Received.selector;
	}

	// when receiving wrapped ens tokens, make the last child immutable
	function onERC1155BatchReceived(address, address from, uint256[] memory ids, uint256[] memory, bytes memory data) public returns (bytes4) {
		require(msg.sender == ENS_TOKEN_WRAPPER, 'PetalLock: Only Wrapped ENS tokens are supported');
		(SubDomainLabelNode[] memory pathToChild, bytes memory contenthash, address resolutionAddress) = abi.decode(data, (SubDomainLabelNode[], bytes, address));
		
		for (uint256 idIndex = 0; idIndex < ids.length; idIndex++) {	
			require(exists(ids[idIndex], pathToChild), 'PetalLock: Sent token does not exist in nodes');
		}
		require(contenthash.length != 0 || resolutionAddress != address(0x0), 'PetalLock: Either resolution address or content hash need to be set');

		makeImmutable(from, pathToChild, contenthash, resolutionAddress);
		return this.onERC1155BatchReceived.selector;
	}
}
