import { getCallsStatus, } from '../actions/getCallsStatus.js';
import { getCapabilities, } from '../actions/getCapabilities.js';
import { sendCalls, } from '../actions/sendCalls.js';
import { showCallsStatus, } from '../actions/showCallsStatus.js';
import { writeContracts, } from '../actions/writeContracts.js';
/**
 * A suite of EIP-5792 Wallet Actions.
 *
 * - Docs: https://viem.sh/experimental
 *
 * @example
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { walletActionsEip5792 } from 'viem/experimental'
 *
 * const walletClient = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(walletActionsEip5792())
 *
 * const hash = await walletClient.sendCalls({...})
 */
export function walletActionsEip5792() {
    return (client) => {
        return {
            getCallsStatus: (parameters) => getCallsStatus(client, parameters),
            getCapabilities: ((parameters) => getCapabilities(client, parameters)),
            sendCalls: (parameters) => sendCalls(client, parameters),
            showCallsStatus: (parameters) => showCallsStatus(client, parameters),
            writeContracts: (parameters) => writeContracts(client, parameters),
        };
    };
}
//# sourceMappingURL=eip5792.js.map