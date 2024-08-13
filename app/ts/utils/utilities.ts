export async function sleep(milliseconds: number) {
	await new Promise(resolve => setTimeout(resolve, milliseconds))
}

export function jsonStringify(value: unknown, space?: string | number | undefined): string {
    return JSON.stringify(value, (_, value) => {
		if (typeof value === 'bigint') return `0x${value.toString(16)}n`
		if (value instanceof Uint8Array) return `b'${Array.from(value).map(x => x.toString(16).padStart(2, '0')).join('')}'`
		// cast works around https://github.com/uhyo/better-typescript-lib/issues/36
		return value as JSONValueF<unknown>
    }, space)
}

export function jsonParse(text: string): unknown {
	return JSON.parse(text, (_key: string, value: unknown) => {
		if (typeof value !== 'string') return value
		if (/^0x[a-fA-F0-9]+n$/.test(value)) return BigInt(value.slice(0, -1))
		const bytesMatch = /^b'(:<hex>[a-fA-F0-9])+'$/.exec(value)
		if (bytesMatch && 'groups' in bytesMatch && bytesMatch.groups && 'hex' in bytesMatch.groups && bytesMatch.groups['hex'].length % 2 === 0) return hexToBytes(`0x${bytesMatch.groups['hex']}`)
		return value
	})
}

export function ensureError(caught: unknown) {
	return (caught instanceof Error) ? caught
		: typeof caught === 'string' ? new Error(caught)
		: typeof caught === 'object' && caught !== null && 'message' in caught && typeof caught.message === 'string' ? new Error(caught.message)
		: new Error(`Unknown error occurred.\n${jsonStringify(caught)}`)
}

function hexToBytes(value: string) {
	const result = new Uint8Array((value.length - 2) / 2)
	for (let i = 0; i < result.length; ++i) {
		result[i] = Number.parseInt(value.slice(i * 2 + 2, i * 2 + 4), 16)
	}
	return result
}

export function dataString(data: Uint8Array | null) {
	if (data === null) return ''
	return Array.from(data).map(x => x.toString(16).padStart(2, '0')).join('')
}

export function dataStringWith0xStart(data: Uint8Array | null) {
	if (data === null) return ''
	return `0x${ dataString(data) }`
}

export function decodeEthereumNameServiceString(ens: string): string {
	const parts = ens.split('.')
	const encodedData: string[] = []
	encodedData.push('0x')

	function stringToHex(str: string): string {
		return Array.from(str).map((char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join('')
	}
	parts.forEach((part) => {
		const encodedPart = stringToHex(part)
		const byteCount = (encodedPart.length / 2).toString(16).padStart(2, '0')
		encodedData.push(byteCount + encodedPart)
	})

	encodedData.push('00')
	return encodedData.join('')
}

export function assertNever(value: never): never {
	throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`)
}

export function isSameAddress(address1: `0x${ string }` | undefined, address2: `0x${ string }` | undefined) {
	if (address1 === undefined && address2 === undefined) return true
	if (address1 === undefined || address2 === undefined) return false
	return address1.toLowerCase() === address2.toLowerCase()
}

export function getSubstringAfterFirstPoint(input: string): string {
	const pointIndex = input.indexOf('.')
	if (pointIndex === -1) {
		return input // Return the original string if no point is found
	}
	return input.substring(pointIndex + 1)
}
