import { promises as fs } from 'fs'
import path = require('path')
import { compile } from 'solc'

const compilePetalLock = async () => {
	const input = {
		language: 'Solidity',
		sources: {
			'PetalLock.sol': { content: await fs.readFile('contracts/PetalLock.sol', 'utf8') },
			'OpenRenewalManager.sol': { content: await fs.readFile('contracts/OpenRenewalManager.sol', 'utf8') },
		},
		settings: {
			optimizer: {
				enabled: true,
				runs: 500
			},
			outputSelection: {
				"*": {
					'*': [ 'evm.bytecode.object', 'evm.deployedBytecode.object', 'abi' ]
				}
			}
		}
	}

	var output = compile(JSON.stringify(input))
	const artifactsDir = path.join(process.cwd(), 'artifacts')
	await fs.mkdir(artifactsDir, { recursive: false })
	fs.writeFile('artifacts/PetalLock.json', output)
}

compilePetalLock().catch(error => {
	console.error(error)
	debugger
	process.exit(1)
})
