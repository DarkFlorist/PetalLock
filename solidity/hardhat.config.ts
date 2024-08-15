import type { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox-viem'

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.26",
		settings: {
			optimizer: {
				enabled: true,
				runs: 1000,
			},
		},
	},
}

export default config
