import { computed, Signal, useSignal } from '@preact/signals'
import { AccountAddress, CheckBoxes, EnsFuseName, FinalChildChecks, ParentChecks } from '../types/types.js'
import { callPetalLock, deployPetalLockAndRenewalManager, getOpenRenewalManagerAddress, getRequiredFusesWithoutApproval, renewDomainByYear, renewDomainToMax } from '../utils/ensUtils.js'
import { isSameAddress } from '../utils/utilities.js'
import { OptionalSignal } from '../utils/OptionalSignal.js'
import { isValidContentHashString } from '../utils/contenthash.js'
import { Spinner } from './Spinner.js'
import { isAddress } from 'viem'
import { YearPicker } from './YearPicker.js'
import { ENS_NAME_WRAPPER } from '../utils/constants.js'

interface SwitchAddressProps {
	maybeAccountAddress: OptionalSignal<AccountAddress>
	maybeSigningAddress: Signal<AccountAddress | undefined>
	requirementsMet: boolean
}

export const SwitchAddress = ({ maybeSigningAddress, maybeAccountAddress, requirementsMet }: SwitchAddressProps) => {
	if (requirementsMet) return <></>
	if (maybeSigningAddress.value === undefined) return <></>
	if (BigInt(maybeSigningAddress.value) === 0n) return <></>
	if (isSameAddress(maybeAccountAddress.deepValue, maybeSigningAddress.value) ) return <></>
	return <p class = 'paragraph' style = 'color: #b43c42'> { ` - Switch to ${ maybeSigningAddress } to sign` } </p>
}

const arrayToString = (array: readonly string[]) => array.map((n) => `"${ n }"`).join(', ')

const getFuseString = (alreadyBurntBuses: readonly EnsFuseName[], requiredFuses: readonly EnsFuseName[]) => {
	const fusesToBurnStill = requiredFuses.filter((fuse) => !alreadyBurntBuses.includes(fuse))
	if (alreadyBurntBuses.length === 0) return `The fuses ${ arrayToString(fusesToBurnStill) } need to be burnt`
	if (fusesToBurnStill.length === 0) return `Currently the fuses ${ arrayToString(alreadyBurntBuses) } are burnt`
	return `Currently the fuses ${ arrayToString(alreadyBurntBuses) } are burnt. It it still needed to burn following fuses: ${ arrayToString(fusesToBurnStill) }`
}

export const ChildRequirements = ( { checkBoxes, fuses } : { checkBoxes: FinalChildChecks, fuses: readonly EnsFuseName[] }) => {
	const fuseError = getFuseString(checkBoxes.domainInfo.fuses, fuses)
	return <>
		<p class = 'subdomain-header'>{ checkBoxes.domainInfo.subDomain } </p>
		<div class = 'grid-container'>
			<Requirement checked = { checkBoxes.exists } primarytext = { `${ checkBoxes.domainInfo.subDomain } exists` } />
			<Requirement checked = { checkBoxes.isWrapped } primarytext = { `${ checkBoxes.domainInfo.subDomain } is wrapped` } />
			<Requirement checked = { checkBoxes.fusesBurned } primarytext = { `${ checkBoxes.domainInfo.subDomain } fuses are burnt` } secondaryText = { fuseError } />
			<Requirement checked = { checkBoxes.childOwnershipIsGivenAway } primarytext = { 'The domain control is restricted' } secondaryText = 'The owner of the domain need to be burned or controlled by the Open Renewal Contract'/>
			<Requirement checked = { checkBoxes.ownershipOpenRenewalContract } primarytext = { `${ checkBoxes.domainInfo.subDomain } is owned by Open Renewal Contract` } secondaryText = 'The ownership of subdomain is moved to an Open Renewal Contract that allows anyone to renew the domain.'/>
			<Requirement checked = { checkBoxes.contentHashIsSet || checkBoxes.resolutionAddressIsSet } primarytext = { 'Content hash or address is set'} secondaryText = 'Content hash or address should be set for the domain to be useful'/>
		</div>
	</>
}

export const ParentRequirements = ( { checkBoxes, fuses } : { checkBoxes: ParentChecks, fuses: readonly EnsFuseName[] }) => {
	const fuseError = getFuseString(checkBoxes.domainInfo.fuses, fuses)
	return <>
		<p class = 'subdomain-header'>{ checkBoxes.domainInfo.subDomain } </p>
		<div class = 'grid-container'>
			<Requirement checked = { checkBoxes.exists } primarytext = { `${ checkBoxes.domainInfo.subDomain } exists` } />
			<Requirement checked = { checkBoxes.isWrapped } primarytext = { `${ checkBoxes.domainInfo.subDomain } is wrapped` } />
			<Requirement checked = { checkBoxes.fusesBurned } primarytext = { `${ checkBoxes.domainInfo.subDomain } fuses are burnt` } secondaryText = { fuseError } />
			<Requirement checked = { checkBoxes.openRenewalContractIsApproved } primarytext = { `${ checkBoxes.domainInfo.subDomain } has approved Open Renewal Contract` } secondaryText = { `Contract ${ getOpenRenewalManagerAddress() } needs to be approved and fuses "Cannot Approve" needs to be burned in order for anyone to be able to renew the name.` } />
		</div>
	</>
}

export const Requirements = ({ checkBoxesArray } : { checkBoxesArray: OptionalSignal<CheckBoxes> }) => {
	const allCheckBoxes = checkBoxesArray.deepValue
	if (allCheckBoxes === undefined) return <></>
	return <div class = 'grid-container-bordered'> { [...allCheckBoxes].reverse().map((check, index) => {
		const fuses = getRequiredFusesWithoutApproval(allCheckBoxes.length - index - 1, allCheckBoxes.map((c) => c.domainInfo))
		if (check.type === 'parent') return <ParentRequirements checkBoxes = { check } fuses = { fuses }/>
		return <ChildRequirements checkBoxes = { check } fuses = { fuses }/>
	}) } </div>
}

interface RequirementProps {
	primarytext: string,
	secondaryText?: string,
	checked: boolean,
}

export const Requirement = ({ checked, primarytext, secondaryText }: RequirementProps) => {
	return <>
		<div class = 'grid-item' style = 'justify-self: start'>
			<div style = 'display: grid; grid-template-rows: auto auto;'>
				<label class = 'form-control'>
					<input type = 'checkbox' name = 'switch' class = 'check' checked = { checked } disabled = { true }/>
					<p class = 'paragraph checkbox-text requirement'> { primarytext } </p>
				</label>
				{ secondaryText === undefined ? <></> : <p class = 'paragraph dim' style = 'padding-left: 10px;'> { secondaryText } </p> }
			</div>
		</div>
	</>
}

export const Immutable = ( { checkBoxesArray } : { checkBoxesArray: OptionalSignal<CheckBoxes> }) => {
	if (checkBoxesArray.deepValue === undefined) return <></>
	const checkBoxes = checkBoxesArray.deepValue[checkBoxesArray.deepValue.length - 1]
	if (checkBoxes === undefined || checkBoxes.type !== 'finalChild') return <></>
	return <div>
		<div style = 'padding-top: 30px; padding-bottom: 30px; align-items: center; display: grid; width: 100%'>
			{ checkBoxes.immutable ? <>
				<p class = 'status-green'>
					{`IMMUTABLE until ${ checkBoxes.domainInfo.expiry.toISOString() }` }
				</p>
			</>: <p class = 'status-red'> NOT IMMUTABLE </p> }
		</div>
		{ checkBoxes.immutable ? <></> : <p style = 'margin: 0px; margin-bottom: 10px; padding-left: 10px;' class = 'requirement'> { checkBoxes.domainInfo.subDomain } should satisfy the following conditions to be immutable: </p> }
	</div>
}

interface DeployProps {
	areContractsDeployed: Signal<boolean | undefined>
	deploy: () => void
}

export const DeployContract = ({ areContractsDeployed, deploy }: DeployProps) => {
	if (areContractsDeployed.value === false) return <>
		<p class = 'error-component' style = 'width: 100%; margin-left: 10px; text-align: center;'> PetalLock contract is not deployed. </p>
		<button class = 'button is-primary' onClick = { deploy }> Deploy PetalLock contract</button>
	</>
	return <></>
}

interface DisplayErrorStringIfNotUndefinedProps {
	maybeString: Signal<string | undefined>
}
const DisplayErrorStringIfNotUndefined = ({ maybeString }: DisplayErrorStringIfNotUndefinedProps) => {
	if (maybeString.value === undefined) return <></>
	return <p class = 'paragraph' style = 'color: #b43c42'> { maybeString.value } </p>
}

interface DisplayErrorStringIfVariableTrueProps {
	displayError: boolean
	message: string
}
const DisplayErrorStringIfVariableTrue = ({ message, displayError }: DisplayErrorStringIfVariableTrueProps) => {
	if (displayError === false) return <></>
	return <p class = 'paragraph' style = 'color: #b43c42'> { message } </p>
}

interface CreateProps {
	contentHashInput: Signal<string>
	handleContentHashInput: (input: string) => void
	resolutionAddressInput: Signal<string>
	handleResolutionAddressInput: (input: string) => void
	loadingInfos: Signal<boolean>
	immutable: Signal<boolean>
	maybeAccountAddress: OptionalSignal<AccountAddress>
	checkBoxes: OptionalSignal<CheckBoxes>
	updateInfos: (showLoading: boolean) => Promise<void>
	creating: Signal<boolean>
	areContractsDeployed: Signal<boolean | undefined>
	extendYear: Signal<number>
	extending: Signal<boolean>
}

export const Create = ( { contentHashInput, resolutionAddressInput, loadingInfos, immutable, handleContentHashInput, handleResolutionAddressInput, maybeAccountAddress, checkBoxes, updateInfos, creating, areContractsDeployed, extendYear, extending }: CreateProps) => {
	const isYearValid = useSignal<boolean>(true)

	const makeImmutable = async () => {
		const account = maybeAccountAddress.peek()
		if (account === undefined) throw new Error('missing maybeAccountAddress')
		if (checkBoxes.deepValue === undefined) return
		try {
			creating.value = true
			await callPetalLock(account.value, checkBoxes.deepValue.map((value) => value.domainInfo), contentHashInput.value.trim(), resolutionAddressInput.value.trim())
			await updateInfos(false)
		} catch(e) {
			throw e
		} finally {
			creating.value = false
		}
	}

	const deploy = async () => {
		const account = maybeAccountAddress.peek()
		if (account === undefined) throw new Error('missing maybeAccountAddress')
		await deployPetalLockAndRenewalManager(account.value)
		await updateInfos(false)
		areContractsDeployed.value = true
	}

	const renewByYear = async () => {
		const account = maybeAccountAddress.peek()
		if (account === undefined) throw new Error('missing maybeAccountAddress')
		if (checkBoxes.deepValue === undefined) return
		try {
			extending.value = true
			await renewDomainByYear(account.value, extendYear.value, checkBoxes.deepValue.map((value) => value.domainInfo))
			await updateInfos(false)
		} finally {
			extending.value = false
		}
	}

	const renewToMax = async () => {
		const account = maybeAccountAddress.peek()
		if (account === undefined) throw new Error('missing maybeAccountAddress')
		if (checkBoxes.deepValue === undefined) return
		try {
			extending.value = true
			await renewDomainToMax(account.value, checkBoxes.deepValue.map((value) => value.domainInfo))
			await updateInfos(false)
		} finally {
			extending.value = false
		}
	}

	const maybeSigningAddress = computed(() => {
		if (checkBoxes.deepValue === undefined) return undefined
		return checkBoxes.deepValue[0]?.domainInfo.owner
	})

	const rightAddress = computed(() => isSameAddress(maybeSigningAddress.value, maybeAccountAddress.deepValue))
	const validContenthash = computed(() => isValidContentHashString(contentHashInput.value.trim()))
	const validResolutionAddress = computed(() => isAddress(resolutionAddressInput.value.trim()))
	const wrappedIssues = computed(() => {
		const nonWrappedTokens = checkBoxes.deepValue?.filter((x) => x.exists && !x.isWrapped)
		if (nonWrappedTokens === undefined || nonWrappedTokens.length === 0) return undefined
		return ` - The domain${ nonWrappedTokens.length > 1 ? 's' : '' }: ${ nonWrappedTokens.map((token) => `"${ token.domainInfo.subDomain }"`).join(', ')} need to be wrapped for PetalLock to function`
	})
	const ownershipIssues = computed(() => {
		const managerAndOwners = checkBoxes.deepValue?.filter((x) => x.exists && x.isWrapped).map((x) => [x.domainInfo.owner, x.domainInfo.manager])
		if (managerAndOwners === undefined || managerAndOwners.length === 0) return undefined
		const unique = Array.from(new Set(managerAndOwners.flat().flat().filter((address) => address !== ENS_NAME_WRAPPER)))
		if (unique.length <= 1) return undefined
		return ` - The domain${ unique.length > 1 ? 's' : '' } need to be owned and managed by the same address. Currently they are managed by addresses: ${ unique.join(', ') }`
	})
	const domainExistIssue = computed(() => {
		const first = checkBoxes.deepValue?.at(0)
		if (first === undefined || first.exists) return undefined
		return ` - The domain ${ first.domainInfo.subDomain } need to be created before you can use PetalLock to create immutable subdomains under it`
	})
	const contentSetProperly = computed(() => {
		if (resolutionAddressInput.value.length === 0 && validContenthash.value) return true
		if (contentHashInput.value.length === 0 && validResolutionAddress.value) return true
		if (validContenthash.value && validResolutionAddress.value) return true
		return false
	})

	const level2DomainExpiryBiggerThanLowestLevelExpiry = computed(() => {
		if (checkBoxes.deepValue === undefined) return false
		const first = checkBoxes.deepValue[0]
		const last = checkBoxes.deepValue[checkBoxes.deepValue.length - 1]
		if (first === undefined || last == undefined) return false
		return first.domainInfo.expiry.toISOString() !== last.domainInfo.expiry.toISOString()
	})

	if (checkBoxes.deepValue === undefined) return <></>
	const finalChild = checkBoxes.deepValue[checkBoxes.deepValue.length - 1]
	const subDomain = finalChild?.domainInfo.subDomain
	if (subDomain === undefined) throw new Error('missing subdomain')
	return <div style = 'padding-top: 10px;'>
		{ immutable.value ? <div key = 'dialog' class = 'extend-dialog'>
			{ !(finalChild?.type === 'finalChild' && finalChild.ownershipOpenRenewalContract) ? <div style = 'justify-content: center;'> <p class = 'paragraph' style = 'color: #b43c42'> { `Warning: ${ subDomain } cannot be renewed. It will become mutable when expired.` } </p> </div>: <>
				<p style = 'white-space: nowrap; margin: 0; font-size: 24px; padding-bottom: 10px; justify-self: center;'>{ `Renew ${ subDomain }` }</p>
				<div style = 'justify-content: center;'>
					<p style = 'font-size: 24px;'> Renew by&nbsp;</p> <YearPicker validYear = { isYearValid } year = { extendYear }/> <p style = 'font-size: 24px;'>&nbsp;years </p>
					<button style = 'font-size: 3em;' class = 'button is-primary' disabled = { extending.value || !isYearValid.value } onClick = { renewByYear }> Renew { extending.value ? <Spinner/> : <></> }</button>
				</div>
				{ !level2DomainExpiryBiggerThanLowestLevelExpiry.value || checkBoxes.deepValue[0] === undefined ? <></> : <>
					<div style = 'justify-content: center; font-size: 24px;'>
						<p> OR </p>
					</div>
					<div style = 'justify-content: center;'>
						<p style = 'font-size: 24px;' >{ `Renew without renewing ${ checkBoxes.deepValue[0].domainInfo.subDomain }` }</p>
						<button style = 'font-size: 3em;' class = 'button is-primary' disabled = { extending.value } onClick = { renewToMax }> { `Renew to ${ checkBoxes.deepValue[0].domainInfo.expiry.toISOString().substring(0, 10) }` } { extending.value ? <Spinner/> : <></> }</button>
					</div>
				</> }
			</> }
		</div> : <div key = 'dialog'>
			<div style = 'padding: 10px;'>
				<p style = 'white-space: nowrap; margin: 0; font-size: 24px; padding-bottom: 10px'> Make the domain immutable! </p>
				<div style = 'display: grid; grid-template-columns: min-content auto; width: 100%; gap: 10px; padding-bottom: 10px;'>
					<p style = 'white-space: nowrap; margin: 0;'>{ `Content hash:` }</p>
					<input
						style = 'height: fit-content;'
						class = 'input'
						type = 'text'
						width = '100%'
						placeholder = 'ipfs://bafy...'
						value = { contentHashInput.value }
						onInput = { e => handleContentHashInput(e.currentTarget.value) }
					/>
				</div>
				<div style = 'display: grid; grid-template-columns: min-content auto; width: 100%; gap: 10px;'>
					<p style = 'white-space: nowrap; margin: 0;'> Resolution address: </p>
					<input
						style = 'height: fit-content;'
						class = 'input'
						type = 'text'
						width = '100%'
						placeholder = '0x...'
						value = { resolutionAddressInput.value }
						onInput = { e => handleResolutionAddressInput(e.currentTarget.value) }
					/>
				</div>
			</div>
			<div style = 'padding: 10px; display: block;' key = 'issues'>
				<DisplayErrorStringIfNotUndefined maybeString = { domainExistIssue } />
				<DisplayErrorStringIfVariableTrue displayError = { !(validContenthash.value || contentHashInput.value.length === 0) } message = ' - Content hash is not valid'/>
				<DisplayErrorStringIfVariableTrue displayError = { !(validResolutionAddress.value || resolutionAddressInput.value.length === 0) } message = ' - Resolution address is not a valid address'/>
				<DisplayErrorStringIfVariableTrue displayError = { !(validContenthash.value || validResolutionAddress.value) } message = ' - Set content hash or resolution address or both'/>
				<DisplayErrorStringIfNotUndefined maybeString = { wrappedIssues } />
				<DisplayErrorStringIfNotUndefined maybeString = { ownershipIssues } />
				<SwitchAddress requirementsMet = { loadingInfos.value } maybeAccountAddress = { maybeAccountAddress } maybeSigningAddress = { maybeSigningAddress }/>
			</div>
			<button style = 'font-size: 3em;' class = 'button is-primary' disabled = { ownershipIssues.value !== undefined || wrappedIssues.value !== undefined || areContractsDeployed.value !== true || !contentSetProperly.value || !rightAddress.value || checkBoxes.deepValue === undefined || loadingInfos.value || immutable.value || creating.value } onClick = { makeImmutable }> Make immutable { creating.value ? <Spinner/> : <></> }</button>
		</div> }
		<DeployContract areContractsDeployed = { areContractsDeployed } deploy = { deploy }/>
	</div>
}
