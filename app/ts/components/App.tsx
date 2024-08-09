import { Signal, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { requestAccounts, AccountAddress, DomainInfo, isValidEnsSubDomain, getDomainInfo, getSubstringAfterFirstPoint, doWeNeedToBurnParentFuses, doWeNeedToBurnChildFuses, isChildOwnershipBurned, burnParentFuses, burnChildFuses, transferChildOwnershipAway, getAccounts, wrapDomain, parentFuseToBurn, childFusesToBurn, getRightSigningAddress } from '../utils.js'
import { labelhash, namehash } from 'viem'
import { Spinner } from './Spinner.js'
import { ensureError, isSameAddress } from '../library/utilities.js'

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
		<p style = 'color: gray'>{ `Connected with ${ account.value }` }</p>
	) : (
		<button class = 'button is-primary' onClick = { connect }>
			{ `Connect wallet` }
		</button>
	)
}

export function App() {
	const inputValue = useSignal<string>('')
	const errorString = useSignal<string | undefined>(undefined)
	const loadingAccount = useSignal<boolean>(true)
	const isWindowEthereum = useSignal<boolean>(true)
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
			const ensSubDomain = inputValue.value.toLowerCase()
			if (!isValidEnsSubDomain(ensSubDomain)) return
			const ensParent = getSubstringAfterFirstPoint(ensSubDomain)
			const [ensLabel] = ensSubDomain.split('.')
			if (ensLabel === undefined) return
			if (account.value === undefined) return
				
			const childNameHash = namehash(ensSubDomain) 
			const parentNameHash = namehash(ensParent)
			const childInfo = await getDomainInfo(account.value, childNameHash, ensSubDomain, labelhash(ensSubDomain.slice(0, ensSubDomain.indexOf('.'))))
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
			errorString.value = undefined
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
		if (window.ethereum === undefined) {
			isWindowEthereum.value = false
			return
		}
		isWindowEthereum.value = true
		window.ethereum.on('accountsChanged', function (accounts) {
			account.value = accounts[0]
		})
		const fetchAccount = async () => {
			try {
				const fetchedAccount = await getAccounts()
				if (fetchedAccount) account.value = fetchedAccount
			} catch(e) {
				setError(e)
			} finally {
				loadingAccount.value = false
			}
		}
		fetchAccount()
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
			{ !loadingAccount.value && account.value !== undefined ? <WalletComponent account = { account } /> : <></> }
			{ !isWindowEthereum.value ? <p class = 'paragraph' style = 'color: #b43c42;'> An Ethereum enabled wallet is required to use PetalLock.</p> : <></> }
			<div style = 'display: block'>
				<div class = 'petal-lock'>
					<img src = 'favicon.svg' alt = 'Icon' style ='width: 60px;'/> PetalLock
				</div>
				<p class = 'sub-title'>Make immutable ENS subdomains</p>
			</div>
			{ account.value !== undefined ? <>
				<input 
					class = 'input' 
					type = 'text' 
					placeholder = '2.horswap.eth' 
					value = { inputValue.value } 
					onInput = { e => handleInput(e.currentTarget.value) }
				/>
			</> : <></> }
			
			{ !loadingAccount.value && account.value === undefined ? <WalletComponent account = { account } /> : <></> }

			{ errorString.value !== undefined ? <p style = 'color: #b43c42; word-break: break-all; white-space: break-spaces; border: 2px solid rgb(180, 60, 66); border-radius: 5px; padding: 10px;'> { errorString.value }</p> : <> </> }
			
			{ childDomainInfo.value === undefined || childDomainInfo.value.registered ? <></>: <p style = 'color: #b43c42'>{ `The name ${ childDomainInfo.value.label } does not exist in the ENS registry. You need to register the domain to use PetalLock.` }</p> }
			{ parentDomainInfo.value === undefined || parentDomainInfo.value.registered ? <></>: <p style = 'color: #b43c42'>{ `The name ${ parentDomainInfo.value.label } does not exist in the ENS registry. You need to register the domain to use PetalLock.` }</p> }
			
			{ childDomainInfo.value === undefined || parentDomainInfo.value === undefined || account.value === undefined || !childDomainInfo.value.registered || !parentDomainInfo.value.registered ? <></> : <>
				{ checkBoxes.value?.immutable ? <p class = 'status' style = 'color: #3cb371'> {`IMMUTABLE until ${ new Date(Number(childDomainInfo.value.expiry) * 1000).toISOString() }` } </p> : <p class = 'status' style = 'color: #b43c42'> {`${ childDomainInfo.value.label } is NOT IMMUTABLE` } </p> }
				{ checkBoxes.value?.immutable ? <></>: <p style = 'color: gray'> Execute the following transactions with an account that owns both the parent and child name to make the name Immutable </p> }
				
				<div class = 'grid-container'>
					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.parentWrapped === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text'> { parentDomainInfo.value.label } is wrapped </p>
							</label>
							{ !checkBoxes.value?.parentWrapped && !isSameAddress(account.value, getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...!isSameAddress(account.value, getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.parentWrapped || pendingCheckBoxes.value.parentWrapped ? { disabled: true } : {} } onClick = { buttonWrapParent }>
							Wrap { pendingCheckBoxes.value.parentWrapped ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.childWrapped === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text'> { childDomainInfo.value.label } is wrapped </p>
							</label>
							<p class = 'paragraph dim'> { `Requires approve all from the owner (asked if needed)` } </p>
							{ !checkBoxes.value?.childWrapped && !isSameAddress(account.value, getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...!isSameAddress(account.value, getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.childWrapped || pendingCheckBoxes.value.childWrapped ? { disabled: true } : {} } onClick = { buttonWrapChild }>
							Wrap { pendingCheckBoxes.value.childWrapped ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.parentFusesBurned === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text'> { parentDomainInfo.value.label } fuses are burnt </p>
							</label>
							<p class = 'paragraph dim'> { `The fuse "${ parentFuseToBurn }" is burnt` } </p>
							{ !checkBoxes.value?.parentFusesBurned && !isSameAddress(account.value, getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...!isSameAddress(account.value, getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.parentFusesBurned || pendingCheckBoxes.value.parentFusesBurned ? { disabled: true } : {} } onClick = { buttonBurnParentFuses }>
							Burn fuses { pendingCheckBoxes.value.parentFusesBurned ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.childFusesBurned === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text'> { childDomainInfo.value.label } fuses are burnt </p>
							</label>
							<p class = 'paragraph dim'> { `The fuses ${ childFusesToBurn.map((n) => `"${ n }"`).join(', ') } are burnt` } </p>
							{ !checkBoxes.value?.childFusesBurned && !isSameAddress(account.value, getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...!isSameAddress(account.value, getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.childFusesBurned || pendingCheckBoxes.value.childFusesBurned  ? { disabled: true } : {} } onClick = { buttonBurnChildFuses }>
							Burn fuses { pendingCheckBoxes.value.childFusesBurned ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.childOwnershipBurned === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text'> { childDomainInfo.value.label } ownership is burnt </p>
							</label>
							<p class = 'paragraph dim'> { `The ownership of subdomain is moved to an address controlled by nobody` } </p>
							{ !isSameAddress(account.value, getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value)) && !(pendingCheckBoxes.value.childOwnershipBurned || checkBoxes.value?.childOwnershipBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.parentWrapped || !checkBoxes.value?.childWrapped) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end'>
						<button class = 'button is-primary' { ...(!isSameAddress(account.value, getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value)) || pendingCheckBoxes.value.childOwnershipBurned || checkBoxes.value?.childOwnershipBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.parentWrapped || !checkBoxes.value?.childWrapped) ? { disabled: true } : {} } onClick = { buttonBurnChildOwnership }>
							Burn ownership { pendingCheckBoxes.value.childOwnershipBurned ? <Spinner/> : <></> }
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
