// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// ens contracts
address constant ENS_PUBLIC_RESOLVER = 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63
address constant ENS_TOKEN_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401
address constant ENS_ETH_REGISTRAR_CONTROLLER = 0x253553366Da8546fC250F225fe3d25d0C782303b
address constant ENS_ETHEREUM_NAME_SERVICE = 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85
address constant ENS_PUBLIC_RESOLVER_2 = 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
address constant ENS_REGISTRY_WITH_FALLBACK = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
address constant ENS_REVERSE_REGISTRAR = 0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb

// ENS Fuses
uint256 constant CANNOT_UNWRAP = 1
uint256 constant CANNOT_BURN_FUSES = 2n
uint256 constant CANNOT_TRANSFER = 4n
uint256 constant CANNOT_SET_RESOLVER = 8n
uint256 constant CANNOT_SET_TTL = 16n
uint256 constant CANNOT_CREATE_SUBDOMAIN = 32n
uint256 constant CANNOT_APPROVE = 64n
uint256 constant PARENT_CANNOT_CONTROL = 1n << 16n
uint256 constant IS_DOT_ETH = 1n << 17n
uint256 constant CAN_EXTEND_EXPIRY = 1n << 18n
uint256 constant CAN_DO_EVERYTHING = 0n

// interfaces
interface IENS_REGISTRY_WITH_FALLBACK {
	function recordExists(bytes32 node) external view returns (boolean);
	function isWrapped(bytes32 node) external view returns (boolean);
}
interface IENS_TOKEN_WRAPPER {
	function setSubnodeRecord(bytes32 parentNode, string label, address owner, address resolver, uint64 ttl, uint32 fuses, uint64 expiry) public returns(bytes32 node);
	function getData(uint256 id) public returns([address owner, uint32 fuses, uint64 expiry]);

}
interface IENS_ETHEREUM_NAME_SERVICE {
	function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data) external returns ();
}

IENS_REGISTRY_WITH_FALLBACK constant ens_registry = IENS_REGISTRY_WITH_FALLBACK(ENS_REGISTRY_WITH_FALLBACK);
IENS_TOKEN_WRAPPER constant ens_token_wrapper = IENS_TOKEN_WRAPPER(ENS_TOKEN_WRAPPER);
IENS_ETHEREUM_NAME_SERVICE constant ens_ethereum_name_service = IENS_ETHEREUM_NAME_SERVICE(ENS_ETHEREUM_NAME_SERVICE);

uint256 const parentFusesToBurn = CANNOT_UNWRAP;
uint256 const childFusesToBurn = CANNOT_UNWRAP + CANNOT_BURN_FUSES + CANNOT_SET_RESOLVER + CANNOT_SET_TTL + CANNOT_CREATE_SUBDOMAIN + PARENT_CANNOT_CONTROL + CANNOT_APPROVE + CAN_EXTEND_EXPIRY;

contract PetalLock {
	constructor() {}

	// subdomainRoute = ['darkflorist.eth', 'killari.darkflorist.eth', '3.killari.darkflorist.eth']
	function makeImmutable(string[] memory subdomainRoute) public {
		//console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);
		require(subdomainRoute.length > 1, 'need to have atleast parent and subdomain')

		// handle parents
		for (uint i = 0; i < subdomainRoute.length - 1; i++) {
			const node = nodify(subdomainRoute[i])
			// 1) check that exists
			if (!ens_registry.recordExists(node)) {
				// create
				const parentNameHash = 
				const subDomainName =
				const parentOwner = 
				const parentExpiry = 
				ens_token_wrapper.setSubnodeRecord(parentNameHash, subDomainName, parentOwner, ENS_PUBLIC_RESOLVER, 0, parentFusesToBurn, parentExpiry);
			}
			// 2) check that is wrapped
			if (!ens_token_wrapper.isWrapped(node)) {
				const parentOwner = 
				const labelhash = 
				const encodedData = encodeAbiParameters(
					[
						{ name: 'label', type: 'string' },
						{ name: 'owner', type: 'address' },
						{ name: 'ownerControlledFuses', type: 'uint16' },
						{ name: 'resolver', type: 'address' },
					],
					[ensLabel, account, 0, ENS_PUBLIC_RESOLVER]
				)
				ens_ethereum_name_service.safeTransferFrom(parentOwner, ENS_TOKEN_WRAPPER, labelhash, encodedData)
			}
			// 3) check that 'Cannot Unwrap Name' is burned
			const nameHash = 
			const data = ens_token_wrapper.getData(nameHash);
			if (!(data[1] & CANNOT_UNWRAP)) {
				await client.writeContract({
						chain: mainnet, 
						account,
						address: ENS_TOKEN_WRAPPER,
						abi: ENS_WRAPPER_ABI, 
						functionName: 'setFuses',
						args: [parentInfo.nameHash, fusesUint]
					})
			}
		}

		// handle child
		string const child = subdomainRoute[subdomainRoute.length - 1]
		// 1) check that exists

		// 2) check that is wrapped

		// 3) check that fuses are burnt:
		//	'Cannot Unwrap Name',
		//	'Cannot Burn Fuses',
		//	'Cannot Set Resolver',
		//	'Cannot Set Time To Live',
		//	'Cannot Create Subdomain',
		//	'Parent Domain Cannot Control',
		//	'Cannot Approve',
		//	'Can Extend Expiry'¨

		// burn owner

		require(block.timestamp >= unlockTime, "You can't withdraw yet");
		require(msg.sender == owner, "You aren't the owner");

		emit Withdrawal(address(this).balance, block.timestamp);

		owner.transfer(address(this).balance);
	}
}
