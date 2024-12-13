import { parseAccount, } from '../../accounts/utils/parseAccount.js';
import { AccountNotFoundError, AccountTypeNotSupportedError, } from '../../errors/account.js';
import { assertCurrentChain, } from '../../utils/chain/assertCurrentChain.js';
import { getTransactionError, } from '../../utils/errors/getTransactionError.js';
import { extract } from '../../utils/formatters/extract.js';
import { formatTransactionRequest, } from '../../utils/formatters/transactionRequest.js';
import { getAction } from '../../utils/getAction.js';
import { assertRequest, } from '../../utils/transaction/assertRequest.js';
import { getChainId } from '../public/getChainId.js';
import { defaultParameters, prepareTransactionRequest, } from './prepareTransactionRequest.js';
import { sendRawTransaction, } from './sendRawTransaction.js';
/**
 * Creates, signs, and sends a new transaction to the network.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions/sending-transactions
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
 *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
 *
 * @param client - Client to use
 * @param parameters - {@link SendTransactionParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link SendTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await sendTransaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await sendTransaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
export async function sendTransaction(client, parameters) {
    const { account: account_ = client.account, chain = client.chain, accessList, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, ...rest } = parameters;
    if (!account_)
        throw new AccountNotFoundError({
            docsPath: '/docs/actions/wallet/sendTransaction',
        });
    const account = parseAccount(account_);
    try {
        assertRequest(parameters);
        let chainId;
        if (chain !== null) {
            chainId = await getAction(client, getChainId, 'getChainId')({});
            assertCurrentChain({
                currentChainId: chainId,
                chain,
            });
        }
        if (account.type === 'json-rpc') {
            const chainFormat = client.chain?.formatters?.transactionRequest?.format;
            const format = chainFormat || formatTransactionRequest;
            const request = format({
                // Pick out extra data that might exist on the chain's transaction request type.
                ...extract(rest, { format: chainFormat }),
                accessList,
                blobs,
                chainId,
                data,
                from: account.address,
                gas,
                gasPrice,
                maxFeePerBlobGas,
                maxFeePerGas,
                maxPriorityFeePerGas,
                nonce,
                to,
                value,
            });
            return await client.request({
                method: 'eth_sendTransaction',
                params: [request],
            }, { retryCount: 0 });
        }
        if (account.type === 'local') {
            // Prepare the request for signing (assign appropriate fees, etc.)
            const request = await getAction(client, prepareTransactionRequest, 'prepareTransactionRequest')({
                account,
                accessList,
                blobs,
                chain,
                chainId,
                data,
                gas,
                gasPrice,
                maxFeePerBlobGas,
                maxFeePerGas,
                maxPriorityFeePerGas,
                nonce,
                parameters: [...defaultParameters, 'sidecars'],
                to,
                value,
                ...rest,
            });
            const serializer = chain?.serializers?.transaction;
            const serializedTransaction = (await account.signTransaction(request, {
                serializer,
            }));
            return await getAction(client, sendRawTransaction, 'sendRawTransaction')({
                serializedTransaction,
            });
        }
        if (account.type === 'smart')
            throw new AccountTypeNotSupportedError({
                metaMessages: [
                    'Consider using the `sendUserOperation` Action instead.',
                ],
                docsPath: '/docs/actions/bundler/sendUserOperation',
                type: 'smart',
            });
        throw new Error('incompatible account type.');
    }
    catch (err) {
        if (err instanceof AccountTypeNotSupportedError)
            throw err;
        throw getTransactionError(err, {
            ...parameters,
            account,
            chain: parameters.chain || undefined,
        });
    }
}
//# sourceMappingURL=sendTransaction.js.map