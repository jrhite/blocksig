import {
  EntryPoint,
  EntryPointVersion,
  GetEntryPointVersion,
} from "permissionless/types";
import { Address, Hex } from "viem";
import { PartialBy } from "viem/types/utils";

export type UserOperationWithBigIntAsHex<
  entryPointVersion extends EntryPointVersion
> = entryPointVersion extends "v0.6"
  ? {
      sender: Address;
      nonce: Hex;
      initCode: Hex;
      callData: Hex;
      callGasLimit: Hex;
      verificationGasLimit: Hex;
      preVerificationGas: Hex;
      maxFeePerGas: Hex;
      maxPriorityFeePerGas: Hex;
      paymasterAndData: Hex;
      signature: Hex;
      factory?: never;
      factoryData?: never;
      paymaster?: never;
      paymasterVerificationGasLimit?: never;
      paymasterPostOpGasLimit?: never;
      paymasterData?: never;
    }
  : {
      sender: Address;
      nonce: Hex;
      factory: Address;
      factoryData: Hex;
      callData: Hex;
      callGasLimit: Hex;
      verificationGasLimit: Hex;
      preVerificationGas: Hex;
      maxFeePerGas: Hex;
      maxPriorityFeePerGas: Hex;
      paymaster: Address;
      paymasterVerificationGasLimit: Hex;
      paymasterPostOpGasLimit: Hex;
      paymasterData: Hex;
      signature: Hex;
      initCode?: never;
      paymasterAndData?: never;
    };

export type PaymasterRpcSchema<entryPoint extends EntryPoint> = [
  {
    Method: "pm_sponsorUserOperation";
    Parameters: [
      userOperation: GetEntryPointVersion<entryPoint> extends "v0.6"
        ? PartialBy<
            UserOperationWithBigIntAsHex<"v0.6">,
            "callGasLimit" | "preVerificationGas" | "verificationGasLimit"
          >
        : PartialBy<
            UserOperationWithBigIntAsHex<"v0.7">,
            | "callGasLimit"
            | "preVerificationGas"
            | "verificationGasLimit"
            | "paymasterVerificationGasLimit"
            | "paymasterPostOpGasLimit"
          >,
      entryPoint: entryPoint,
      metadata?: {
        sponsorshipPolicyId?: string;
      }
    ];
    ReturnType: GetEntryPointVersion<entryPoint> extends "v0.6"
      ? {
          paymasterAndData: Hex;
          preVerificationGas: Hex;
          verificationGasLimit: Hex;
          callGasLimit: Hex;
          paymaster?: never;
          paymasterVerificationGasLimit?: never;
          paymasterPostOpGasLimit?: never;
          paymasterData?: never;
        }
      : {
          preVerificationGas: Hex;
          verificationGasLimit: Hex;
          callGasLimit: Hex;
          paymaster: Address;
          paymasterVerificationGasLimit: Hex;
          paymasterPostOpGasLimit: Hex;
          paymasterData: Hex;
          paymasterAndData?: never;
        };
  }
];
