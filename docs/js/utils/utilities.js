export async function sleep(milliseconds) {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}
export function jsonStringify(value, space) {
    return JSON.stringify(value, (_, value) => {
        if (typeof value === 'bigint')
            return `0x${value.toString(16)}n`;
        if (value instanceof Uint8Array)
            return `b'${Array.from(value).map(x => x.toString(16).padStart(2, '0')).join('')}'`;
        // cast works around https://github.com/uhyo/better-typescript-lib/issues/36
        return value;
    }, space);
}
export function jsonParse(text) {
    return JSON.parse(text, (_key, value) => {
        if (typeof value !== 'string')
            return value;
        if (/^0x[a-fA-F0-9]+n$/.test(value))
            return BigInt(value.slice(0, -1));
        const bytesMatch = /^b'(:<hex>[a-fA-F0-9])+'$/.exec(value);
        if (bytesMatch && 'groups' in bytesMatch && bytesMatch.groups && 'hex' in bytesMatch.groups && bytesMatch.groups['hex'].length % 2 === 0)
            return hexToBytes(`0x${bytesMatch.groups['hex']}`);
        return value;
    });
}
export function ensureError(caught) {
    return (caught instanceof Error) ? caught
        : typeof caught === 'string' ? new Error(caught)
            : typeof caught === 'object' && caught !== null && 'message' in caught && typeof caught.message === 'string' ? new Error(caught.message)
                : new Error(`Unknown error occurred.\n${jsonStringify(caught)}`);
}
function hexToBytes(value) {
    const result = new Uint8Array((value.length - 2) / 2);
    for (let i = 0; i < result.length; ++i) {
        result[i] = Number.parseInt(value.slice(i * 2 + 2, i * 2 + 4), 16);
    }
    return result;
}
export function dataString(data) {
    if (data === null)
        return '';
    return Array.from(data).map(x => x.toString(16).padStart(2, '0')).join('');
}
export function dataStringWith0xStart(data) {
    if (data === null)
        return '0x';
    return `0x${dataString(data)}`;
}
export function decodeEthereumNameServiceString(ens) {
    const parts = ens.split('.');
    const encodedData = [];
    encodedData.push('0x');
    function stringToHex(str) {
        return Array.from(str).map((char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    }
    parts.forEach((part) => {
        const encodedPart = stringToHex(part);
        const byteCount = (encodedPart.length / 2).toString(16).padStart(2, '0');
        encodedData.push(byteCount + encodedPart);
    });
    encodedData.push('00');
    return encodedData.join('');
}
export function assertNever(value) {
    throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}
export function isSameAddress(address1, address2) {
    if (address1 === undefined && address2 === undefined)
        return true;
    if (address1 === undefined || address2 === undefined)
        return false;
    return address1.toLowerCase() === address2.toLowerCase();
}
export const splitEnsStringToSubdomainPath = (input) => {
    const parts = input.split('.');
    const result = [];
    for (let i = 0; i < parts.length; i++) {
        const joined = parts.slice(i).join('.');
        result.push(joined);
    }
    result.pop(); // eth element
    return result.reverse();
};
export const splitDomainToSubDomainAndParent = (domain) => {
    const index = domain.indexOf('.');
    if (index === -1)
        throw new Error('not proper domain');
    return [domain.slice(0, index), domain.slice(index + 1)];
};
export function bigIntToNumber(value) {
    if (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER) {
        return Number(value);
    }
    throw new Error(`Value: "${value}" is out of bounds to be a Number.`);
}
//# sourceMappingURL=utilities.js.map