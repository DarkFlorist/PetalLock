import { computed, Signal } from '@preact/signals'
import { AccountAddress, CheckBoxes, FinalChildChecks, ParentChecks } from '../types/types.js'
import { burnAddresses } from '../utils/constants.js'
import { callPetalLock, childFusesToBurn, deployPetalLock, parentFuseToBurn } from '../utils/ensUtils.js'
import { isSameAddress } from '../utils/utilities.js'
import { OptionalSignal } from './PreactUtils.js'
import { isValidContentHashString } from '../utils/contenthash.js'
import { Spinner } from './Spinner.js'

interface SwitchAddressProps {
	account: Signal<AccountAddress | undefined>
	signingAddress: Signal<AccountAddress| undefined>
	requirementsMet: boolean
}

export const SwitchAddress = ({ signingAddress, account, requirementsMet }: SwitchAddressProps) => {
	if (requirementsMet) return <></>
	if (signingAddress.value === undefined) return <></>
	if (burnAddresses.map((b) => BigInt(b)).includes(BigInt(signingAddress.value))) return <></>
	if (isSameAddress(account.value, signingAddress.value) ) return <></>
	return <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ signingAddress } to sign` } </p>
}

export const Requirements = ( { checkBoxesArray } : { checkBoxesArray: OptionalSignal<CheckBoxes> }) => {
	if (checkBoxesArray.deepValue === undefined) return <></>
	return <div class = 'grid-container-bordered'> { [...checkBoxesArray.deepValue].reverse().map((check) => {
		if (check.type === 'parent') return <ParentRequirements checkBoxes = { check }/>
		return <ChildRequirements checkBoxes = { check }/>
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
			{ checkBoxes.immutable ? <p class = 'status-green'> {`IMMUTABLE until ${ new Date(Number(checkBoxes.domainInfo.expiry) * 1000).toISOString() }` } </p> : <p class = 'status-red'> NOT IMMUTABLE </p> }
		</div>
		{ checkBoxes.immutable ? <></> : <p style = 'margin: 0px; margin-bottom: 10px; padding-left: 10px;' class = 'requirement'> { checkBoxes.domainInfo.subDomain } should satisfy the following conditions to be immutable: </p> }
	</div>
}

export const ChildRequirements = ( { checkBoxes } : { checkBoxes: FinalChildChecks }) => {
	return <>
		<p class = 'subdomain-header'>{ checkBoxes.domainInfo.subDomain } </p>
		<div class = 'grid-container'>
			<Requirement checked = { checkBoxes.exists } primarytext = { `${ checkBoxes.domainInfo.subDomain } exists` } />
			<Requirement checked = { checkBoxes.isWrapped } primarytext = { `${ checkBoxes.domainInfo.subDomain } is wrapped` } />
			<Requirement checked = { checkBoxes.fusesBurned } primarytext = { `${ checkBoxes.domainInfo.subDomain } fuses are burnt` } secondaryText = { `The fuses ${ childFusesToBurn.map((n) => `"${ n }"`).join(', ') } are burnt` } />
			<Requirement checked = { checkBoxes.ownershipBurned } primarytext = { `${ checkBoxes.domainInfo.subDomain } ownership is burnt` } secondaryText = 'The ownership of subdomain is moved to an address controlled by nobody'/>
			<Requirement checked = { checkBoxes.contentHashIsSet } primarytext = { 'Content hash is set'} secondaryText = 'Content hash should be set for the domain to be useful'/>
		</div>
	</>
}

export const ParentRequirements = ( { checkBoxes } : { checkBoxes: ParentChecks }) => {
	return <>
	<p class = 'subdomain-header'>{ checkBoxes.domainInfo.subDomain } </p>
		<div class = 'grid-container'>
			<Requirement checked = { checkBoxes.exists } primarytext = { `${ checkBoxes.domainInfo.subDomain } exists` } />
			<Requirement checked = { checkBoxes.isWrapped } primarytext = { `${ checkBoxes.domainInfo.subDomain } is wrapped` } />
			<Requirement checked = { checkBoxes.fusesBurned } primarytext = { `${ checkBoxes.domainInfo.subDomain } fuses are burnt` } secondaryText = { `The fuse "${ parentFuseToBurn }" is burnt` } />
		</div>
	</>
}

interface CreateProps {
	contentHashInput: Signal<string>
	loadingInfos: Signal<boolean>
	immutable: Signal<boolean>
	handleContentHashInput: (input: string) => void
	account: Signal<AccountAddress | undefined>
	checkBoxes: OptionalSignal<CheckBoxes>
	updateInfos: (showLoading: boolean) => Promise<void>
	creating: Signal<boolean>
}

export const Create = ( { contentHashInput, loadingInfos, immutable, handleContentHashInput, account, checkBoxes, updateInfos, creating }: CreateProps) => {
	if (checkBoxes.deepValue === undefined) return <></>
	const subDomain = checkBoxes.deepValue[checkBoxes.deepValue.length -1]?.domainInfo.subDomain
	if (subDomain === undefined) throw new Error('missing subdomain')
	// todo check that accesses are correct
	const makeImmutable = async () => {
		const acc = account.peek()
		if (acc === undefined) throw new Error('missing account')
		if (checkBoxes.deepValue === undefined) return
		try {
			creating.value = true
			await callPetalLock(acc, checkBoxes.deepValue.map((value) => value.domainInfo), contentHashInput.value)
			await updateInfos(false)
		} catch(e) {
			throw e
		} finally {
			creating.value = false
		}
	}
	const deploy = async () => {
		const acc = account.peek()
		if (acc === undefined) throw new Error('missing account')
		await deployPetalLock(acc)
		await updateInfos(false)
	}
	
	const signingAddress = computed(() => {
		if (checkBoxes.deepValue === undefined) return undefined
		return checkBoxes.deepValue[0]?.domainInfo.owner
	})
	return <>
		<div style = 'padding-top: 10px;'>
			<div style = 'display: grid; grid-template-columns: min-content auto; width: 100%; padding: 10px; gap: 10px;'>
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
			<div style = 'padding: 10px;'>
				<SwitchAddress requirementsMet = { loadingInfos.value || !immutable } account = { account } signingAddress = { signingAddress }/>
			</div>
			<button class = 'button is-primary' onClick = { deploy }> deploy </button>
			<button style = 'font-size: 3em;' class = 'button is-primary' disabled = { !isValidContentHashString(contentHashInput.value) || !isSameAddress(signingAddress.value, account.value) || checkBoxes.deepValue === undefined || loadingInfos.value || immutable.value || creating.value } onClick = { makeImmutable }> Make immutable { creating.value ? <Spinner/> : <></> }</button>
		</div>
	</>
}
