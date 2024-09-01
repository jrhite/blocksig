import "@nomicfoundation/hardhat-toolbox-viem";
import { vars, type HardhatUserConfig } from "hardhat/config";
import { baseSepolia } from "viem/chains";

// const overrideOptimizedCompilerSettings = {
//   version: "0.8.24",
//   settings: {
//     optimizer: { enabled: true, runs: 1000000 },
//     viaIR: true,
//   },
// };

const config: HardhatUserConfig = {
  //defaultNetwork: 'localhost',
  //defaultNetwork: 'hardhat',
  defaultNetwork: baseSepolia.network,
  networks: {
    "base-sepolia": {
      url: baseSepolia.rpcUrls.default.http[0],
      accounts: [vars.get("TEST_AA_ACCOUNT_PRIVATE_KEY")],
    },
  },
  etherscan: {
    apiKey: {
      "base-sepolia": vars.get("BASESCAN_API_KEY"),
    },
    customChains: [
      {
        network: baseSepolia.network,
        chainId: baseSepolia.id,
        urls: {
          apiURL: baseSepolia.blockExplorers.default.apiUrl,
          browserURL: baseSepolia.blockExplorers.default.url,
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
};

export default config;
