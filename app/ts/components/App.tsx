import { Signal, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { requestAccounts, AccountAddress, DomainInfo, isValidEnsSubDomain, getDomainInfo, getSubstringAfterFirstPoint, doWeNeedToBurnParentFuses, doWeNeedToBurnChildFuses, isChildOwnershipBurned, burnParentFuses, burnChildFuses, transferChildOwnershipAway, getAccounts } from '../utils.js'
import { namehash } from 'viem'

type CheckBoxes = {
	parentWrapped: boolean,
	childWrapped: boolean,
	parentFusesBurned: boolean,
	childFusesBurned: boolean,
	childOwnershipBurned: boolean
	immutable: boolean
}

interface WalletComponentProps {
	account: Signal<AccountAddress | undefined>
}

const WalletComponent = ({ account }: WalletComponentProps) => {
	const connect = async () => {
		account.value = await requestAccounts()
	}
	return account.value !== undefined ? (
		<p>{ `Connected with ${ account.value }` }</p>
	) : (
		<button class = 'button is-primary' onClick = { connect }>
			{ `Connect wallet` }
		</button>
	)
}

export function App() {
	const inputValue = useSignal<string>('')
	const account = useSignal<AccountAddress | undefined>(undefined)
	const parentDomainInfo = useSignal<DomainInfo | undefined>(undefined)
	const childDomainInfo = useSignal<DomainInfo | undefined>(undefined)
	const checkBoxes = useSignal<CheckBoxes | undefined>(undefined)
	const timeoutRef = useRef<number | null>(null)

	const updateInfos = async () => {
		if (!isValidEnsSubDomain(inputValue.value)) return

		const ensSubDomain = inputValue.value
		const ensParent = getSubstringAfterFirstPoint(ensSubDomain)
		const [ensLabel] = ensSubDomain.split('.')
		if (ensLabel === undefined) return
		if (account.value === undefined) return
			
		const childNameHash = namehash(ensSubDomain) 
		const parentNameHash = namehash(ensParent)
		const childInfo = await getDomainInfo(account.value, childNameHash, inputValue.value)
		const parentInfo = await getDomainInfo(account.value, parentNameHash, ensParent)
		parentDomainInfo.value = parentInfo
		childDomainInfo.value = childInfo

		checkBoxes.value = {
			parentWrapped: parentInfo.isWrapped === true,
			childWrapped: childInfo.isWrapped === true,
			parentFusesBurned: !doWeNeedToBurnParentFuses(parentInfo),
			childFusesBurned: !doWeNeedToBurnChildFuses(childInfo, parentInfo),
			childOwnershipBurned: isChildOwnershipBurned(childInfo),
			immutable: parentInfo.isWrapped === true && childInfo.isWrapped === true && !doWeNeedToBurnParentFuses(parentInfo) && !doWeNeedToBurnChildFuses(childInfo, parentInfo) && isChildOwnershipBurned(childInfo)
		}
	}

	function handleInput(value: string) {
		inputValue.value = value
		
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current)
		}

		timeoutRef.current = window.setTimeout(() => {
			updateInfos()
			timeoutRef.current = null
		}, 500)
	}

	useEffect(() => {
		if (window.ethereum) {
			window.ethereum.on('accountsChanged', function (accounts) {
				account.value = accounts[0]
			})
			const fetchAccount = async () => {
				const fetchedAccount = await getAccounts()
				if (fetchedAccount) account.value = fetchedAccount
			}
			fetchAccount()
		}
		return () => {
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])
	
	useEffect(() => { updateInfos() }, [account.value])

	const buttonWrapParent = () => {
		throw new Error('not implemented')
	}
	const buttonWrapChild = () => {
		throw new Error('not implemented')
	}
	const buttonBurnParentFuses = async () => {
		const acc = account.peek()
		if (acc === undefined) throw new Error('missing account')
		const parent = parentDomainInfo.peek()
		if (parent === undefined) throw new Error('parent info missing')
		await burnParentFuses(acc, parent)
		await updateInfos()
	}
	const buttonBurnChildFuses = async () => {
		if (!isValidEnsSubDomain(inputValue.value)) return
		const acc = account.peek()
		if (acc === undefined) throw new Error('missing account')
		const parentInfo = parentDomainInfo.peek()
		if (parentInfo === undefined) throw new Error('parent info missing')
		const childInfo = childDomainInfo.peek()
		if (childInfo === undefined) throw new Error('child info missing')

		const ensSubDomain = inputValue.value
		const [ensLabel] = ensSubDomain.split('.')
		if (ensLabel === undefined) return
		if (account.value === undefined) return

		await burnChildFuses(acc, ensLabel, childInfo, parentInfo)
		await updateInfos()
	}
	const buttonBurnChildOwnership = async () => {
		const acc = account.peek()
		if (acc === undefined) throw new Error('missing account')
		const childInfo = childDomainInfo.peek()
		if (childInfo === undefined) throw new Error('child info missing')
		await transferChildOwnershipAway(acc, childInfo)
		await updateInfos()
	}
	
	return <main>
		<WalletComponent account = { account } />
		<div style = 'display: block'>
			<div class = 'petal-lock'>PetalLock</div>
			<h2 class = 'subdomain-title'>Make ENS subdomain immutable</h2>
		</div>
		{ account.value !== undefined ? <>
			<input 
				class = 'input' 
				type = 'text' 
				placeholder = 'slasha.vitalik.eth' 
				value = { inputValue.value } 
				onInput = { e => handleInput(e.currentTarget.value) }
			/>
		</> : <></> }
		{ childDomainInfo.value === undefined || parentDomainInfo.value === undefined || account.value === undefined? <></> : <>
			{ checkBoxes.peek()?.immutable ? <p class = 'status' style = 'color: #3cb371'> {`${ childDomainInfo.value.label } IS IMMUTABLE` } </p> : <p class = 'status' style = 'color: #b43c42'> {`${ childDomainInfo.value.label } IS NOT IMMUTABLE` } </p> }
			
			{ childDomainInfo.value.registered ? <></>: <p style = 'color: #b43c42'>{ `The name ${ childDomainInfo.value.label } does not exist in the registry` }</p> }
			{ parentDomainInfo.value.registered ? <></>: <p style = 'color: #b43c42'>{ `The name ${ parentDomainInfo.value.label } does not exist in the registry` }</p> }
			
			{ !checkBoxes.peek()?.immutable && childDomainInfo.value.isWrapped && BigInt(childDomainInfo.value.owner) !== BigInt(account.value) ? <p style = 'color: #b43c42'>{ `You are not owner of ${ childDomainInfo.value.label }, its owned by ${ childDomainInfo.value.owner }` }</p> : <></> }
			{ !checkBoxes.peek()?.immutable && parentDomainInfo.value.isWrapped && BigInt(parentDomainInfo.value.owner) !== BigInt(account.value) ? <p style = 'color: #b43c42'>{ `You are not owner of ${ parentDomainInfo.value.label }, its owned by ${ parentDomainInfo.value.owner }` }</p> : <></> }
			
			{ checkBoxes.peek()?.immutable ? <></>: <p style = 'color: gray'> Execute the following transactions with an account that owns both the parent and child name to make the name Immutable </p> }
			
			<div class = 'grid-container'>
				<div class = 'grid-item' style = 'justify-self: start'>
					<label class = 'form-control'>
						<input type = 'checkbox' checked = { checkBoxes.value?.parentWrapped === true } disabled = { true }/>
						<p class = 'paragraph checkbox-text'> Parent is wrapped </p>
					</label>
				</div>
				<div class = 'grid-item' style = 'justify-self: end'>
					<button class = 'button is-primary' { ...checkBoxes.value?.parentWrapped ? { disabled: true } : {} } onClick = { buttonWrapParent }> Wrap parent </button>
				</div>

				<div class = 'grid-item' style = 'justify-self: start'>
					<label class = 'form-control'>
						<input type = 'checkbox' checked = { checkBoxes.value?.childWrapped === true } disabled = { true }/>
						<p class = 'paragraph checkbox-text'> Subdomain is wrapped </p>
					</label>
				</div>
				<div class = 'grid-item' style = 'justify-self: end'>
					<button class = 'button is-primary' { ...checkBoxes.value?.childWrapped ? { disabled: true } : {} } onClick = { buttonWrapChild }> Wrap subdomain </button>
				</div>

				<div class = 'grid-item' style = 'justify-self: start'>
					<label class = 'form-control'>
						<input type = 'checkbox' checked = { checkBoxes.value?.parentFusesBurned === true } disabled = { true }/>
						<p class = 'paragraph checkbox-text'> Parents fuses are burned </p>
					</label>
				</div>
				<div class = 'grid-item' style = 'justify-self: end'>
					<button class = 'button is-primary' { ...checkBoxes.value?.parentFusesBurned ? { disabled: true } : {} } onClick = { buttonBurnParentFuses }> Burn parent fuses </button>
				</div>

				<div class = 'grid-item' style = 'justify-self: start'>
					<label class = 'form-control'>
						<input type = 'checkbox' checked = { checkBoxes.value?.childFusesBurned === true } disabled = { true }/>
						<p class = 'paragraph checkbox-text'> Childs fuses are burned </p>
					</label>
				</div>
				<div class = 'grid-item' style = 'justify-self: end'>
					<button class = 'button is-primary' { ...checkBoxes.value?.childFusesBurned ? { disabled: true } : {} } onClick = { buttonBurnChildFuses }> Burn child fuses </button>
				</div>

				<div class = 'grid-item' style = 'justify-self: start'>
					<label class = 'form-control'>
						<input type = 'checkbox' checked = { checkBoxes.value?.childOwnershipBurned === true } disabled = { true }/>
						<p class = 'paragraph checkbox-text'> Childs ownership is burned </p>
					</label>
				</div>
				<div class = 'grid-item' style = 'justify-self: end'>
					<button class = 'button is-primary' { ...(checkBoxes.value?.childOwnershipBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.parentWrapped || !checkBoxes.value?.childWrapped) ? { disabled: true } : {} } onClick = { buttonBurnChildOwnership }> Burn ownership to child </button>
				</div>
			</div>
		</> }
	</main>
}
