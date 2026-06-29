'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMagic } from './MagicContext';
import { createKernelAccount, createKernelAccountClient } from '@zerodev/sdk';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { createWalletClient, custom, http } from 'viem';
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
                // 1. Build standard viem wallet client directly from Magic RPC
                const walletClient = createWalletClient({
                    chain: arbitrumSepolia,
                    transport: custom(magic.rpcProvider),
                });

                // 2. Fetch EntryPoint v0.7 representation explicitly using the verified constant helper
                const entryPoint = getEntryPoint("0.7");

                // 3. Initialize the validator configuration with kernelVersion supplied inside the arguments object
                const ecdsaValidator = await signerToEcdsaValidator(walletClient, {
                    signer: walletClient as any,
                    entryPoint,
                    kernelVersion: KERNEL_V3_1, // Satisfies the validator's strict requirements
                });

                // 4. Create your Kernel smart contract account
                const kernelAccount = await createKernelAccount(walletClient, {
                    plugins: {
                        sudo: ecdsaValidator,
                    },
                    entryPoint,
                    kernelVersion: KERNEL_V3_1,
                });

                // 5. Connect the bundle framework
                const client = createKernelAccountClient({
                    account: kernelAccount,
                    chain: arbitrumSepolia,
                    bundlerTransport: http('https://sepolia-rollup.arbitrum.io/rpc'),
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