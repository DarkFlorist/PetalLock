// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// ENS contracts
address constant ENS_PUBLIC_RESOLVER = 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63;
address constant ENS_TOKEN_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401;
address constant ENS_REGISTRY_WITH_FALLBACK = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;
address constant ENS_ETH_REGISTRAR_CONTROLLER = 0x253553366Da8546fC250F225fe3d25d0C782303b;

// Open Renewal Manager contract address
address constant OPEN_RENEWAL_MANAGER = 0x2d335A644EC10967D517C367CaF388261223f321;

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

interface IENsRegistrarController {
	function renew(string calldata name, uint256 duration) external payable;
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
	function getApproved(uint256 id) external returns (address);
}

interface IEnsPublicResolver {
	function setContenthash(bytes32 node, bytes calldata hash) external;
	function setAddr(bytes32 node, address resolutionAddress) external;
}

interface IOpenRenewalManager {
	function extendExpiry(bytes32 parentNode, bytes32 labelhash, uint64 expiry) external returns (uint64);
}

IOpenRenewalManager constant openRenewalManager = IOpenRenewalManager(OPEN_RENEWAL_MANAGER);
IEnsRegistryWithFallBack constant ensRegistry = IEnsRegistryWithFallBack(ENS_REGISTRY_WITH_FALLBACK);
IEnsTokenWrapper constant ensTokenWrapper = IEnsTokenWrapper(ENS_TOKEN_WRAPPER);
IEnsPublicResolver constant ensPublicResolver = IEnsPublicResolver(ENS_PUBLIC_RESOLVER);
IENsRegistrarController constant ensRegistrarController = IENsRegistrarController(ENS_ETH_REGISTRAR_CONTROLLER);

// fuse combinations
uint16 constant TOP_PARENT_FUSES_TO_BURN = CANNOT_UNWRAP | CANNOT_APPROVE;
uint32 constant PARENT_FUSES_TO_BURN = CANNOT_UNWRAP | PARENT_CANNOT_CONTROL | CANNOT_APPROVE;
uint32 constant FINAL_CHILD_FUSES_TO_BURN = CANNOT_UNWRAP | CANNOT_BURN_FUSES | CANNOT_SET_RESOLVER | CANNOT_SET_TTL | CANNOT_CREATE_SUBDOMAIN | PARENT_CANNOT_CONTROL | CANNOT_APPROVE | CAN_EXTEND_EXPIRY;

uint64 constant MAX_UINT64 = type(uint64).max;
uint256 constant ETH_NAME_HASH = 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae; // keccak256(namehash('') + labelhash('eth')) https://docs.ens.domains/resolution/names

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

struct BatchExtend { 
	bytes32 parentNode;
	string label;
	uint64 domainExpiry;
}

contract PetalLock {
	function batchExtend(BatchExtend[] calldata domainsAndSubDomains) public payable {
		for (uint256 i = 0; i < domainsAndSubDomains.length; i++) {
			if (uint256(domainsAndSubDomains[i].parentNode) == ETH_NAME_HASH) {
				ensRegistrarController.renew{ value: address(this).balance }(domainsAndSubDomains[i].label, domainsAndSubDomains[i].domainExpiry);
			} else {
				// sub domains are always extended to the max, so `domainExpiry` paremeter is not obeyed
				openRenewalManager.extendExpiry(domainsAndSubDomains[i].parentNode, keccak256(abi.encodePacked(domainsAndSubDomains[i].label)), MAX_UINT64);
			}
		}
		(bool sent, bytes memory data) = payable(msg.sender).call{value: address(this).balance}("");
       	require(sent, 'Failed to send Ether');
	}

	function makeImmutable(address originalOwner, SubDomainLabelNode[] memory pathToChild, bytes memory contenthash, address resolutionAddress) private {
		require(ensRegistry.recordExists(pathToChild[0].node), 'PetalLock: The first record need to exist');
		require(ensTokenWrapper.isWrapped(pathToChild[0].node), 'PetalLock: The first record is not wrapped');
		if (ensTokenWrapper.getApproved(uint256(pathToChild[0].node)) != OPEN_RENEWAL_MANAGER) {
			ensTokenWrapper.approve(OPEN_RENEWAL_MANAGER, uint256(pathToChild[0].node));
		}
		uint256 finalChildIndex = pathToChild.length - 1;
		
		// CREATE SUBDOMAINS // 
		// create nodes and approve open renewal manager. Do not create the first domain, it needs to be created already
		for (uint256 i = 1; i < pathToChild.length; i++) {
			bytes32 parentNameHash = pathToChild[i - 1].node;
			bytes32 node = pathToChild[i].node;
			// check that the record exists, if not, lets create it
			if (!ensRegistry.recordExists(node)) {
				ensTokenWrapper.setSubnodeRecord(parentNameHash, pathToChild[i].label, address(this), ENS_PUBLIC_RESOLVER, 0, 0, MAX_UINT64);
				ensTokenWrapper.approve(OPEN_RENEWAL_MANAGER, uint256(node));
			} else {
				// the node needs to be wrapped
				require(ensTokenWrapper.isWrapped(node), 'PetalLock: Node not wrapped');
				if (ensTokenWrapper.getApproved(uint256(node)) != OPEN_RENEWAL_MANAGER) {
					ensTokenWrapper.approve(OPEN_RENEWAL_MANAGER, uint256(node));
				}
			}
		}

		// set content hash and address
		if (contenthash.length != 0) { ensPublicResolver.setContenthash(pathToChild[finalChildIndex].node, contenthash); }
		if (resolutionAddress != address(0x0)) { ensPublicResolver.setAddr(pathToChild[finalChildIndex].node, resolutionAddress); }
		
		// BURN PARENT FUSES //
		// the top parent
		(, uint32 topParentFuses,) = ensTokenWrapper.getData(uint256(pathToChild[0].node));
		if (topParentFuses & TOP_PARENT_FUSES_TO_BURN != TOP_PARENT_FUSES_TO_BURN) {
			ensTokenWrapper.setFuses(pathToChild[0].node, TOP_PARENT_FUSES_TO_BURN);
		}

		// rest of the parents
		for (uint256 i = 1; i < pathToChild.length - 1; i++) {
			(, uint32 parentFuses,) = ensTokenWrapper.getData(uint256(pathToChild[i].node));
			if (parentFuses & PARENT_FUSES_TO_BURN != PARENT_FUSES_TO_BURN) {
				ensTokenWrapper.setChildFuses(pathToChild[i - 1].node, keccak256(abi.encodePacked(pathToChild[i].label)), PARENT_FUSES_TO_BURN, MAX_UINT64);
			}
		}

		// BURN FINAL CHILD FUSES //
		(, uint32 finalChildFuses,) = ensTokenWrapper.getData(uint256(pathToChild[finalChildIndex].node));
		if (finalChildIndex == 0) { // only one node in the data (<name>.eth)
			if (finalChildFuses & CANNOT_UNWRAP != CANNOT_UNWRAP) {
				ensTokenWrapper.setFuses(pathToChild[0].node, CANNOT_UNWRAP);
			}
		} else {
			if (finalChildFuses & FINAL_CHILD_FUSES_TO_BURN != FINAL_CHILD_FUSES_TO_BURN) {
				ensTokenWrapper.setChildFuses(pathToChild[finalChildIndex - 1].node, keccak256(abi.encodePacked(pathToChild[finalChildIndex].label)), FINAL_CHILD_FUSES_TO_BURN, MAX_UINT64);
			}
		}
	
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
	
	// only ensRegistrarController refunds eth to us
	receive() external payable  {
		require(msg.sender == ENS_ETH_REGISTRAR_CONTROLLER, 'PetalLock: do not send ETH to PetalLock');
	}
}
