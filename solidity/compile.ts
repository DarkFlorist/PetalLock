import { promises as fs } from 'fs'
import { compile } from 'solc'

const compilePetalLock = async () => {
	const input = {
		language: 'Solidity',
		sources: { 'PetalLock.sol': { content: await fs.readFile('contracts/PetalLock.sol', 'utf8') } },
		settings: {
			optimizer: {
				enabled: true,
				runs: 500
			},
			outputSelection: {
				"*": {
					'*': [ 'evm.bytecode.object', 'evm.deployedBytecode.object' ]
				}
			}
		}
	}

	var output = compile(JSON.stringify(input))
	fs.writeFile('artifacts/PetalLock.json', output)
}

compilePetalLock().catch(error => {
	console.error(error)
	debugger
	process.exit(1)
})
