// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// ENS contracts
address constant ENS_PUBLIC_RESOLVER = 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63;
address constant ENS_NAME_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401;
address constant ENS_REGISTRY_WITH_FALLBACK = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;
address constant ENS_ETH_REGISTRAR_CONTROLLER = 0x253553366Da8546fC250F225fe3d25d0C782303b;

// Open Renewal Manager contract address
address constant OPEN_RENEWAL_MANAGER = 0x55B75C29834DFd71ef30E2C828a938394564f0C0;

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

interface IEnsNameWrapper {
	function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes memory _data) external;
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
IEnsNameWrapper constant ensNameWrapper = IEnsNameWrapper(ENS_NAME_WRAPPER);
IEnsPublicResolver constant ensPublicResolver = IEnsPublicResolver(ENS_PUBLIC_RESOLVER);
IENsRegistrarController constant ensRegistrarController = IENsRegistrarController(ENS_ETH_REGISTRAR_CONTROLLER);

// FUSES
// fuses to burn for the second level domain given it's not the one made immutable
uint16 constant TOP_PARENT_FUSES_TO_BURN = CANNOT_UNWRAP | CANNOT_APPROVE;
// fuses to burn for each parent that is not second level domain
uint32 constant PARENT_FUSES_TO_BURN = CANNOT_UNWRAP | PARENT_CANNOT_CONTROL | CANNOT_APPROVE;
// fuses to burn when there's subdomain or more subdomains: <finalchild>.<name>.eth or <finalchild>.<parent>.<name>.eth
uint32 constant FINAL_CHILD_FUSES_TO_BURN = CANNOT_UNWRAP | CANNOT_BURN_FUSES | CANNOT_SET_RESOLVER | CANNOT_SET_TTL | CANNOT_CREATE_SUBDOMAIN | PARENT_CANNOT_CONTROL | CANNOT_APPROVE | CAN_EXTEND_EXPIRY;

// fuses to burn when second level domain is made immutable: <name>.eth
uint16 constant ONLY_CHILD_FUSES = CANNOT_UNWRAP;

uint64 constant MAX_UINT64 = type(uint64).max;
uint256 constant ETH_NAME_HASH = 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae; // keccak256(namehash('') + labelhash('eth')) https://docs.ens.domains/resolution/names

// check that tokenId exists in an array
function exists(uint256 tokenId, bytes32[] memory nodes) pure returns (bool) {
	uint256 nodesLength = nodes.length;
	for (uint256 i = 0; i < nodesLength; i++) {
		if (uint256(nodes[i]) == tokenId) return true;
	}
	return false;
}

struct BatchExtend {
	bytes32 parentNode;
	string label;
	uint64 domainExpiry;
}

contract PetalLock {
	event MadeImmutable(string fullName, uint256 tokenId, bytes contenthash, address resolutionAddress);

	function formFullPathEnsNameString(string[] memory inputArray) private pure returns (string memory) {
		bytes memory result;
		for (uint i = inputArray.length - 1; i >= 0; i--) {
			result = abi.encodePacked(result, inputArray[i], '.');
		}
		return string(abi.encodePacked(result, 'eth'));
	}

	function batchExtend(BatchExtend[] calldata domainsAndSubDomains) public payable {
		uint256 domainsAndSubDomainsLength = domainsAndSubDomains.length;
		for (uint256 i = 0; i < domainsAndSubDomainsLength; i++) {
			if (uint256(domainsAndSubDomains[i].parentNode) == ETH_NAME_HASH) {
				ensRegistrarController.renew{ value: address(this).balance }(domainsAndSubDomains[i].label, domainsAndSubDomains[i].domainExpiry);
			} else {
				// sub domains are always extended to the max, so `domainExpiry` paremeter is not obeyed
				openRenewalManager.extendExpiry(domainsAndSubDomains[i].parentNode, keccak256(abi.encodePacked(domainsAndSubDomains[i].label)), MAX_UINT64);
			}
		}
		(bool sent,) = payable(msg.sender).call{value: address(this).balance}("");
       	require(sent, 'Failed to send Ether');
	}

	function makeImmutable(address originalOwner, string[] memory labelPathToChild, uint256[] memory tokenIds, bytes memory contenthash, address resolutionAddress) private {
		require(contenthash.length != 0 || resolutionAddress != address(0x0), 'PetalLock: Either resolution address or content hash need to be set');
		uint256 pathLength = labelPathToChild.length;
		require(pathLength > 0, 'PetalLock: Missing subdomain path');

		// calculate ENS name hashes from labels
		bytes32[] memory nodePathToChild = new bytes32[](pathLength);
		bytes32 prevNamehash = 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae; // keccak256(abi.encodePacked(0x0000000000000000000000000000000000000000000000000000000000000000, keccak256(abi.encodePacked('eth'))));
		for (uint256 labelIndex = 0; labelIndex < pathLength; labelIndex++) {
			prevNamehash = keccak256(abi.encodePacked(prevNamehash, keccak256(abi.encodePacked(labelPathToChild[labelIndex]))));
			nodePathToChild[labelIndex] = prevNamehash;
		}

		uint256 idsLength = tokenIds.length;
		for (uint256 idIndex = 0; idIndex < idsLength; idIndex++) {
			require(exists(tokenIds[idIndex], nodePathToChild), 'PetalLock: Sent ENS name does not exist in nodes');
		}
		require(ensRegistry.recordExists(nodePathToChild[0]), 'PetalLock: The second level domain does not exist');
		require(ensNameWrapper.isWrapped(nodePathToChild[0]), 'PetalLock: The second level domain is not wrapped');

		uint256 finalChildIndex = pathLength - 1;
		if (finalChildIndex != 0 && ensNameWrapper.getApproved(uint256(nodePathToChild[0])) != OPEN_RENEWAL_MANAGER) {
			ensNameWrapper.approve(OPEN_RENEWAL_MANAGER, uint256(nodePathToChild[0]));
		}

		// CREATE SUBDOMAINS //
		// create nodes and approve open renewal manager. Do not create the first domain, it needs to be created already
		for (uint256 i = 1; i < pathLength; i++) {
			bytes32 node = nodePathToChild[i];
			// check that the record exists, if not, lets create it
			if (!ensRegistry.recordExists(node)) {
				ensNameWrapper.setSubnodeRecord(nodePathToChild[i - 1], labelPathToChild[i], address(this), ENS_PUBLIC_RESOLVER, 0, 0, MAX_UINT64);
				ensNameWrapper.approve(OPEN_RENEWAL_MANAGER, uint256(node));
			} else {
				// the node needs to be wrapped
				require(ensNameWrapper.isWrapped(node), 'PetalLock: Child node is not wrapped');
				if (ensNameWrapper.getApproved(uint256(node)) != OPEN_RENEWAL_MANAGER) {
					ensNameWrapper.approve(OPEN_RENEWAL_MANAGER, uint256(node));
				}
			}
		}
		bytes32 finalChildNode = nodePathToChild[finalChildIndex];
		// set content hash and address
		if (contenthash.length != 0) { ensPublicResolver.setContenthash(finalChildNode, contenthash); }
		if (resolutionAddress != address(0x0)) { ensPublicResolver.setAddr(finalChildNode, resolutionAddress); }

		if (finalChildIndex == 0) { // the second level domain is made immutable
			(, uint32 finalChildFuses,) = ensNameWrapper.getData(uint256(finalChildNode));
			if (finalChildFuses & ONLY_CHILD_FUSES != ONLY_CHILD_FUSES) {
				ensNameWrapper.setFuses(nodePathToChild[0], ONLY_CHILD_FUSES);
			}
		} else {
			(, uint32 topParentFuses,) = ensNameWrapper.getData(uint256(nodePathToChild[0]));
			if (topParentFuses & TOP_PARENT_FUSES_TO_BURN != TOP_PARENT_FUSES_TO_BURN) {
				ensNameWrapper.setFuses(nodePathToChild[0], TOP_PARENT_FUSES_TO_BURN);
			}
			// rest of the parents
			uint256 nParents = pathLength - 1;
			for (uint256 i = 1; i < nParents; i++) {
				(, uint32 parentFuses,) = ensNameWrapper.getData(uint256(nodePathToChild[i]));
				if (parentFuses & PARENT_FUSES_TO_BURN != PARENT_FUSES_TO_BURN) {
					ensNameWrapper.setChildFuses(nodePathToChild[i - 1], keccak256(abi.encodePacked(labelPathToChild[i])), PARENT_FUSES_TO_BURN, MAX_UINT64);
				}
			}

			// burn the final child fuses
			(, uint32 finalChildFuses,) = ensNameWrapper.getData(uint256(finalChildNode));
			if (finalChildFuses & FINAL_CHILD_FUSES_TO_BURN != FINAL_CHILD_FUSES_TO_BURN) {
				ensNameWrapper.setChildFuses(nodePathToChild[finalChildIndex - 1], keccak256(abi.encodePacked(labelPathToChild[finalChildIndex])), FINAL_CHILD_FUSES_TO_BURN, MAX_UINT64);
			}
		}

		// move the final child to renewal manager, so it can be renewed by anyone (otherwise its technically burned)
		ensNameWrapper.safeTransferFrom(address(this), OPEN_RENEWAL_MANAGER, uint256(finalChildNode), 1, bytes(''));

		// return all tokens that we own in the path
		for (uint256 i = 0; i < pathLength; i++) {
			(address owner,,) = ensNameWrapper.getData(uint256(nodePathToChild[i]));
			if (owner == address(this)) {
				ensNameWrapper.safeTransferFrom(address(this), originalOwner, uint256(nodePathToChild[i]), 1, bytes(''));
			}
		}
		emit MadeImmutable(formFullPathEnsNameString(labelPathToChild), uint256(nodePathToChild[finalChildIndex]), contenthash, resolutionAddress);
	}

	// allow only minting wraped ENS names here (required as we are minting them here)
	function onERC1155Received(address operator, address from, uint256, uint256, bytes memory) external view returns (bytes4) {
		require(from == address(0x0) && operator == address(this) && msg.sender == ENS_NAME_WRAPPER, 'PetalLock: Do not send tokens to PetalLock');
		return this.onERC1155Received.selector;
	}

	// when receiving wrapped ens names, make the last child immutable
	function onERC1155BatchReceived(address, address from, uint256[] memory ids, uint256[] memory, bytes memory data) external returns (bytes4) {
		require(msg.sender == ENS_NAME_WRAPPER, 'PetalLock: Only Wrapped ENS names are supported');
		(string[] memory labelPathToChild, bytes memory contenthash, address resolutionAddress) = abi.decode(data, (string[], bytes, address));
		makeImmutable(from, labelPathToChild, ids, contenthash, resolutionAddress);
		return this.onERC1155BatchReceived.selector;
	}

	// only ensRegistrarController should send eth to us (refund for renewals)
	receive() external payable {
		require(msg.sender == ENS_ETH_REGISTRAR_CONTROLLER, 'PetalLock: do not send ETH to PetalLock');
	}
}
