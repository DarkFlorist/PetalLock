import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { isAddress } from 'viem'
import { getSafeAddress } from '../utils/safe.js'

export const Settings = () => {
	const safeAddressInput = useSignal<string>(getSafeAddress() ?? '')
	const safeAddressError = useSignal<string | undefined>(undefined)

	useEffect(() => {
		const stored = getSafeAddress()
		safeAddressInput.value = stored ?? ''
	}, [])

	const setSafeAddress = () => {
		const trimmed = safeAddressInput.value.trim()
		if (trimmed.length === 0) {
			localStorage.removeItem('safeAddress')
			location.reload()
			return
		}
		if (!isAddress(trimmed, { strict: true })) {
			safeAddressError.value = 'Invalid address format'
			return
		}
		localStorage.setItem('safeAddress', trimmed)
		location.reload()
	}

	const removeSafeAddress = () => {
		localStorage.removeItem('safeAddress')
		safeAddressInput.value = ''
		location.reload()
	}

	const currentSafeAddress = getSafeAddress()

	return <div style = 'padding-top: 30px; border-top: 1px solid #ccc; margin-top: 30px; display: block;'>
		<p class = 'sub-title'>Settings</p>
		<div style = 'display: block; width: 100%;'>
			<p class = 'paragraph' style = 'margin-bottom: 10px; color: gray;'>
				Safe Address to use to execute single signer safe commands (if empty, do not use Safe)
			</p>
			<div style = 'display: grid; grid-template-columns: auto max-content; gap: 0.5rem;'>
				<input
					class = 'input'
					type = 'text'
					placeholder = '0x...'
					value = { safeAddressInput.value }
					onInput = { (e: Event) => {
						safeAddressInput.value = (e.target as HTMLInputElement).value
						safeAddressError.value = undefined
					} }
				/>
				<button class = 'button' style = 'width: max-content;' onClick = { setSafeAddress }> Set Safe Address</button>
			</div>
			{ safeAddressError.value !== undefined ? <p class = 'error-component' style = 'margin-top: 5px;'> { safeAddressError.value } </p> : <></> }
			{ currentSafeAddress !== undefined ? <p class = 'paragraph' style = 'color: gray; margin-top: 10px;'>
				Currently using Safe: { currentSafeAddress }
				<button class = 'button' style = 'width: max-content; margin-top: 5px; font-size: small; padding: 5px;' onClick = { removeSafeAddress }> Remove</button>
			</p> : <></> }
		</div>
	</div>
}
