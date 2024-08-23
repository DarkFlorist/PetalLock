import { computed, Signal } from '@preact/signals'
import { AccountAddress, CheckBoxes, FinalChildChecks, ParentChecks } from '../types/types.js'
import { burnAddresses, ENS_TOKEN_WRAPPER } from '../utils/constants.js'
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
	return <p class = 'paragraph' style = 'color: #b43c42'> { ` - Switch to ${ signingAddress } to sign` } </p>
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
	petalLockDeployed: Signal<boolean | undefined>
}

export const Create = ( { contentHashInput, loadingInfos, immutable, handleContentHashInput, account, checkBoxes, updateInfos, creating, petalLockDeployed }: CreateProps) => {
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
		petalLockDeployed.value = true
	}
	
	const signingAddress = computed(() => {
		if (checkBoxes.deepValue === undefined) return undefined
		
		return checkBoxes.deepValue[0]?.domainInfo.owner
	})

	const rightAddress = computed(() => isSameAddress(signingAddress.value, account.value))
	const validContenthash = computed(() => isValidContentHashString(contentHashInput.value))
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

	return <>
		<div style = 'padding-top: 10px;'>
			{ !immutable.value ? <div style = 'padding: 10px;'>
				<p style = 'white-space: nowrap; margin: 0; font-size: 24px; padding-bottom: 10px'>{ `Make the domain immutable!` }</p>
				<div style = 'display: grid; grid-template-columns: min-content auto; width: 100%; gap: 10px;'>
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
			</div> : <></> }
			
			{ petalLockDeployed.value === false ? <>
				<p class = 'error-component' style = 'width: 100%; margin-left: 10px; text-align: center;'> PetalLock contract is not deployed. </p>
				<button class = 'button is-primary' onClick = { deploy }> Deploy PetalLock contract</button>
			</> : <></> }
			{ immutable.value ? <></> : <>
				<div style = 'padding: 10px; display: block;'>
					{ domainExistIssue.value === undefined ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { domainExistIssue.value } </p>}
					<SwitchAddress requirementsMet = { loadingInfos.value } account = { account } signingAddress = { signingAddress }/>
					{ validContenthash.value ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { ` - Set a valid content hash` } </p>}
					{ wrappedIssues.value === undefined ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { wrappedIssues.value } </p>}
					{ ownershipIssues.value === undefined ? <></> : <p class = 'paragraph' style = 'color: #b43c42'> { ownershipIssues.value } </p>}
				</div>
				<button style = 'font-size: 3em;' class = 'button is-primary' disabled = { ownershipIssues.value !== undefined || wrappedIssues !== undefined || petalLockDeployed.value !== true || !validContenthash.value || !rightAddress.value || checkBoxes.deepValue === undefined || loadingInfos.value || immutable.value || creating.value } onClick = { makeImmutable }> Make immutable { creating.value ? <Spinner/> : <></> }</button>
			</> }
		</div>
	</>
}
