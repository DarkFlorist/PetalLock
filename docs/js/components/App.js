import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { requestAccounts, isValidEnsSubDomain, getDomainInfo, getSubstringAfterFirstPoint, doWeNeedToBurnParentFuses, doWeNeedToBurnChildFuses, isChildOwnershipBurned, burnParentFuses, burnChildFuses, transferChildOwnershipAway, getAccounts, wrapDomain, parentFuseToBurn, childFusesToBurn, getRightSigningAddress } from '../utils.js';
import { labelhash, namehash } from 'viem';
import { Spinner } from './Spinner.js';
import { ensureError, isSameAddress } from '../library/utilities.js';
const WalletComponent = ({ account }) => {
    const connect = async () => {
        account.value = await requestAccounts();
    };
    return account.value !== undefined ? (_jsx("p", { style: 'color: gray', children: `Connected with ${account.value}` })) : (_jsx("button", { class: 'button is-primary', onClick: connect, children: `Connect wallet` }));
};
export function App() {
    const inputValue = useSignal('');
    const errorString = useSignal(undefined);
    const loadingAccount = useSignal(true);
    const isWindowEthereum = useSignal(true);
    const account = useSignal(undefined);
    const parentDomainInfo = useSignal(undefined);
    const childDomainInfo = useSignal(undefined);
    const checkBoxes = useSignal(undefined);
    const pendingCheckBoxes = useSignal({
        parentWrapped: false,
        childWrapped: false,
        parentFusesBurned: false,
        childFusesBurned: false,
        childOwnershipBurned: false,
        immutable: false
    });
    const timeoutRef = useRef(null);
    const setError = (error) => {
        const ensured = ensureError(error);
        console.error(error);
        errorString.value = ensured.message;
    };
    const updateInfos = async () => {
        try {
            if (!isValidEnsSubDomain(inputValue.value))
                return;
            const ensSubDomain = inputValue.value;
            const ensParent = getSubstringAfterFirstPoint(ensSubDomain);
            const [ensLabel] = ensSubDomain.split('.');
            if (ensLabel === undefined)
                return;
            if (account.value === undefined)
                return;
            const childNameHash = namehash(ensSubDomain);
            const parentNameHash = namehash(ensParent);
            const childInfo = await getDomainInfo(account.value, childNameHash, inputValue.value, labelhash(inputValue.value.slice(0, inputValue.value.indexOf('.'))));
            const parentInfo = await getDomainInfo(account.value, parentNameHash, ensParent, labelhash(ensParent.slice(0, ensParent.indexOf('.'))));
            parentDomainInfo.value = parentInfo;
            childDomainInfo.value = childInfo;
            checkBoxes.value = {
                parentWrapped: parentInfo.isWrapped === true,
                childWrapped: childInfo.isWrapped === true,
                parentFusesBurned: !doWeNeedToBurnParentFuses(parentInfo),
                childFusesBurned: !doWeNeedToBurnChildFuses(childInfo),
                childOwnershipBurned: isChildOwnershipBurned(childInfo),
                immutable: parentInfo.isWrapped === true && childInfo.isWrapped === true && !doWeNeedToBurnParentFuses(parentInfo) && !doWeNeedToBurnChildFuses(childInfo) && isChildOwnershipBurned(childInfo)
            };
            errorString.value = undefined;
        }
        catch (e) {
            setError(e);
        }
    };
    function handleInput(value) {
        inputValue.value = value;
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            updateInfos();
            timeoutRef.current = null;
        }, 500);
    }
    useEffect(() => {
        if (window.ethereum === undefined) {
            isWindowEthereum.value = false;
            return;
        }
        isWindowEthereum.value = true;
        window.ethereum.on('accountsChanged', function (accounts) {
            account.value = accounts[0];
        });
        const fetchAccount = async () => {
            try {
                const fetchedAccount = await getAccounts();
                if (fetchedAccount)
                    account.value = fetchedAccount;
            }
            catch (e) {
                setError(e);
            }
            finally {
                loadingAccount.value = false;
            }
        };
        fetchAccount();
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    useEffect(() => { updateInfos(); }, [account.value]);
    const buttonWrapChild = async () => {
        try {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childWrapped: true };
            const acc = account.peek();
            if (acc === undefined)
                throw new Error('missing account');
            const childInfo = childDomainInfo.peek();
            if (childInfo === undefined)
                throw new Error('child info missing');
            await wrapDomain(acc, childInfo, true);
            await updateInfos();
        }
        catch (e) {
            setError(e);
        }
        finally {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childWrapped: false };
        }
    };
    const buttonWrapParent = async () => {
        try {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), parentWrapped: true };
            const acc = account.peek();
            if (acc === undefined)
                throw new Error('missing account');
            const parentInfo = parentDomainInfo.peek();
            if (parentInfo === undefined)
                throw new Error('parent info missing');
            await wrapDomain(acc, parentInfo, false);
            await updateInfos();
        }
        catch (e) {
            setError(e);
        }
        finally {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), parentWrapped: false };
        }
    };
    const buttonBurnParentFuses = async () => {
        try {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), parentFusesBurned: true };
            const acc = account.peek();
            if (acc === undefined)
                throw new Error('missing account');
            const parent = parentDomainInfo.peek();
            if (parent === undefined)
                throw new Error('parent info missing');
            await burnParentFuses(acc, parent);
            await updateInfos();
        }
        catch (e) {
            setError(e);
        }
        finally {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), parentFusesBurned: false };
        }
    };
    const buttonBurnChildFuses = async () => {
        try {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childFusesBurned: true };
            if (!isValidEnsSubDomain(inputValue.value))
                return;
            const acc = account.peek();
            if (acc === undefined)
                throw new Error('missing account');
            const parentInfo = parentDomainInfo.peek();
            if (parentInfo === undefined)
                throw new Error('parent info missing');
            const childInfo = childDomainInfo.peek();
            if (childInfo === undefined)
                throw new Error('child info missing');
            const ensSubDomain = inputValue.value;
            const [ensLabel] = ensSubDomain.split('.');
            if (ensLabel === undefined)
                return;
            if (account.value === undefined)
                return;
            await burnChildFuses(acc, ensLabel, childInfo, parentInfo);
            await updateInfos();
        }
        catch (e) {
            setError(e);
        }
        finally {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childFusesBurned: false };
        }
    };
    const buttonBurnChildOwnership = async () => {
        try {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childOwnershipBurned: true };
            const acc = account.peek();
            if (acc === undefined)
                throw new Error('missing account');
            const childInfo = childDomainInfo.peek();
            if (childInfo === undefined)
                throw new Error('child info missing');
            await transferChildOwnershipAway(acc, childInfo);
            await updateInfos();
        }
        catch (e) {
            setError(e);
        }
        finally {
            pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childOwnershipBurned: false };
        }
    };
    return _jsxs("main", { children: [_jsx("div", { style: 'padding: 80px' }), _jsxs("div", { class: 'app', children: [!loadingAccount.value && account.value !== undefined ? _jsx(WalletComponent, { account: account }) : _jsx(_Fragment, {}), !isWindowEthereum.value ? _jsx("p", { class: 'paragraph', style: 'color: #b43c42;', children: " An Ethereum enabled wallet is required to use PetalLock." }) : _jsx(_Fragment, {}), _jsxs("div", { style: 'display: block', children: [_jsxs("div", { class: 'petal-lock', children: [_jsx("img", { src: 'favicon.svg', alt: 'Icon', style: 'width: 60px;' }), " PetalLock"] }), _jsx("p", { class: 'sub-title', children: "Make immutable ENS subdomains" })] }), account.value !== undefined ? _jsx(_Fragment, { children: _jsx("input", { class: 'input', type: 'text', placeholder: '2.horswap.eth', value: inputValue.value, onInput: e => handleInput(e.currentTarget.value) }) }) : _jsx(_Fragment, {}), !loadingAccount.value && account.value === undefined ? _jsx(WalletComponent, { account: account }) : _jsx(_Fragment, {}), errorString.value !== undefined ? _jsxs("p", { style: 'color: #b43c42; word-break: break-all; white-space: break-spaces; border: 2px solid rgb(180, 60, 66); border-radius: 5px; padding: 10px;', children: [" ", errorString.value] }) : _jsx(_Fragment, { children: " " }), childDomainInfo.value === undefined || childDomainInfo.value.registered ? _jsx(_Fragment, {}) : _jsx("p", { style: 'color: #b43c42', children: `The name ${childDomainInfo.value.label} does not exist in the ENS registry. You need to register the domain to use PetalLock.` }), parentDomainInfo.value === undefined || parentDomainInfo.value.registered ? _jsx(_Fragment, {}) : _jsx("p", { style: 'color: #b43c42', children: `The name ${parentDomainInfo.value.label} does not exist in the ENS registry. You need to register the domain to use PetalLock.` }), childDomainInfo.value === undefined || parentDomainInfo.value === undefined || account.value === undefined || !childDomainInfo.value.registered || !parentDomainInfo.value.registered ? _jsx(_Fragment, {}) : _jsxs(_Fragment, { children: [checkBoxes.value?.immutable ? _jsxs("p", { class: 'status', style: 'color: #3cb371', children: [" ", `IMMUTABLE until ${new Date(Number(childDomainInfo.value.expiry) * 1000).toISOString()}`, " "] }) : _jsxs("p", { class: 'status', style: 'color: #b43c42', children: [" ", `${childDomainInfo.value.label} is NOT IMMUTABLE`, " "] }), checkBoxes.value?.immutable ? _jsx(_Fragment, {}) : _jsx("p", { style: 'color: gray', children: " Execute the following transactions with an account that owns both the parent and child name to make the name Immutable " }), _jsxs("div", { class: 'grid-container', children: [_jsx("div", { class: 'grid-item', style: 'justify-self: start', children: _jsxs("div", { style: 'display: grid; grid-template-rows: auto auto;', children: [_jsxs("label", { class: 'form-control', children: [_jsx("input", { type: 'checkbox', name: 'switch', class: 'check', checked: checkBoxes.value?.parentWrapped === true, disabled: true }), _jsxs("p", { class: 'paragraph checkbox-text', children: [" ", parentDomainInfo.value.label, " is wrapped "] })] }), !checkBoxes.value?.parentWrapped && !isSameAddress(account.value, getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value)) ? _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", `Switch to ${getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value)} to sign`, " "] }) : _jsx(_Fragment, {})] }) }), _jsx("div", { class: 'grid-item', style: 'justify-self: end', children: _jsxs("button", { class: 'button is-primary', ...!isSameAddress(account.value, getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.parentWrapped || pendingCheckBoxes.value.parentWrapped ? { disabled: true } : {}, onClick: buttonWrapParent, children: ["Wrap ", pendingCheckBoxes.value.parentWrapped ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] }) }), _jsx("div", { class: 'grid-item', style: 'justify-self: start', children: _jsxs("div", { style: 'display: grid; grid-template-rows: auto auto;', children: [_jsxs("label", { class: 'form-control', children: [_jsx("input", { type: 'checkbox', name: 'switch', class: 'check', checked: checkBoxes.value?.childWrapped === true, disabled: true }), _jsxs("p", { class: 'paragraph checkbox-text', children: [" ", childDomainInfo.value.label, " is wrapped "] })] }), _jsxs("p", { class: 'paragraph dim', children: [" ", `Requires approve all from the owner (asked if needed)`, " "] }), !checkBoxes.value?.childWrapped && !isSameAddress(account.value, getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value)) ? _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", `Switch to ${getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value)} to sign`, " "] }) : _jsx(_Fragment, {})] }) }), _jsx("div", { class: 'grid-item', style: 'justify-self: end', children: _jsxs("button", { class: 'button is-primary', ...!isSameAddress(account.value, getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.childWrapped || pendingCheckBoxes.value.childWrapped ? { disabled: true } : {}, onClick: buttonWrapChild, children: ["Wrap ", pendingCheckBoxes.value.childWrapped ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] }) }), _jsx("div", { class: 'grid-item', style: 'justify-self: start', children: _jsxs("div", { style: 'display: grid; grid-template-rows: auto auto;', children: [_jsxs("label", { class: 'form-control', children: [_jsx("input", { type: 'checkbox', name: 'switch', class: 'check', checked: checkBoxes.value?.parentFusesBurned === true, disabled: true }), _jsxs("p", { class: 'paragraph checkbox-text', children: [" ", parentDomainInfo.value.label, " fuses are burnt "] })] }), _jsxs("p", { class: 'paragraph dim', children: [" ", `The fuse "${parentFuseToBurn}" is burnt`, " "] }), !checkBoxes.value?.parentFusesBurned && !isSameAddress(account.value, getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value)) ? _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", `Switch to ${getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value)} to sign`, " "] }) : _jsx(_Fragment, {})] }) }), _jsx("div", { class: 'grid-item', style: 'justify-self: end', children: _jsxs("button", { class: 'button is-primary', ...!isSameAddress(account.value, getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.parentFusesBurned || pendingCheckBoxes.value.parentFusesBurned ? { disabled: true } : {}, onClick: buttonBurnParentFuses, children: ["Burn fuses ", pendingCheckBoxes.value.parentFusesBurned ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] }) }), _jsx("div", { class: 'grid-item', style: 'justify-self: start', children: _jsxs("div", { style: 'display: grid; grid-template-rows: auto auto;', children: [_jsxs("label", { class: 'form-control', children: [_jsx("input", { type: 'checkbox', name: 'switch', class: 'check', checked: checkBoxes.value?.childFusesBurned === true, disabled: true }), _jsxs("p", { class: 'paragraph checkbox-text', children: [" ", childDomainInfo.value.label, " fuses are burnt "] })] }), _jsxs("p", { class: 'paragraph dim', children: [" ", `The fuses ${childFusesToBurn.map((n) => `"${n}"`).join(', ')} are burnt`, " "] }), !checkBoxes.value?.childFusesBurned && !isSameAddress(account.value, getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value)) ? _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", `Switch to ${getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value)} to sign`, " "] }) : _jsx(_Fragment, {})] }) }), _jsx("div", { class: 'grid-item', style: 'justify-self: end', children: _jsxs("button", { class: 'button is-primary', ...!isSameAddress(account.value, getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.childFusesBurned || pendingCheckBoxes.value.childFusesBurned ? { disabled: true } : {}, onClick: buttonBurnChildFuses, children: ["Burn fuses ", pendingCheckBoxes.value.childFusesBurned ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] }) }), _jsx("div", { class: 'grid-item', style: 'justify-self: start', children: _jsxs("div", { style: 'display: grid; grid-template-rows: auto auto;', children: [_jsxs("label", { class: 'form-control', children: [_jsx("input", { type: 'checkbox', name: 'switch', class: 'check', checked: checkBoxes.value?.childOwnershipBurned === true, disabled: true }), _jsxs("p", { class: 'paragraph checkbox-text', children: [" ", childDomainInfo.value.label, " ownership is burnt "] })] }), _jsxs("p", { class: 'paragraph dim', children: [" ", `The ownership of subdomain is moved to an address controlled by nobody`, " "] }), !isSameAddress(account.value, getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value)) && !(pendingCheckBoxes.value.childOwnershipBurned || checkBoxes.value?.childOwnershipBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.parentWrapped || !checkBoxes.value?.childWrapped) ? _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", `Switch to ${getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value)} to sign`, " "] }) : _jsx(_Fragment, {})] }) }), _jsx("div", { class: 'grid-item', style: 'justify-self: end', children: _jsxs("button", { class: 'button is-primary', ...(!isSameAddress(account.value, getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value)) || pendingCheckBoxes.value.childOwnershipBurned || checkBoxes.value?.childOwnershipBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.parentWrapped || !checkBoxes.value?.childWrapped) ? { disabled: true } : {}, onClick: buttonBurnChildOwnership, children: ["Burn ownership ", pendingCheckBoxes.value.childOwnershipBurned ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] }) })] })] })] }), _jsxs("div", { class: 'text-white/50 text-center', children: [_jsxs("div", { class: 'mt-8', children: ["PetalLock by\u00A0", _jsx("a", { class: 'text-white hover:underline', href: 'https://dark.florist', children: "Dark Florist" })] }), _jsxs("div", { class: 'inline-grid', children: [_jsx("a", { class: 'text-white hover:underline', href: 'https://discord.gg/BeFnJA5Kjb', children: "Discord" }), _jsx("a", { class: 'text-white hover:underline', href: 'https://twitter.com/DarkFlorist', children: "Twitter" }), _jsx("a", { class: 'text-white hover:underline', href: 'https://github.com/DarkFlorist', children: "Github" })] })] })] });
}
//# sourceMappingURL=App.js.map