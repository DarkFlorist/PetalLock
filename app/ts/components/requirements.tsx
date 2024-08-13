import { Signal } from '@preact/signals'
import { AccountAddress, CheckBoxes, DomainInfo } from '../types/types.js'
import { isSameAddress } from '../utils/utilities.js'
import { childFusesToBurn, getRightSigningAddress, parentFuseToBurn } from '../utils/ensUtils.js'
import { Spinner } from './Spinner.js'
import { isValidContentHashString, tryDecodeContentHash } from '../utils/contenthash.js'
import { burnAddresses } from '../utils/constants.js'

interface SwitchAddressProps {
	account: Signal<AccountAddress | undefined>
	signingAddress: AccountAddress
	requirementsMet: boolean
}

const SwitchAddress = ({ signingAddress, account, requirementsMet }: SwitchAddressProps) => {
	if (requirementsMet) return <></>
	if (burnAddresses.map((b) => BigInt(b)).includes(BigInt(signingAddress))) return <></>
	if (isSameAddress(account.value, signingAddress) ) return <></>
	return <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ signingAddress } to sign` } </p>
}


interface RequirementProps {
	checkBoxes: Signal<CheckBoxes>
	pendingCheckBoxes: Signal<CheckBoxes>
	parentDomainInfo: Signal<DomainInfo>
	childDomainInfo: Signal<DomainInfo> 
	account: Signal<AccountAddress | undefined>
	button: () => void
}

export const WrapParent = ({ checkBoxes, parentDomainInfo, childDomainInfo, account, pendingCheckBoxes, button }: RequirementProps) => {
	const pending = pendingCheckBoxes.value.parentWrapped
	const correctSigningAddress = getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value)
	const requirementsMet = checkBoxes.value.parentWrapped
	const buttonDisabled = account.value === undefined || !isSameAddress(account.value, correctSigningAddress) || requirementsMet || pending

	return <>
		<div class = 'grid-item' style = 'justify-self: start'>
			<div style = 'display: grid; grid-template-rows: auto auto;'>
				<label class = 'form-control'>
					<p class = 'paragraph requirement'> 1) </p>
					<input type = 'checkbox' name = 'switch' class = 'check' checked = { requirementsMet } disabled = { true }/>
					<p class = 'paragraph checkbox-text requirement'> { parentDomainInfo.value.label } is wrapped </p>
				</label>
				<SwitchAddress requirementsMet = { requirementsMet } account = { account } signingAddress = { correctSigningAddress }/>
			</div>
		</div>
		<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
			<button class = 'button is-primary' { ...buttonDisabled ? { disabled: true } : {} } onClick = { button }>
				Wrap { pending ? <Spinner/> : <></> }
			</button>
		</div>
	</>
}

export const CreateChild = ({ checkBoxes, parentDomainInfo, childDomainInfo, account, pendingCheckBoxes, button }: RequirementProps) => {
	const pending = pendingCheckBoxes.value.childExists
	const correctSigningAddress = getRightSigningAddress('createChild', childDomainInfo.value, parentDomainInfo.value)
	const requirementsMet = checkBoxes.value.childExists
	const buttonDisabled = account.value === undefined || !isSameAddress(account.value, correctSigningAddress) || requirementsMet || pending
	return <>
		<div class = 'grid-item' style = 'justify-self: start'>
			<div style = 'display: grid; grid-template-rows: auto auto;'>
				<label class = 'form-control'>
					<p class = 'paragraph requirement'> 2) </p>
					<input type = 'checkbox' name = 'switch' class = 'check' checked = { requirementsMet } disabled = { true }/>
					<p class = 'paragraph checkbox-text requirement'> { childDomainInfo.value.label } exists </p>
				</label>
				<SwitchAddress requirementsMet = { requirementsMet } account = { account } signingAddress = { correctSigningAddress }/>
			</div>
		</div>
		<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
			<button class = 'button is-primary' { ...buttonDisabled ? { disabled: true } : {} } onClick = { button }>
				Create Subdomain and burn subodmain fuses { pending ? <Spinner/> : <></> }
			</button>
		</div>
	</>
}

export const WrapChild = ({ checkBoxes, parentDomainInfo, childDomainInfo, account, pendingCheckBoxes, button }: RequirementProps) => {
	const pending = pendingCheckBoxes.value.childWrapped
	const correctSigningAddress = getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value)
	const requirementsMet = checkBoxes.value.childWrapped
	const buttonDisabled = account.value === undefined || !isSameAddress(account.value, correctSigningAddress) || requirementsMet || pending
	return <>
		<div class = 'grid-item' style = 'justify-self: start'>
			<div style = 'display: grid; grid-template-rows: auto auto;'>
				<label class = 'form-control'>
					<p class = 'paragraph requirement'> 3) </p>
					<input type = 'checkbox' name = 'switch' class = 'check' checked = { requirementsMet } disabled = { true }/>
					<p class = 'paragraph checkbox-text requirement'> { childDomainInfo.value.label } is wrapped </p>
				</label>
				<p class = 'paragraph dim'> { `Requires approve all from the owner (asked if needed)` } </p>
				<SwitchAddress requirementsMet = { requirementsMet } account = { account } signingAddress = { correctSigningAddress }/>
			</div>
		</div>
		<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
			<button class = 'button is-primary' { ...buttonDisabled ? { disabled: true } : {} } onClick = { button }>
				Wrap { pending ? <Spinner/> : <></> }
			</button>
		</div>
	</>
}

interface SetContentHashProps {
	checkBoxes: Signal<CheckBoxes>
	pendingCheckBoxes: Signal<CheckBoxes>
	parentDomainInfo: Signal<DomainInfo>
	childDomainInfo: Signal<DomainInfo> 
	account: Signal<AccountAddress | undefined>
	button: () => void
	contentHashInput: Signal<string>
	handleContentHashInput: (input: string) => void
}

export const SetContentHash = ({ checkBoxes, parentDomainInfo, childDomainInfo, account, pendingCheckBoxes, button, contentHashInput, handleContentHashInput }: SetContentHashProps) => {
	const pending = pendingCheckBoxes.value.childContentHashIsSet
	const correctSigningAddress = getRightSigningAddress('setContentHash', childDomainInfo.value, parentDomainInfo.value)
	const requirementsMet = checkBoxes.value.childContentHashIsSet
	const buttonDisabled = account.value === undefined || !isSameAddress(account.value, correctSigningAddress) || requirementsMet || pending || !isValidContentHashString(contentHashInput.value)
	
	return <>
		<div class = 'grid-item' style = 'justify-self: start; width: 100%;'>
			<div style = 'display: grid; grid-template-rows: auto auto; width: 100%;'>
				<label class = 'form-control'>
					<p class = 'paragraph requirement'> 4) </p>
					<input type = 'checkbox' name = 'switch' class = 'check' checked = { requirementsMet } disabled = { true }/>
					<p class = 'paragraph checkbox-text requirement'> Content hash is set </p>
				</label>
				{ tryDecodeContentHash(childDomainInfo.value.contentHash) !== undefined ? <p class = 'paragraph dim'> Current content hash: { tryDecodeContentHash(childDomainInfo.value.contentHash) }.</p> : <>
					<p class = 'paragraph dim'> The content hash needs to be set for the domain to be useful.` </p>
					<input 
						class = 'input' 
						type = 'text' 
						width = '100%'
						placeholder = 'ipfs://bafy...' 
						disabled = { checkBoxes.value?.childContentHashIsSet === true }
						value = { contentHashInput.value } 
						onInput = { e => handleContentHashInput(e.currentTarget.value) }
					/>
				<SwitchAddress requirementsMet = { requirementsMet } account = { account } signingAddress = { correctSigningAddress }/>
				</> }
			</div>
		</div>
		<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
			<button class = 'button is-primary' { ...buttonDisabled ? { disabled: true } : {} } onClick = { button }>
				Set content hash { pending ? <Spinner/> : <></> }
			</button>
		</div>
	</>
}

export const BurnParentFuses = ({ checkBoxes, parentDomainInfo, childDomainInfo, account, pendingCheckBoxes, button }: RequirementProps) => {
	const pending = pendingCheckBoxes.value?.parentFusesBurned
	const correctSigningAddress = getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value)
	const requirementsMet = checkBoxes.value?.parentFusesBurned
	const buttonDisabled = account.value === undefined || !isSameAddress(account.value, correctSigningAddress) || requirementsMet || pending
	
	return <>
		<div class = 'grid-item' style = 'justify-self: start'>
			<div style = 'display: grid; grid-template-rows: auto auto;'>
				<label class = 'form-control'>
					<p class = 'paragraph requirement'> 5) </p>
					<input type = 'checkbox' name = 'switch' class = 'check' checked = { requirementsMet } disabled = { true }/>
					<p class = 'paragraph checkbox-text requirement'> { parentDomainInfo.value.label } fuses are burnt </p>
				</label>
				<p class = 'paragraph dim'> { `The fuse "${ parentFuseToBurn }" is burnt` } </p>
				<SwitchAddress requirementsMet = { requirementsMet } account = { account } signingAddress = { correctSigningAddress }/>
			</div>
		</div>
		<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
			<button class = 'button is-primary' { ...buttonDisabled ? { disabled: true } : {} } onClick = { button }>
				Burn fuses { pending ? <Spinner/> : <></> }
			</button>
		</div>
	</>
}

export const BurnChildFuses = ({ checkBoxes, parentDomainInfo, childDomainInfo, account, pendingCheckBoxes, button }: RequirementProps) => {
	const pending = pendingCheckBoxes.value?.childFusesBurned
	const correctSigningAddress = getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value)
	const requirementsMet = checkBoxes.value?.childFusesBurned
	const buttonDisabled = account.value === undefined || !isSameAddress(account.value, correctSigningAddress) || requirementsMet || pending
	
	return <>
		<div class = 'grid-item' style = 'justify-self: start'>
			<div style = 'display: grid; grid-template-rows: auto auto;'>
				<label class = 'form-control'>
					<p class = 'paragraph requirement'> 6) </p>
					<input type = 'checkbox' name = 'switch' class = 'check' checked = { requirementsMet === true } disabled = { true }/>
					<p class = 'paragraph checkbox-text requirement'> { childDomainInfo.value.label } fuses are burnt </p>
				</label>
				<p class = 'paragraph dim'> { `The fuses ${ childFusesToBurn.map((n) => `"${ n }"`).join(', ') } are burnt` } </p>
				<SwitchAddress requirementsMet = { requirementsMet } account = { account } signingAddress = { correctSigningAddress }/>
			</div>
		</div>
		<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
			<button class = 'button is-primary' { ...buttonDisabled ? { disabled: true } : {} } onClick = { button }>
				Burn fuses { pending ? <Spinner/> : <></> }
			</button>
		</div>
	</>
}

export const BurnDomainOwnership = ({ checkBoxes, parentDomainInfo, childDomainInfo, account, pendingCheckBoxes, button }: RequirementProps) => {
	const pending = pendingCheckBoxes.value?.childOwnershipBurned
	const correctSigningAddress = getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value)
	const requirementsMet = checkBoxes.value?.childOwnershipBurned
	const buttonDisabled = account.value === undefined || !isSameAddress(account.value, correctSigningAddress) || requirementsMet || checkBoxes.value?.childOwnershipBurned || !checkBoxes.value?.childContentHashIsSet || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.parentWrapped || !checkBoxes.value?.childWrapped || pending
	
	return <>
		<div class = 'grid-item' style = 'justify-self: start'>
			<div style = 'display: grid; grid-template-rows: auto auto;'>
				<label class = 'form-control'>
					<p class = 'paragraph requirement'> 7) </p>
					<input type = 'checkbox' name = 'switch' class = 'check' checked = { requirementsMet } disabled = { true }/>
					<p class = 'paragraph checkbox-text requirement'> { childDomainInfo.value.label } ownership is burnt </p>
				</label>
				<p class = 'paragraph dim'> { `The ownership of subdomain is moved to an address controlled by nobody` } </p>
				<SwitchAddress requirementsMet = { requirementsMet } account = { account } signingAddress = { correctSigningAddress }/>
			</div>
		</div>
		<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
			<button class = 'button is-primary' { ...buttonDisabled ? { disabled: true } : {} } onClick = { button }>
				Burn ownership { pending ? <Spinner/> : <></> }
			</button>
		</div>
	</>
}
