'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMagic } from './MagicContext';
import { createKernelAccount, createKernelAccountClient } from '@zerodev/sdk';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { createWalletClient, custom, http, hashMessage, toBytes, toHex } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { KERNEL_V3_1, getEntryPoint } from '@zerodev/sdk/constants';

interface ZeroDevContextType {
    smartAccountAddress: string | null;
    isAccountLoading: boolean;
    kernelClient: any | null;
}

const ZeroDevContext = createContext<ZeroDevContextType | undefined>(undefined);

export function ZeroDevProvider({ children }: { children: React.ReactNode }) {
    const { magic, userEmail } = useMagic();
    const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
    const [isAccountLoading, setIsAccountLoading] = useState(false);
    const [kernelClient, setKernelClient] = useState<any | null>(null);

    useEffect(() => {
        async function initZeroDev() {
            if (!magic || !userEmail) {
                setSmartAccountAddress(null);
                setKernelClient(null);
                return;
            }

            setIsAccountLoading(true);
            try {
                // 1. Fetch the active account address directly from Magic
                const accounts = await magic.rpcProvider.request({ method: 'eth_requestAccounts' }) as string[];
                if (!accounts || accounts.length === 0) {
                    throw new Error("No active Magic accounts found.");
                }
                const primaryAccount = accounts[0] as `0x${string}`;

                // 2. Build a native, clean EIP-1193 Signer object that satisfies the validator types
                const smartAccountSigner = {
                    address: primaryAccount,
                    type: 'local' as const,
                    source: 'custom' as const,
                    publicKey: primaryAccount,
                    // The magic sauce: sign the message raw bytes directly via personal_sign
                    signMessage: async ({ message }: { message: any }) => {
                        // ZeroDev passes { raw: Uint8Array | `0x${string}` } for pre-hashed messages
                        if (message && typeof message === 'object' && 'raw' in message) {
                            // message.raw is already hashed bytes — use eth_sign to avoid double-hashing
                            const rawHex = typeof message.raw === 'string'
                                ? message.raw
                                : toHex(message.raw); // import toHex from 'viem'
                            return await magic.rpcProvider.request({
                                method: 'eth_sign',
                                params: [primaryAccount, rawHex],
                            }) as `0x${string}`;
                        }
                        // Plain string message — personal_sign is correct here
                        return await magic.rpcProvider.request({
                            method: 'personal_sign',
                            params: [message, primaryAccount],
                        }) as `0x${string}`;
                    },
                    signTransaction: async () => {
                        throw new Error("Transactions must be routed through the Kernel client proxy.");
                    },
                    signTypedData: async (typedData: any) => {
                        return await magic.rpcProvider.request({
                            method: 'eth_signTypedData_v4',
                            params: [primaryAccount, JSON.stringify(typedData)],
                        }) as `0x${string}`;
                    },
                };

                // 3. Build a standard wallet client for core transaction transport routing
                const walletClient = createWalletClient({
                    account: smartAccountSigner as any,
                    chain: arbitrumSepolia,
                    transport: custom(magic.rpcProvider),
                });

                // 4. Fetch EntryPoint representation explicitly
                const entryPoint = getEntryPoint("0.7");

                // 5. Initialize the validator passing our native smart account signer object
                const ecdsaValidator = await signerToEcdsaValidator(walletClient, {
                    signer: smartAccountSigner as any,
                    entryPoint,
                    kernelVersion: KERNEL_V3_1,
                });

                // 6. Create your Kernel smart contract account
                const kernelAccount = await createKernelAccount(walletClient, {
                    plugins: {
                        sudo: ecdsaValidator,
                    },
                    entryPoint,
                    kernelVersion: KERNEL_V3_1,
                });

                // 7. Connect the proper ERC-4337 Bundler + Paymaster framework node
                const client = createKernelAccountClient({
                    account: kernelAccount,
                    chain: arbitrumSepolia,
                    bundlerTransport: http('https://rpc.zerodev.app/api/v3/1fb8e0c5-8ebf-4671-9983-20991b56832e/chain/421614'),
                    paymaster: true,
                });

                setKernelClient(client);
                setSmartAccountAddress(kernelAccount.address);
            } catch (error) {
                console.error("ZeroDev Smart Account Initialization Failed:", error);
            } finally {
                setIsAccountLoading(false);
            }
        }

        initZeroDev();
    }, [magic, userEmail]);

    return (
        <ZeroDevContext.Provider value={{ smartAccountAddress, isAccountLoading, kernelClient }}>
            {children}
        </ZeroDevContext.Provider>
    );
}

export function useZeroDev() {
    const context = useContext(ZeroDevContext);
    if (!context) throw new Error('useZeroDev must be used within a ZeroDevProvider');
    return context;
}