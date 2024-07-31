import { Signal } from '@preact/signals'
import { createElement, render } from 'preact'
import { App, AppModel } from './components/App.js'
import { createWalletClient, custom, keccak256, namehash, publicActions, toHex } from 'viem'
import { mainnet } from 'viem/chains'
import { ENS_WRAPPER_ABI } from './ens_wrapper_abi.js'
import { ENS_TOKEN_WRAPPER } from './ens.js'
import 'viem/window'

// create the root model for our app
const greeting = new Signal('Hello')
const rootModel = {
	greeting: greeting,
	cycleGreeting: () => greeting.value = (greeting.peek() === 'Hello') ? 'nuqneH' : 'Hello',
} satisfies AppModel

// put the root model on the window for debugging convenience
declare global { interface Window { rootModel: AppModel } }
window.rootModel = rootModel

// specify our render function, which will be fired anytime rootModel is mutated
function rerender() {
	const element = createElement(App, rootModel)
	render(element, document.body)
}

// kick off the initial render
rerender()

function getSubstringAfterFirstPoint(input: string): string {
	const pointIndex = input.indexOf('.')
	if (pointIndex === -1) {
		return input // Return the original string if no point is found
	}
	return input.substring(pointIndex + 1)
}

type EnsFuseName = 
  | 'Cannot Unwrap Name'
  | 'Cannot Burn Fuses'
  | 'Cannot Transfer'
  | 'Cannot Set Resolver'
  | 'Cannot Set Time To Live'
  | 'Cannot Create Subdomain'
  | 'Parent Domain Cannot Control'
  | 'Cannot Approve'
  | 'Is .eth domain'
  | 'Can Extend Expiry'
  | 'Can Do Everything'

type EnsFuseFlag = {
	name: EnsFuseName
	value: bigint
}

// ENS Fuses
export const CANNOT_UNWRAP = 1n
export const CANNOT_BURN_FUSES = 2n
export const CANNOT_TRANSFER = 4n
export const CANNOT_SET_RESOLVER = 8n
export const CANNOT_SET_TTL = 16n
export const CANNOT_CREATE_SUBDOMAIN = 32n
export const CANNOT_APPROVE = 64n
export const PARENT_CANNOT_CONTROL = 1n << 16n
export const IS_DOT_ETH = 1n << 17n
export const CAN_EXTEND_EXPIRY = 1n << 18n
export const CAN_DO_EVERYTHING = 0n

const flags: EnsFuseFlag[] = [
	{ name: 'Cannot Unwrap Name', value: CANNOT_UNWRAP },
	{ name: 'Cannot Burn Fuses', value: CANNOT_BURN_FUSES },
	{ name: 'Cannot Transfer', value: CANNOT_TRANSFER },
	{ name: 'Cannot Set Resolver', value: CANNOT_SET_RESOLVER },
	{ name: 'Cannot Set Time To Live', value: CANNOT_SET_TTL },
	{ name: 'Cannot Create Subdomain', value: CANNOT_CREATE_SUBDOMAIN },
	{ name: 'Cannot Approve', value: CANNOT_APPROVE },
	{ name: 'Parent Domain Cannot Control', value: PARENT_CANNOT_CONTROL },
	{ name: 'Is .eth domain', value: IS_DOT_ETH },
	{ name: 'Can Extend Expiry', value: CAN_EXTEND_EXPIRY },
	{ name: 'Can Do Everything', value: CAN_DO_EVERYTHING },
]

export const extractENSFuses = (uint: bigint): readonly EnsFuseName[] => {
	if (uint === CAN_DO_EVERYTHING) return ['Can Do Everything']
	const result: EnsFuseName[] = []
	for (const flag of flags) {
		if ((uint & flag.value) === flag.value && flag.value !== CAN_DO_EVERYTHING) {
			result.push(flag.name)
		}
	}
	return result
}

export const fuseNamesToUint = (names: readonly EnsFuseName[]): number => {
	let result = 0
	for (const name of names) {
		const flag = flags.find(flag => flag.name === name)
		if (flag) {
			result |= Number(flag.value)
		}
	}
	return result
}

type DomainInfo = {
	isWrapped: boolean,
	nameHash: `0x${ string }`
	owner: `0x${ string }`,
	data: readonly [`0x${ string }`, number, bigint],
	fuses: readonly EnsFuseName[],
	expiry: bigint,
}

const main = async () => {
	if (window.ethereum === undefined) throw new Error('no window.ethereum injected')

	const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' }) 
	console.log(account)
	if (account === undefined) throw new Error('no account!')
	const client = createWalletClient({ 
		account: account,
		chain: mainnet, 
		transport: custom(window.ethereum) 
	}).extend(publicActions)

	const ensSubDomain = 'immutable.darkflorist.eth'
	const ensParent = getSubstringAfterFirstPoint(ensSubDomain)
	const [ensLabel] = ensSubDomain.split('.')
	if (ensLabel === undefined) throw new Error('label is undefined')

	const getDomainInfo = async (nameHash: `0x${ string }`): Promise<DomainInfo> => {
		const isWrapped = await client.readContract({
			address: ENS_TOKEN_WRAPPER,
			abi: ENS_WRAPPER_ABI, 
			functionName: 'isWrapped',
			args: [nameHash]
		})
		const owner = await client.readContract({
			address: ENS_TOKEN_WRAPPER,
			abi: ENS_WRAPPER_ABI, 
			functionName: 'ownerOf',
			args: [BigInt(nameHash)]
		})
		
		const data = await client.readContract({
			address: ENS_TOKEN_WRAPPER,
			abi: ENS_WRAPPER_ABI, 
			functionName: 'getData',
			args: [BigInt(nameHash)]
		})
		const fuses = extractENSFuses(BigInt(data[1]))
		return {
			nameHash,
			isWrapped,
			owner,
			data,
			fuses,
			expiry: data[2]
		}
	}
	const printDomainInfo = async (name: string, domainInfo: DomainInfo) => {
		console.log(name)
		console.log(`	namehash: `, domainInfo.nameHash)
		console.log(`	isWrapped -> `, domainInfo.isWrapped)
		console.log(`	owner -> `, domainInfo.owner)
		console.log(`	data -> `, `[${ domainInfo.data.join(', ') }]`)
		console.log(`	fuses -> `, `[${ domainInfo.fuses.join(', ') }]`)
		console.log(`	expiry -> `, domainInfo.expiry)
	}

	const childNameHash = namehash(ensSubDomain) 
	const parentNameHash = namehash(ensParent)
	
	const parentInfo = await getDomainInfo(parentNameHash)
	printDomainInfo(ensParent, parentInfo)
	const childInfo = await getDomainInfo(childNameHash)
	printDomainInfo(ensSubDomain, childInfo)

	if (parentInfo.isWrapped === false) throw new Error('parent is not wrapped') //TODO, add wrapping
	const isParentCannotUnWrapSet = parentInfo.fuses.includes('Cannot Unwrap Name')
	if (isParentCannotUnWrapSet) {
		console.log(`	parent has  -> Cannot Unwrap Name`)
	} else {
		// burn parents fuses
		console.log('burning parent fuses')
		const fusesUint = fuseNamesToUint(['Cannot Unwrap Name'])
		const request = await client.writeContract({
			account,
			address: ENS_TOKEN_WRAPPER,
			abi: ENS_WRAPPER_ABI, 
			functionName: 'setFuses',
			args: [parentNameHash, fusesUint]
		})
		console.log(`request sent: ${ request }`)
	}
	if (!childInfo.isWrapped) {
		// wrap child
		throw new Error('child is not wrapped') //TODO, add wrapping
		/*const request = await client.writeContract({
			account,
			address: ENS_TOKEN_WRAPPER,
			abi: ENS_WRAPPER_ABI, 
			functionName: 'wrap',
			args: [childNameHash, parentNameHash, ENS_RESOLVER]
		})*/
	}

	// set expiry to parents expiry
	console.log('burning child fuses')
	const ensLabelhash = keccak256(toHex(ensLabel))
	const fusesToBurn = ['Cannot Unwrap Name', 'Cannot Burn Fuses', 'Cannot Set Resolver', 'Cannot Set Time To Live',  'Cannot Create Subdomain', 'Parent Domain Cannot Control', 'Cannot Approve', 'Can Extend Expiry'] as const
	if (fuseNamesToUint(childInfo.fuses) != fuseNamesToUint(fusesToBurn) && parentInfo.expiry !== childInfo.expiry) {
		await client.writeContract({
			account,
			address: ENS_TOKEN_WRAPPER,
			abi: ENS_WRAPPER_ABI, 
			functionName: 'setChildFuses',
			args: [parentNameHash, ensLabelhash, fuseNamesToUint(fusesToBurn), parentInfo.expiry]
		})
	}

	// give up ownership of the subdomain
	console.log('transfer ownership')
	console.log(childInfo.owner)
	await client.writeContract({
		account,
		address: ENS_TOKEN_WRAPPER,
		abi: ENS_WRAPPER_ABI, 
		functionName: 'safeTransferFrom',
		args: [childInfo.owner, `0x000000000000000000000000000000000000dEaD`, BigInt(childNameHash), 1n, '0x0']
	})
}
main()
