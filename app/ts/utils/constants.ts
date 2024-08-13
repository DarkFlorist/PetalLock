export const MOCK_ADDRESS = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
export const ENS_PUBLIC_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'
export const ENS_TOKEN_WRAPPER = '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401'
export const ENS_ETH_REGISTRAR_CONTROLLER = '0x253553366Da8546fC250F225fe3d25d0C782303b'
export const ENS_ETHEREUM_NAME_SERVICE = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'
export const ENS_PUBLIC_RESOLVER_2 = '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41'
export const ENS_REGISTRY_WITH_FALLBACK = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
export const ENS_REVERSE_REGISTRAR = '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb'

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

export const ENS_FLAGS = [
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
] as const

export const burnAddresses = [
	'0xdeaDDeADDEaDdeaDdEAddEADDEAdDeadDEADDEaD',
	'0x000000000000000000000000000000000000dEaD',
	'0x0000000000000000000000000000000000000000',
	'0xdEaD000000000000000000000000000000000000',
	'0x0000000000000000000000000000000000000001'
] as const

