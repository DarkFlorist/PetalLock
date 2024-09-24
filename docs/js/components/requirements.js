import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { computed, useSignal } from '@preact/signals';
import { ENS_TOKEN_WRAPPER } from '../utils/constants.js';
import { callPetalLock, deployPetalLockAndRenewalManager, getOpenRenewalManagerAddress, getRequiredFuses, renewDomainByYear, renewDomainToMax } from '../utils/ensUtils.js';
import { isSameAddress } from '../utils/utilities.js';
import { isValidContentHashString } from '../utils/contenthash.js';
import { Spinner } from './Spinner.js';
import { isAddress } from 'viem';
import { YearPicker } from './YearPicker.js';
export const SwitchAddress = ({ maybeSigningAddress, maybeAccountAddress, requirementsMet }) => {
    if (requirementsMet)
        return _jsx(_Fragment, {});
    if (maybeSigningAddress.value === undefined)
        return _jsx(_Fragment, {});
    if (BigInt(maybeSigningAddress.value) === 0n)
        return _jsx(_Fragment, {});
    if (isSameAddress(maybeAccountAddress.deepValue, maybeSigningAddress.value))
        return _jsx(_Fragment, {});
    return _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", ` - Switch to ${maybeSigningAddress} to sign`, " "] });
};
export const ChildRequirements = ({ checkBoxes, fuses }) => {
    return _jsxs(_Fragment, { children: [_jsxs("p", { class: 'subdomain-header', children: [checkBoxes.domainInfo.subDomain, " "] }), _jsxs("div", { class: 'grid-container', children: [_jsx(Requirement, { checked: checkBoxes.exists, primarytext: `${checkBoxes.domainInfo.subDomain} exists` }), _jsx(Requirement, { checked: checkBoxes.isWrapped, primarytext: `${checkBoxes.domainInfo.subDomain} is wrapped` }), _jsx(Requirement, { checked: checkBoxes.fusesBurned, primarytext: `${checkBoxes.domainInfo.subDomain} fuses are burnt`, secondaryText: `The fuses ${fuses.map((n) => `"${n}"`).join(', ')} are burnt` }), _jsx(Requirement, { checked: checkBoxes.ownershipOpenRenewalContract, primarytext: `${checkBoxes.domainInfo.subDomain} is owned by Open Renewal Contract`, secondaryText: 'The ownership of subdomain is moved to an Open Renewal Contract that allows anyone to renew the domain.' }), _jsx(Requirement, { checked: checkBoxes.contentHashIsSet || checkBoxes.resolutionAddressIsSet, primarytext: 'Content hash or address is set', secondaryText: 'Content hash or address should be set for the domain to be useful' })] })] });
};
export const ParentRequirements = ({ checkBoxes, fuses }) => {
    return _jsxs(_Fragment, { children: [_jsxs("p", { class: 'subdomain-header', children: [checkBoxes.domainInfo.subDomain, " "] }), _jsxs("div", { class: 'grid-container', children: [_jsx(Requirement, { checked: checkBoxes.exists, primarytext: `${checkBoxes.domainInfo.subDomain} exists` }), _jsx(Requirement, { checked: checkBoxes.isWrapped, primarytext: `${checkBoxes.domainInfo.subDomain} is wrapped` }), _jsx(Requirement, { checked: checkBoxes.fusesBurned, primarytext: `${checkBoxes.domainInfo.subDomain} fuses are burnt`, secondaryText: `The fuses ${fuses.map((n) => `"${n}"`).join(', ')} are burnt` }), _jsx(Requirement, { checked: checkBoxes.openRenewalContractIsApproved, primarytext: `${checkBoxes.domainInfo.subDomain} has approved Open Renewal Contract`, secondaryText: `Contract ${getOpenRenewalManagerAddress()} needs to be approved in order for anyone to be able to renew the name.` })] })] });
};
export const Requirements = ({ checkBoxesArray }) => {
    const allCheckBoxes = checkBoxesArray.deepValue;
    if (allCheckBoxes === undefined)
        return _jsx(_Fragment, {});
    return _jsxs("div", { class: 'grid-container-bordered', children: [" ", [...allCheckBoxes].reverse().map((check, index) => {
                const fuses = getRequiredFuses(index, allCheckBoxes.map((c) => c.domainInfo));
                if (check.type === 'parent')
                    return _jsx(ParentRequirements, { checkBoxes: check, fuses: fuses });
                return _jsx(ChildRequirements, { checkBoxes: check, fuses: fuses });
            }), " "] });
};
export const Requirement = ({ checked, primarytext, secondaryText }) => {
    return _jsx(_Fragment, { children: _jsx("div", { class: 'grid-item', style: 'justify-self: start', children: _jsxs("div", { style: 'display: grid; grid-template-rows: auto auto;', children: [_jsxs("label", { class: 'form-control', children: [_jsx("input", { type: 'checkbox', name: 'switch', class: 'check', checked: checked, disabled: true }), _jsxs("p", { class: 'paragraph checkbox-text requirement', children: [" ", primarytext, " "] })] }), secondaryText === undefined ? _jsx(_Fragment, {}) : _jsxs("p", { class: 'paragraph dim', style: 'padding-left: 10px;', children: [" ", secondaryText, " "] })] }) }) });
};
export const Immutable = ({ checkBoxesArray }) => {
    const checkBoxes = checkBoxesArray.value[checkBoxesArray.value.length - 1];
    if (checkBoxes === undefined || checkBoxes.type !== 'finalChild')
        return _jsx(_Fragment, {});
    return _jsxs("div", { children: [_jsx("div", { style: 'padding-top: 30px; padding-bottom: 30px; align-items: center; display: grid; width: 100%', children: checkBoxes.immutable ? _jsx(_Fragment, { children: _jsx("p", { class: 'status-green', children: `IMMUTABLE until ${checkBoxes.domainInfo.expiry.toISOString()}` }) }) : _jsx("p", { class: 'status-red', children: " NOT IMMUTABLE " }) }), checkBoxes.immutable ? _jsx(_Fragment, {}) : _jsxs("p", { style: 'margin: 0px; margin-bottom: 10px; padding-left: 10px;', class: 'requirement', children: [" ", checkBoxes.domainInfo.subDomain, " should satisfy the following conditions to be immutable: "] })] });
};
export const Create = ({ contentHashInput, resolutionAddressInput, loadingInfos, immutable, handleContentHashInput, handleResolutionAddressInput, maybeAccountAddress, checkBoxes, updateInfos, creating, areContractsDeployed, extendYear, extending }) => {
    const isYearValid = useSignal(true);
    if (checkBoxes.deepValue === undefined)
        return _jsx(_Fragment, {});
    const subDomain = checkBoxes.deepValue[checkBoxes.deepValue.length - 1]?.domainInfo.subDomain;
    if (subDomain === undefined)
        throw new Error('missing subdomain');
    const makeImmutable = async () => {
        const account = maybeAccountAddress.peek();
        if (account === undefined)
            throw new Error('missing maybeAccountAddress');
        if (checkBoxes.deepValue === undefined)
            return;
        try {
            creating.value = true;
            await callPetalLock(account.value, checkBoxes.deepValue.map((value) => value.domainInfo), contentHashInput.value.trim(), resolutionAddressInput.value.trim());
            await updateInfos(false);
        }
        catch (e) {
            throw e;
        }
        finally {
            creating.value = false;
        }
    };
    const deploy = async () => {
        const account = maybeAccountAddress.peek();
        if (account === undefined)
            throw new Error('missing maybeAccountAddress');
        await deployPetalLockAndRenewalManager(account.value);
        await updateInfos(false);
        areContractsDeployed.value = true;
    };
    const renewByYear = async () => {
        const account = maybeAccountAddress.peek();
        if (account === undefined)
            throw new Error('missing maybeAccountAddress');
        if (checkBoxes.deepValue === undefined)
            return;
        try {
            extending.value = true;
            await renewDomainByYear(account.value, extendYear.value, checkBoxes.deepValue.map((value) => value.domainInfo));
            await updateInfos(false);
        }
        finally {
            extending.value = false;
        }
    };
    const renewToMax = async () => {
        const account = maybeAccountAddress.peek();
        if (account === undefined)
            throw new Error('missing maybeAccountAddress');
        if (checkBoxes.deepValue === undefined)
            return;
        try {
            extending.value = true;
            await renewDomainToMax(account.value, checkBoxes.deepValue.map((value) => value.domainInfo));
            await updateInfos(false);
        }
        finally {
            extending.value = false;
        }
    };
    const maybeSigningAddress = computed(() => {
        if (checkBoxes.deepValue === undefined)
            return undefined;
        return checkBoxes.deepValue[0]?.domainInfo.owner;
    });
    const rightAddress = computed(() => isSameAddress(maybeSigningAddress.value, maybeAccountAddress.deepValue));
    const validContenthash = computed(() => isValidContentHashString(contentHashInput.value.trim()));
    const validResolutionAddress = computed(() => isAddress(resolutionAddressInput.value.trim()));
    const wrappedIssues = computed(() => {
        const nonWrappedTokens = checkBoxes.deepValue?.filter((x) => x.exists && !x.isWrapped);
        if (nonWrappedTokens === undefined || nonWrappedTokens.length === 0)
            return undefined;
        return ` - The domain${nonWrappedTokens.length > 1 ? 's' : ''}: ${nonWrappedTokens.map((token) => `"${token.domainInfo.subDomain}"`).join(', ')} need to be wrapped for PetalLock to function`;
    });
    const ownershipIssues = computed(() => {
        const managerAndOwners = checkBoxes.deepValue?.filter((x) => x.exists && x.isWrapped).map((x) => [x.domainInfo.owner, x.domainInfo.manager]);
        if (managerAndOwners === undefined || managerAndOwners.length === 0)
            return undefined;
        const unique = Array.from(new Set(managerAndOwners.flat().flat().filter((address) => address !== ENS_TOKEN_WRAPPER)));
        if (unique.length <= 1)
            return undefined;
        return ` - The domain${unique.length > 1 ? 's' : ''} need to be owned and managed by the same address. Currently they are managed by addresses: ${unique.join(', ')}`;
    });
    const domainExistIssue = computed(() => {
        const first = checkBoxes.deepValue ? checkBoxes.deepValue[0] : undefined;
        if (first === undefined || first.exists)
            return undefined;
        return ` - The domain ${first.domainInfo.subDomain} need to be created before you can use PetalLock to create immutable subdomains under it`;
    });
    const contentSetProperly = computed(() => {
        if (resolutionAddressInput.value.length === 0 && validContenthash.value)
            return true;
        if (contentHashInput.value.length === 0 && validResolutionAddress.value)
            return true;
        if (validContenthash.value && validResolutionAddress.value)
            return true;
        return false;
    });
    const level2DomainExpiryBiggerThanLowestLevelExpiry = computed(() => {
        if (checkBoxes.deepValue === undefined)
            return false;
        const first = checkBoxes.deepValue[0];
        const last = checkBoxes.deepValue[checkBoxes.deepValue.length - 1];
        if (first === undefined || last == undefined)
            return false;
        return first.domainInfo.expiry.toISOString() !== last.domainInfo.expiry.toISOString();
    });
    return _jsx(_Fragment, { children: _jsxs("div", { style: 'padding-top: 10px;', children: [!immutable.value ? _jsxs("div", { style: 'padding: 10px;', children: [_jsx("p", { style: 'white-space: nowrap; margin: 0; font-size: 24px; padding-bottom: 10px', children: `Make the domain immutable!` }), _jsxs("div", { style: 'display: grid; grid-template-columns: min-content auto; width: 100%; gap: 10px; padding-bottom: 10px;', children: [_jsx("p", { style: 'white-space: nowrap; margin: 0;', children: `Content hash:` }), _jsx("input", { style: 'height: fit-content;', class: 'input', type: 'text', width: '100%', placeholder: 'ipfs://bafy...', value: contentHashInput.value, onInput: e => handleContentHashInput(e.currentTarget.value) })] }), _jsxs("div", { style: 'display: grid; grid-template-columns: min-content auto; width: 100%; gap: 10px;', children: [_jsx("p", { style: 'white-space: nowrap; margin: 0;', children: `Resolution address:` }), _jsx("input", { style: 'height: fit-content;', class: 'input', type: 'text', width: '100%', placeholder: '0x...', value: resolutionAddressInput.value, onInput: e => handleResolutionAddressInput(e.currentTarget.value) })] })] }) : _jsx(_Fragment, {}), areContractsDeployed.value === false ? _jsxs(_Fragment, { children: [_jsx("p", { class: 'error-component', style: 'width: 100%; margin-left: 10px; text-align: center;', children: " PetalLock contract is not deployed. " }), _jsx("button", { class: 'button is-primary', onClick: deploy, children: " Deploy PetalLock contract" })] }) : _jsx(_Fragment, {}), immutable.value ? _jsxs("div", { class: 'extend-dialog', children: [_jsx("p", { style: 'white-space: nowrap; margin: 0; font-size: 24px; padding-bottom: 10px; justify-self: center;', children: `Renew ${subDomain}` }), _jsxs("div", { style: 'justify-content: center;', children: [_jsx("p", { style: 'font-size: 24px;', children: " Renew by\u00A0" }), " ", _jsx(YearPicker, { validYear: isYearValid, year: extendYear }), " ", _jsx("p", { style: 'font-size: 24px;', children: "\u00A0years " }), _jsxs("button", { style: 'font-size: 3em;', class: 'button is-primary', disabled: extending.value || !isYearValid.value, onClick: renewByYear, children: [" Renew ", extending.value ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] })] }), !level2DomainExpiryBiggerThanLowestLevelExpiry.value || checkBoxes.deepValue[0] === undefined ? _jsx(_Fragment, {}) : _jsxs(_Fragment, { children: [_jsx("div", { style: 'justify-content: center; font-size: 24px;', children: _jsx("p", { children: " OR " }) }), _jsxs("div", { style: 'justify-content: center;', children: [_jsx("p", { style: 'font-size: 24px;', children: `Renew without renewing ${checkBoxes.deepValue[0].domainInfo.subDomain}` }), _jsxs("button", { style: 'font-size: 3em;', class: 'button is-primary', disabled: extending.value, onClick: renewToMax, children: [" ", `Renew to ${checkBoxes.deepValue[0].domainInfo.expiry.toISOString().substring(0, 10)}`, " ", extending.value ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] })] })] })] }) : _jsxs(_Fragment, { children: [_jsxs("div", { style: 'padding: 10px; display: block;', children: [domainExistIssue.value === undefined ? _jsx(_Fragment, {}) : _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", domainExistIssue.value, " "] }), _jsx(SwitchAddress, { requirementsMet: loadingInfos.value, maybeAccountAddress: maybeAccountAddress, maybeSigningAddress: maybeSigningAddress }), validContenthash.value || contentHashInput.value.length == 0 ? _jsx(_Fragment, {}) : _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", ` - Content hash is not valid`, " "] }), validResolutionAddress.value || resolutionAddressInput.value.length == 0 ? _jsx(_Fragment, {}) : _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", ` - Resolution address is not a valid address`, " "] }), validContenthash.value || validResolutionAddress.value ? _jsx(_Fragment, {}) : _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", ` - Set content hash or resolution address or both`, " "] }), wrappedIssues.value === undefined ? _jsx(_Fragment, {}) : _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", wrappedIssues.value, " "] }), ownershipIssues.value === undefined ? _jsx(_Fragment, {}) : _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", ownershipIssues.value, " "] })] }), _jsxs("button", { style: 'font-size: 3em;', class: 'button is-primary', disabled: ownershipIssues.value !== undefined || wrappedIssues.value !== undefined || areContractsDeployed.value !== true || !contentSetProperly.value || !rightAddress.value || checkBoxes.deepValue === undefined || loadingInfos.value || immutable.value || creating.value, onClick: makeImmutable, children: [" Make immutable ", creating.value ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] })] })] }) });
};
//# sourceMappingURL=requirements.js.map