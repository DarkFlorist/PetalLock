import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { computed, useComputed, useSignal } from '@preact/signals';
import { callPetalLock, deployPetalLockAndRenewalManager, getOpenRenewalManagerAddress, getRequiredFusesWithoutApproval, renewDomainByYear, renewDomainToMax } from '../utils/ensUtils.js';
import { isSameAddress } from '../utils/utilities.js';
import { isValidContentHashString } from '../utils/contenthash.js';
import { Spinner } from './Spinner.js';
import { isAddress } from 'viem';
import { YearPicker } from './YearPicker.js';
import { ENS_NAME_WRAPPER } from '../utils/constants.js';
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
const arrayToString = (array) => array.map((n) => `"${n}"`).join(', ');
const getFuseString = (alreadyBurntBuses, requiredFuses) => {
    const fusesToBurnStill = requiredFuses.filter((fuse) => !alreadyBurntBuses.includes(fuse));
    if (alreadyBurntBuses.length === 0)
        return `The fuses ${arrayToString(fusesToBurnStill)} need to be burnt`;
    if (fusesToBurnStill.length === 0)
        return `Currently the fuses ${arrayToString(alreadyBurntBuses)} are burnt`;
    return `Currently the fuses ${arrayToString(alreadyBurntBuses)} are burnt. It it still needed to burn following fuses: ${arrayToString(fusesToBurnStill)}`;
};
export const ChildRequirements = ({ checkBoxes, fuses }) => {
    const fuseError = getFuseString(checkBoxes.domainInfo.fuses, fuses);
    return _jsxs(_Fragment, { children: [_jsxs("p", { class: 'subdomain-header', children: [checkBoxes.domainInfo.subDomain, " "] }), _jsxs("div", { class: 'grid-container', children: [_jsx(Requirement, { checked: checkBoxes.exists, primarytext: `${checkBoxes.domainInfo.subDomain} exists` }), _jsx(Requirement, { checked: checkBoxes.isWrapped, primarytext: `${checkBoxes.domainInfo.subDomain} is wrapped` }), _jsx(Requirement, { checked: checkBoxes.fusesBurned, primarytext: `${checkBoxes.domainInfo.subDomain} fuses are burnt`, secondaryText: fuseError }), _jsx(Requirement, { checked: checkBoxes.childOwnershipIsGivenAway, primarytext: 'The domain control is restricted', secondaryText: 'The owner of the domain need to be burned or controlled by the Open Renewal Contract' }), _jsx(Requirement, { checked: checkBoxes.ownershipOpenRenewalContract, primarytext: `${checkBoxes.domainInfo.subDomain} is owned by Open Renewal Contract (optional)`, secondaryText: 'The ownership of subdomain is moved to an Open Renewal Contract that allows anyone to renew the domain.' }), _jsx(Requirement, { checked: checkBoxes.contentHashIsSet || checkBoxes.resolutionAddressIsSet, primarytext: 'Content hash or address is set', secondaryText: 'Content hash or address should be set for the domain to be useful' })] })] });
};
export const ParentRequirements = ({ checkBoxes, fuses }) => {
    const fuseError = getFuseString(checkBoxes.domainInfo.fuses, fuses);
    return _jsxs(_Fragment, { children: [_jsxs("p", { class: 'subdomain-header', children: [checkBoxes.domainInfo.subDomain, " "] }), _jsxs("div", { class: 'grid-container', children: [_jsx(Requirement, { checked: checkBoxes.exists, primarytext: `${checkBoxes.domainInfo.subDomain} exists` }), _jsx(Requirement, { checked: checkBoxes.isWrapped, primarytext: `${checkBoxes.domainInfo.subDomain} is wrapped` }), _jsx(Requirement, { checked: checkBoxes.fusesBurned, primarytext: `${checkBoxes.domainInfo.subDomain} fuses are burnt`, secondaryText: fuseError }), _jsx(Requirement, { checked: checkBoxes.openRenewalContractIsApproved, primarytext: `${checkBoxes.domainInfo.subDomain} has approved Open Renewal Contract (optional)`, secondaryText: `Contract ${getOpenRenewalManagerAddress()} needs to be approved and fuses "Cannot Approve" needs to be burned in order for anyone to be able to renew the name.` })] })] });
};
export const EnsRequirements = () => {
    return _jsxs(_Fragment, { children: [_jsx("p", { class: 'subdomain-header', children: " Ethereum Name Service " }), _jsx("div", { class: 'grid-container', children: _jsx("div", { class: 'grid-item', style: 'justify-self: start', children: _jsx("div", { style: 'display: grid; grid-template-rows: auto auto;', children: _jsxs("label", { class: 'form-control', children: [_jsx("input", { type: 'checkbox', name: 'switch', class: 'check', checked: false, disabled: true }), _jsxs("p", { class: 'paragraph checkbox-text requirement', children: ["Convince ENS DAO to fix the bug reported in ", _jsx("a", { href: 'https://discuss.ens.domains/t/temp-check-executable-revoke-the-daos-ability-to-upgrade-the-name-wrapper/19920/8', children: "the-daos-ability-to-upgrade-the-name-wrapper" }), " so they cannot rug you."] })] }) }) }) })] });
};
export const Requirements = ({ checkBoxesArray }) => {
    const allCheckBoxes = checkBoxesArray.deepValue;
    if (allCheckBoxes === undefined)
        return _jsx(_Fragment, {});
    return _jsxs("div", { class: 'grid-container-bordered', children: [[...allCheckBoxes].reverse().map((check, index) => {
                const fuses = getRequiredFusesWithoutApproval(allCheckBoxes.length - index - 1, allCheckBoxes.map((c) => c.domainInfo));
                if (check.type === 'parent')
                    return _jsx(ParentRequirements, { checkBoxes: check, fuses: fuses });
                return _jsx(ChildRequirements, { checkBoxes: check, fuses: fuses });
            }), _jsx(EnsRequirements, {})] });
};
export const Requirement = ({ checked, primarytext, secondaryText }) => {
    return _jsx(_Fragment, { children: _jsx("div", { class: 'grid-item', style: 'justify-self: start', children: _jsxs("div", { style: 'display: grid; grid-template-rows: auto auto;', children: [_jsxs("label", { class: 'form-control', children: [_jsx("input", { type: 'checkbox', name: 'switch', class: 'check', checked: checked, disabled: true }), _jsxs("p", { class: 'paragraph checkbox-text requirement', children: [" ", primarytext, " "] })] }), secondaryText === undefined ? _jsx(_Fragment, {}) : _jsxs("p", { class: 'paragraph dim', style: 'padding-left: 10px;', children: [" ", secondaryText, " "] })] }) }) });
};
export const Immutable = ({ checkBoxesArray }) => {
    if (checkBoxesArray.deepValue === undefined)
        return _jsx(_Fragment, {});
    const checkBoxes = checkBoxesArray.deepValue[checkBoxesArray.deepValue.length - 1];
    if (checkBoxes === undefined || checkBoxes.type !== 'finalChild')
        return _jsx(_Fragment, {});
    function humanReadableDateDelta(secondsDiff) {
        const secondsInHour = 3600;
        const secondsInDay = secondsInHour * 24;
        const secondsInMonth = secondsInDay * 30;
        const secondsInYear = secondsInDay * 365;
        const years = Math.floor(secondsDiff / secondsInYear);
        secondsDiff %= secondsInYear;
        const months = Math.floor(secondsDiff / secondsInMonth);
        secondsDiff %= secondsInMonth;
        const days = Math.floor(secondsDiff / secondsInDay);
        const parts = [];
        if (years > 0)
            parts.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months > 0 && years <= 5)
            parts.push(`${months} month${months > 1 ? 's' : ''}`);
        if (days > 0 && years <= 2)
            parts.push(`${days} day${days > 1 ? 's' : ''}`);
        return parts.length > 0 ? parts.join(' ') : 'less than a day';
    }
    const dateDiff = computed(() => humanReadableDateDelta((checkBoxes.domainInfo.expiry.getTime() - new Date().getTime()) / 1000));
    const dateString = computed(() => checkBoxes.domainInfo.expiry.toISOString().substring(0, 10));
    return _jsxs("div", { children: [_jsx("div", { style: 'padding-top: 30px; padding-bottom: 30px; align-items: center; display: grid; width: 100%', children: checkBoxes.immutable ? _jsx(_Fragment, { children: _jsx("p", { class: 'status-green', children: `Almost* IMMUTABLE for about ${dateDiff} (until ${dateString})` }) }) : _jsx("p", { class: 'status-red', children: " NOT IMMUTABLE " }) }), checkBoxes.immutable ? _jsx(_Fragment, {}) : _jsxs("p", { style: 'margin: 0px; margin-bottom: 10px; padding-left: 10px;', class: 'requirement', children: [" ", checkBoxes.domainInfo.subDomain, " should satisfy the following conditions to be immutable: "] })] });
};
export const DeployContract = ({ areContractsDeployed, deploy }) => {
    if (areContractsDeployed.value === false)
        return _jsxs(_Fragment, { children: [_jsx("p", { class: 'error-component', style: 'width: 100%; margin-left: 10px; text-align: center;', children: " PetalLock contract is not deployed. " }), _jsx("button", { class: 'button is-primary', onClick: deploy, children: " Deploy PetalLock contract" })] });
    return _jsx(_Fragment, {});
};
const DisplayError = (props) => {
    if (!('displayError' in props)) {
        if (props.message.value === undefined)
            return _jsx(_Fragment, {});
        return _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", props.message.value, " "] });
    }
    if (props.displayError === false)
        return _jsx(_Fragment, {});
    return _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", props.message, " "] });
};
const ContentHashError = ({ contentHashInput, validContenthash }) => {
    if (validContenthash.value === true)
        return _jsx(_Fragment, {});
    if (contentHashInput.value.length === 0)
        return _jsx(_Fragment, {});
    const separator = contentHashInput.value.includes('://');
    if (separator === false)
        return _jsx(DisplayError, { displayError: true, message: ' - Content hash needs to include protocol and hash, eg ("ipfs://bafy...")' });
    return _jsx(DisplayError, { displayError: true, message: ' - Content hash is not valid' });
};
const ImmutableDomain = ({ checkBoxes, extendYear, extending, maybeAccountAddress, updateInfos }) => {
    const isYearValid = useSignal(true);
    if (checkBoxes.deepValue === undefined)
        return _jsx(_Fragment, {});
    const level2DomainExpiryBiggerThanLowestLevelExpiry = computed(() => {
        if (checkBoxes.deepValue === undefined)
            return false;
        const first = checkBoxes.deepValue[0];
        const last = checkBoxes.deepValue[checkBoxes.deepValue.length - 1];
        if (first === undefined || last == undefined)
            return false;
        return first.domainInfo.expiry.toISOString() !== last.domainInfo.expiry.toISOString();
    });
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
    const finalChild = checkBoxes.deepValue[checkBoxes.deepValue.length - 1];
    const subDomain = finalChild?.domainInfo.subDomain;
    if (subDomain === undefined)
        throw new Error('missing subdomain');
    return _jsx("div", { class: 'extend-dialog', children: !(finalChild?.type === 'finalChild' && finalChild.ownershipOpenRenewalContract) ? _jsxs("div", { style: 'justify-content: center;', children: [" ", _jsxs("p", { class: 'paragraph', style: 'color: #b43c42', children: [" ", `Warning: ${subDomain} cannot be renewed. It will become mutable when expired.`, " "] }), " "] }) : _jsxs(_Fragment, { children: [_jsx("p", { style: 'white-space: nowrap; margin: 0; font-size: 24px; padding-bottom: 10px; justify-self: center;', children: `Renew ${subDomain}` }), _jsxs("div", { style: 'justify-content: center;', children: [_jsx("p", { style: 'font-size: 24px;', children: " Renew by\u00A0" }), " ", _jsx(YearPicker, { validYear: isYearValid, year: extendYear }), " ", _jsx("p", { style: 'font-size: 24px;', children: "\u00A0years " }), _jsxs("button", { style: 'font-size: 3em;', class: 'button is-primary', disabled: extending.value || !isYearValid.value, onClick: renewByYear, children: [" Renew ", extending.value ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] })] }), !level2DomainExpiryBiggerThanLowestLevelExpiry.value || checkBoxes.deepValue[0] === undefined ? _jsx(_Fragment, {}) : _jsxs(_Fragment, { children: [_jsx("div", { style: 'justify-content: center; font-size: 24px;', children: _jsx("p", { children: " OR " }) }), _jsxs("div", { style: 'justify-content: center;', children: [_jsx("p", { style: 'font-size: 24px;', children: `Renew without renewing ${checkBoxes.deepValue[0].domainInfo.subDomain}` }), _jsxs("button", { style: 'font-size: 3em;', class: 'button is-primary', disabled: extending.value, onClick: renewToMax, children: [" ", `Renew to ${checkBoxes.deepValue[0].domainInfo.expiry.toISOString().substring(0, 10)}`, " ", extending.value ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] })] })] })] }) }, 'dialog');
};
const NonImmutableDomain = ({ checkBoxes, maybeAccountAddress, updateInfos, creating, contentHashInput, resolutionAddressInput, handleContentHashInput, handleResolutionAddressInput, loadingInfos, areContractsDeployed }) => {
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
    const maybeSigningAddress = useComputed(() => {
        if (checkBoxes.deepValue === undefined)
            return undefined;
        return checkBoxes.deepValue[0]?.domainInfo.owner;
    });
    const rightAddress = useComputed(() => isSameAddress(maybeSigningAddress.value, maybeAccountAddress.deepValue));
    const validContenthash = useComputed(() => isValidContentHashString(contentHashInput.value.trim()));
    const validResolutionAddress = useComputed(() => isAddress(resolutionAddressInput.value.trim()));
    const wrappedIssues = useComputed(() => {
        const nonWrappedTokens = checkBoxes.deepValue?.filter((x) => x.exists && !x.isWrapped);
        if (nonWrappedTokens === undefined || nonWrappedTokens.length === 0)
            return undefined;
        return ` - The domain${nonWrappedTokens.length > 1 ? 's' : ''}: ${nonWrappedTokens.map((token) => `"${token.domainInfo.subDomain}"`).join(', ')} need to be wrapped for PetalLock to function`;
    });
    const ownershipIssues = useComputed(() => {
        const managerAndOwners = checkBoxes.deepValue?.filter((x) => x.exists && x.isWrapped).map((x) => [x.domainInfo.owner, x.domainInfo.manager]);
        if (managerAndOwners === undefined || managerAndOwners.length === 0)
            return undefined;
        const unique = Array.from(new Set(managerAndOwners.flat().flat().filter((address) => address !== ENS_NAME_WRAPPER)));
        if (unique.length <= 1)
            return undefined;
        return ` - The domain${unique.length > 1 ? 's' : ''} need to be owned and managed by the same address. Currently they are managed by addresses: ${unique.join(', ')}`;
    });
    const domainExistIssue = useComputed(() => {
        const first = checkBoxes.deepValue?.at(0);
        if (first === undefined || first.exists)
            return undefined;
        return ` - The domain ${first.domainInfo.subDomain} need to be created before you can use PetalLock to create almost* immutable subdomains under it`;
    });
    const contentSetProperly = useComputed(() => {
        if (resolutionAddressInput.value.length === 0 && validContenthash.value)
            return true;
        if (contentHashInput.value.length === 0 && validResolutionAddress.value)
            return true;
        if (validContenthash.value && validResolutionAddress.value)
            return true;
        return false;
    });
    return _jsxs("div", { style: 'width: 100%', children: [_jsxs("div", { style: 'padding: 10px; width: 100%', children: [_jsx("p", { style: 'margin: 0; font-size: 24px; padding-bottom: 10px', children: " Make the domain almost* immutable! " }), _jsxs("div", { style: 'display: grid; width: 100%; gap: 10px; padding-bottom: 10px;', children: [_jsx("p", { style: 'margin: 0;', children: `Content hash:` }), _jsx("input", { style: 'height: fit-content;', class: 'input', type: 'text', width: '100%', placeholder: 'ipfs://bafy...', value: contentHashInput.value, onInput: e => handleContentHashInput(e.currentTarget.value) })] }), _jsxs("div", { style: 'display: grid; width: 100%; gap: 10px;', children: [_jsx("p", { style: 'margin: 0;', children: " Resolution address: " }), _jsx("input", { style: 'height: fit-content;', class: 'input', type: 'text', width: '100%', placeholder: '0x...', value: resolutionAddressInput.value, onInput: e => handleResolutionAddressInput(e.currentTarget.value) })] })] }), _jsxs("div", { style: 'padding: 10px; width: 100%;', children: [_jsx(DisplayError, { message: domainExistIssue }), _jsx(ContentHashError, { validContenthash: validContenthash, contentHashInput: contentHashInput }), _jsx(DisplayError, { displayError: !(validResolutionAddress.value || resolutionAddressInput.value.length === 0), message: ' - Resolution address is not a valid address' }), _jsx(DisplayError, { displayError: !(validContenthash.value || validResolutionAddress.value), message: ' - Set content hash or resolution address or both' }), _jsx(DisplayError, { message: wrappedIssues }), _jsx(DisplayError, { message: ownershipIssues }), _jsx(SwitchAddress, { requirementsMet: loadingInfos.value, maybeAccountAddress: maybeAccountAddress, maybeSigningAddress: maybeSigningAddress })] }, 'issues'), _jsxs("button", { style: 'font-size: 3em;', class: 'button is-primary', disabled: ownershipIssues.value !== undefined || wrappedIssues.value !== undefined || areContractsDeployed.value !== true || !contentSetProperly.value || !rightAddress.value || checkBoxes.deepValue === undefined || loadingInfos.value || creating.value, onClick: makeImmutable, children: [" Make almost* immutable ", creating.value ? _jsx(Spinner, {}) : _jsx(_Fragment, {})] })] }, 'dialog');
};
export const Create = ({ contentHashInput, resolutionAddressInput, loadingInfos, immutable, handleContentHashInput, handleResolutionAddressInput, maybeAccountAddress, checkBoxes, updateInfos, creating, areContractsDeployed, extendYear, extending }) => {
    const deploy = async () => {
        const account = maybeAccountAddress.peek();
        if (account === undefined)
            throw new Error('missing maybeAccountAddress');
        await deployPetalLockAndRenewalManager(account.value);
        await updateInfos(false);
        areContractsDeployed.value = true;
    };
    if (checkBoxes.deepValue === undefined)
        return _jsx(_Fragment, {});
    const finalChild = checkBoxes.deepValue[checkBoxes.deepValue.length - 1];
    const subDomain = finalChild?.domainInfo.subDomain;
    if (subDomain === undefined)
        throw new Error('missing subdomain');
    return _jsxs("div", { style: 'padding-top: 10px; width: 100%', children: [immutable.value ? _jsx(ImmutableDomain, { checkBoxes: checkBoxes, extendYear: extendYear, extending: extending, maybeAccountAddress: maybeAccountAddress, updateInfos: updateInfos }) : _jsx(NonImmutableDomain, { maybeAccountAddress: maybeAccountAddress, resolutionAddressInput: resolutionAddressInput, checkBoxes: checkBoxes, updateInfos: updateInfos, creating: creating, contentHashInput: contentHashInput, handleContentHashInput: handleContentHashInput, handleResolutionAddressInput: handleResolutionAddressInput, loadingInfos: loadingInfos, areContractsDeployed: areContractsDeployed }), _jsx(DeployContract, { areContractsDeployed: areContractsDeployed, deploy: deploy })] });
};
//# sourceMappingURL=requirements.js.map