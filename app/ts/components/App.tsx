import { Signal, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { requestAccounts, AccountAddress, DomainInfo, isValidEnsSubDomain, getDomainInfo, getSubstringAfterFirstPoint, doWeNeedToBurnParentFuses, doWeNeedToBurnChildFuses, isChildOwnershipBurned, burnParentFuses, burnChildFuses, transferChildOwnershipAway, getAccounts, wrapDomain, parentFuseToBurn, childFusesToBurn } from '../utils.js'
import { labelhash, namehash } from 'viem'
import { Spinner } from './Spinner.js'
import { ensureError } from '../library/utilities.js'

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
	const errorString = useSignal<string | undefined>(undefined)
	const account = useSignal<AccountAddress | undefined>(undefined)
	const parentDomainInfo = useSignal<DomainInfo | undefined>(undefined)
	const childDomainInfo = useSignal<DomainInfo | undefined>(undefined)
	const checkBoxes = useSignal<CheckBoxes | undefined>(undefined)
	const pendingCheckBoxes = useSignal<CheckBoxes>({
		parentWrapped: false,
		childWrapped: false,
		parentFusesBurned: false,
		childFusesBurned: false,
		childOwnershipBurned: false,
		immutable: false
	})
	const timeoutRef = useRef<number | null>(null)

	const setError = (error: unknown) => {
		const ensured = ensureError(error)
		console.error(error)
		errorString.value = ensured.message
	}

	const updateInfos = async () => {
		try {
			if (!isValidEnsSubDomain(inputValue.value)) return

			const ensSubDomain = inputValue.value
			const ensParent = getSubstringAfterFirstPoint(ensSubDomain)
			const [ensLabel] = ensSubDomain.split('.')
			if (ensLabel === undefined) return
			if (account.value === undefined) return
				
			const childNameHash = namehash(ensSubDomain) 
			const parentNameHash = namehash(ensParent)
			const childInfo = await getDomainInfo(account.value, childNameHash, inputValue.value, labelhash(inputValue.value.slice(0, inputValue.value.indexOf('.'))))
			const parentInfo = await getDomainInfo(account.value, parentNameHash, ensParent, labelhash(ensParent.slice(0, ensParent.indexOf('.'))))
			parentDomainInfo.value = parentInfo
			childDomainInfo.value = childInfo

			checkBoxes.value = {
				parentWrapped: parentInfo.isWrapped === true,
				childWrapped: childInfo.isWrapped === true,
				parentFusesBurned: !doWeNeedToBurnParentFuses(parentInfo),
				childFusesBurned: !doWeNeedToBurnChildFuses(childInfo),
				childOwnershipBurned: isChildOwnershipBurned(childInfo),
				immutable: parentInfo.isWrapped === true && childInfo.isWrapped === true && !doWeNeedToBurnParentFuses(parentInfo) && !doWeNeedToBurnChildFuses(childInfo) && isChildOwnershipBurned(childInfo)
			}
		} catch(e: unknown) {
			setError(e)
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
				try {
					const fetchedAccount = await getAccounts()
					if (fetchedAccount) account.value = fetchedAccount
				} catch(e) {
					setError(e)
				}
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

	const buttonWrapChild = async () => {
		try {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childWrapped: true }
			const acc = account.peek()
			if (acc === undefined) throw new Error('missing account')
			const childInfo = childDomainInfo.peek()
			if (childInfo === undefined) throw new Error('child info missing')
			await wrapDomain(acc, childInfo, true)
			await updateInfos()
		} catch(e: unknown) {
			setError(e)
		} finally {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childWrapped: false }
		}
	}
	
	const buttonWrapParent = async () => {
		try {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), parentWrapped: true }
			const acc = account.peek()
			if (acc === undefined) throw new Error('missing account')
			const parentInfo = parentDomainInfo.peek()
			if (parentInfo === undefined) throw new Error('parent info missing')
			await wrapDomain(acc, parentInfo, false)
			await updateInfos()
		} catch(e: unknown) {
			setError(e)
		} finally {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), parentWrapped: false }
		}
	}

	const buttonBurnParentFuses = async () => {
		try {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), parentFusesBurned: true }
			const acc = account.peek()
			if (acc === undefined) throw new Error('missing account')
			const parent = parentDomainInfo.peek()
			if (parent === undefined) throw new Error('parent info missing')
			await burnParentFuses(acc, parent)
			await updateInfos()
		} catch(e: unknown) {
			setError(e)
		} finally {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), parentFusesBurned: false }
		}
	}

	const buttonBurnChildFuses = async () => {
		try {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childFusesBurned: true }
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
		} catch(e: unknown) {
			setError(e)
		} finally {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childFusesBurned: false }
		}
	}

	const buttonBurnChildOwnership = async () => {
		try {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childOwnershipBurned: true }
			const acc = account.peek()
			if (acc === undefined) throw new Error('missing account')
			const childInfo = childDomainInfo.peek()
			if (childInfo === undefined) throw new Error('child info missing')
			await transferChildOwnershipAway(acc, childInfo)
			await updateInfos()
		} catch (e: unknown) {
			setError(e)
		} finally {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childOwnershipBurned: false }
		}
	}
	return <main>
		<div style ='padding: 80px'></div>
		<div class = 'app'>
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

			{ errorString.value !== undefined ? <p class = 'status' style = 'color: #b43c42'> { errorString.value }</p> : <> </> }
			{ childDomainInfo.value === undefined || parentDomainInfo.value === undefined || account.value === undefined? <></> : <>
				{ checkBoxes.value?.immutable ? <p class = 'status' style = 'color: #3cb371'> {`${ childDomainInfo.value.label } is IMMUTABLE until ${ new Date(Number(childDomainInfo.value.expiry) * 1000).toISOString() }` } </p> : <p class = 'status' style = 'color: #b43c42'> {`${ childDomainInfo.value.label } is NOT IMMUTABLE` } </p> }
				
				{ childDomainInfo.value.registered ? <></>: <p style = 'color: #b43c42'>{ `The name ${ childDomainInfo.value.label } does not exist in the registry` }</p> }
				{ parentDomainInfo.value.registered ? <></>: <p style = 'color: #b43c42'>{ `The name ${ parentDomainInfo.value.label } does not exist in the registry` }</p> }
				
				{ !checkBoxes.value?.immutable && childDomainInfo.value.isWrapped && BigInt(childDomainInfo.value.owner) !== BigInt(account.value) ? <p style = 'color: #b43c42'>{ `You are not owner of ${ childDomainInfo.value.label }, its owned by ${ childDomainInfo.value.owner }` }</p> : <></> }
				{ !checkBoxes.value?.immutable && parentDomainInfo.value.isWrapped && BigInt(parentDomainInfo.value.owner) !== BigInt(account.value) ? <p style = 'color: #b43c42'>{ `You are not owner of ${ parentDomainInfo.value.label }, its owned by ${ parentDomainInfo.value.owner }` }</p> : <></> }
				
				{ !checkBoxes.value?.immutable && !childDomainInfo.value.isWrapped && BigInt(childDomainInfo.value.registeryOwner) !== BigInt(account.value) ? <p style = 'color: #b43c42'>{ `You are not owner of ${ childDomainInfo.value.label }, its owned by ${ childDomainInfo.value.registeryOwner }` }</p> : <></> }
				{ !checkBoxes.value?.immutable && !parentDomainInfo.value.isWrapped && BigInt(parentDomainInfo.value.registeryOwner) !== BigInt(account.value) ? <p style = 'color: #b43c42'>{ `You are not owner of ${ parentDomainInfo.value.label }, its owned by ${ parentDomainInfo.value.registeryOwner }` }</p> : <></> }
				
				{ checkBoxes.value?.immutable ? <></>: <p style = 'color: gray'> Execute the following transactions with an account that owns both the parent and child name to make the name Immutable </p> }
				
				<div class = 'grid-container'>
					<div class = 'grid-item' style = 'justify-self: start'>
						<label class = 'form-control'>
							<input type = 'checkbox' checked = { checkBoxes.value?.parentWrapped === true } disabled = { true }/>
							<p class = 'paragraph checkbox-text'> Parent is wrapped </p>
						</label>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...checkBoxes.value?.parentWrapped || pendingCheckBoxes.value.parentWrapped ? { disabled: true } : {} } onClick = { buttonWrapParent }>
							Wrap parent { pendingCheckBoxes.value.parentWrapped ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<input type = 'checkbox' checked = { checkBoxes.value?.childWrapped === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text'> Subdomain is wrapped </p>
							</label>
							<p class = 'paragraph dim'> { `Requires approve wall from the owner (asked if needed)` } </p>
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...checkBoxes.value?.childWrapped || pendingCheckBoxes.value.childWrapped ? { disabled: true } : {} } onClick = { buttonWrapChild }>
							Wrap subdomain { pendingCheckBoxes.value.childWrapped ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<input type = 'checkbox' checked = { checkBoxes.value?.parentFusesBurned === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text'> Parents fuses are burned </p>
							</label>
							<p class = 'paragraph dim'> { `The fuse "${ parentFuseToBurn }" is burned` } </p>
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...checkBoxes.value?.parentFusesBurned || pendingCheckBoxes.value.parentFusesBurned ? { disabled: true } : {} } onClick = { buttonBurnParentFuses }>
							Burn parent fuses { pendingCheckBoxes.value.parentFusesBurned ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<input type = 'checkbox' checked = { checkBoxes.value?.childFusesBurned === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text'> Childs fuses are burned </p>
							</label>
							<p class = 'paragraph dim'> { `The fuses ${ childFusesToBurn.map((n) => `"${ n }"`).join(', ') } are burned` } </p>
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...checkBoxes.value?.childFusesBurned || pendingCheckBoxes.value.childFusesBurned  ? { disabled: true } : {} } onClick = { buttonBurnChildFuses }>
							Burn child fuses { pendingCheckBoxes.value.childFusesBurned ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<input type = 'checkbox' checked = { checkBoxes.value?.childOwnershipBurned === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text'> Subdomain ownership is burned </p>
							</label>
							<p class = 'paragraph dim'> { `The ownership of subdomain is moved to an address controlled by nobody` } </p>
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...(pendingCheckBoxes.value.childOwnershipBurned || checkBoxes.value?.childOwnershipBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.parentWrapped || !checkBoxes.value?.childWrapped) ? { disabled: true } : {} } onClick = { buttonBurnChildOwnership }>
							Burn ownership to child { pendingCheckBoxes.value.childOwnershipBurned ? <Spinner/> : <></> }
						</button>
					</div>
				</div>
			</> }
		</div>
		<div class = 'text-white/50 text-center'>
			<div class = 'mt-8'>
				PetalLock by&nbsp;
				<a class = 'text-white hover:underline' href='https://dark.florist'>
					Dark Florist
				</a>
			</div>
			<div class = 'inline-grid'>
				<a class = 'text-white hover:underline' href='https://discord.gg/BeFnJA5Kjb'>
					Discord
				</a>
				<a class = 'text-white hover:underline' href='https://twitter.com/DarkFlorist'>
					Twitter
				</a>
				<a class = 'text-white hover:underline' href='https://github.com/DarkFlorist'>
					Github
				</a>
			</div>
		</div>
	</main>
}
