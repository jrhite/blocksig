import type { EntryPoint } from "permissionless/types";
import { Client } from "viem";
import { Prettify } from "viem/types/utils";
import { PaymasterClient } from "../paymaster";
import { sponsorUserOperation, SponsorUserOperationParameters, SponsorUserOperationReturnType } from "../sponsorUserOperation";

export type PaymasterClientActions<entryPoint extends EntryPoint> = {
  /**
   * Returns paymasterAndData & updated gas parameters required to sponsor a userOperation.
   *
   * https://docs.pimlico.io/permissionless/reference/pimlico-paymaster-actions/sponsorUserOperation
   *
   * @param args {@link PimlicoSponsorUserOperationParameters} UserOperation you want to sponsor & entryPoint.
   * @returns paymasterAndData & updated gas parameters, see {@link SponsorUserOperationReturnType}
   *
   * @example
   * import { createClient } from "viem"
   * import { sponsorUserOperation } from "permissionless/actions/pimlico"
   *
   * const bundlerClient = createClient({
   *      chain: goerli,
   *      transport: http("https://api.pimlico.io/v2/goerli/rpc?apikey=YOUR_API_KEY_HERE")
   * }).extend(pimlicoPaymasterActions)
   *
   * await bundlerClient.sponsorUserOperation(bundlerClient, {
   *      userOperation: userOperationWithDummySignature,
   *      entryPoint: entryPoint
   * }})
   *
   */
  sponsorUserOperation: (
    args: Omit<
      SponsorUserOperationParameters<entryPoint>,
      "entryPoint"
    >
  ) => Promise<Prettify<SponsorUserOperationReturnType<entryPoint>>>
}

  /**
 * Returns valid sponsorship policies for a userOperation from the list of ids passed
 * - Docs: https://docs.pimlico.io/permissionless/reference/pimlico-paymaster-actions/ValidateSponsorshipPolicies
 *
 * @param args {@link ValidateSponsorshipPoliciesParameters} UserOperation you want to sponsor & entryPoint.
 * @returns valid sponsorship policies, see {@link ValidateSponsorshipPolicies}
 *
 * @example
 * import { createClient } from "viem"
 * import { validateSponsorshipPolicies } from "permissionless/actions/pimlico"
 *
 * const bundlerClient = createClient({
 *   chain: goerli,
 *   transport: http("https://api.pimlico.io/v2/goerli/rpc?apikey=YOUR_API_KEY_HERE")
 * }).extend(pimlicoPaymasterActions)

 *
 * await bundlerClient.validateSponsorshipPolicies({
 *   userOperation: userOperationWithDummySignature,
 *   entryPoint: entryPoint,
 *   sponsorshipPolicyIds: ["sp_shiny_puma"]
 * })
 * Returns
 * [
 *   {
 *     sponsorshipPolicyId: "sp_shiny_puma",
 *     data: {
 *       name: "Shiny Puma",
 *       author: "Pimlico",
 *       icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4...",
 *       description: "This policy is for testing purposes only"
 *    }
 *   }
 * ]
 */
export const paymasterActions =
  <entryPoint extends EntryPoint>(entryPointAddress: entryPoint) =>
    (client: Client): PaymasterClientActions<entryPoint> => ({
      sponsorUserOperation: async (
        args: Omit<
          SponsorUserOperationParameters<entryPoint>,
          "entryPoint"
        >
      ) =>
        sponsorUserOperation<entryPoint>(
          client as PaymasterClient<entryPoint>,
          {
            ...args,
            entryPoint: entryPointAddress
          }
        )
    });

