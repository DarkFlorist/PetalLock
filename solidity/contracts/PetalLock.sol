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
}

interface IENS_PUBLIC_RESOLVER {
	function setContenthash(bytes32 node, bytes memory hash) external;
}

interface IENS_ETHEREUM_NAME_SERVICE {
	function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) external;
}

IENS_REGISTRY_WITH_FALLBACK constant ens_registry = IENS_REGISTRY_WITH_FALLBACK(ENS_REGISTRY_WITH_FALLBACK);
IENS_TOKEN_WRAPPER constant ens_token_wrapper = IENS_TOKEN_WRAPPER(ENS_TOKEN_WRAPPER);
IENS_ETHEREUM_NAME_SERVICE constant ens_ethereum_name_service = IENS_ETHEREUM_NAME_SERVICE(ENS_ETHEREUM_NAME_SERVICE);
IENS_PUBLIC_RESOLVER constant ens_public_resolver = IENS_PUBLIC_RESOLVER(ENS_PUBLIC_RESOLVER);

uint32 constant parentFusesToBurn = CANNOT_UNWRAP;
uint32 constant childFusesToBurn = CANNOT_UNWRAP + CANNOT_BURN_FUSES + CANNOT_SET_RESOLVER + CANNOT_SET_TTL + CANNOT_CREATE_SUBDOMAIN + PARENT_CANNOT_CONTROL + CANNOT_APPROVE + CAN_EXTEND_EXPIRY;
uint32 constant mandatoryChildFusesToBurn = PARENT_CANNOT_CONTROL;
address constant burnAddress = 0xdeaDDeADDEaDdeaDdEAddEADDEAdDeadDEADDEaD;

// todo, access controls
contract PetalLock {
	// subdomainRoute = ['darkflorist.eth', 'killari.darkflorist.eth', '3.killari.darkflorist.eth']
	function makeImmutable(string[] memory subdomainRouteNames, string[] memory labels, bytes32[] memory subdomainRouteNodes, bytes32[] memory labelHashes, address[] memory owners, bytes memory contenthash) public {
		require(subdomainRouteNames.length > 1, 'need to have atleast parent and subdomain');
		require(labelHashes.length == subdomainRouteNodes.length, 'input array length mismatch');
		require(owners.length == subdomainRouteNodes.length, 'input array length mismatch');
		require(labelHashes.length == labels.length, 'input array length mismatch');
		
		uint256 finalChildIndex = subdomainRouteNodes.length - 1;

		// handle parents
		for (uint256 i = 0; i < subdomainRouteNames.length; i++) {
			bytes32 node = subdomainRouteNodes[i];
			// 1) check that exists
			if (!ens_registry.recordExists(node)) {
				require(i > 0, 'first record need to exist');
				// create
				(,, uint64 parentExpiry) = ens_token_wrapper.getData(uint256(subdomainRouteNodes[i]));
				bytes32 parentNameHash = subdomainRouteNodes[i - 1];
				string memory subDomainName = subdomainRouteNames[i];
				address parentOwner = owners[i - 1];
				if (i == finalChildIndex) {
					ens_token_wrapper.setSubnodeRecord(parentNameHash, subDomainName, parentOwner, ENS_PUBLIC_RESOLVER, 0, childFusesToBurn, parentExpiry);
				} else {
					ens_token_wrapper.setSubnodeRecord(parentNameHash, subDomainName, parentOwner, ENS_PUBLIC_RESOLVER, 0, parentFusesToBurn, parentExpiry);
				}
			}

			// 2) check that is wrapped
			if (!ens_token_wrapper.isWrapped(node)) {
				address parentOwner = owners[i - 1];
				bytes32 labelhash = labelHashes[i];
				bytes memory encodedData = abi.encode(labels[i], owners[i], 0, ENS_PUBLIC_RESOLVER);
				ens_ethereum_name_service.safeTransferFrom(parentOwner, ENS_TOKEN_WRAPPER, uint256(labelhash), encodedData);
			}

			// 3) check that 'Cannot Unwrap Name' is burned
			bytes32 nameHash = subdomainRouteNodes[i];
			(, uint32 newFuses, uint64 newParentExpiry)= ens_token_wrapper.getData(uint256(nameHash));
			if (i == finalChildIndex) {
				if (newFuses & mandatoryChildFusesToBurn == mandatoryChildFusesToBurn) {
					ens_token_wrapper.setChildFuses(subdomainRouteNodes[i - 1], labelHashes[i], childFusesToBurn, newParentExpiry);
				}
			} else {
				if (newFuses & parentFusesToBurn == parentFusesToBurn) {
					ens_token_wrapper.setChildFuses(subdomainRouteNodes[i - 1], labelHashes[i], parentFusesToBurn, newParentExpiry);
				}
			}
		}
		ens_public_resolver.setContenthash(subdomainRouteNodes[finalChildIndex], contenthash);
		
		// burn child owner
		ens_token_wrapper.safeTransferFrom(owners[finalChildIndex], burnAddress, uint256(subdomainRouteNodes[finalChildIndex]), 1, bytes(''));
	}
}
