import { createPublicClient, createWalletClient, custom, encodeAbiParameters, getAddress, getContractAddress, http, isAddress, labelhash, namehash, numberToBytes, publicActions, ReadContractErrorType } from 'viem'
import { mainnet } from 'viem/chains'
import { ENS_WRAPPER_ABI } from '../abi/ens_wrapper_abi.js'
import 'viem/window'
import { ENS_REGISTRY_ABI } from '../abi/ens_registry_abi.js'
import { bigIntToNumber, splitDomainToSubDomainAndParent, splitEnsStringToSubdomainPath } from './utilities.js'
import { ENS_PUBLIC_RESOLVER_ABI } from '../abi/ens_public_resolver_abi.js'
import { CAN_DO_EVERYTHING, ENS_ETH_REGISTRAR_CONTROLLER, ENS_ETHEREUM_NAME_SERVICE, ENS_FLAGS, ENS_PUBLIC_RESOLVER, ENS_REGISTRY_WITH_FALLBACK, ENS_TOKEN_WRAPPER, FINAL_CHILD_FUSES, MID_PARENT_FUSES, SINGLE_DOMAIN_FUSES, TOP_PARENT_FUSES } from './constants.js'
import { AccountAddress, DomainInfo, EnsFuseName } from '../types/types.js'
import { ENS_ETHEREUM_NAME_SERVICE_ABI } from '../abi/ens_ethereum_name_service_abi.js'
import { tryEncodeContentHash } from './contenthash.js'
import { petalLockContractArtifact } from '../VendoredPetalLock.js'
import { PETAL_LOCK_ABI } from '../abi/petal_lock_abi.js'
import { ENS_REGISTRAR_CONTROLLER_ABI } from '../abi/ens_registrar_controller_abi.js'

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

const createReadClient = (accountAddress: AccountAddress | undefined) => {
	if (window.ethereum === undefined || accountAddress === undefined) {
		return createPublicClient({ chain: mainnet, transport: http('https://geth.dark.florist', { batch: { wait: 100 } }) })
	}
	return createWalletClient({ chain: mainnet, transport: custom(window.ethereum) }).extend(publicActions)
}

const createWriteClient = (accountAddress: AccountAddress) => {
	if (window.ethereum === undefined) throw new Error('no window.ethereum injected')
	if (accountAddress === undefined) throw new Error('no accountAddress!')
	return createWalletClient({ account: accountAddress, chain: mainnet, transport: custom(window.ethereum) }).extend(publicActions)
}

export const getChainId = async (accountAddress: AccountAddress) => {
	return await createWriteClient(accountAddress).getChainId()
}

const getDomainInfo = async (accountAddress: AccountAddress | undefined, nameHash: `0x${ string }`, label: string, parentDomain: string, token: `0x${ string }`, subDomain: string): Promise<DomainInfo> => {
	const client = createReadClient(accountAddress)
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

	const resolutionAddressPromise = client.readContract({
		address: ENS_PUBLIC_RESOLVER,
		abi: ENS_PUBLIC_RESOLVER_ABI,
		functionName: 'addr',
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

	const approvedPromise = client.readContract({
		address: ENS_TOKEN_WRAPPER,
		abi: ENS_WRAPPER_ABI,
		functionName: 'getApproved',
		args: [BigInt(nameHash)]
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
		expiry: new Date(bigIntToNumber(data[2]) * 1000),
		label,
		registered: await registeredPromise,
		contentHash: await contentHashPromise,
		manager: await managerPromise,
		subDomain,
		resolutionAddress: await resolutionAddressPromise,
		approved: await approvedPromise,
		parentDomain,
	}
}

export const getDomainInfos = async (accountAddress: AccountAddress | undefined, name: string): Promise<DomainInfo[]> => {
	const subDomainPath = splitEnsStringToSubdomainPath(name)
	return await Promise.all(subDomainPath.map((subDomain) => {
		const [label, parentDomain] = splitDomainToSubDomainAndParent(subDomain)
		if (label === undefined) throw new Error('undefined label')
		const nameHash = namehash(subDomain)
		const token = labelhash(subDomain.slice(0, subDomain.indexOf('.')))
		return getDomainInfo(accountAddress, nameHash, label, parentDomain, token, subDomain)
	}))
}

export const getRequiredFusesWithoutApproval = (domainIndex: number, domainInfos: readonly DomainInfo[]) => {
	return getRequiredFusesWithApproval(domainIndex, domainInfos).filter((fuse) => fuse !== 'Cannot Approve' && fuse !== 'Can Extend Expiry')
}

export const getRequiredFusesWithApproval = (domainIndex: number, domainInfos: readonly DomainInfo[]) => {
	console.log('getRequiredFusesWithApproval')
	console.log(domainInfos)
	if (domainInfos.length === 1) return SINGLE_DOMAIN_FUSES
	if (domainIndex === 0 && domainInfos.length > 1) return TOP_PARENT_FUSES
	if (domainIndex === domainInfos.length - 1) return FINAL_CHILD_FUSES
	return MID_PARENT_FUSES
}

export const areRequiredFusesBurntWithoutApproval = (domainIndex: number, domainInfos: readonly DomainInfo[]) => {
	const domainInfo = domainInfos[domainIndex]
	if (domainInfo === undefined) throw new Error('wrong index')
	if (!domainInfo.isWrapped) return false
	const requiredFuses = getRequiredFusesWithoutApproval(domainIndex, domainInfos)
	for (const requiredFuse of requiredFuses) {
		if (!domainInfo.fuses.includes(requiredFuse)) return false
	}
	return true
}

export const isValidEnsSubDomain = (subdomain: string): boolean => {
	// Regex to validate the ENS subdomain with infinite subdomains support
	const ensRegex = /^(?!-)([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(?<!-)\.eth$/
	return ensRegex.test(subdomain)
}

export const isChildOwnershipOwnedByOpenRenewManager = (childInfo: DomainInfo) => {
	return BigInt(getOpenRenewalManagerAddress()) === BigInt(childInfo.owner) && childInfo.isWrapped
}

export const isChildOwnershipGivenAway = (childInfo: DomainInfo) => {
	const owner = BigInt(childInfo.owner)
	const renewalManager = BigInt(getOpenRenewalManagerAddress())
	const burnAddresses = [
		0x0000000000000000000000000000000000000000n,
		0x000000000000000000000000000000000000deadn,
		0xdead000000000000000000000000000000000000n,
		0xdeaDDeADDEaDdeaDdEAddEADDEAdDeadDEADDEaDn
	]
	return (renewalManager === owner || burnAddresses.includes(owner)) && childInfo.isWrapped
}

export const proxyDeployerAddress = `0x7a0d94f55792c434d74a40883c6ed8545e406d12`

export async function ensureProxyDeployerDeployed(accountAddress: AccountAddress): Promise<void> {
	const wallet = createWriteClient(accountAddress)
	const deployerBytecode = await wallet.getCode({ address: proxyDeployerAddress })
	if (deployerBytecode === '0x60003681823780368234f58015156014578182fd5b80825250506014600cf3') return
	const ethSendHash = await wallet.sendTransaction({ to: '0x4c8d290a1b368ac4728d83a9e8321fc3af2b39b1', amount: 10000000000000000n })
	await wallet.waitForTransactionReceipt({ hash: ethSendHash })
	const deployHash = await wallet.sendRawTransaction({ serializedTransaction: '0xf87e8085174876e800830186a08080ad601f80600e600039806000f350fe60003681823780368234f58015156014578182fd5b80825250506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222' })
	await wallet.waitForTransactionReceipt({ hash: deployHash })
}

export function getPetalLockAddress() {
	const bytecode: `0x${ string }` = `0x${ petalLockContractArtifact.contracts['PetalLock.sol'].PetalLock.evm.bytecode.object }`
	return getContractAddress({ bytecode, from: proxyDeployerAddress, opcode: 'CREATE2', salt: numberToBytes(0) })
}

export function getOpenRenewalManagerAddress() {
	const bytecode: `0x${ string }` = `0x${ petalLockContractArtifact.contracts['OpenRenewalManager.sol'].OpenRenewalManager.evm.bytecode.object }`
	return getContractAddress({ bytecode, from: proxyDeployerAddress, opcode: 'CREATE2', salt: numberToBytes(0) })
}

const isOpenRenewalManagerDeployed = async (accountAddress: AccountAddress | undefined) => {
	const wallet = createReadClient(accountAddress)
	const expectedDeployedBytecode: `0x${ string }` = `0x${ petalLockContractArtifact.contracts['OpenRenewalManager.sol'].OpenRenewalManager.evm.deployedBytecode.object }`
	const address = getOpenRenewalManagerAddress()
	const deployedBytecode = await wallet.getCode({ address })
	return deployedBytecode === expectedDeployedBytecode
}

const isPetalLockDeployed = async (accountAddress: AccountAddress | undefined) => {
	const wallet = createReadClient(accountAddress)
	const expectedDeployedBytecode: `0x${ string }` = `0x${ petalLockContractArtifact.contracts['PetalLock.sol'].PetalLock.evm.deployedBytecode.object }`
	const address = getPetalLockAddress()
	const deployedBytecode = await wallet.getCode({ address })
	return deployedBytecode === expectedDeployedBytecode
}

export const isPetalLockAndOpenRenewalManagerDeployed = async (accountAddress: AccountAddress | undefined) => {
	return await isOpenRenewalManagerDeployed(accountAddress) && await isPetalLockDeployed(accountAddress)
}

export const deployPetalLockTransaction = () => {
	const bytecode: `0x${ string }` = `0x${ petalLockContractArtifact.contracts['PetalLock.sol'].PetalLock.evm.bytecode.object }`
	return { to: proxyDeployerAddress, data: bytecode } as const
}

export const deployOpenRenewalManagerTransaction = () => {
	const bytecode: `0x${ string }` = `0x${ petalLockContractArtifact.contracts['OpenRenewalManager.sol'].OpenRenewalManager.evm.bytecode.object }`
	return { to: proxyDeployerAddress, data: bytecode } as const
}

export const deployPetalLockAndRenewalManager = async (accountAddress: AccountAddress) => {
	const openRenewalManagerDeployed = await isOpenRenewalManagerDeployed(accountAddress)
	const petalLockDeployed = await isPetalLockDeployed(accountAddress)
	if (openRenewalManagerDeployed && petalLockDeployed) throw new Error('already deployed')
	await ensureProxyDeployerDeployed(accountAddress)
	const client = createWriteClient(accountAddress)
	if (!openRenewalManagerDeployed) {
		const hash = await client.sendTransaction(deployOpenRenewalManagerTransaction())
		await client.waitForTransactionReceipt({ hash })
	}
	if (!petalLockDeployed) {
		const hash = await client.sendTransaction(deployPetalLockTransaction())
		await client.waitForTransactionReceipt({ hash })
	}
}

export const getPetalLockUseTransaction = (petalLockAddress: AccountAddress, accountAddress: AccountAddress, subdomainRouteNames: string[], ownedTokens: bigint[], contentHash: string, resolutionAddress: string) => {
	const labels = subdomainRouteNames.map((p) => {
		const [label] = p.split('.')
		if (label === undefined) throw new Error('Not a valid ENS sub domain')
		return label
	})
	const subdomainRouteNodes = subdomainRouteNames.map((pathPart) => namehash(pathPart))
	const encodedContentHash = contentHash === '' ? '0x' : tryEncodeContentHash(contentHash)
	if (encodedContentHash === undefined) throw new Error('Unable to decode content hash')
	if (resolutionAddress.length > 0 && !isAddress(resolutionAddress, { strict: true })) throw new Error('Resolution address is not valid')
	const decodedResolutionAddress = resolutionAddress === '' ? '0x0000000000000000000000000000000000000000' : getAddress(resolutionAddress)

	if (subdomainRouteNodes[0] === undefined) throw new Error('Not a valid ENS sub domain')

	const subDomainLabelNode = [
		{ name: 'label', type: 'string' },
		{ name: 'node', type: 'bytes32' }
	] as const

	const pathToChild: { label: string, node: `0x${ string }` }[] = []
	for (let i = 0; i < labels.length; i++) {
		const labelAtIndex = labels[i]
		const nodeAtIndex = subdomainRouteNodes[i]
		if (labelAtIndex === undefined) throw new Error('missing label at index')
		if (nodeAtIndex === undefined) throw new Error('missing node at index')
		pathToChild.push({ label: labelAtIndex, node: nodeAtIndex })
	}

	const data = encodeAbiParameters([
		{ name: 'pathToChild', components: subDomainLabelNode, type: 'tuple[]' },
		{ name: 'contenthash', type: 'bytes' },
		{ name: 'resolutionAddress', type: 'address' },
	], [pathToChild, encodedContentHash, decodedResolutionAddress])
	return {
		chain: mainnet,
		account: accountAddress,
		address: ENS_TOKEN_WRAPPER,
		abi: ENS_WRAPPER_ABI,
		functionName: 'safeBatchTransferFrom',
		args: [accountAddress, petalLockAddress, ownedTokens, ownedTokens.map(() => 1n), data]
	} as const
}

export const callPetalLock = async (accountAddress: AccountAddress, domainInfos: DomainInfo[], contentHash: string, resolutionAddress: string) => {
	const client = createWriteClient(accountAddress)
	const petalLockAddress = getPetalLockAddress()
	const subdomainRouteNames = domainInfos.map((x) => x.subDomain)
	const ownedTokens = domainInfos.filter((info) => info.registered).map((info) => BigInt(info.nameHash))
	const write = getPetalLockUseTransaction(petalLockAddress, accountAddress, subdomainRouteNames, ownedTokens, contentHash, resolutionAddress)
	const hash = await client.writeContract(write)
	return await client.waitForTransactionReceipt({ hash })
}

export const renewDomainByYear = async (accountAddress: AccountAddress, extendYear: number, domainInfos: DomainInfo[]) => {
	const client = createWriteClient(accountAddress)
	const petalLockAddress = getPetalLockAddress()
	const extendSeconds = 365n * 24n * 60n * 60n * BigInt(extendYear)
	const domainsAndSubDomains = domainInfos.map((domain) => ({
		parentNode: namehash(domain.parentDomain),
		label: domain.label,
		domainExpiry: domain.fuses.includes('Is .eth domain') ? extendSeconds : 0n
	}))

	const totalRentCost = (await Promise.all(domainInfos.map( async (domain) =>
		domain.fuses.includes('Is .eth domain') ? await client.readContract({
			address: ENS_ETH_REGISTRAR_CONTROLLER,
			abi: ENS_REGISTRAR_CONTROLLER_ABI,
			functionName: 'rentPrice',
			args: [domain.subDomain, extendSeconds]
		}) : { base: 0n, premium: 0n }
	))).reduce((agg, current) => agg + current.base, 0n)

	const hash = await client.writeContract({
		value: totalRentCost,
		chain: mainnet,
		account: accountAddress,
		address: petalLockAddress,
		abi: PETAL_LOCK_ABI,
		functionName: 'batchExtend',
		args: [domainsAndSubDomains]
	})
	return await client.waitForTransactionReceipt({ hash })
}

export const renewDomainToMax = async (accountAddress: AccountAddress, domainInfos: DomainInfo[]) => {
	const client = createWriteClient(accountAddress)
	const petalLockAddress = getPetalLockAddress()
	const domainsAndSubDomains = domainInfos.filter((x) => !x.fuses.includes('Is .eth domain')).map((domain) => ({
		parentNode: namehash(domain.parentDomain),
		label: domain.label,
		domainExpiry: 0n
	}))

	const hash = await client.writeContract({
		chain: mainnet,
		account: accountAddress,
		address: petalLockAddress,
		abi: PETAL_LOCK_ABI,
		functionName: 'batchExtend',
		args: [domainsAndSubDomains]
	})
	return await client.waitForTransactionReceipt({ hash })
}
