import { promises as fs } from 'fs'
import path = require('path')
import { compile } from 'solc'

async function exists(path: string) {
	try {
		await fs.stat(path)
		return true
	} catch {
		return false
	}
}

const compilePetalLock = async () => {
	const input = {
		language: 'Solidity',
		sources: {
			'PetalLock.sol': { content: await fs.readFile('contracts/PetalLock.sol', 'utf8') },
			'OpenRenewalManager.sol': { content: await fs.readFile('contracts/OpenRenewalManager.sol', 'utf8') },
		},
		settings: {
			viaIR: true,
			optimizer: {
				enabled: true,
				runs: 500,
				details: {
					inliner: true,
				}
			},
			outputSelection: {
				"*": {
					'*': [ 'evm.bytecode.object', 'evm.deployedBytecode.object', 'abi' ]
				}
			},
		},
	}

	var output = compile(JSON.stringify(input))
	const artifactsDir = path.join(process.cwd(), 'artifacts')
	if (!await exists(artifactsDir)) await fs.mkdir(artifactsDir, { recursive: false })
	await fs.writeFile(path.join(artifactsDir, 'PetalLock.json'), output)
}

compilePetalLock().catch(error => {
	console.error(error)
	debugger
	process.exit(1)
})
