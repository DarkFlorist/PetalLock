
export type CheckBoxes = {
	childExists: boolean
	parentWrapped: boolean
	childWrapped: boolean
	parentFusesBurned: boolean
	childFusesBurned: boolean
	childOwnershipBurned: boolean
	immutable: boolean
	childContentHashIsSet: boolean
}

export type EnsFuseName = 
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

export type DomainInfo = {
	isWrapped: boolean,
	nameHash: `0x${ string }`
	owner: `0x${ string }`,
	registeryOwner: `0x${ string }`,
	data: readonly [`0x${ string }`, number, bigint],
	fuses: readonly EnsFuseName[],
	expiry: bigint,
	label: string,
	registered: boolean,
	contentHash: `0x${ string }`,
	manager: `0x${ string }`,
}

export type AccountAddress = `0x${ string }`
