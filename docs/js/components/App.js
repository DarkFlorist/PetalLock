import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { requestAccounts, isValidEnsSubDomain, isChildOwnershipOwnedByOpenRenewManager, getAccounts, getDomainInfos, isPetalLockAndOpenRenewalManagerDeployed, getOpenRenewalManagerAddress, areRequiredFusesBurntWithoutApproval, isChildOwnershipGivenAway } from '../utils/ensUtils.js';
import { BigSpinner } from './Spinner.js';
import { ensureError } from '../utils/utilities.js';
import { Create, Immutable, Requirements } from './requirements.js';
import { useOptionalSignal } from '../utils/OptionalSignal.js';
import { getChainId } from '../utils/ensUtils.js';
const WalletComponent = ({ maybeAccountAddress, loadingAccount, isWindowEthereum }) => {
    if (!isWindowEthereum.value)
        return _jsx("p", { class: 'paragraph', children: " An Ethereum enabled wallet is required to make almost* immutable domains." });
    if (loadingAccount.value)
        return _jsx(_Fragment, {});
    const connect = async () => {
        maybeAccountAddress.deepValue = await requestAccounts();
    };
    return maybeAccountAddress.value !== undefined ? (_jsx("p", { style: 'color: gray; justify-self: right;', children: `Connected with ${maybeAccountAddress.value}` })) : (_jsx("button", { class: 'button is-primary', style: 'justify-self: right;', onClick: connect, children: `Connect wallet` }));
};
const LoadingSpinner = ({ loading }) => {
    if (loading === false)
        return _jsx(_Fragment, {});
    return _jsx("div", { style: 'max-width: fit-content; margin-inline: auto; padding: 20px;', children: _jsx(BigSpinner, {}) });
};
const ErrorComponent = (props) => {
    if (!('displayError' in props)) {
        if (props.message.value === undefined)
            return _jsx(_Fragment, {});
        return _jsxs("p", { class: 'error-component', children: [" ", props.message.value, " "] });
    }
    if (props.displayError === false)
        return _jsx(_Fragment, {});
    return _jsxs("p", { class: 'error-component', children: [" ", props.message, " "] });
};
const EnsRegistryError = ({ checkBoxes }) => {
    if (checkBoxes.deepValue === undefined || checkBoxes.deepValue[0] === undefined || checkBoxes.deepValue[0].exists)
        return _jsx(_Fragment, {});
    return _jsx("p", { style: 'color: #b43c42', children: `The name ${checkBoxes.deepValue[0].domainInfo.label} does not exist in the ENS registry. You need to register the domain to use PetalLock.` });
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
        errorString.deepValue = ensured.message;
    };
    const clear = () => {
        pathInfo.value = undefined;
        loadingInfos.value = false;
        checkBoxes.value = undefined;
        immutable.value = false;
    };
    const updateInfos = async (showLoading) => {
        const ensSubDomain = inputValue.value.toLowerCase();
        try {
            if (!isValidEnsSubDomain(ensSubDomain))
                return;
            if (loadingInfos.value)
                return; // already loading
            if (showLoading)
                loadingInfos.value = true;
            const newPathInfo = await getDomainInfos(maybeAccountAddress.deepValue, ensSubDomain);
            pathInfo.deepValue = newPathInfo;
            immutable.value = false;
            checkBoxes.deepValue = newPathInfo.map((currElement, index) => {
                const fusesBurned = areRequiredFusesBurntWithoutApproval(index, newPathInfo);
                const base = {
                    exists: currElement.registered,
                    isWrapped: currElement.isWrapped,
                    fusesBurned,
                    domainInfo: currElement,
                };
                if (index === newPathInfo.length - 1) {
                    immutable.value = currElement.isWrapped && fusesBurned && isChildOwnershipGivenAway(currElement);
                    return {
                        ...base,
                        type: 'finalChild',
                        ownershipOpenRenewalContract: isChildOwnershipOwnedByOpenRenewManager(currElement),
                        childOwnershipIsGivenAway: isChildOwnershipGivenAway(currElement),
                        immutable: immutable.value,
                        contentHashIsSet: currElement.contentHash !== '0x',
                        resolutionAddressIsSet: BigInt(currElement.resolutionAddress) !== 0n,
                    };
                }
                return {
                    ...base,
                    type: 'parent',
                    openRenewalContractIsApproved: currElement.approved === getOpenRenewalManagerAddress() && currElement.fuses.includes('Cannot Approve')
                };
            });
            errorString.value = undefined;
        }
        catch (e) {
            setError(e);
        }
        finally {
            loadingInfos.value = false;
            if (inputValue.value.toLowerCase() !== ensSubDomain)
                await updateInfos(showLoading);
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
                return setError(`${ensSubDomain} is not a valid ENS subdomain. The format should be similar to "2.horswap.eth" or "1.lunaria.darkflorist.eth".`);
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
    return _jsxs("main", { style: 'overflow: auto;', children: [_jsxs("div", { class: 'app', children: [_jsx(WalletComponent, { loadingAccount: loadingAccount, isWindowEthereum: isWindowEthereum, maybeAccountAddress: maybeAccountAddress }), _jsxs("div", { style: 'display: block', children: [_jsxs("div", { class: 'petal-lock', children: [_jsx("img", { src: 'favicon.svg', alt: 'Icon', style: 'width: 60px;' }), " PetalLock"] }), _jsx("p", { class: 'sub-title', children: "Make almost* immutable ENS domains and subdomains" })] }), _jsx("input", { class: 'input', type: 'text', style: 'width: 100%;', placeholder: '2.horswap.eth', value: inputValue.value, onInput: e => handleInput(e.currentTarget.value) }), _jsx(LoadingSpinner, { loading: loadingInfos.value === true || loadingAccount.value }), _jsx(ErrorComponent, { message: errorString }), _jsx(ErrorComponent, { displayError: chainId.value !== undefined && chainId.value !== 1, message: 'PetalLock functions only on Ethereum Mainnet. Please switch to Ethereum Mainnet.' }), _jsx(EnsRegistryError, { checkBoxes: checkBoxes }), _jsx(Immutable, { checkBoxesArray: checkBoxes }), _jsx(Requirements, { checkBoxesArray: checkBoxes }), _jsx(Create, { contentHashInput: contentHashInput, handleContentHashInput: handleContentHashInput, resolutionAddressInput: resolutionAddressInput, handleResolutionAddressInput: handleResolutionAddressInput, loadingInfos: loadingInfos, immutable: immutable, maybeAccountAddress: maybeAccountAddress, checkBoxes: checkBoxes, updateInfos: updateInfos, creating: creating, areContractsDeployed: areContractsDeployed, extendYear: extendYear, extending: extending })] }), _jsx("div", { class: 'text-white/50 text-center', children: _jsxs("p", { style: 'max-width: 700px;', children: ["*) There are two bugs in the Ethereum Name Service (ENS) that allow the ENS DAO to seize ENS names. These flaws make it impossible to create truly immutable names.", _jsx("br", {}), _jsx("a", { href: 'https://discuss.ens.domains/t/temp-check-executable-revoke-the-daos-ability-to-upgrade-the-name-wrapper/19920/8', children: "https://discuss.ens.domains/t/temp-check-executable-revoke-the-daos-ability-to-upgrade-the-name-wrapper/19920/8" })] }) }), _jsxs("div", { class: 'text-white/50 text-center', children: [_jsxs("div", { class: 'mt-8', children: ["PetalLock by\u00A0", _jsx("a", { class: 'text-white hover:underline', href: 'https://dark.florist', children: "Dark Florist" })] }), _jsxs("div", { class: 'inline-grid', children: [_jsx("a", { class: 'text-white hover:underline', href: 'https://discord.gg/BeFnJA5Kjb', children: "Discord" }), _jsx("a", { class: 'text-white hover:underline', href: 'https://twitter.com/DarkFlorist', children: "Twitter" }), _jsx("a", { class: 'text-white hover:underline', href: 'https://github.com/DarkFlorist', children: "Github" })] })] })] });
}
//# sourceMappingURL=App.js.map