import { Signal, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { requestAccounts, isValidEnsSubDomain, getDomainInfo, doWeNeedToBurnParentFuses, doWeNeedToBurnChildFuses, isChildOwnershipBurned, burnParentFuses, burnChildFuses, transferChildOwnershipAway, getAccounts, wrapDomain, createSubDomain, setContentHash } from '../utils/ensUtils.js'
import { labelhash, namehash } from 'viem'
import { BigSpinner } from './Spinner.js'
import { ensureError, getSubstringAfterFirstPoint } from '../utils/utilities.js'
import { isValidContentHashString, tryEncodeContentHash } from '../utils/contenthash.js'
import { AccountAddress, CheckBoxes, DomainInfo } from '../types/types.js'
import { BurnChildFuses, BurnDomainOwnership, BurnParentFuses, CreateChild, SetContentHash, WrapChild, WrapParent } from './requirements.js'
import { useOptionalSignal } from './PreactUtils.js'

interface WalletComponentProps {
	account: Signal<AccountAddress | undefined>
}

const WalletComponent = ({ account }: WalletComponentProps) => {
	const connect = async () => {
		account.value = await requestAccounts()
	}
	return account.value !== undefined ? (
		<p style = 'color: gray; justify-self: right;'>{ `Connected with ${ account.value }` }</p>
	) : (
		<button class = 'button is-primary' style = 'justify-self: right;' onClick = { connect }>
			{ `Connect wallet` }
		</button>
	)
}

export function App() {
	const inputValue = useSignal<string>('')
	const contentHashInput = useSignal<string>('') 
	const errorString = useOptionalSignal<string>(undefined)
	const loadingAccount = useSignal<boolean>(false)
	const isWindowEthereum = useSignal<boolean>(true)
	const account = useSignal<AccountAddress | undefined>(undefined)
	const parentDomainInfo = useOptionalSignal<DomainInfo>(undefined)
	const childDomainInfo = useOptionalSignal<DomainInfo>(undefined)
	const checkBoxes = useOptionalSignal<CheckBoxes>(undefined)
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
		errorString.deepValue = ensured.message
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
			const childInfoPromise = getDomainInfo(account.value, childNameHash, ensSubDomain, labelhash(ensSubDomain.slice(0, ensSubDomain.indexOf('.'))))
			const parentInfoPromise = getDomainInfo(account.value, parentNameHash, ensParent, labelhash(ensParent.slice(0, ensParent.indexOf('.'))))
			const parentInfo = await parentInfoPromise
			const childInfo = await childInfoPromise
			parentDomainInfo.deepValue = parentInfo
			childDomainInfo.deepValue = childInfo
			checkBoxes.deepValue = {
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
			if (!isValidEnsSubDomain(ensSubDomain)) return setError(`${ ensSubDomain } is not a valid ENS subdomain. The format should be similar to "2.horswap.eth" or "1.lunaria.darkflorist.eth"`)
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
				loadingAccount.value = true
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
			const childInfo = childDomainInfo.deepPeek()
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
			const parentInfo = parentDomainInfo.deepPeek()
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
			const parent = parentDomainInfo.deepPeek()
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
			const parentInfo = parentDomainInfo.deepPeek()
			if (parentInfo === undefined) throw new Error('parent info missing')
			const childInfo = childDomainInfo.deepPeek()
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
			const childInfo = childDomainInfo.deepPeek()
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
			const parent = parentDomainInfo.deepPeek()
			if (parent === undefined) throw new Error('parent info missing')
			const child = childDomainInfo.deepPeek()
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
			const child = childDomainInfo.deepPeek()
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
			{ !isWindowEthereum.value ? <p class = 'paragraph'> An Ethereum enabled wallet is required to make immutable domains.</p> : <></> }
			
			{ !loadingAccount.value && isWindowEthereum.value ? <WalletComponent account = { account } /> : <></> }

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

			{ errorString.deepValue !== undefined ? <p style = 'color: #b43c42; word-break: break-all; white-space: break-spaces; border: 2px solid rgb(180, 60, 66); border-radius: 5px; padding: 10px;'> { errorString.value }</p> : <> </> }
			
			{ parentDomainInfo.deepValue === undefined || parentDomainInfo.deepValue?.registered ? <></>: <p style = 'color: #b43c42'>{ `The name ${ parentDomainInfo.deepValue.label } does not exist in the ENS registry. You need to register the domain to use PetalLock.` }</p> }
			
			{ checkBoxes.value === undefined || childDomainInfo.deepValue === undefined || childDomainInfo.value === undefined  || parentDomainInfo.value === undefined || !parentDomainInfo.deepValue?.registered ? <></> : <>
				<p class = 'subdomain-header'>{ childDomainInfo.deepValue?.label } </p>
				{ checkBoxes.deepValue?.immutable ? <p class = 'status-green'> {`IMMUTABLE until ${ new Date(Number(childDomainInfo.deepValue.expiry) * 1000).toISOString() }` } </p> : <p class = 'status-red'> NOT IMMUTABLE </p> }
				{ checkBoxes.deepValue?.immutable ? <></> : <p class = 'requirement'> { childDomainInfo.deepValue?.label } should satisfy the following conditions to be immutable: </p> }
				
				<div class = 'grid-container'>
					<WrapParent checkBoxes = { checkBoxes.value } parentDomainInfo = { parentDomainInfo.value } childDomainInfo = { childDomainInfo.value } account = { account } pendingCheckBoxes = { pendingCheckBoxes } button = { buttonWrapParent }/>
					<CreateChild checkBoxes = { checkBoxes.value } parentDomainInfo = { parentDomainInfo.value } childDomainInfo = { childDomainInfo.value } account = { account } pendingCheckBoxes = { pendingCheckBoxes } button = { buttonCreateChild }/>
					<WrapChild checkBoxes = { checkBoxes.value } parentDomainInfo = { parentDomainInfo.value } childDomainInfo = { childDomainInfo.value } account = { account } pendingCheckBoxes = { pendingCheckBoxes } button = { buttonWrapChild }/>
					<SetContentHash contentHashInput = { contentHashInput } handleContentHashInput = { handleContentHashInput } checkBoxes = { checkBoxes.value } parentDomainInfo = { parentDomainInfo.value } childDomainInfo = { childDomainInfo.value } account = { account } pendingCheckBoxes = { pendingCheckBoxes } button = { buttonSetContentHash }/>
					<BurnParentFuses checkBoxes = { checkBoxes.value } parentDomainInfo = { parentDomainInfo.value } childDomainInfo = { childDomainInfo.value } account = { account } pendingCheckBoxes = { pendingCheckBoxes } button = { buttonBurnParentFuses }/>
					<BurnChildFuses checkBoxes = { checkBoxes.value } parentDomainInfo = { parentDomainInfo.value } childDomainInfo = { childDomainInfo.value } account = { account } pendingCheckBoxes = { pendingCheckBoxes } button = { buttonBurnChildFuses }/>
					<BurnDomainOwnership checkBoxes = { checkBoxes.value } parentDomainInfo = { parentDomainInfo.value } childDomainInfo = { childDomainInfo.value } account = { account } pendingCheckBoxes = { pendingCheckBoxes } button = { buttonBurnChildOwnership }/>
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
