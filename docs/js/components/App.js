import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { requestAccounts, isValidEnsSubDomain, isChildOwnershipOwnedByOpenRenewManager, getAccounts, getDomainInfos, isPetalLockAndOpenRenewalManagerDeployed, getOpenRenewalManagerAddress, areRequiredFusesBurnt } from '../utils/ensUtils.js';
import { BigSpinner } from './Spinner.js';
import { ensureError } from '../utils/utilities.js';
import { Create, Immutable, Requirements } from './requirements.js';
import { useOptionalSignal } from '../utils/OptionalSignal.js';
import { getChainId } from '../utils/ensUtils.js';
const WalletComponent = ({ maybeAccountAddress }) => {
    const connect = async () => {
        maybeAccountAddress.deepValue = await requestAccounts();
    };
    return maybeAccountAddress.value !== undefined ? (_jsx("p", { style: 'color: gray; justify-self: right;', children: `Connected with ${maybeAccountAddress.value}` })) : (_jsx("button", { class: 'button is-primary', style: 'justify-self: right;', onClick: connect, children: `Connect wallet` }));
};
export function App() {
    const inputValue = useSignal('');
    const contentHashInput = useSignal('');
    const resolutionAddressInput = useSignal('');
    const errorString = useOptionalSignal(undefined);
    const loadingAccount = useSignal(false);
    const isWindowEthereum = useSignal(true);
    const areContractsDeployed = useSignal(undefined);
    const maybeAccountAddress = useOptionalSignal(undefined);
    const chainId = useSignal(undefined);
    const pathInfo = useOptionalSignal(undefined);
    const immutable = useSignal(false);
    const checkBoxes = useOptionalSignal(undefined);
    const loadingInfos = useSignal(false);
    const creating = useSignal(false);
    const inputTimeoutRef = useRef(null);
    const extendYear = useSignal(1);
    const extending = useSignal(false);
    const setError = (error) => {
        if (error === undefined) {
            errorString.value = undefined;
            return;
        }
        const ensured = ensureError(error);
        console.error(error);
        errorString.deepValue = ensured.message;
    };
    const clear = () => {
        pathInfo.value = undefined;
        loadingInfos.value = false;
        checkBoxes.value = undefined;
        immutable.value = false;
    };
    const updateInfos = async (showLoading) => {
        try {
            const ensSubDomain = inputValue.value.toLowerCase();
            if (!isValidEnsSubDomain(ensSubDomain))
                return;
            if (showLoading)
                loadingInfos.value = true;
            const newPathInfo = await getDomainInfos(maybeAccountAddress.deepValue, ensSubDomain);
            pathInfo.deepValue = newPathInfo;
            immutable.value = false;
            checkBoxes.deepValue = newPathInfo.map((currElement, index) => {
                const fusesBurned = areRequiredFusesBurnt(index, newPathInfo);
                const base = {
                    exists: currElement.registered,
                    isWrapped: currElement.isWrapped,
                    fusesBurned,
                    domainInfo: currElement,
                };
                if (index === newPathInfo.length - 1) {
                    immutable.value = currElement.isWrapped && fusesBurned && isChildOwnershipOwnedByOpenRenewManager(currElement);
                    return {
                        ...base,
                        type: 'finalChild',
                        ownershipOpenRenewalContract: isChildOwnershipOwnedByOpenRenewManager(currElement),
                        immutable: immutable.value,
                        contentHashIsSet: currElement.contentHash !== '0x',
                        resolutionAddressIsSet: BigInt(currElement.resolutionAddress) !== 0n,
                    };
                }
                return {
                    ...base,
                    type: 'parent',
                    openRenewalContractIsApproved: currElement.approved === getOpenRenewalManagerAddress()
                };
            });
            errorString.value = undefined;
        }
        catch (e) {
            setError(e);
        }
        finally {
            loadingInfos.value = false;
        }
    };
    function handleInput(value) {
        inputValue.value = value;
        if (inputTimeoutRef.current !== null)
            clearTimeout(inputTimeoutRef.current);
        inputTimeoutRef.current = setTimeout(() => {
            inputTimeoutRef.current = null;
            const ensSubDomain = inputValue.value.toLowerCase();
            if (!isValidEnsSubDomain(ensSubDomain)) {
                clear();
                return setError(`${ensSubDomain} is not a valid ENS subdomain. The format should be similar to "2.horswap.eth" or "1.lunaria.darkflorist.eth."`);
            }
            setError(undefined);
            updateInfos(true);
        }, 500);
    }
    function handleContentHashInput(value) {
        contentHashInput.value = value;
    }
    function handleResolutionAddressInput(value) {
        resolutionAddressInput.value = value;
    }
    const updateChainId = async () => {
        const account = maybeAccountAddress.deepPeek();
        if (account === undefined)
            return;
        chainId.value = await getChainId(account);
    };
    useEffect(() => {
        if (window.ethereum === undefined) {
            isWindowEthereum.value = false;
            return;
        }
        isWindowEthereum.value = true;
        window.ethereum.on('accountsChanged', function (accounts) { maybeAccountAddress.deepValue = accounts[0]; });
        window.ethereum.on('chainChanged', async () => { updateChainId(); });
        const fetchAccount = async () => {
            try {
                loadingAccount.value = true;
                const fetchedAccount = await getAccounts();
                if (fetchedAccount)
                    maybeAccountAddress.deepValue = fetchedAccount;
                updateChainId();
            }
            catch (e) {
                setError(e);
            }
            finally {
                loadingAccount.value = false;
                areContractsDeployed.value = await isPetalLockAndOpenRenewalManagerDeployed(maybeAccountAddress.deepValue);
            }
        };
        fetchAccount();
        return () => {
            if (inputTimeoutRef.current !== null) {
                clearTimeout(inputTimeoutRef.current);
            }
        };
    }, []);
    useEffect(() => {
        updateInfos(true);
        updateChainId();
    }, [maybeAccountAddress.value]);
    return _jsxs("main", { children: [_jsxs("div", { class: 'app', children: [!isWindowEthereum.value ? _jsx("p", { class: 'paragraph', children: " An Ethereum enabled wallet is required to make immutable domains." }) : _jsx(_Fragment, {}), !loadingAccount.value && isWindowEthereum.value ? _jsx(WalletComponent, { maybeAccountAddress: maybeAccountAddress }) : _jsx(_Fragment, {}), _jsxs("div", { style: 'display: block', children: [_jsxs("div", { class: 'petal-lock', children: [_jsx("img", { src: 'favicon.svg', alt: 'Icon', style: 'width: 60px;' }), " PetalLock"] }), _jsx("p", { class: 'sub-title', children: "Make immutable ENS domains and subdomains" })] }), _jsx("input", { class: 'input', type: 'text', placeholder: '2.horswap.eth', value: inputValue.value, onInput: e => handleInput(e.currentTarget.value) }), loadingInfos.value === true || loadingAccount.value ? _jsxs("div", { style: 'max-width: fit-content; margin-inline: auto; padding: 20px;', children: [" ", _jsx(BigSpinner, {}), " "] }) : _jsx(_Fragment, {}), errorString.deepValue !== undefined ? _jsxs("p", { class: 'error-component', children: [" ", errorString.value] }) : _jsx(_Fragment, { children: " " }), chainId.value !== undefined && chainId.value !== 1 ? _jsxs("p", { class: 'error-component', children: [" ", 'PetalLock functions only on Ethereum Mainnet. Please switch to Ethereum Mainnet.'] }) : _jsx(_Fragment, { children: " " }), checkBoxes.deepValue === undefined || checkBoxes.deepValue[0] === undefined || checkBoxes.deepValue[0].exists ? _jsx(_Fragment, {}) : _jsx("p", { style: 'color: #b43c42', children: `The name ${checkBoxes.deepValue[0].domainInfo.label} does not exist in the ENS registry. You need to register the domain to use PetalLock.` }), checkBoxes.value !== undefined ? _jsx(Immutable, { checkBoxesArray: checkBoxes.value }) : _jsx(_Fragment, {}), _jsx(Requirements, { checkBoxesArray: checkBoxes }), _jsx(Create, { contentHashInput: contentHashInput, handleContentHashInput: handleContentHashInput, resolutionAddressInput: resolutionAddressInput, handleResolutionAddressInput: handleResolutionAddressInput, loadingInfos: loadingInfos, immutable: immutable, maybeAccountAddress: maybeAccountAddress, checkBoxes: checkBoxes, updateInfos: updateInfos, creating: creating, areContractsDeployed: areContractsDeployed, extendYear: extendYear, extending: extending })] }), _jsxs("div", { class: 'text-white/50 text-center', children: [_jsxs("div", { class: 'mt-8', children: ["PetalLock by\u00A0", _jsx("a", { class: 'text-white hover:underline', href: 'https://dark.florist', children: "Dark Florist" })] }), _jsxs("div", { class: 'inline-grid', children: [_jsx("a", { class: 'text-white hover:underline', href: 'https://discord.gg/BeFnJA5Kjb', children: "Discord" }), _jsx("a", { class: 'text-white hover:underline', href: 'https://twitter.com/DarkFlorist', children: "Twitter" }), _jsx("a", { class: 'text-white hover:underline', href: 'https://github.com/DarkFlorist', children: "Github" })] })] })] });
}
//# sourceMappingURL=App.js.map