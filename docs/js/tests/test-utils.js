export const addressString = (address) => `0x${address.toString(16).padStart(40, '0')}`;
export function bigintToUint8Array(value, numberOfBytes) {
    if (typeof value === 'number')
        value = BigInt(value);
    if (value >= 2n ** BigInt(numberOfBytes * 8) || value < 0n)
        throw new Error(`Cannot fit ${value} into a ${numberOfBytes}-byte unsigned integer.`);
    const result = new Uint8Array(numberOfBytes);
    for (let i = 0; i < result.length; ++i) {
        result[i] = Number((value >> BigInt(numberOfBytes - i - 1) * 8n) & 0xffn);
    }
    return result;
}
export function stringToUint8Array(data) {
    const dataLength = (data.length - 2) / 2;
    if (dataLength === 0)
        return new Uint8Array();
    return bigintToUint8Array(BigInt(data), dataLength);
}
export function bytesToUnsigned(bytes) {
    let value = 0n;
    for (const byte of bytes) {
        value = (value << 8n) + BigInt(byte);
    }
    return value;
}
export const removeEthSuffix = (str) => {
    if (str.endsWith('.eth'))
        return str.slice(0, -4);
    return str;
};
export const allSuccess = (result) => {
    return result.flatMap((x) => x.calls.map((x) => x.status === 'success')).every((a) => a === true);
};
//# sourceMappingURL=test-utils.js.map