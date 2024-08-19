// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// ens contracts
address constant ENS_PUBLIC_RESOLVER = 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63;
address constant ENS_TOKEN_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401;
address constant ENS_ETH_REGISTRAR_CONTROLLER = 0x253553366Da8546fC250F225fe3d25d0C782303b;
address constant ENS_ETHEREUM_NAME_SERVICE = 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85;
address constant ENS_PUBLIC_RESOLVER_2 = 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41;
address constant ENS_REGISTRY_WITH_FALLBACK = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;
address constant ENS_REVERSE_REGISTRAR = 0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb;

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
interface IENS_REGISTRY_WITH_FALLBACK {
	function recordExists(bytes32 node) external view returns (bool);
}

interface IENS_TOKEN_WRAPPER {
	function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes memory _data) external;
	function setSubnodeRecord(bytes32 parentNode, string memory label, address owner, address resolver, uint64 ttl, uint32 fuses, uint64 expiry) external returns(bytes32 node);
	function getData(uint256 id) external view returns (address, uint32, uint64);
	function setChildFuses(bytes32 parentNode, bytes32 labelhash, uint32 fuses, uint64 expiry) external;
	function isWrapped(bytes32 node) external view returns (bool);
	function setFuses(bytes32 node, uint16 fuses) external returns (uint32);
}

interface IENS_PUBLIC_RESOLVER {
	function setContenthash(bytes32 node, bytes calldata hash) external;
}

interface IENS_ETHEREUM_NAME_SERVICE {
	function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) external;
}

IENS_REGISTRY_WITH_FALLBACK constant ens_registry = IENS_REGISTRY_WITH_FALLBACK(ENS_REGISTRY_WITH_FALLBACK);
IENS_TOKEN_WRAPPER constant ens_token_wrapper = IENS_TOKEN_WRAPPER(ENS_TOKEN_WRAPPER);
IENS_ETHEREUM_NAME_SERVICE constant ens_ethereum_name_service = IENS_ETHEREUM_NAME_SERVICE(ENS_ETHEREUM_NAME_SERVICE);
IENS_PUBLIC_RESOLVER constant ens_public_resolver = IENS_PUBLIC_RESOLVER(ENS_PUBLIC_RESOLVER);

uint32 constant parentFusesToBurn = CANNOT_UNWRAP + PARENT_CANNOT_CONTROL;
uint32 constant childFusesToBurn = CANNOT_UNWRAP + CANNOT_BURN_FUSES + CANNOT_SET_RESOLVER + CANNOT_SET_TTL + CANNOT_CREATE_SUBDOMAIN + PARENT_CANNOT_CONTROL + CANNOT_APPROVE + CAN_EXTEND_EXPIRY;
uint32 constant mandatoryChildFusesToBurn = PARENT_CANNOT_CONTROL;
address constant burnAddress = 0xdeaDDeADDEaDdeaDdEAddEADDEAdDeadDEADDEaD;

contract PetalLock {
	function makeImmutable(address originalOwner, string[] memory labels, bytes32[] memory subdomainRouteNodes, bytes32[] memory labelHashes, bytes memory contenthash) private {
		require(labelHashes.length == subdomainRouteNodes.length, 'input array length mismatch');
		require(labelHashes.length == labels.length, 'input array length mismatch');
		uint256 finalChildIndex = subdomainRouteNodes.length - 1;

		// handle parents
		for (uint256 i = 0; i < labels.length; i++) {
			bytes32 node = subdomainRouteNodes[i];
			// 1) check that exists
			if (!ens_registry.recordExists(node)) {
				require(i > 0, 'first record need to exist');
				(,, uint64 parentExpiry) = ens_token_wrapper.getData(uint256(subdomainRouteNodes[i - 1]));
				bytes32 parentNameHash = subdomainRouteNodes[i - 1];
				if (i == finalChildIndex) {
					ens_token_wrapper.setSubnodeRecord(parentNameHash, labels[i], address(this), ENS_PUBLIC_RESOLVER, 0, 0, parentExpiry);
				} else {
					ens_token_wrapper.setSubnodeRecord(parentNameHash, labels[i], address(this), ENS_PUBLIC_RESOLVER, 0, parentFusesToBurn, parentExpiry);
				}
			} else {
				// 2) check that is wrapped
				require(ens_token_wrapper.isWrapped(node), 'node not wrapped');
				// 3) check that 'Cannot Unwrap Name' is burned
				(, uint32 newFuses,) = ens_token_wrapper.getData(uint256(subdomainRouteNodes[i]));
				if (i == finalChildIndex) {
					continue;
				} else {
					if (i == 0) {
						if (newFuses & CANNOT_UNWRAP != CANNOT_UNWRAP) {
							ens_token_wrapper.setFuses(subdomainRouteNodes[i], CANNOT_UNWRAP);
						}
					} else {
						if (newFuses & parentFusesToBurn != parentFusesToBurn) {
							(,, uint64 newParentExpiry) = ens_token_wrapper.getData(uint256(subdomainRouteNodes[i - 1]));
							ens_token_wrapper.setChildFuses(subdomainRouteNodes[i - 1], labelHashes[i], parentFusesToBurn, newParentExpiry);
						}
					}
				}
			}
		}
		
		ens_public_resolver.setContenthash(subdomainRouteNodes[finalChildIndex], contenthash);
		(,, uint64 newParentExpiry2) = ens_token_wrapper.getData(uint256(subdomainRouteNodes[finalChildIndex - 1]));
		ens_token_wrapper.setChildFuses(subdomainRouteNodes[finalChildIndex - 1], labelHashes[finalChildIndex], childFusesToBurn, newParentExpiry2);
		
		// burn child owner
		ens_token_wrapper.safeTransferFrom(address(this), burnAddress, uint256(subdomainRouteNodes[finalChildIndex]), 1, bytes(''));
		
		//return tokens to the owner
		for (uint256 i = 0; i < labels.length - 1; i++) {
			ens_token_wrapper.safeTransferFrom(address(this), originalOwner, uint256(subdomainRouteNodes[i]), 1, bytes(''));
		}
	}
	
	function onERC1155Received(address, address from, uint256, uint256, bytes memory data) public virtual returns (bytes4) {
		// Can we somehow prevent anyone sending to this contract by accident?
		// currently we need to mint to ourself and this need to return the selector
		return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address from, uint256[] memory, uint256[] memory, bytes memory data) public virtual returns (bytes4) {
		(string[] memory labels, bytes32[] memory subdomainRouteNodes, bytes32[] memory labelHashes, bytes memory contenthash) = abi.decode(data, (string[], bytes32[], bytes32[], bytes));
		makeImmutable(from, labels, subdomainRouteNodes, labelHashes, contenthash);
	    return this.onERC1155BatchReceived.selector;
    }
}
