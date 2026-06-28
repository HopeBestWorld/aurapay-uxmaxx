'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Magic } from 'magic-sdk';

interface MagicContextType {
    magic: Magic | null;
    userEmail: string | null;
    isInitializing: boolean;
    isLoading: boolean;
    loginWithEmail: (email: string) => Promise<void>;
    logout: () => Promise<void>;
}

const MagicContext = createContext<MagicContextType | undefined>(undefined);

export function MagicProvider({ children }: { children: React.ReactNode }) {
    const [magic, setMagic] = useState<Magic | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const magicKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || 'pk_live_YOUR_KEY_HERE';

        if (typeof window !== 'undefined') {
            const magicInstance = new Magic(magicKey, {
                network: 'sepolia',
            });
            setMagic(magicInstance);

            magicInstance.user.isLoggedIn().then(async (loggedIn) => {
                if (loggedIn) {
                    try {
                        const accounts = await magicInstance.rpcProvider.request({ method: 'eth_accounts' }) as string[];
                        if (accounts && accounts.length > 0) {
                            try {
                                const info = await magicInstance.user.getInfo();
                                setUserEmail(info.email || `User (${accounts[0].slice(0, 6)}...)`);
                            } catch {
                                setUserEmail(`User (${accounts[0].slice(0, 6)}...)`);
                            }
                        }
                    } catch (e) {
                        console.error("Failed to restore session accounts:", e);
                    }
                }
                setIsInitializing(false);
            }).catch(() => setIsInitializing(false));
        }
    }, []);

    const loginWithEmail = async (email: string) => {
        if (!magic) return;
        setIsLoading(true);
        try {
            await magic.auth.loginWithEmailOTP({ email });

            const accounts = await magic.rpcProvider.request({ method: 'eth_accounts' }) as string[];

            try {
                // Changed magicInstance to magic here ✨
                const info = await magic.user.getInfo();
                setUserEmail(info.email || email);
            } catch {
                setUserEmail(email);
            }
        } catch (error: any) {
            if (error.message?.includes("User canceled action")) {
                console.log("User gracefully cancelled the OTP configuration flow.");
            } else {
                console.error("Magic Authentication Failed:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        if (!magic) return;
        setIsLoading(true);
        await magic.user.logout();
        setUserEmail(null);
        setIsLoading(false);
    };

    return (
        <MagicContext.Provider value={{ magic, userEmail, isInitializing, isLoading, loginWithEmail, logout }}>
            {children}
        </MagicContext.Provider>
    );
}

export function useMagic() {
    const context = useContext(MagicContext);
    if (!context) throw new Error('useMagic must be used within a MagicProvider');
    return context;
}