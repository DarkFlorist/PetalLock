import { createPublicClient, createWalletClient, custom, encodeAbiParameters, http, keccak256, publicActions, ReadContractErrorType, toHex } from 'viem'
import { mainnet } from 'viem/chains'
import { ENS_WRAPPER_ABI } from '../abi/ens_wrapper_abi.js'
import 'viem/window'
import { ENS_REGISTRY_ABI } from '../abi/ens_registry_abi.js'
import { ENS_BASE_REGISTRY_ABI } from '../abi/ens_base_registry_implementation_abi.js'
import { assertNever, decodeEthereumNameServiceString } from './utilities.js'
import { ENS_PUBLIC_RESOLVER_ABI } from '../abi/ens_public_resolver_abi.js'
import { burnAddresses, CAN_DO_EVERYTHING, ENS_ETHEREUM_NAME_SERVICE, ENS_FLAGS, ENS_PUBLIC_RESOLVER, ENS_REGISTRY_WITH_FALLBACK, ENS_TOKEN_WRAPPER } from './constants.js'
import { AccountAddress, DomainInfo, EnsFuseName } from '../types/types.js'
import { ENS_ETHEREUM_NAME_SERVICE_ABI } from '../abi/ens_ethereum_name_service_abi.js'

export const extractENSFuses = (uint: bigint): readonly EnsFuseName[] => {
	if (uint === CAN_DO_EVERYTHING) return ['Can Do Everything']
	const result: EnsFuseName[] = []
	for (const flag of ENS_FLAGS) {
		if ((uint & flag.value) === flag.value && flag.value !== CAN_DO_EVERYTHING) {
			result.push(flag.name)
		}
	}
	return result
}

export const fuseNamesToUint = (names: readonly EnsFuseName[]): number => {
	let result = 0
	for (const name of names) {
		const flag = ENS_FLAGS.find(flag => flag.name === name)
		if (flag) {
			result |= Number(flag.value)
		}
	}
	return result
}

export const requestAccounts = async () => {
	if (window.ethereum === undefined) throw new Error('no window.ethereum injected')
	const reply = await window.ethereum.request({ method: 'eth_requestAccounts', params: undefined })
	return reply[0]
}

export const getAccounts = async () => {
	if (window.ethereum === undefined) throw new Error('no window.ethereum injected')
	const reply = await window.ethereum.request({ method: 'eth_accounts', params: undefined })
	return reply[0]
}

const createReadClient = (account: AccountAddress | undefined) => {
	if (window.ethereum === undefined || account === undefined) {
		return createPublicClient({ chain: mainnet, transport: http('https://geth.dark.florist', { batch: { wait: 100 } }) })
	}
	return createWalletClient({ chain: mainnet, transport: custom(window.ethereum) }).extend(publicActions)
}

const createWriteClient = (account: AccountAddress) => {
	if (window.ethereum === undefined) throw new Error('no window.ethereum injected')
	if (account === undefined) throw new Error('no account!')
	return createWalletClient({ account, chain: mainnet, transport: custom(window.ethereum) }).extend(publicActions)
}

export const getDomainInfo = async (account: AccountAddress | undefined, nameHash: `0x${ string }`, label: string, token: `0x${ string }`): Promise<DomainInfo> => {
	const client = createReadClient(account)
	const isWrappedPromise = client.readContract({
		address: ENS_TOKEN_WRAPPER,
		abi: ENS_WRAPPER_ABI, 
		functionName: 'isWrapped',
		args: [nameHash]
	})

	const ownerPromise = client.readContract({
		address: ENS_TOKEN_WRAPPER,
		abi: ENS_WRAPPER_ABI, 
		functionName: 'ownerOf',
		args: [BigInt(nameHash)]
	})
	
	const dataPromise = client.readContract({
		address: ENS_TOKEN_WRAPPER,
		abi: ENS_WRAPPER_ABI, 
		functionName: 'getData',
		args: [BigInt(nameHash)]
	})

	const registeredPromise = client.readContract({
		address: ENS_REGISTRY_WITH_FALLBACK,
		abi: ENS_REGISTRY_ABI, 
		functionName: 'recordExists',
		args: [nameHash]
	})

	const contentHashPromise = client.readContract({
		address: ENS_PUBLIC_RESOLVER,
		abi: ENS_PUBLIC_RESOLVER_ABI, 
		functionName: 'contenthash',
		args: [nameHash]
	})
	const getRegistryOwner = async () => {
		try {
			return await client.readContract({
				address: ENS_ETHEREUM_NAME_SERVICE,
				abi: ENS_ETHEREUM_NAME_SERVICE_ABI,
				functionName: 'ownerOf',
				args: [BigInt(token)]
			})
		} catch (e) {
			const error = e as ReadContractErrorType
			switch(error.name) {
				case 'ContractFunctionExecutionError': return `0x0000000000000000000000000000000000000000`
			}
		}
	}

	const managerPromise = client.readContract({
		address: ENS_REGISTRY_WITH_FALLBACK,
		abi: ENS_REGISTRY_ABI,
		functionName: 'owner',
		args: [nameHash]
	})

	const registeryOwnerPromise = getRegistryOwner()
	const data = await dataPromise
	return {
		nameHash,
		isWrapped: await isWrappedPromise,
		owner: await ownerPromise,
		registeryOwner: await registeryOwnerPromise,
		data,
		fuses: extractENSFuses(BigInt(data[1])),
		expiry: data[2],
		label,
		registered: await registeredPromise,
		contentHash: await contentHashPromise,
		manager: await managerPromise,
	}
}

export const parentFuseToBurn = 'Cannot Unwrap Name' as const

export const doWeNeedToBurnParentFuses = (parentInfo: DomainInfo) => {
	if (!parentInfo.isWrapped) return true
	return !parentInfo.fuses.includes(parentFuseToBurn)
}

export const burnParentFuses = async (account: AccountAddress, parentInfo: DomainInfo) => {
	if (!doWeNeedToBurnParentFuses(parentInfo)) return undefined
	const client = createWriteClient(account)
	const fusesUint = fuseNamesToUint([parentFuseToBurn])
	const hash = await client.writeContract({
		chain: mainnet, 
		account,
		address: ENS_TOKEN_WRAPPER,
		abi: ENS_WRAPPER_ABI, 
		functionName: 'setFuses',
		args: [parentInfo.nameHash, fusesUint]
	})
	return await client.waitForTransactionReceipt({ hash })
}

export const mandatoryChildFusesToBurn = ['Parent Domain Cannot Control'] as const

export const childFusesToBurn = ['Cannot Unwrap Name', 'Cannot Burn Fuses', 'Cannot Set Resolver', 'Cannot Set Time To Live', 'Cannot Create Subdomain', 'Parent Domain Cannot Control', 'Cannot Approve', 'Can Extend Expiry'] as const
export const doWeNeedToBurnChildFuses = (childInfo: DomainInfo) => {
	if (!childInfo.isWrapped) return true
	for (const requiredFuse of mandatoryChildFusesToBurn) {
		if (!childInfo.fuses.includes(requiredFuse)) return true
	}
	return false
}

export const burnChildFuses = async (account: AccountAddress, ensLabel: string, childInfo: DomainInfo, parentInfo: DomainInfo) => {
	const client = createWriteClient(account)
	const ensLabelhash = keccak256(toHex(ensLabel))
	if (doWeNeedToBurnChildFuses(childInfo)) {
		const hash = await client.writeContract({
			chain: mainnet, 
			account,
			address: ENS_TOKEN_WRAPPER,
			abi: ENS_WRAPPER_ABI, 
			functionName: 'setChildFuses',
			args: [parentInfo.nameHash, ensLabelhash, fuseNamesToUint(childFusesToBurn), parentInfo.expiry]
		})
		return await client.waitForTransactionReceipt({ hash })
	}
	return undefined
}

export const wrapDomain = async (account: AccountAddress, domainInfo: DomainInfo, subdomain: boolean) => {
	if (domainInfo.isWrapped) return undefined
	const client = createWriteClient(account)
	if (subdomain) {
		if (await client.readContract({
			account,
			address: ENS_REGISTRY_WITH_FALLBACK,
			abi: ENS_BASE_REGISTRY_ABI,
			functionName: 'isApprovedForAll',
			args: [account, ENS_TOKEN_WRAPPER]
		}) === false) {
			const requestHash1 = await client.writeContract({
				account,
				address: ENS_REGISTRY_WITH_FALLBACK,
				abi: ENS_BASE_REGISTRY_ABI,
				functionName: 'setApprovalForAll',
				args: [ENS_TOKEN_WRAPPER, true]
			})
			await client.waitForTransactionReceipt({ hash: requestHash1 })
		}
		const requestHash2 = await client.writeContract({
			account,
			address: ENS_TOKEN_WRAPPER,
			abi: ENS_WRAPPER_ABI, 
			functionName: 'wrap',
			args: [decodeEthereumNameServiceString(domainInfo.label) as `0x${ string }`, account, ENS_PUBLIC_RESOLVER]
		})
		return await client.waitForTransactionReceipt({ hash: requestHash2 })
	}

	const ensSubDomain = domainInfo.label
	const [ensLabel] = ensSubDomain.split('.')
	if (ensLabel === undefined) throw new Error('undefined sub')
	const ensLabelhash = keccak256(toHex(ensLabel))
	const encodedData = encodeAbiParameters(
		[
			{ name: 'label', type: 'string' },
			{ name: 'owner', type: 'address' },
			{ name: 'ownerControlledFuses', type: 'uint16' },
			{ name: 'resolver', type: 'address' },
		],
		[ensLabel, account, 0, ENS_PUBLIC_RESOLVER]
	)
	const requestHash2 = await client.writeContract({
		account,
		address: ENS_ETHEREUM_NAME_SERVICE,
		abi: ENS_BASE_REGISTRY_ABI, 
		functionName: 'safeTransferFrom',
		args: [account, ENS_TOKEN_WRAPPER, BigInt(ensLabelhash), encodedData]
	})
	return await client.waitForTransactionReceipt({ hash: requestHash2 })
}

export const isValidEnsSubDomain = (subdomain: string): boolean => {
	// Regex to validate the ENS subdomain
	const ensRegex = /^(?!-)[a-zA-Z0-9-]+(?<!-)\.([a-zA-Z0-9-]+\.)?eth$/
	return ensRegex.test(subdomain)
}

export const isChildOwnershipBurned = (childInfo: DomainInfo) => {
	return burnAddresses.map((b) => BigInt(b)).includes(BigInt(childInfo.owner)) && childInfo.isWrapped
}

export const transferChildOwnershipAway = async (account: AccountAddress, childInfo: DomainInfo) => {
	if (isChildOwnershipBurned(childInfo)) return undefined
	const client = createWriteClient(account)
	const hash = await client.writeContract({
		chain: mainnet,
		account,
		address: ENS_TOKEN_WRAPPER,
		abi: ENS_WRAPPER_ABI, 
		functionName: 'safeTransferFrom',
		args: [childInfo.owner, burnAddresses[0], BigInt(childInfo.nameHash), 1n, '0x0']
	})
	return await client.waitForTransactionReceipt({ hash })
}

export const createSubDomain = async (account: AccountAddress, childInfo: DomainInfo, parentInfo: DomainInfo) => {
	if (childInfo.registered) return undefined
	const client = createWriteClient(account)
	if (parentInfo.isWrapped) {
		const [subDomainName] = childInfo.label.split('.')
		if (subDomainName === undefined) throw new Error('subdomain missing')
		const hash = await client.writeContract({
			chain: mainnet,
			account,
			address: ENS_TOKEN_WRAPPER,
			abi: ENS_WRAPPER_ABI, 
			functionName: 'setSubnodeRecord',
			args: [parentInfo.nameHash, subDomainName, parentInfo.owner, ENS_PUBLIC_RESOLVER, 0n, fuseNamesToUint(childFusesToBurn), parentInfo.expiry]
		})
		return await client.waitForTransactionReceipt({ hash })
	}
	else {
		const hash = await client.writeContract({
			chain: mainnet,
			account,
			address: ENS_REGISTRY_WITH_FALLBACK,
			abi: ENS_REGISTRY_ABI, 
			functionName: 'setSubnodeRecord',
			args: [parentInfo.nameHash, childInfo.nameHash, account, ENS_PUBLIC_RESOLVER, 0n]
		})
		return await client.waitForTransactionReceipt({ hash })
	}
}

export const setContentHash = async (account: AccountAddress, node: DomainInfo, contenthash: `0x${ string }`) => {
	const client = createWriteClient(account)
	const hash = await client.writeContract({
		chain: mainnet,
		account,
		address: ENS_PUBLIC_RESOLVER,
		abi: ENS_PUBLIC_RESOLVER_ABI, 
		functionName: 'setContenthash',
		args: [node.nameHash, contenthash]
	})
	return await client.waitForTransactionReceipt({ hash })
}

export const getRightSigningAddress = (transaction: 'setContentHash' | 'wrapParent' | 'wrapChild' | 'parentFuses' | 'childFuses' | 'subDomainOwnership' | 'createChild', childInfo: DomainInfo, parentInfo: DomainInfo) => {
	switch(transaction) {
		case 'setContentHash': return childInfo.owner
		case 'createChild': return parentInfo.isWrapped ? parentInfo.owner : parentInfo.registeryOwner
		case 'wrapChild': return childInfo.manager
		case 'wrapParent': return parentInfo.registeryOwner
		case 'parentFuses': return parentInfo.owner
		case 'childFuses': return parentInfo.owner
		case 'subDomainOwnership': return childInfo.owner
		default: assertNever(transaction)
	}
}
