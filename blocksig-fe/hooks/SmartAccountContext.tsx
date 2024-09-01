import { ConnectedWallet, useWallets } from "@privy-io/react-auth";

import {
  ENTRYPOINT_ADDRESS_V06,
  createSmartAccountClient,
  walletClientToSmartAccountSigner,
  type SmartAccountClient,
} from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import type { ENTRYPOINT_ADDRESS_V06_TYPE } from "permissionless/types";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import {
  PaymasterClient,
  createPaymasterClient,
} from "../lib/clients/paymaster";

import defaultChain from "../config/defaultChain";

/** Interface returned by custom `useSmartAccount` hook */
type SmartAccount = {
  /** ConnectedWallet representing the user's EOA (embedded wallet) */
  eoa: ConnectedWallet | undefined;
  /** Smart account client to send signature/transaction requests to the smart account */
  smartAccountClient?:
    | SmartAccountClient<ENTRYPOINT_ADDRESS_V06_TYPE>
    | undefined;
  /** Smart account address */
  smartAccountAddress?: `0x${string}` | undefined;
  /** Boolean to indicate whether the smart account state has initialized */
  smartAccountReady: boolean;
};

const SmartAccountContext = React.createContext<SmartAccount>({
  eoa: undefined,
  smartAccountClient: undefined,
  smartAccountAddress: undefined,
  smartAccountReady: false,
});

export const useSmartAccount = () => {
  return useContext(SmartAccountContext);
};

export const SmartAccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Get a list of all of the wallets (EOAs) the user has connected to your site
  const { wallets } = useWallets();
  // Find the embedded wallet by finding the entry in the list with a `walletClientType` of 'privy'
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  console.log({ wallets });
  console.log({ embeddedWallet });

  // States to store the smart account and its status
  const [eoa, setEoa] = useState<ConnectedWallet | undefined>();
  const [smartAccountClient, setSmartAccountClient] =
    useState<SmartAccountClient<ENTRYPOINT_ADDRESS_V06_TYPE>>();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    `0x${string}` | undefined
  >();
  const [smartAccountReady, setSmartAccountReady] = useState(false);

  //
  // Coinbase list of JSON RPC methods for bundler and paymaster here:
  // https://docs.cdp.coinbase.com/node/docs/paymaster-bundler-api/#bundler-methods
  //

  // Initialize RPC client connected to Base Sepolia RPC URL. Used to submit signed user operations to the
  // network
  // const bundlerClient: BundlerClient<ENTRYPOINT_ADDRESS_V06_TYPE> = useMemo(
  //   () =>
  //     createBundlerClient({
  //       transport: http(
  //         process.env.NEXT_PUBLIC_BASE_SEPOLIA_BUNDLER_PAYMASTER_URL
  //       ),
  //       entryPoint: ENTRYPOINT_ADDRESS_V06,
  //     }),
  //   []
  // );

  // Initialize RPC client connected to the Base Sepolia Paymaster. Used to populate
  // `paymasterAndData` field of user operations.
  //
  // https://github.com/coinbase/paymaster-bundler-examples/blob/master/examples/alchemy/src/paymaster.js
  const paymasterClient: PaymasterClient<ENTRYPOINT_ADDRESS_V06_TYPE> = useMemo(
    () =>
      createPaymasterClient({
        chain: defaultChain,
        transport: http(
          process.env.NEXT_PUBLIC_BASE_SEPOLIA_BUNDLER_PAYMASTER_URL
        ),
        entryPoint: ENTRYPOINT_ADDRESS_V06,
      }),
    []
  );

  useEffect(() => {
    // Creates a smart account given a Privy `ConnectedWallet` object representing
    // the  user's EOA.
    const createSmartWallet = async (eoa: ConnectedWallet) => {
      console.log(`in createSmartWallet: eoa = ${eoa.address}`);
      // Get an EIP1193 provider and viem WalletClient for the EOA
      const eip1193Provider = await eoa.getEthereumProvider();
      const privyClient = createWalletClient({
        account: embeddedWallet?.address as `0x${string}`,
        chain: defaultChain,
        transport: custom(eip1193Provider),
      });

      const smartAccountSigner = walletClientToSmartAccountSigner(privyClient);

      const publicClient = createPublicClient({
        chain: defaultChain,
        transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
      });

      const simpleSmartAccount = await signerToSimpleSmartAccount(
        publicClient,
        {
          signer: smartAccountSigner,
          entryPoint: ENTRYPOINT_ADDRESS_V06,
        }
      );

      // console.log({ simpleSmartAccount });

      const smartAccountClient = createSmartAccountClient({
        account: simpleSmartAccount,
        chain: defaultChain, // Replace this with the chain for your app
        bundlerTransport: http(
          process.env.NEXT_PUBLIC_BASE_SEPOLIA_BUNDLER_PAYMASTER_URL
        ),
        middleware: {
          //
          // How is pimlico_getUserOperationGasPrice different from eth_estimateUserOperationGas?
          //
          // eth_estimateUserOperationGas estimates the gas limits for the user operation (i.e. how much
          // total gas can be spent for the difference stages of the user operation).
          //
          // In contrast, pimlico_getUserOperationGasPrice responds with the gas prices (i.e. for each
          // unit of gas, what is the amount of ETH you're willing to pay to the bundler).
          //
          // gasPrice: async () => {
          //   return (await bundlerClient.getUserOperationGasPrice()).fast;
          // },
          //
          sponsorUserOperation: paymasterClient.sponsorUserOperation, // optional
        },
      });

      const smartAccountAddress = smartAccountClient.account?.address;

      console.log({
        eoa,
        smartAccountClient,
        smartAccountAddress,
        smartAccountReady,
      });

      setEoa(eoa);
      setSmartAccountClient(smartAccountClient);
      setSmartAccountAddress(smartAccountAddress);
      setSmartAccountReady(true);
    };

    if (embeddedWallet) createSmartWallet(embeddedWallet);
  }, [embeddedWallet?.address]);

  return (
    <SmartAccountContext.Provider
      value={{
        eoa: eoa,
        smartAccountClient: smartAccountClient,
        smartAccountAddress: smartAccountAddress,
        smartAccountReady: smartAccountReady,
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};
