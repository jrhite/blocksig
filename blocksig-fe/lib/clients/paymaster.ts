import type {
  Account,
  Chain,
  Client,
  PublicClientConfig,
  Transport,
} from "viem";
import { createClient } from "viem";
import type { EntryPoint } from "permissionless/types";
import type {
  PaymasterRpcSchema,
} from "../types/types";
import {
  type PaymasterClientActions,
  paymasterActions,
} from "./decorators/paymaster";

export type PaymasterClient<entryPoint extends EntryPoint> = Client<
  Transport,
  Chain | undefined,
  Account | undefined,
  PaymasterRpcSchema<entryPoint>,
  PaymasterClientActions<entryPoint>
>;

/**
 * Creates a pimlico specific Paymaster Client with a given [Transport](https://viem.sh/docs/clients/intro.html) configured for a [Chain](https://viem.sh/docs/clients/chains.html).
 *
 * - Docs: https://docs.pimlico.io/permissionless/reference/clients/pimlicoPaymasterClient
 *
 * A Pimlico Paymaster Client is an interface to "pimlico paymaster endpoints" [JSON-RPC API](https://docs.pimlico.io/reference/verifying-paymaster/endpoints) methods such as sponsoring user operation, etc through Pimlico Paymaster Actions.
 *
 * @param config - {@link PublicClientConfig}
 * @returns A Pimlico Paymaster Client. {@link PimlicoPaymasterClient}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const pimlicoPaymasterClient = createPimlicoPaymasterClient({
 *   chain: mainnet,
 *   transport: http("https://api.pimlico.io/v2/goerli/rpc?apikey=YOUR_API_KEY_HERE"),
 * })
 */
export const createPaymasterClient = <
  entryPoint extends EntryPoint,
  transport extends Transport = Transport,
  chain extends Chain | undefined = undefined
>(
  parameters: PublicClientConfig<transport, chain> & {
    entryPoint: entryPoint;
  }
): PaymasterClient<entryPoint> => {
  const { key = "public", name = "Paymaster Client" } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    type: "paymasterClient",
  });
  return client.extend(paymasterActions(parameters.entryPoint));
};
