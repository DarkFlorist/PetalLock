import { computed, ReadonlySignal, Signal, useComputed, useSignal } from '@preact/signals'
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
			<Requirement checked = { checkBoxes.ownershipOpenRenewalContract } primarytext = { `${ checkBoxes.domainInfo.subDomain } is owned by Open Renewal Contract (optional)` } secondaryText = 'The ownership of subdomain is moved to an Open Renewal Contract that allows anyone to renew the domain.'/>
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
			<Requirement checked = { checkBoxes.openRenewalContractIsApproved } primarytext = { `${ checkBoxes.domainInfo.subDomain } has approved Open Renewal Contract (optional)` } secondaryText = { `Contract ${ getOpenRenewalManagerAddress() } needs to be approved and fuses "Cannot Approve" needs to be burned in order for anyone to be able to renew the name.` } />
		</div>
	</>
}

export const EnsRequirements = () => {
	return <>
		<p class = 'subdomain-header'> Ethereum Name Service </p>
		<div class = 'grid-container'>
			<div class = 'grid-item' style = 'justify-self: start'>
				<div style = 'display: grid; grid-template-rows: auto auto;'>
					<label class = 'form-control'>
						<input type = 'checkbox' name = 'switch' class = 'check' checked = { false } disabled = { true }/>
						<p class = 'paragraph checkbox-text requirement'>
							Convince ENS DAO to fix the bug reported <a href = 'https://discuss.ens.domains/t/temp-check-executable-revoke-the-daos-ability-to-upgrade-the-name-wrapper/19920/8'>the-daos-ability-to-upgrade-the-name-wrapper</a> so they cannot rug you.
						</p>
					</label>
				</div>
			</div>
		</div>
	</>
}


export const Requirements = ({ checkBoxesArray } : { checkBoxesArray: OptionalSignal<CheckBoxes> }) => {
	const allCheckBoxes = checkBoxesArray.deepValue
	if (allCheckBoxes === undefined) return <></>
	return <div class = 'grid-container-bordered'> <>
		{ [...allCheckBoxes].reverse().map((check, index) => {
			const fuses = getRequiredFusesWithoutApproval(allCheckBoxes.length - index - 1, allCheckBoxes.map((c) => c.domainInfo))
			if (check.type === 'parent') return <ParentRequirements checkBoxes = { check } fuses = { fuses }/>
			return <ChildRequirements checkBoxes = { check } fuses = { fuses }/>
		}) }
		<EnsRequirements/>
	</></div>
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

	function humanReadableDateDelta(secondsDiff: number) {
		const secondsInHour = 3600
		const secondsInDay = secondsInHour * 24
		const secondsInMonth = secondsInDay * 30
		const secondsInYear = secondsInDay * 365

		const years = Math.floor(secondsDiff / secondsInYear)
		secondsDiff %= secondsInYear

		const months = Math.floor(secondsDiff / secondsInMonth)
		secondsDiff %= secondsInMonth

		const days = Math.floor(secondsDiff / secondsInDay)

		const parts: string[] = []
		if (years > 0) parts.push(`${ years } year${ years > 1 ? 's' : '' }`)
		if (months > 0 && years <= 5) parts.push(`${ months } month${ months > 1 ? 's' : '' }`)
		if (days > 0 && years <= 2) parts.push(`${ days } day${ days > 1 ? 's' : '' }`)

		return parts.length > 0 ? parts.join(' ') : 'less than a day'
	}
	const dateDiff = computed(() => humanReadableDateDelta((checkBoxes.domainInfo.expiry.getTime() - new Date().getTime()) / 1000))
	const dateString = computed(() => checkBoxes.domainInfo.expiry.toISOString().substring(0, 10))

	return <div>
		<div style = 'padding-top: 30px; padding-bottom: 30px; align-items: center; display: grid; width: 100%'>
			{ checkBoxes.immutable ? <>
				<p class = 'status-green'>
					{`IMMUTABLE* for about ${ dateDiff } (until ${ dateString })` }
				</p>
			</>: <p class = 'status-red'> NOT IMMUTABLE </p> }
		</div>
		{ checkBoxes.immutable ? <></> : <p style = 'margin: 0px; margin-bottom: 10px; padding-left: 10px;' class = 'requirement'> { checkBoxes.domainInfo.subDomain } should satisfy the following conditions to be immutable*: </p> }
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

type DisplayErrorProps  = { displayError: boolean, message: string } | { message: OptionalSignal<string> | ReadonlySignal<string | undefined> }
const DisplayError = (props: DisplayErrorProps) => {
	if (!('displayError' in props)) {
		if (props.message.value === undefined) return <></>
		return <p class = 'paragraph' style = 'color: #b43c42'> { props.message.value } </p>
	}
	if (props.displayError === false) return <></>
	return <p class = 'paragraph' style = 'color: #b43c42'> { props.message } </p>
}

interface ContentHashErrorProps {
	contentHashInput: Signal<string>
	validContenthash: ReadonlySignal<boolean>
}
const ContentHashError = ({ contentHashInput, validContenthash }: ContentHashErrorProps) => {
	if (validContenthash.value === true) return <></>
	if (contentHashInput.value.length === 0) return <></>
	const separator = contentHashInput.value.includes('://')
	if (separator === false) return <DisplayError displayError = { true } message = ' - Content hash needs to include protocol and hash, eg ("ipfs://bafy...")'/>
	return <DisplayError displayError = { true } message = ' - Content hash is not valid'/>
}

interface ImmutableDomainProps {
	checkBoxes: OptionalSignal<CheckBoxes>
	extendYear: Signal<number>
	extending: Signal<boolean>
	maybeAccountAddress: OptionalSignal<AccountAddress>
	updateInfos: (showLoading: boolean) => Promise<void>
}

const ImmutableDomain = ({ checkBoxes, extendYear, extending, maybeAccountAddress, updateInfos }: ImmutableDomainProps) => {
	const isYearValid = useSignal<boolean>(true)
	if (checkBoxes.deepValue === undefined) return <></>
	const level2DomainExpiryBiggerThanLowestLevelExpiry = computed(() => {
		if (checkBoxes.deepValue === undefined) return false
		const first = checkBoxes.deepValue[0]
		const last = checkBoxes.deepValue[checkBoxes.deepValue.length - 1]
		if (first === undefined || last == undefined) return false
		return first.domainInfo.expiry.toISOString() !== last.domainInfo.expiry.toISOString()
	})

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

	const finalChild = checkBoxes.deepValue[checkBoxes.deepValue.length - 1]
	const subDomain = finalChild?.domainInfo.subDomain
	if (subDomain === undefined) throw new Error('missing subdomain')
	return <div key = 'dialog' class = 'extend-dialog'>
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
	</div>
}

interface NonImmutableDomainProps {
	maybeAccountAddress: OptionalSignal<AccountAddress>
	resolutionAddressInput: Signal<string>
	checkBoxes: OptionalSignal<CheckBoxes>
	updateInfos: (showLoading: boolean) => Promise<void>
	creating: Signal<boolean>
	contentHashInput: Signal<string>
	handleContentHashInput: (input: string) => void
	handleResolutionAddressInput: (input: string) => void
	loadingInfos: Signal<boolean>
	areContractsDeployed: Signal<boolean | undefined>
}

const NonImmutableDomain = ({ checkBoxes, maybeAccountAddress, updateInfos, creating, contentHashInput, resolutionAddressInput, handleContentHashInput, handleResolutionAddressInput, loadingInfos, areContractsDeployed }: NonImmutableDomainProps) => {
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

	const maybeSigningAddress = useComputed(() => {
		if (checkBoxes.deepValue === undefined) return undefined
		return checkBoxes.deepValue[0]?.domainInfo.owner
	})

	const rightAddress = useComputed(() => isSameAddress(maybeSigningAddress.value, maybeAccountAddress.deepValue))
	const validContenthash = useComputed(() => isValidContentHashString(contentHashInput.value.trim()))
	const validResolutionAddress = useComputed(() => isAddress(resolutionAddressInput.value.trim()))

	const wrappedIssues = useComputed(() => {
		const nonWrappedTokens = checkBoxes.deepValue?.filter((x) => x.exists && !x.isWrapped)
		if (nonWrappedTokens === undefined || nonWrappedTokens.length === 0) return undefined
		return ` - The domain${ nonWrappedTokens.length > 1 ? 's' : '' }: ${ nonWrappedTokens.map((token) => `"${ token.domainInfo.subDomain }"`).join(', ')} need to be wrapped for PetalLock to function`
	})
	const ownershipIssues = useComputed(() => {
		const managerAndOwners = checkBoxes.deepValue?.filter((x) => x.exists && x.isWrapped).map((x) => [x.domainInfo.owner, x.domainInfo.manager])
		if (managerAndOwners === undefined || managerAndOwners.length === 0) return undefined
		const unique = Array.from(new Set(managerAndOwners.flat().flat().filter((address) => address !== ENS_NAME_WRAPPER)))
		if (unique.length <= 1) return undefined
		return ` - The domain${ unique.length > 1 ? 's' : '' } need to be owned and managed by the same address. Currently they are managed by addresses: ${ unique.join(', ') }`
	})
	const domainExistIssue = useComputed(() => {
		const first = checkBoxes.deepValue?.at(0)
		if (first === undefined || first.exists) return undefined
		return ` - The domain ${ first.domainInfo.subDomain } need to be created before you can use PetalLock to create immutable* subdomains under it`
	})
	const contentSetProperly = useComputed(() => {
		if (resolutionAddressInput.value.length === 0 && validContenthash.value) return true
		if (contentHashInput.value.length === 0 && validResolutionAddress.value) return true
		if (validContenthash.value && validResolutionAddress.value) return true
		return false
	})

	return <div key = 'dialog' style = 'width: 100%'>
		<div style = 'padding: 10px; width: 100%'>
			<p style = 'margin: 0; font-size: 24px; padding-bottom: 10px'> Make the domain immutable*! </p>
			<div style = 'display: grid; width: 100%; gap: 10px; padding-bottom: 10px;'>
				<p style = 'margin: 0;'>{ `Content hash:` }</p>
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
			<div style = 'display: grid; width: 100%; gap: 10px;'>
				<p style = 'margin: 0;'> Resolution address: </p>
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
		<div style = 'padding: 10px; width: 100%;' key = 'issues'>
			<DisplayError message = { domainExistIssue } />
			<ContentHashError validContenthash = { validContenthash } contentHashInput = { contentHashInput }/>
			<DisplayError displayError = { !(validResolutionAddress.value || resolutionAddressInput.value.length === 0) } message = ' - Resolution address is not a valid address'/>
			<DisplayError displayError = { !(validContenthash.value || validResolutionAddress.value) } message = ' - Set content hash or resolution address or both'/>
			<DisplayError message = { wrappedIssues } />
			<DisplayError message = { ownershipIssues } />
			<SwitchAddress requirementsMet = { loadingInfos.value } maybeAccountAddress = { maybeAccountAddress } maybeSigningAddress = { maybeSigningAddress }/>
		</div>
		<button style = 'font-size: 3em;' class = 'button is-primary' disabled = { ownershipIssues.value !== undefined || wrappedIssues.value !== undefined || areContractsDeployed.value !== true || !contentSetProperly.value || !rightAddress.value || checkBoxes.deepValue === undefined || loadingInfos.value || creating.value } onClick = { makeImmutable }> Make immutable* { creating.value ? <Spinner/> : <></> }</button>
	</div>
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
	const deploy = async () => {
		const account = maybeAccountAddress.peek()
		if (account === undefined) throw new Error('missing maybeAccountAddress')
		await deployPetalLockAndRenewalManager(account.value)
		await updateInfos(false)
		areContractsDeployed.value = true
	}

	if (checkBoxes.deepValue === undefined) return <></>
	const finalChild = checkBoxes.deepValue[checkBoxes.deepValue.length - 1]
	const subDomain = finalChild?.domainInfo.subDomain
	if (subDomain === undefined) throw new Error('missing subdomain')
	return <div style = 'padding-top: 10px; width: 100%'>
		{ immutable.value ? <ImmutableDomain
			checkBoxes = { checkBoxes }
			extendYear = { extendYear }
			extending = { extending }
			maybeAccountAddress = { maybeAccountAddress }
			updateInfos = { updateInfos }
		/> : <NonImmutableDomain
			maybeAccountAddress = { maybeAccountAddress }
			resolutionAddressInput = { resolutionAddressInput }
			checkBoxes = { checkBoxes }
			updateInfos = { updateInfos }
			creating = { creating }
			contentHashInput = { contentHashInput }
			handleContentHashInput = { handleContentHashInput }
			handleResolutionAddressInput = { handleResolutionAddressInput }
			loadingInfos = { loadingInfos }
			areContractsDeployed = { areContractsDeployed }
		/> }
		<DeployContract areContractsDeployed = { areContractsDeployed } deploy = { deploy }/>
	</div>
}
