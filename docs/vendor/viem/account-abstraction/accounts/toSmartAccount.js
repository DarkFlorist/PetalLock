import { getCode } from '../../actions/public/getCode.js';
import { getAction } from '../../utils/getAction.js';
import { createNonceManager } from '../../utils/nonceManager.js';
import { serializeErc6492Signature } from '../../utils/signature/serializeErc6492Signature.js';
/**
 * @description Creates a Smart Account with a provided account implementation.
 *
 * @param parameters - {@link ToSmartAccountParameters}
 * @returns A Smart Account. {@link ToSmartAccountReturnType}
 */
export async function toSmartAccount(implementation) {
    const { extend, ...rest } = implementation;
    let deployed = false;
    const address = await implementation.getAddress();
    const nonceKeyManager = createNonceManager({
        source: {
            get() {
                return Date.now();
            },
            set() { },
        },
    });
    return {
        ...extend,
        ...rest,
        address,
        async getFactoryArgs() {
            if ('isDeployed' in this && (await this.isDeployed()))
                return { factory: undefined, factoryData: undefined };
            return implementation.getFactoryArgs();
        },
        async getNonce(parameters) {
            const key = parameters?.key ??
                BigInt(await nonceKeyManager.consume({
                    address,
                    chainId: implementation.client.chain.id,
                    client: implementation.client,
                }));
            return await implementation.getNonce({ ...parameters, key });
        },
        async isDeployed() {
            if (deployed)
                return true;
            const code = await getAction(implementation.client, getCode, 'getCode')({
                address,
            });
            deployed = Boolean(code);
            return deployed;
        },
        ...(implementation.sign
            ? {
                async sign(parameters) {
                    const [{ factory, factoryData }, signature] = await Promise.all([
                        this.getFactoryArgs(),
                        implementation.sign(parameters),
                    ]);
                    if (factory && factoryData)
                        return serializeErc6492Signature({
                            address: factory,
                            data: factoryData,
                            signature,
                        });
                    return signature;
                },
            }
            : {}),
        async signMessage(parameters) {
            const [{ factory, factoryData }, signature] = await Promise.all([
                this.getFactoryArgs(),
                implementation.signMessage(parameters),
            ]);
            if (factory && factoryData)
                return serializeErc6492Signature({
                    address: factory,
                    data: factoryData,
                    signature,
                });
            return signature;
        },
        async signTypedData(parameters) {
            const [{ factory, factoryData }, signature] = await Promise.all([
                this.getFactoryArgs(),
                implementation.signTypedData(parameters),
            ]);
            if (factory && factoryData)
                return serializeErc6492Signature({
                    address: factory,
                    data: factoryData,
                    signature,
                });
            return signature;
        },
        type: 'smart',
    };
}
//# sourceMappingURL=toSmartAccount.js.map