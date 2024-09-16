import { computed, Signal } from '@preact/signals'
import { AccountAddress, CheckBoxes, FinalChildChecks, ParentChecks } from '../types/types.js'
import { ENS_TOKEN_WRAPPER } from '../utils/constants.js'
import { callPetalLock, deployPetalLockAndRenewalManager, getOpenRenewalManagerAddress, getRequiredFuses, renewDomainByYear, renewDomainToMax } from '../utils/ensUtils.js'
import { isSameAddress } from '../utils/utilities.js'
import { OptionalSignal } from '../utils/OptionalSignal.js'
import { isValidContentHashString } from '../utils/contenthash.js'
import { Spinner } from './Spinner.js'
import { isAddress } from 'viem'
import { YearPicker } from './YearPicker.js'

interface SwitchAddressProps {
	accountAddress: Signal<AccountAddress | undefined>
	signingAddress: Signal<AccountAddress| undefined>
	requirementsMet: boolean
}

export const SwitchAddress = ({ signingAddress, accountAddress, requirementsMet }: SwitchAddressProps) => {
	if (requirementsMet) return <></>
	if (signingAddress.value === undefined) return <></>
	if (BigInt(signingAddress.value) === 0n) return <></>
	if (isSameAddress(accountAddress.value, signingAddress.value) ) return <></>
	return <p class = 'paragraph' style = 'color: #b43c42'> { ` - Switch to ${ signingAddress } to sign` } </p>
}


export const ChildRequirements = ( { checkBoxes, fuses } : { checkBoxes: FinalChildChecks, fuses: readonly string[] }) => {
	return <>
		<p class = 'subdomain-header'>{ checkBoxes.domainInfo.subDomain } </p>
		<div class = 'grid-container'>
			<Requirement checked = { checkBoxes.exists } primarytext = { `${ checkBoxes.domainInfo.subDomain } exists` } />
			<Requirement checked = { checkBoxes.isWrapped } primarytext = { `${ checkBoxes.domainInfo.subDomain } is wrapped` } />
			<Requirement checked = { checkBoxes.fusesBurned } primarytext = { `${ checkBoxes.domainInfo.subDomain } fuses are burnt` } secondaryText = { `The fuses ${ fuses.map((n) => `"${ n }"`).join(', ') } are burnt` } />
			<Requirement checked = { checkBoxes.ownershipOpenRenewalContract } primarytext = { `${ checkBoxes.domainInfo.subDomain } is owned by Open Renewal Contract` } secondaryText = 'The ownership of subdomain is moved to an Open Renewal Contract that allows anyone to renew the domain.'/>
			<Requirement checked = { checkBoxes.contentHashIsSet || checkBoxes.resolutionAddressIsSet } primarytext = { 'Content hash or address is set'} secondaryText = 'Content hash or address should be set for the domain to be useful'/>
		</div>
	</>
}

export const ParentRequirements = ( { checkBoxes, fuses } : { checkBoxes: ParentChecks, fuses: readonly string[] }) => {
	return <>
	<p class = 'subdomain-header'>{ checkBoxes.domainInfo.subDomain } </p>
		<div class = 'grid-container'>
			<Requirement checked = { checkBoxes.exists } primarytext = { `${ checkBoxes.domainInfo.subDomain } exists` } />
			<Requirement checked = { checkBoxes.isWrapped } primarytext = { `${ checkBoxes.domainInfo.subDomain } is wrapped` } />
			<Requirement checked = { checkBoxes.fusesBurned } primarytext = { `${ checkBoxes.domainInfo.subDomain } fuses are burnt` } secondaryText = { `The fuses ${ fuses.map((n) => `"${ n }"`).join(', ') } are burnt` } />
			<Requirement checked = { checkBoxes.openRenewalContractIsApproved } primarytext = { `${ checkBoxes.domainInfo.subDomain } has approved Open Renewal Contract` } secondaryText = { `Contract ${ getOpenRenewalManagerAddress() } needs to be approved in order for anyone to be able to renew the name.` } />
		</div>
	</>
}

export const Requirements = ({ checkBoxesArray } : { checkBoxesArray: OptionalSignal<CheckBoxes> }) => {
	const allCheckBoxes = checkBoxesArray.deepValue
	if (allCheckBoxes === undefined) return <></>
	return <div class = 'grid-container-bordered'> { [...allCheckBoxes].reverse().map((check, index) => {
		const fuses = getRequiredFuses(index, allCheckBoxes.map((c) => c.domainInfo))
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

export const Immutable = ( { checkBoxesArray } : { checkBoxesArray: Signal<CheckBoxes> }) => {
	const checkBoxes = checkBoxesArray.value[checkBoxesArray.value.length - 1]
	if (checkBoxes === undefined || checkBoxes.type !== 'finalChild') return <></>
	return <div>
		<div style = 'padding-top: 30px; padding-bottom: 30px; align-items: center; display: grid; width: 100%'>
			{ checkBoxes.immutable ? <>
				<p class = 'status-green'>
					{`IMMUTABLE until ${ new Date(Number(checkBoxes.domainInfo.expiry) * 1000).toISOString() }` }
				</p>
			</>: <p class = 'status-red'> NOT IMMUTABLE </p> }
		</div>
		{ checkBoxes.immutable ? <></> : <p style = 'margin: 0px; margin-bottom: 10px; padding-left: 10px;' class = 'requirement'> { checkBoxes.domainInfo.subDomain } should satisfy the following conditions to be immutable: </p> }
	</div>
}

interface CreateProps {
	contentHashInput: Signal<string>
	handleContentHashInput: (input: string) => void
	resolutionAddressInput: Signal<string>
	handleResolutionAddressInput: (input: string) => void
	loadingInfos: Signal<boolean>
	immutable: Signal<boolean>
	accountAddress: Signal<AccountAddress | undefined>
	checkBoxes: OptionalSignal<CheckBoxes>
	updateInfos: (showLoading: boolean) => Promise<void>
	creating: Signal<boolean>
	areContractsDeployed: Signal<boolean | undefined>
	extendYear: Signal<number>
	extending: Signal<boolean>
}

export const Create = ( { contentHashInput, resolutionAddressInput, loadingInfos, immutable, handleContentHashInput, handleResolutionAddressInput, accountAddress, checkBoxes, updateInfos, creating, areContractsDeployed, extendYear, extending }: CreateProps) => {
	if (checkBoxes.deepValue === undefined) return <></>
	const subDomain = checkBoxes.deepValue[checkBoxes.deepValue.length -1]?.domainInfo.subDomain
	if (subDomain === undefined) throw new Error('missing subdomain')
	const makeImmutable = async () => {
		const acc = accountAddress.peek()
		if (acc === undefined) throw new Error('missing accountAddress')
		if (checkBoxes.deepValue === undefined) return
		try {
			creating.value = true
			await callPetalLock(acc, checkBoxes.deepValue.map((value) => value.domainInfo), contentHashInput.value.trim(), resolutionAddressInput.value.trim())
			await updateInfos(false)
		} catch(e) {
			throw e
		} finally {
			creating.value = false
		}
	}

	const deploy = async () => {
		const acc = accountAddress.peek()
		if (acc === undefined) throw new Error('missing accountAddress')
		await deployPetalLockAndRenewalManager(acc)
		await updateInfos(false)
		areContractsDeployed.value = true
	}

	const renewByYear = async () => {
		const acc = accountAddress.peek()
		if (acc === undefined) throw new Error('missing accountAddress')
		if (checkBoxes.deepValue === undefined) return
		try {
			extending.value = true
			await renewDomainByYear(acc, extendYear.value, checkBoxes.deepValue.map((value) => value.domainInfo))
			await updateInfos(false)
		} finally {
			extending.value = false
		}
	}

	const renewToMax = async () => {
		const acc = accountAddress.peek()
		if (acc === undefined) throw new Error('missing accountAddress')
		if (checkBoxes.deepValue === undefined) return
		try {
			extending.value = true
			await renewDomainToMax(acc, checkBoxes.deepValue.map((value) => value.domainInfo))
			await updateInfos(false)
		} finally {
			extending.value = false
		}
	}

	const signingAddress = computed(() => {
		if (checkBoxes.deepValue === undefined) return undefined
		return checkBoxes.deepValue[0]?.domainInfo.owner
	})

	const rightAddress = computed(() => isSameAddress(signingAddress.value, accountAddress.value))
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
		const unique = Array.from(new Set(managerAndOwners.flat().flat().filter((address) => address !== ENS_TOKEN_WRAPPER)))
		if (unique.length <= 1) return undefined
		return ` - The domain${ unique.length > 1 ? 's' : '' } need to be owned and managed by the same address. Currently they are managed by addresses: ${ unique.join(', ') }`
	})
	const domainExistIssue = computed(() => {
		const first = checkBoxes.deepValue ? checkBoxes.deepValue[0] : undefined
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
		return first.domainInfo.expiry !== last.domainInfo.expiry
	})

	return <>
		<div style = 'padding-top: 10px;'>
			{ !immutable.value ? <div style = 'padding: 10px;'>
				<p style = 'white-space: nowrap; margin: 0; font-size: 24px; padding-bottom: 10px'>{ `Make the domain immutable!` }</p>
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
					<p style = 'white-space: nowrap; margin: 0;'>{ `Resolution address:` }</p>
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
			</div> : <></> }

			{ areContractsDeployed.value === false ? <>
				<p class = 'error-component' style = 'width: 100%; margin-left: 10px; text-align: center;'> PetalLock contract is not deployed. </p>
				<button class = 'button is-primary' onClick = { deploy }> Deploy PetalLock contract</button>
			</> : <></> }
			{ immutable.value ? <div class = 'extend-dialog'>
				<p style = 'white-space: nowrap; margin: 0; font-size: 24px; padding-bottom: 10px; justify-self: center;'>{ `Renew ${ subDomain }` }</p>
				<div style = 'justify-content: center;'>
					<p style = 'font-size: 24px;'> Renew by&nbsp;</p> <YearPicker year = { extendYear }/> <p style = 'font-size: 24px;'>&nbsp;years </p>
					<button style = 'font-size: 3em;' class = 'button is-primary' disabled = { extending.value } onClick = { renewByYear }> Renew { extending.value ? <Spinner/> : <></> }</button>
				</div>
				{ !level2DomainExpiryBiggerThanLowestLevelExpiry.value || checkBoxes.deepValue[0] === undefined ? <></> : <>
					<div style = 'justify-content: center; font-size: 24px;'>
						<p> OR </p>
					</div>
					<div style = 'justify-content: center;'>
						<p style = 'font-size: 24px;' >{ `Renew without renewing ${ checkBoxes.deepValue[0].domainInfo.subDomain }` }</p>
						<button style = 'font-size: 3em;' class = 'button is-primary' disabled = { extending.value } onClick = { renewToMax }> { `Renew to ${ new Date(Number(checkBoxes.deepValue[0].domainInfo.expiry) * 1000).toISOString().substring(0, 10) }`} { extending.value ? <Spinner/> : <></> }</button>
					</div>
				</> }
			</div> : <>
				<div style = 'padding: 10px; display: block;'>
					{ domainExistIssue.value === undefined ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { domainExistIssue.value } </p> }
					<SwitchAddress requirementsMet = { loadingInfos.value } accountAddress = { accountAddress } signingAddress = { signingAddress }/>
					{ validContenthash.value || contentHashInput.value.length == 0 ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { ` - Content hash is not valid` } </p> }
					{ validResolutionAddress.value || resolutionAddressInput.value.length == 0 ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { ` - Resolution address is not a valid address` } </p> }
					{ validContenthash.value || validResolutionAddress.value ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { ` - Set content hash or resolution address or both` } </p> }

					{ wrappedIssues.value === undefined ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { wrappedIssues.value } </p> }
					{ ownershipIssues.value === undefined ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { ownershipIssues.value } </p> }
				</div>
				<button style = 'font-size: 3em;' class = 'button is-primary' disabled = { ownershipIssues.value !== undefined || wrappedIssues.value !== undefined || areContractsDeployed.value !== true || !contentSetProperly.value || !rightAddress.value || checkBoxes.deepValue === undefined || loadingInfos.value || immutable.value || creating.value } onClick = { makeImmutable }> Make immutable { creating.value ? <Spinner/> : <></> }</button>
			</> }
		</div>
	</>
}
