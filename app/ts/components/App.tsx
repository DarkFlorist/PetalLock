import { Signal, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { requestAccounts, isValidEnsSubDomain, doWeNeedToBurnParentFuses, doWeNeedToBurnChildFuses, isChildOwnershipBurned, getAccounts, getDomainInfos, isPetalLockDeployed } from '../utils/ensUtils.js'
import { BigSpinner } from './Spinner.js'
import { ensureError } from '../utils/utilities.js'
import { isValidContentHashString } from '../utils/contenthash.js'
import { AccountAddress, CheckBoxes, DomainInfo, FinalChildChecks, ParentChecks } from '../types/types.js'
import { Create, Immutable, Requirements } from './requirements.js'
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
	const petalLockDeployed = useSignal<boolean | undefined>(undefined)
	const account = useSignal<AccountAddress | undefined>(undefined)
	const pathInfo = useOptionalSignal<DomainInfo[]>(undefined)
	const immutable = useSignal<boolean>(false)
	const checkBoxes = useOptionalSignal<CheckBoxes>(undefined)
	const loadingInfos = useSignal<boolean>(false)
	const creating = useSignal<boolean>(false)
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
			if (showLoading) loadingInfos.value = true
			const newPathInfo = await getDomainInfos(account.value, ensSubDomain)
			pathInfo.deepValue = newPathInfo
			immutable.value = false
			checkBoxes.deepValue = newPathInfo.map((currElement, index): FinalChildChecks | ParentChecks => {
				if (index === newPathInfo.length - 1) {
					immutable.value = currElement.isWrapped && !doWeNeedToBurnChildFuses(currElement) && isChildOwnershipBurned(currElement)
					return {
						type: 'finalChild' as const,
						exists: currElement.registered,
						isWrapped: currElement.isWrapped,
						fusesBurned: !doWeNeedToBurnChildFuses(currElement),
						ownershipBurned: isChildOwnershipBurned(currElement),
						immutable: currElement.isWrapped && !doWeNeedToBurnChildFuses(currElement) && isChildOwnershipBurned(currElement),
						contentHashIsSet: currElement.contentHash !== '0x',
						domainInfo: currElement,
					}
				}
				return {
					type: 'parent' as const,
					exists: currElement.registered,
					isWrapped: currElement.isWrapped,
					fusesBurned: !doWeNeedToBurnParentFuses(currElement),
					domainInfo: currElement,
				}
			})
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
				petalLockDeployed.value = await isPetalLockDeployed(account.value)
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

			{ errorString.deepValue !== undefined ? <p class = 'error-component'> { errorString.value }</p> : <> </> }
			
			{ checkBoxes.deepValue === undefined || checkBoxes.deepValue[0] === undefined || checkBoxes.deepValue[0].exists ? <></>: <p style = 'color: #b43c42'>{ `The name ${ checkBoxes.deepValue[0].domainInfo.label } does not exist in the ENS registry. You need to register the domain to use PetalLock.` }</p> }
			
			{ checkBoxes.value !== undefined ? <Immutable checkBoxesArray = { checkBoxes.value } /> : <></> }

			<Requirements checkBoxesArray = { checkBoxes }/>

			<Create
				contentHashInput = { contentHashInput }
				loadingInfos = { loadingInfos }
				immutable = { immutable }
				handleContentHashInput= { handleContentHashInput }
				account = { account }
				checkBoxes = { checkBoxes }
				updateInfos = { updateInfos }
				creating = { creating }
				petalLockDeployed = { petalLockDeployed }
			/>
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
