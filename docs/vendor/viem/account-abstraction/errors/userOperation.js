import { BaseError } from '../../errors/base.js';
import { prettyPrint } from '../../errors/transaction.js';
import { formatGwei } from '../../utils/index.js';
export class UserOperationExecutionError extends BaseError {
    constructor(cause, { callData, callGasLimit, docsPath, factory, factoryData, initCode, maxFeePerGas, maxPriorityFeePerGas, nonce, paymaster, paymasterAndData, paymasterData, paymasterPostOpGasLimit, paymasterVerificationGasLimit, preVerificationGas, sender, signature, verificationGasLimit, }) {
        const prettyArgs = prettyPrint({
            callData,
            callGasLimit,
            factory,
            factoryData,
            initCode,
            maxFeePerGas: typeof maxFeePerGas !== 'undefined' &&
                `${formatGwei(maxFeePerGas)} gwei`,
            maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== 'undefined' &&
                `${formatGwei(maxPriorityFeePerGas)} gwei`,
            nonce,
            paymaster,
            paymasterAndData,
            paymasterData,
            paymasterPostOpGasLimit,
            paymasterVerificationGasLimit,
            preVerificationGas,
            sender,
            signature,
            verificationGasLimit,
        });
        super(cause.shortMessage, {
            cause,
            docsPath,
            metaMessages: [
                ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
                'Request Arguments:',
                prettyArgs,
            ].filter(Boolean),
        });
        Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UserOperationExecutionError'
        });
        this.cause = cause;
    }
}
export class UserOperationReceiptNotFoundError extends BaseError {
    constructor({ hash }) {
        super(`User Operation receipt with hash "${hash}" could not be found. The User Operation may not have been processed yet.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UserOperationReceiptNotFoundError'
        });
    }
}
export class UserOperationNotFoundError extends BaseError {
    constructor({ hash }) {
        super(`User Operation with hash "${hash}" could not be found.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UserOperationNotFoundError'
        });
    }
}
export class WaitForUserOperationReceiptTimeoutError extends BaseError {
    constructor({ hash }) {
        super(`Timed out while waiting for User Operation with hash "${hash}" to be confirmed.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'WaitForUserOperationReceiptTimeoutError'
        });
    }
}
//# sourceMappingURL=userOperation.js.map