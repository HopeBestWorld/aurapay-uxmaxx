'use client';

import React, { useState } from 'react';
import { useMagic } from '@/context/MagicContext';
import { useZeroDev } from '@/context/ZeroDevContext'; // Added this import line ✨

export default function Home() {
  const { userEmail, loginWithEmail, logout, isInitializing, isLoading } = useMagic();
  const [emailInput, setEmailInput] = useState('');
  const { smartAccountAddress, isAccountLoading } = useZeroDev();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    try {
      await loginWithEmail(emailInput);
      // After login resolves, Next.js re-renders based on the updated userEmail context value!
    } catch (error) {
      console.error("Login component caught an error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFF9F2] to-[#FFF3E3] text-slate-800 font-sans selection:bg-amber-200">

      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-rose-500 bg-clip-text text-transparent tracking-tight">
            AuraPay
          </span>
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Arbitrum
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
          {isInitializing ? (
            <div className="w-20 h-9 bg-slate-200 animate-pulse rounded-xl" />
          ) : userEmail ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 font-medium">✨ {userEmail}</span>
              <button onClick={logout} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl transition-all">
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const promptEmail = prompt("Enter your email to sign in:");
                if (promptEmail) loginWithEmail(promptEmail);
              }}
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              Sign In
            </button>
          )}
        </div>
      </nav >

      {/* Hero Section */}
      < header className="max-w-4xl mx-auto text-center px-6 pt-16 pb-20" >
        <div className="inline-flex items-center space-x-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm">
          <span>✨ Making Web3 feel like home</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
          Micro-payments made{' '}
          <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 bg-clip-text text-transparent">
            effortlessly simple.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
          Send pocket-sized payments instantly with your favorite social login. No seed phrases, no complex wallet apps, and absolutely zero gas fees for you. Just smooth, secure transactions.
        </p>

        {/* Call to Action Box */}

        {userEmail ? (
          <div className="max-w-md mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-xl text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">🎉 You're logged in!</h3>
            <p className="text-slate-600 text-sm mb-4">Ready to try your first gasless transaction on Arbitrum?</p>

            {isAccountLoading ? (
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                ZeroDev Smart Account Initializing...
              </div>
            ) : smartAccountAddress ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-mono break-all selection:bg-emerald-200">
                <span className="font-sans block text-slate-500 font-medium mb-1 text-[10px] tracking-wider uppercase">Your Gasless Account Address</span>
                {smartAccountAddress}
              </div>
            ) : (
              <div className="text-xs text-rose-600">Failed to establish account proxy connection.</div>
            )}
          </div>
        ) : (
          <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-amber-100/50 shadow-xl shadow-amber-900/5 flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email to get started"
              disabled={isLoading}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all disabled:opacity-50"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap disabled:opacity-50"
            >
              {isLoading ? 'Sending Link...' : "Let's Go! 🚀"}
            </button>
          </form>
        )
        }
      </header >

      {/* Feature Section */}
      < section id="features" className="max-w-6xl mx-auto px-6 py-12" >
        <div className="grid md:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-amber-100/30 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
              👋
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Social Onboarding</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Log in instantly using Google or email via Magic Labs. An embedded wallet handles security silently behind the scenes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-amber-100/30 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
              ⛽
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Zero Gas Fees</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Thanks to ZeroDev account abstraction, gas fees are completely sponsored. What you send is exactly what they receive.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-amber-100/30 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Lightning Fast</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Built on Arbitrum's high-speed network, your transfers finalize in the blink of an eye without lag or network congestion.
            </p>
          </div>

        </div>
      </section >

      {/* Footer */}
      < footer className="text-center py-12 text-slate-400 text-xs" >
        <p>© 2026 AuraPay. Proudly built for the UXmaxx Hackathon.</p>
      </footer >
    </div >
  );
}