import { Abi, ContractFunctionArgs, ContractFunctionName, encodeFunctionData, encodePacked, isAddress, ReadContractReturnType, WriteContractParameters, zeroAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { SAFE_ABI } from '../abi/safe_abi.js'
import { AccountAddress, RemoveFields } from '../types/types.js'
import { createReadClient, createWriteClient } from './ensUtils.js'

export type ReadClient = ReturnType<typeof createReadClient> | ReturnType<typeof createWriteClient>
export type WriteClient = ReturnType<typeof createWriteClient>

export const getOwners = async (readClient: ReadClient, safeAddress: `0x${ string }`) => {
	const safeAddressForAccount = getSafeAddress()
	return await readClient.readContract({
		abi: SAFE_ABI,
		functionName: 'getOwners',
		address: safeAddress,
		args: [],
		...(safeAddressForAccount !== undefined ? { account: safeAddressForAccount } : {})
	}) as `0x${ string }`[]
}

export const execTransaction = async (writeClient: WriteClient, safeAddress: `0x${ string }`, to: AccountAddress, data: `0x${ string }`) => {
	const safeOwners = await getOwners(writeClient, safeAddress)
	if (safeOwners.length === 0) throw new Error('Safe has no owners!')
	const signature = encodePacked(['uint256', 'uint256', 'bool'], [BigInt(writeClient.account.address), 0n, true])
	const value = 0n
	const operation = 0
	const safeTxGas = 0n
	const baseGas = 0n
	const gasPrice = 0n
	const gasToken = zeroAddress
	const refundReceiver = zeroAddress

	return await writeClient.writeContract({
		chain: mainnet,
		abi: SAFE_ABI,
		functionName: 'execTransaction',
		address: safeAddress,
		args: [to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signature]
	})
}

export const writeContractSafeWrapIfSafeIsEnabled = async (client: WriteClient, params: WriteContractParameters) => {
	const safeAddress = getSafeAddress()
	if (safeAddress === undefined) return await client.writeContract(params as Parameters<typeof client.writeContract>[0])
	const data = encodeFunctionData({ abi: params.abi, functionName: params.functionName, args: params.args })
	return await execTransaction(client, safeAddress, params.address, data)
}

export const sendTransactionSafeWrapIfSafeIsEnabled = async (client: WriteClient, params: Parameters<typeof client.sendTransaction>[0]) => {
	const safeAddress = getSafeAddress()
	if (safeAddress === undefined) return await client.sendTransaction(params)
	if (params.to === undefined || params.to === null) throw new Error('cannot send transaction to undefined address through safe')
	const data = params.data ?? '0x'
	return await execTransaction(client, safeAddress, params.to, data)
}

export const getSafeAddress = (): `0x${ string }` | undefined => {
	if (typeof localStorage === 'undefined') return undefined
	const safeAddress = localStorage.getItem('safeAddress')
	if (safeAddress === null) return undefined
	const trimmed = safeAddress.trim()
	if (!isAddress(trimmed, { strict: true })) throw new Error('invalid safe address. Please adjust safe address in the settings by correcting it or removing it.')
	return trimmed
}

export const readContractSafeWrapIfSafeIsEnabled = async <const TAbi extends Abi | readonly unknown[], TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>, TArgs extends ContractFunctionArgs<TAbi, 'pure' | 'view', TFunctionName>>(
	client: ReadClient,
	params: {
		abi: TAbi
		functionName: TFunctionName
		args?: TArgs
		address: AccountAddress
		account?: AccountAddress
	} & RemoveFields<Parameters<ReadClient['readContract']>[0], 'abi' | 'functionName' | 'args' | 'address' | 'account'>,
): Promise<ReadContractReturnType<TAbi, TFunctionName, TArgs>> => {
	const safeAddress = getSafeAddress()
	if (safeAddress === undefined) return await client.readContract(params as Parameters<ReadClient['readContract']>[0]) as ReadContractReturnType<TAbi, TFunctionName, TArgs>
	return await client.readContract({ ...params, account: safeAddress } as Parameters<ReadClient['readContract']>[0]) as ReadContractReturnType<TAbi, TFunctionName, TArgs>
}

export const getCurrentReadAccount = (accountAddress: AccountAddress | undefined): AccountAddress | undefined => {
	const safeAddress = getSafeAddress()
	if (safeAddress !== undefined) return safeAddress
	return accountAddress
}

export const getCurrentWriteAccount = (accountAddress: AccountAddress): AccountAddress => {
	const safeAddress = getSafeAddress()
	if (safeAddress !== undefined) return safeAddress
	return accountAddress
}

export const maybeGetCurrentWriteAccount = (accountAddress: AccountAddress | undefined): AccountAddress | undefined => {
	if (accountAddress === undefined) return undefined
	return getCurrentWriteAccount(accountAddress)
}

export const isValidSafeAccountWalletCombination = async (client: WriteClient) => {
	const safeAddress = getSafeAddress()
	if (safeAddress === undefined) return true
	const owners = await getOwners(client, safeAddress)
	if (owners.find((owner) => BigInt(owner) === BigInt(client.account.address)) !== undefined) return true
	return false
}
