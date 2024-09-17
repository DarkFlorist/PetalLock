export type DomainInfo = {
	isWrapped: boolean,
	nameHash: `0x${ string }`
	owner: `0x${ string }`,
	registeryOwner: `0x${ string }`,
	data: readonly [`0x${ string }`, number, bigint],
	fuses: readonly EnsFuseName[],
	expiry: Date,
	label: string,
	parentDomain: string,
	subDomain: string,
	registered: boolean,
	contentHash: `0x${ string }`,
	manager: `0x${ string }`,
	resolutionAddress: `0x${ string }`,
	approved: `0x${ string }`,
}

export type FinalChildChecks = {
	type: 'finalChild',
	exists: boolean,
	isWrapped: boolean,
	fusesBurned: boolean,
	ownershipOpenRenewalContract: boolean,
	immutable: boolean,
	contentHashIsSet: boolean,
	domainInfo: DomainInfo,
	resolutionAddressIsSet: boolean,
}

export type ParentChecks = {
	type: 'parent',
	exists: boolean,
	isWrapped: boolean,
	fusesBurned: boolean,
	domainInfo: DomainInfo,
	openRenewalContractIsApproved: boolean,
}

export type CheckBoxes = readonly (FinalChildChecks | ParentChecks)[]

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

export type AccountAddress = `0x${ string }`
