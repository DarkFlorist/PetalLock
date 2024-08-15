import { Signal, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { requestAccounts, AccountAddress, DomainInfo, isValidEnsSubDomain, getDomainInfo, doWeNeedToBurnParentFuses, doWeNeedToBurnChildFuses, isChildOwnershipBurned, burnParentFuses, burnChildFuses, transferChildOwnershipAway, getAccounts, wrapDomain, parentFuseToBurn, childFusesToBurn, getRightSigningAddress, createSubDomain, setContentHash } from '../utils/ensUtils.js'
import { labelhash, namehash } from 'viem'
import { BigSpinner, Spinner } from './Spinner.js'
import { ensureError, getSubstringAfterFirstPoint, isSameAddress } from '../utils/utilities.js'
import { isValidContentHashString, tryDecodeContentHash, tryEncodeContentHash } from '../utils/contenthash.js'

type CheckBoxes = {
	childExists: boolean
	parentWrapped: boolean
	childWrapped: boolean
	parentFusesBurned: boolean
	childFusesBurned: boolean
	childOwnershipBurned: boolean
	immutable: boolean
	childContentHashIsSet: boolean
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
	const contentHashInput = useSignal<string>('') 
	const errorString = useSignal<string | undefined>(undefined)
	const loadingAccount = useSignal<boolean>(true)
	const isWindowEthereum = useSignal<boolean>(true)
	const account = useSignal<AccountAddress | undefined>(undefined)
	const parentDomainInfo = useSignal<DomainInfo | undefined>(undefined)
	const childDomainInfo = useSignal<DomainInfo | undefined>(undefined)
	const checkBoxes = useSignal<CheckBoxes | undefined>(undefined)
	const loadingInfos = useSignal<boolean>(false)
	const pendingCheckBoxes = useSignal<CheckBoxes>({
		childExists: false,
		parentWrapped: false,
		childWrapped: false,
		parentFusesBurned: false,
		childFusesBurned: false,
		childOwnershipBurned: false,
		immutable: false,
		childContentHashIsSet: false,
	})
	const inputTimeoutRef = useRef<number | null>(null)
	const contentHashTimeoutRef = useRef<number | null>(null)

	const setError = (error: unknown) => {
		if (error === undefined) {
			errorString.value = undefined
			return
		}
		const ensured = ensureError(error)
		console.error(error)
		errorString.value = ensured.message
	}

	const updateInfos = async (showLoading: boolean) => {
		try {
			const ensSubDomain = inputValue.value.toLowerCase()
			if (!isValidEnsSubDomain(ensSubDomain)) return
			const ensParent = getSubstringAfterFirstPoint(ensSubDomain)
			const [ensLabel] = ensSubDomain.split('.')
			if (ensLabel === undefined) return
				
			const childNameHash = namehash(ensSubDomain)
			const parentNameHash = namehash(ensParent)
			if (showLoading) loadingInfos.value = true
			const childInfo = await getDomainInfo(account.value, childNameHash, ensSubDomain, labelhash(ensSubDomain.slice(0, ensSubDomain.indexOf('.'))))
			const parentInfo = await getDomainInfo(account.value, parentNameHash, ensParent, labelhash(ensParent.slice(0, ensParent.indexOf('.'))))
			parentDomainInfo.value = parentInfo
			childDomainInfo.value = childInfo
			checkBoxes.value = {
				childExists: childInfo.registered,
				parentWrapped: parentInfo.isWrapped,
				childWrapped: childInfo.isWrapped,
				parentFusesBurned: !doWeNeedToBurnParentFuses(parentInfo),
				childFusesBurned: !doWeNeedToBurnChildFuses(childInfo),
				childOwnershipBurned: isChildOwnershipBurned(childInfo),
				immutable: parentInfo.isWrapped && childInfo.isWrapped && !doWeNeedToBurnParentFuses(parentInfo) && !doWeNeedToBurnChildFuses(childInfo) && isChildOwnershipBurned(childInfo),
				childContentHashIsSet: childInfo.contentHash !== '0x'
			}
			errorString.value = undefined
		} catch(e: unknown) {
			setError(e)
		} finally {
			loadingInfos.value = false
		}
	}

	function handleInput(value: string) {
		inputValue.value = value
		if (inputTimeoutRef.current !== null) clearTimeout(inputTimeoutRef.current)
		inputTimeoutRef.current = window.setTimeout(() => {
			inputTimeoutRef.current = null
			const ensSubDomain = inputValue.value.toLowerCase()
			if (!isValidEnsSubDomain(ensSubDomain)) return setError('Not valid ENS name')
			setError(undefined)
			updateInfos(true)
		}, 500)
	}

	function handleContentHashInput(value: string) {
		contentHashInput.value = value
		if (contentHashTimeoutRef.current !== null) clearTimeout(contentHashTimeoutRef.current)
		contentHashTimeoutRef.current = window.setTimeout(() => {
			contentHashTimeoutRef.current = null
			if (!isValidContentHashString(contentHashInput.value)) return setError('Not valid content hash')
			setError(undefined)
			updateInfos(false)
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
			if (inputTimeoutRef.current !== null) {
				clearTimeout(inputTimeoutRef.current)
			}
		}
	}, [])
	
	useEffect(() => { updateInfos(true) }, [account.value])

	const buttonWrapChild = async () => {
		try {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childWrapped: true }
			const acc = account.peek()
			if (acc === undefined) throw new Error('missing account')
			const childInfo = childDomainInfo.peek()
			if (childInfo === undefined) throw new Error('child info missing')
			await wrapDomain(acc, childInfo, true)
			await updateInfos(false)
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
			await updateInfos(false)
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
			await updateInfos(false)
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
			await updateInfos(false)
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
			await updateInfos(false)
		} catch (e: unknown) {
			setError(e)
		} finally {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childOwnershipBurned: false }
		}
	}

	const buttonCreateChild = async () => {
		try {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childExists: true }
			const acc = account.peek()
			if (acc === undefined) throw new Error('missing account')
			const parent = parentDomainInfo.peek()
			if (parent === undefined) throw new Error('parent info missing')
			const child = childDomainInfo.peek()
			if (child === undefined) throw new Error('child info missing')
			await createSubDomain(acc, child, parent)
			await updateInfos(false)
		} catch(e: unknown) {
			setError(e)
		} finally {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childExists: false }
		}
	}
	const buttonSetContentHash = async() => {
		try {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childContentHashIsSet: true }
			const acc = account.peek()
			if (acc === undefined) throw new Error('missing account')
			const child = childDomainInfo.peek()
			if (child === undefined) throw new Error('child info missing')
			const hash = tryEncodeContentHash(contentHashInput.value)
			if (hash === undefined) throw new Error('invalid content hash')
			await setContentHash(acc, child, hash)
			await updateInfos(false)
		} catch(e: unknown) {
			setError(e)
		} finally {
			pendingCheckBoxes.value = { ...pendingCheckBoxes.peek(), childContentHashIsSet: false }
		}	
	}
	
	return <main>
		<div class = 'app'>
			{ !loadingAccount.value && account.value !== undefined ? <WalletComponent account = { account } /> : <></> }
			{ !isWindowEthereum.value ? <p class = 'paragraph'> An Ethereum enabled wallet is required to make immutable domains.</p> : <></> }
			
			<div style = 'display: block'>
				<div class = 'petal-lock'>
					<img src = 'favicon.svg' alt = 'Icon' style ='width: 60px;'/> PetalLock
				</div>
				<p class = 'sub-title'>Make immutable ENS subdomains</p>
			</div>
		
			<input 
				class = 'input' 
				type = 'text' 
				placeholder = '2.horswap.eth' 
				value = { inputValue.value } 
				onInput = { e => handleInput(e.currentTarget.value) }
			/>

			{ loadingInfos.value === true || loadingAccount.value ? <div style = 'max-width: fit-content; margin-inline: auto; padding: 20px;'> <BigSpinner/> </div> : <></> }

			{ !loadingAccount.value && account.value === undefined ? <WalletComponent account = { account } /> : <></> }

			{ errorString.value !== undefined ? <p style = 'color: #b43c42; word-break: break-all; white-space: break-spaces; border: 2px solid rgb(180, 60, 66); border-radius: 5px; padding: 10px;'> { errorString.value }</p> : <> </> }
			
			{ parentDomainInfo.value === undefined || parentDomainInfo.value.registered ? <></>: <p style = 'color: #b43c42'>{ `The name ${ parentDomainInfo.value.label } does not exist in the ENS registry. You need to register the domain to use PetalLock.` }</p> }
			
			{ childDomainInfo.value === undefined || parentDomainInfo.value === undefined || !parentDomainInfo.value.registered ? <></> : <>
				{ checkBoxes.value?.immutable ? <p class = 'status-green'> {`IMMUTABLE until ${ new Date(Number(childDomainInfo.value.expiry) * 1000).toISOString() }` } </p> : <p class = 'status-red'> {`${ childDomainInfo.value.label } is NOT IMMUTABLE` } </p> }
				{ checkBoxes.value?.immutable ? <></>: <p class = 'requirement'> { childDomainInfo.value.label } should satisfy the following conditions to be immutable: </p> }
				
				<div class = 'grid-container'>
					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<p class = 'paragraph requirement'> 1) </p>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.parentWrapped === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text requirement'> { parentDomainInfo.value.label } is wrapped </p>
							</label>
							{ !checkBoxes.value?.parentWrapped && !isSameAddress(account.value, getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
						<button class = 'button is-primary' { ...account.value === undefined || !isSameAddress(account.value, getRightSigningAddress('wrapParent', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.parentWrapped || pendingCheckBoxes.value.parentWrapped ? { disabled: true } : {} } onClick = { buttonWrapParent }>
							Wrap { pendingCheckBoxes.value.parentWrapped ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<p class = 'paragraph requirement'> 2) </p>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.childExists === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text requirement'> { childDomainInfo.value.label } exists </p>
							</label>
							{ !childDomainInfo.value.registered && !isSameAddress(account.value, getRightSigningAddress('createChild', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('createChild', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
						<button class = 'button is-primary' { ...account.value === undefined || childDomainInfo.value.registered || !isSameAddress(account.value, getRightSigningAddress('createChild', childDomainInfo.value, parentDomainInfo.value)) ? { disabled: true } : {} } onClick = { buttonCreateChild }>
							Create Subdomain and burn subodmain fuses { pendingCheckBoxes.value.childExists? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start; width: 100%;'>
						<div style = 'display: grid; grid-template-rows: auto auto; width: 100%;'>
							<label class = 'form-control'>
								<p class = 'paragraph requirement'> 3) </p>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { childDomainInfo.value.contentHash !== '0x' } disabled = { true }/>
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
								{ !checkBoxes.value?.childContentHashIsSet && !isSameAddress(account.value, getRightSigningAddress('setContentHash', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('setContentHash', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
							</> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
						<button class = 'button is-primary' { ...account.value === undefined || !isValidContentHashString(contentHashInput.value) || childDomainInfo.value.contentHash !== '0x' || !isSameAddress(account.value, getRightSigningAddress('setContentHash', childDomainInfo.value, parentDomainInfo.value)) ? { disabled: true } : {} } onClick = { buttonSetContentHash }>
							Set content hash { pendingCheckBoxes.value.childContentHashIsSet ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<p class = 'paragraph requirement'> 4) </p>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.childWrapped === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text requirement'> { childDomainInfo.value.label } is wrapped </p>
							</label>
							<p class = 'paragraph dim'> { `Requires approve all from the owner (asked if needed)` } </p>
							{ !checkBoxes.value?.childWrapped && !isSameAddress(account.value, getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
						<button class = 'button is-primary' { ...account.value === undefined || !isSameAddress(account.value, getRightSigningAddress('wrapChild', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.childWrapped || pendingCheckBoxes.value.childWrapped ? { disabled: true } : {} } onClick = { buttonWrapChild }>
							Wrap { pendingCheckBoxes.value.childWrapped ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<p class = 'paragraph requirement'> 5) </p>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.parentFusesBurned === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text requirement'> { parentDomainInfo.value.label } fuses are burnt </p>
							</label>
							<p class = 'paragraph dim'> { `The fuse "${ parentFuseToBurn }" is burnt` } </p>
							{ !checkBoxes.value?.parentFusesBurned && !isSameAddress(account.value, getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
						<button class = 'button is-primary' { ...account.value === undefined || !isSameAddress(account.value, getRightSigningAddress('parentFuses', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.parentFusesBurned || pendingCheckBoxes.value.parentFusesBurned ? { disabled: true } : {} } onClick = { buttonBurnParentFuses }>
							Burn fuses { pendingCheckBoxes.value.parentFusesBurned ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<p class = 'paragraph requirement'> 6) </p>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.childFusesBurned === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text requirement'> { childDomainInfo.value.label } fuses are burnt </p>
							</label>
							<p class = 'paragraph dim'> { `The fuses ${ childFusesToBurn.map((n) => `"${ n }"`).join(', ') } are burnt` } </p>
							{ !checkBoxes.value?.childFusesBurned && !isSameAddress(account.value, getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value)) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
						<button class = 'button is-primary' { ...account.value === undefined || !isSameAddress(account.value, getRightSigningAddress('childFuses', childDomainInfo.value, parentDomainInfo.value)) || checkBoxes.value?.childFusesBurned || pendingCheckBoxes.value.childFusesBurned  ? { disabled: true } : {} } onClick = { buttonBurnChildFuses }>
							Burn fuses { pendingCheckBoxes.value.childFusesBurned ? <Spinner/> : <></> }
						</button>
					</div>

					<div class = 'grid-item' style = 'justify-self: start'>
						<div style = 'display: grid; grid-template-rows: auto auto;'>
							<label class = 'form-control'>
								<p class = 'paragraph requirement'> 7) </p>
								<input type = 'checkbox' name = 'switch' class = 'check' checked = { checkBoxes.value?.childOwnershipBurned === true } disabled = { true }/>
								<p class = 'paragraph checkbox-text requirement'> { childDomainInfo.value.label } ownership is burnt </p>
							</label>
							<p class = 'paragraph dim'> { `The ownership of subdomain is moved to an address controlled by nobody` } </p>
							{ !isSameAddress(account.value, getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value)) && !(pendingCheckBoxes.value.childOwnershipBurned || checkBoxes.value?.childOwnershipBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.parentWrapped || !checkBoxes.value?.childWrapped) ? <p class = 'paragraph' style = 'color: #b43c42'> { `Switch to ${ getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value) } to sign` } </p> : <></> }
						</div>
					</div>
					<div class = 'grid-item' style = 'justify-self: end; justify-content: center;'>
						<button class = 'button is-primary' { ...account.value === undefined || (!isSameAddress(account.value, getRightSigningAddress('subDomainOwnership', childDomainInfo.value, parentDomainInfo.value)) || pendingCheckBoxes.value.childOwnershipBurned || checkBoxes.value?.childOwnershipBurned || !checkBoxes.value?.childContentHashIsSet || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.childFusesBurned || !checkBoxes.value?.parentWrapped || !checkBoxes.value?.childWrapped) ? { disabled: true } : {} } onClick = { buttonBurnChildOwnership }>
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
