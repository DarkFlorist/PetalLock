import { varint } from 'multiformats'
import { base32 } from 'multiformats/bases/base32'
import { base36 } from 'multiformats/bases/base36'
import { base58btc } from 'multiformats/bases/base58'
import { base64url } from 'multiformats/bases/base64'
import { CID } from 'multiformats/cid'
import { create as createDigest, decode as multihashDecode } from 'multiformats/hashes/digest'
import { assertNever } from './library/utilities.js'

export const codeToName = {
	0xe3: 'ipfs',
	0xe4: 'swarm',
	0xe5: 'ipns',
	0x01bc: 'onion',
	0x01bd: 'onion3',
	0xb19910: 'skynet',
	0xb29910: 'arweave',
} as const

export const nameToCode = {
	ipfs: 0xe3,
	swarm: 0xe4,
	ipns: 0xe5,
	onion: 0x01bc,
	onion3: 0x01bd,
	skynet: 0xb19910,
	arweave: 0xb29910,
} as const;
  
type CodecId = keyof typeof codeToName

const hexStringToBytes = (hex: string): Uint8Array => {
	let value: string = hex
	if (value.startsWith('0x')) value = value.slice(2)
	if (value.length % 2 !== 0) throw new Error('Invalid hex string')
	const bytes = new Uint8Array(value.length / 2)
	for (let i = 0; i < value.length; i += 2) {
		bytes[i / 2] = parseInt(value.slice(i, i + 2), 16)
	}
	return bytes
}

const bytesToHexString = (bytes: Uint8Array): `0x${ string }` => {
	let hex = ''
	for (let i = 0; i < bytes.length; i++) {
		const b = bytes[i]
		if (b == undefined) throw new Error('length misalign')
		hex += b.toString(16).padStart(2, '0')
	}
	return `0x${ hex }`
}

const isCryptographicIPNS = (cid: CID): boolean => {
	try {
		const { multihash } = cid
		if (multihash.size < 38) {
			const mh = multihashDecode(multihash.bytes)
			if (mh.code === 0x0 && mh.size < 36) return false
		}
		return true
	} catch (_) {
		return false
	}
}

const base64Decode = (value: string): Uint8Array => base64url.decode(`u${value}`)

const encodes = {
	skynet: (value: string): Uint8Array => base64Decode(value),
	swarm: (value: string): Uint8Array => {
		const bytes = hexStringToBytes(value)
		const multihash = createDigest(0x1b, bytes)
		return CID.create(1, 0xfa, multihash).bytes
	},
	ipfs: (value: string): Uint8Array => CID.parse(value).toV1().bytes,
	ipns: (value: string): Uint8Array => {
		let cid: CID
		try {
			cid = CID.parse(value, value.startsWith('k') ? base36 : undefined)
		} catch (e) {
			const bytes = base58btc.decode(`z${value}`)
			cid = new CID(0, 0x72, createDigest(0x00, bytes.slice(2)), bytes)
		}
		if (!isCryptographicIPNS(cid)) throw new Error('not supported')
		return CID.create(1, 0x72, cid.multihash).bytes
	},
	utf8: (value: string): Uint8Array => {
		const encoder = new TextEncoder()
		return encoder.encode(value)
	},
	arweave: (value: string): Uint8Array => base64Decode(value),
}

const decodes = {
	hexMultiHash: (value: Uint8Array): string => {
		const cid = CID.decode(value)
		return bytesToHexString(multihashDecode(cid.multihash.bytes).digest)
	},
	ipfs: (value: Uint8Array): string => {
		const cid = CID.decode(value).toV1()
		return cid.toString(cid.code === 0x72 ? base36 : base32)
	},
	ipns: (value: Uint8Array): string => {
		const cid = CID.decode(value).toV1()
		if (!isCryptographicIPNS(cid)) throw new Error('not supported')
		return cid.toString(base36)
	},
	utf8: (value: Uint8Array): string => {
		const decoder = new TextDecoder()
		return decoder.decode(value)
	},
	base64: (value: Uint8Array): string => {
		return base64url.encode(value).substring(1)
	},
}

export const encodeContentHash = (name: string, value: string): `0x${ string }` => {
	const encode = () => {
		switch(name) {
			case 'arweave': return encodes.arweave(value)
			case 'ipfs': return encodes.ipfs(value)
			case 'ipns': return encodes.ipns(value)
			case 'skynet': return encodes.skynet(value)
			case 'swarm': return encodes.swarm(value)
			default: return encodes.utf8(value)
		}
	}
	const bytes = encode()
	const code = nameToCode[name as keyof typeof nameToCode] as number
	const codeBytes = varint.encodeTo(code, new Uint8Array(varint.encodingLength(code)))
	return bytesToHexString(new Uint8Array([...codeBytes, ...bytes]))
}

export const decodeContentHash = (contentHash: string): string => {
	const bytes = hexStringToBytes(contentHash)
	const [code, offset] = varint.decode(bytes)
	const value = bytes.slice(offset)
	if (!(code in codeToName)) throw new Error('invalid protocol')
	const name = codeToName[code as CodecId]
	const withProtocol = (hash: string) => `${ name }://${ hash }`
	switch(name) {
		case 'arweave': return withProtocol(decodes.base64(value))
		case 'ipfs': return withProtocol(decodes.ipfs(value))
		case 'ipns': return withProtocol(decodes.ipns(value))
		case 'onion': return withProtocol(decodes.utf8(value))
		case 'onion3': return withProtocol(decodes.utf8(value))
		case 'skynet': return withProtocol(decodes.base64(value))
		case 'swarm': return withProtocol(decodes.hexMultiHash(value))
		default: assertNever(name)
	}
}

export const tryDecodeContentHash = (contentHash: string) => {
	try {
		return decodeContentHash(contentHash)
	} catch(e) {
		return undefined
	}
}

export const tryEncodeContentHash = (contentHash: string) => {
	try {
		const [codec, hash] = contentHash.split('://')
		if (codec === undefined || hash === undefined) throw new Error('invalid hash')
		return encodeContentHash(codec, hash)
	} catch(e) {
		console.log(e)
		return undefined
	}
}

export const isValidContentHashString = (input: string) => {
	return tryEncodeContentHash(input) != undefined
}
