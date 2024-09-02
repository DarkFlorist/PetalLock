import { decodeFunctionResult, encodeFunctionData, namehash, parseEther } from 'viem'
import { extractENSFuses, getPetalLockUseTransaction } from '../utils/ensUtils.js'
import { petalLockContractArtifact } from '../VendoredPetalLock.js'
import { BlockCall, EthSimulateV1Result } from './ethSimulate-types.js'
import { jsonRpcRequest } from './ethSimulate.js'
import { ENS_ETH_REGISTRAR_CONTROLLER, ENS_PUBLIC_RESOLVER, ENS_TOKEN_WRAPPER } from '../utils/constants.js'
import { ENS_WRAPPER_ABI } from '../abi/ens_wrapper_abi.js'
import { ENS_REGISTRAR_CONTROLLER_ABI } from '../abi/ens_registrar_controller_abi.js'
import { dataStringWith0xStart } from '../utils/utilities.js'
import { ENS_PUBLIC_RESOLVER_ABI } from '../abi/ens_public_resolver_abi.js'
import { decodeContentHash } from '../utils/contenthash.js'
import { addressString, allSuccess, areSetsEqual, bytesToUnsigned, removeEthSuffix, stringToUint8Array } from './test-utils.js'

const rpc = 'https://geth.dark.florist' as const

const petalLockAddress = 0x93741n

const subdomainRouteNames2 = ['darkflorist.eth', 'immutable.darkflorist.eth'] as const
const subdomainRouteNames3 = ['darkflorist.eth', 'midname.darkflorist.eth', 'immutable.midname.darkflorist.eth'] as const
const subdomainRouteNames3_another = ['darkflorist.eth', 'midname.darkflorist.eth', 'immutable2.midname.darkflorist.eth'] as const
const ownAddress = 0x6D6054F7745a3Aaf4d1E4ac5830E4ABDc328Ab6Bn
const whale = 0x000054F774000Aaf4d100000000E4ABDc328Ab6Bn
const BURN_ADDRESS = 0xdeaDDeADDEaDdeaDdEAddEADDEAdDeadDEADDEaDn
const testContentHash = 'ipfs://bafybeie7zcqhap5vopmfmacoy6xa5jxguxepeseca4iilnchvydqkivnue'

const makeImmutableDomain = (routenames: readonly string[], ownedTokens: readonly bigint[]) => { // 'darkflorist.eth', 'immutable.darkflorist.eth'
	const tx = getPetalLockUseTransaction(
		addressString(petalLockAddress),
		addressString(ownAddress),
		[...routenames],
		[...ownedTokens],
		testContentHash,
		addressString(ownAddress)
	)
	return {
		from: ownAddress,
		to: BigInt(ENS_TOKEN_WRAPPER),
		input: stringToUint8Array(encodeFunctionData(tx))
	}
}

const ethSimulateTransactions = async (rpc: string, transactions: readonly BlockCall[]): Promise<EthSimulateV1Result> => {
	return EthSimulateV1Result.parse(await jsonRpcRequest(rpc, {
		method: 'eth_simulateV1',
		params: [
			{
				blockStateCalls: [{
					calls: transactions,
					stateOverrides: {
						[addressString(petalLockAddress)]: {
							code: stringToUint8Array(`0x${ petalLockContractArtifact.contracts['PetalLock.sol'].PetalLock.evm.deployedBytecode.object }`)
						},
						[addressString(ownAddress)]: {
							balance: parseEther('200000')
						},
						[addressString(whale)]: {
							balance: parseEther('200000')
						}
					},
				}],
				traceTransfers: true,
				validation: false,
			},
			'latest'
		]
	} as const))
}

const FINAL_CHILD_FUSES = [
	'Cannot Unwrap Name',
	'Cannot Burn Fuses',
	'Cannot Set Resolver',
	'Cannot Create Subdomain',
	'Cannot Approve',
	'Parent Domain Cannot Control',
	'Can Extend Expiry'
] as const

const PARENT_FUSES = [
	'Is .eth domain',
	'Cannot Unwrap Name',
	'Parent Domain Cannot Control',
] as const

const MID_PARENT_FUSES = [
	'Cannot Unwrap Name',
	'Parent Domain Cannot Control' 
] as const

const runTests = async () => {
	const testMakeImmutable = async () => {
		const ownedTokens = [BigInt(namehash(subdomainRouteNames2[0]))] as const
		const result = await ethSimulateTransactions(rpc, [makeImmutableDomain(subdomainRouteNames2, ownedTokens)])
		if (!allSuccess(result)) throw new Error('transaction failed')
	}
	const testWeHaveTheOrignalToken = async () => {
		const ownedTokens = [BigInt(namehash(subdomainRouteNames2[0]))] as const
		const result = await ethSimulateTransactions(rpc, [
			makeImmutableDomain(subdomainRouteNames2, ownedTokens),
			{
				from: ownAddress,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'balanceOf',
					args: [addressString(ownAddress), ownedTokens[0]]
				}))
			}
		])
		if (!allSuccess(result)) throw new Error('transaction failed')
		if (result[0]?.calls[1]?.returnData === undefined) throw new Error('no return data')
		if (bytesToUnsigned(result[0]?.calls[1]?.returnData) !== 1n)  throw new Error('we lost the token')
	}
	const testThatFusesAreCorrect = async () => {
		const ownedTokens = [BigInt(namehash(subdomainRouteNames2[0]))]
		const result = await ethSimulateTransactions(rpc, [
			makeImmutableDomain(subdomainRouteNames2, ownedTokens),
			{
				from: whale,
				to: BigInt(ENS_ETH_REGISTRAR_CONTROLLER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_REGISTRAR_CONTROLLER_ABI,
					functionName: 'renew',
					args: [removeEthSuffix(subdomainRouteNames2[0]), 10n],
				})),
				value: parseEther('1')
			},
			{
				from: whale,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'getData',
					args: [BigInt(namehash(subdomainRouteNames2[0]))]
				})),
			},
			{
				from: whale,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'getData',
					args: [BigInt(namehash(subdomainRouteNames2[1]))]
				})),
			}
		])
		if (result[0]?.calls[2]?.returnData === undefined) throw new Error('no results for call 2')
		const parentData = decodeFunctionResult({ abi: ENS_WRAPPER_ABI, functionName: 'getData', data: dataStringWith0xStart(result[0]?.calls[2]?.returnData) })
		const parentFuses = new Set(extractENSFuses(BigInt(parentData[1])))
		if (!areSetsEqual(parentFuses, new Set(PARENT_FUSES))) throw new Error('not correct parent fuses')
			
		if (result[0]?.calls[3]?.returnData === undefined) throw new Error('no results for call 3')
		const childData = decodeFunctionResult({ abi: ENS_WRAPPER_ABI, functionName: 'getData', data: dataStringWith0xStart(result[0]?.calls[3]?.returnData) })
		const childFuses = new Set(extractENSFuses(BigInt(childData[1])))
		if (!areSetsEqual(childFuses, new Set(FINAL_CHILD_FUSES))) throw new Error('not correct child fuses')

		if (!allSuccess(result)) throw new Error('transaction failed')
	}
	const testNoData = async () => {
		const ownedTokens = [BigInt(namehash(subdomainRouteNames2[0]))]
		const result = await ethSimulateTransactions(rpc, [{
			from: ownAddress,
			to: BigInt(ENS_TOKEN_WRAPPER),
			input: stringToUint8Array(encodeFunctionData({
				abi: ENS_WRAPPER_ABI,
				functionName: 'safeBatchTransferFrom',
				args: [addressString(ownAddress), addressString(petalLockAddress), ownedTokens, ownedTokens.map(() => 1n), '0x']
			})),
		}])
		if (allSuccess(result)) throw new Error('transaction should have failed')
	}
	const testNoNonBatchTransfer = async () => {
		const result = await ethSimulateTransactions(rpc, [{
			from: ownAddress,
			to: BigInt(ENS_TOKEN_WRAPPER),
			input: stringToUint8Array(encodeFunctionData({
				abi: ENS_WRAPPER_ABI,
				functionName: 'safeTransferFrom',
				args: [addressString(ownAddress), addressString(petalLockAddress), BigInt(namehash(subdomainRouteNames2[0])), 1n, '0x']
			})),
		}])
		if (allSuccess(result)) throw new Error('transaction should have failed')
	}
	const testThatFusesAreCorrect3Part = async () => {
		const ownedTokens = [BigInt(namehash(subdomainRouteNames3[0]))]
		const result = await ethSimulateTransactions(rpc, [
			makeImmutableDomain(subdomainRouteNames3, ownedTokens),
			{
				from: whale,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'getData',
					args: [BigInt(namehash(subdomainRouteNames3[0]))]
				})),
			},
			{
				from: whale,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'getData',
					args: [BigInt(namehash(subdomainRouteNames3[1]))]
				})),
			},
			{
				from: whale,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'getData',
					args: [BigInt(namehash(subdomainRouteNames3[2]))]
				})),
			},
			{
				from: ownAddress,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'balanceOf',
					args: [addressString(ownAddress), BigInt(namehash(subdomainRouteNames3[0]))]
				}))
			},
			{
				from: ownAddress,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'balanceOf',
					args: [addressString(ownAddress), BigInt(namehash(subdomainRouteNames3[1]))]
				}))
			},
			{
				from: ownAddress,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'balanceOf',
					args: [addressString(ownAddress), BigInt(namehash(subdomainRouteNames3[2]))]
				}))
			},
			{
				from: ownAddress,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'balanceOf',
					args: [addressString(BURN_ADDRESS), BigInt(namehash(subdomainRouteNames3[2]))]
				}))
			}
		])
		if (!allSuccess(result)) throw new Error('transaction failed')
		if (result[0]?.calls[1]?.returnData === undefined ||
			result[0]?.calls[2]?.returnData === undefined ||
			result[0]?.calls[3]?.returnData === undefined ||
			result[0]?.calls[4]?.returnData === undefined ||
			result[0]?.calls[5]?.returnData === undefined ||
			result[0]?.calls[6]?.returnData === undefined ||
			result[0]?.calls[7]?.returnData === undefined
		) throw new Error('no call results')
		// parent 1
		const parentData1 = decodeFunctionResult({ abi: ENS_WRAPPER_ABI, functionName: 'getData', data: dataStringWith0xStart(result[0]?.calls[1]?.returnData) })
		const parentFuses1 = new Set(extractENSFuses(BigInt(parentData1[1])))
		if (!areSetsEqual(parentFuses1, new Set(PARENT_FUSES))) throw new Error('not correct parent1 fuses')
		
		// parent 2
		const parentData2 = decodeFunctionResult({ abi: ENS_WRAPPER_ABI, functionName: 'getData', data: dataStringWith0xStart(result[0]?.calls[2]?.returnData) })
		const parentFuses2 = new Set(extractENSFuses(BigInt(parentData2[1])))
		if (!areSetsEqual(parentFuses2, new Set(MID_PARENT_FUSES))) throw new Error('not correct parent2 fuses')
		
		// child
		const childData = decodeFunctionResult({ abi: ENS_WRAPPER_ABI, functionName: 'getData', data: dataStringWith0xStart(result[0]?.calls[3]?.returnData) })
		const childFuses = new Set(extractENSFuses(BigInt(childData[1])))
		if (!areSetsEqual(childFuses, new Set(FINAL_CHILD_FUSES))) throw new Error('not correct child fuses')

		// parent 1 ownership.  We should own this
		if (bytesToUnsigned(result[0]?.calls[4]?.returnData) !== 1n) throw new Error('we lost the token 1')
		
		// parent 2 ownership. We should own this
		if (bytesToUnsigned(result[0]?.calls[5]?.returnData) !== 1n) throw new Error('we lost the token 2')

		// child ownership. We should now own this
		if (bytesToUnsigned(result[0]?.calls[6]?.returnData) !== 0n) throw new Error('we didnt lose the child')
		if (bytesToUnsigned(result[0]?.calls[7]?.returnData) !== 1n) throw new Error('burn address does not have the child')
	}
	const testContentHashIsSet = async () => {
		const ownedTokens = [BigInt(namehash(subdomainRouteNames2[0]))]
		const result = await ethSimulateTransactions(rpc, [
			{
				from: whale,
				to: BigInt(ENS_PUBLIC_RESOLVER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_PUBLIC_RESOLVER_ABI,
					functionName: 'contenthash',
					args: [namehash(subdomainRouteNames2[1])],
				})),
			},
			{
				from: whale,
				to: BigInt(ENS_PUBLIC_RESOLVER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_PUBLIC_RESOLVER_ABI,
					functionName: 'addr',
					args: [namehash(subdomainRouteNames2[1])],
				})),
			},
			makeImmutableDomain(subdomainRouteNames2, ownedTokens),
			{
				from: whale,
				to: BigInt(ENS_PUBLIC_RESOLVER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_PUBLIC_RESOLVER_ABI,
					functionName: 'contenthash',
					args: [namehash(subdomainRouteNames2[1])],
				})),
			},
			{
				from: whale,
				to: BigInt(ENS_PUBLIC_RESOLVER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_PUBLIC_RESOLVER_ABI,
					functionName: 'addr',
					args: [namehash(subdomainRouteNames2[1])],
				})),
			},
		])
		if (!allSuccess(result)) throw new Error('transaction failed')
		if (result[0]?.calls[0]?.returnData === undefined ||
			result[0]?.calls[1]?.returnData === undefined || 
			result[0]?.calls[2]?.returnData === undefined || 
			result[0]?.calls[3]?.returnData === undefined || 
			result[0]?.calls[4]?.returnData === undefined
		) throw new Error('no results')
		const priorContentHash = decodeFunctionResult({ abi: ENS_PUBLIC_RESOLVER_ABI, functionName: 'contenthash', data: dataStringWith0xStart(result[0].calls[0].returnData) })
		const afterContentHash = decodeFunctionResult({ abi: ENS_PUBLIC_RESOLVER_ABI, functionName: 'contenthash', data: dataStringWith0xStart(result[0].calls[3].returnData) })
		
		if (priorContentHash === afterContentHash) throw new Error('content has was not set')
		if (decodeContentHash(afterContentHash) !== testContentHash) throw new Error('wrong content hash')
		
		const priorAddr = dataStringWith0xStart(result[0].calls[1].returnData)
		const afterAddr = dataStringWith0xStart(result[0].calls[4].returnData)
		if (BigInt(priorAddr) === BigInt(afterAddr)) throw new Error('addr was not set')
		if (BigInt(afterAddr) !== ownAddress) throw new Error('addr is not correct')
	}
	const testThatFusesAreCorrect3PartAgain = async () => {
		const ownedTokens3 = [BigInt(namehash(subdomainRouteNames3[0]))]
		const ownedTokens3_another = [BigInt(namehash(subdomainRouteNames3[0])), BigInt(namehash(subdomainRouteNames3[1]))]
		//check that we can create more subdomains after creating noe
		const result = await ethSimulateTransactions(rpc, [
			makeImmutableDomain(subdomainRouteNames3, ownedTokens3),
			makeImmutableDomain(subdomainRouteNames3_another, ownedTokens3_another),
			{
				from: whale,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'getData',
					args: [BigInt(namehash(subdomainRouteNames3_another[2]))]
				})),
			},
			{
				from: ownAddress,
				to: BigInt(ENS_TOKEN_WRAPPER),
				input: stringToUint8Array(encodeFunctionData({
					abi: ENS_WRAPPER_ABI,
					functionName: 'balanceOf',
					args: [addressString(BURN_ADDRESS), BigInt(namehash(subdomainRouteNames3_another[2]))]
				}))
			},
		])
		if (!allSuccess(result)) throw new Error('transaction failed')
		if (result[0]?.calls[2]?.returnData === undefined || result[0]?.calls[3]?.returnData === undefined) throw new Error('no call results')
		// child
		const childData = decodeFunctionResult({ abi: ENS_WRAPPER_ABI, functionName: 'getData', data: dataStringWith0xStart(result[0]?.calls[2]?.returnData) })
		const childFuses = new Set(extractENSFuses(BigInt(childData[1])))
		if (!areSetsEqual(childFuses, new Set(FINAL_CHILD_FUSES))) throw new Error('not correct child fuses')
		if (bytesToUnsigned(result[0]?.calls[3]?.returnData) !== 1n) throw new Error('burn address does not have the child')
	}
	const testAnyoneCanRenew = async() => {
		throw new Error('TODO, RENEWALS DO NOT WORK')
		/*,
		{
			from: whale,
			to: BigInt(ENS_TOKEN_WRAPPER),
			input: stringToUint8Array(encodeFunctionData({
				abi: ENS_WRAPPER_ABI,
				functionName: 'extendExpiry',
				args: [namehash('darkflorist.eth'), labelhash('immutable'), 2n ** 64n - 1n]
			})),
		}*/
	}
	await testMakeImmutable()
	await testWeHaveTheOrignalToken()
	await testThatFusesAreCorrect()
	await testNoData()
	await testNoNonBatchTransfer()
	await testThatFusesAreCorrect3Part()
	await testContentHashIsSet()
	await testThatFusesAreCorrect3PartAgain()
	await testAnyoneCanRenew()
}
runTests()
