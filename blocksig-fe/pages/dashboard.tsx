import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createPublicClient, getContract, http } from "viem";
import { Alert } from "../components/AlertWithLink";
import { useSmartAccount } from "../hooks/SmartAccountContext";
import VANILLA_NFT_ABI from "../lib/vanillaNFTABI.json";

import defaultChain from "../config/defaultChain";
import SettingsPage from "./settings";

// import ImageGallery from "react-image-gallery";

// const images = [
//   {
//     original: "https://picsum.photos/id/1018/1000/600/",
//     thumbnail: "https://picsum.photos/id/1018/250/150/",
//   },
//   {
//     original: "https://picsum.photos/id/1015/1000/600/",
//     thumbnail: "https://picsum.photos/id/1015/250/150/",
//   },
//   {
//     original: "https://picsum.photos/id/1019/1000/600/",
//     thumbnail: "https://picsum.photos/id/1019/250/150/",
//   },
// ];

// a vanilla NFT I created and deployed to Base Sepolia
const nftContractAddress = "0x05Ab4889FEab8959aBD7939C3fA1C9E2ADF1374c";

export default function DashboardPage() {
  const router = useRouter();

  const { ready, authenticated, logout } = usePrivy();

  const { smartAccountAddress, smartAccountClient, eoa } = useSmartAccount();

  console.log({ smartAccountAddress, smartAccountClient, eoa });

  const isLoading = !smartAccountAddress || !smartAccountClient;
  const [isMinting, setIsMinting] = useState(false);

  const mint = async () => {
    // The mint button is disabled if either of these are undefined
    if (isLoading) return;

    // Store a state to disable the mint button while mint is in progress
    setIsMinting(true);
    const toastId = toast.loading("Minting...");

    try {
      const vanillaNFTContract = getContract({
        address: nftContractAddress,
        abi: VANILLA_NFT_ABI,
        client: {
          public: createPublicClient({
            chain: defaultChain,
            transport: http(defaultChain.rpcUrls.default.http[0]),
          }),
          wallet: smartAccountClient,
        },
      });

      toast.update(toastId, {
        render: "Waiting for your transaction to be confirmed...",
        type: "info",
        isLoading: true,
      });

      const txHash = await vanillaNFTContract!.write.mint!();

      toast.update(toastId, {
        render: (
          <Alert
            href={`${defaultChain.blockExplorers.default.url}/tx/${txHash}`}
          >
            Successfully minted! Click here to see your transaction.
          </Alert>
        ),
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Mint failed with error: ", error);

      console.error(`Error: ${JSON.stringify(error, undefined, 2)}`);

      toast.update(toastId, {
        render: (
          <Alert>
            There was an error sending your transaction. See the developer
            console for more info.
          </Alert>
        ),
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }

    setIsMinting(false);
  };

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>blocksig</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated && !isLoading ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
            <div className="mt-12 flex gap-4 flex-wrap"></div>
            <SettingsPage />
            <button
              onClick={mint}
              className="text-sm bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 py-2 px-4 rounded-md text-white"
              disabled={isLoading || isMinting}
            >
              Mint NFT
            </button>
            {/* <ImageGallery items={images} /> */}
          </>
        ) : null}
      </main>
    </>
  );
}
