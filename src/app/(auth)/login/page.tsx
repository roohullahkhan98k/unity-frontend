"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../hooks/useToast";
import MetaMaskLogin from "../../components/MetaMaskLogin";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'traditional' | 'wallet'>('traditional');
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useToast();

  // Check if we should auto-switch to wallet mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'wallet') {
      setAuthMode('wallet');
      showToast('Please connect your wallet to link it to your account', 'success');
    }
  }, [searchParams, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      document.cookie = `token=${data.token}; path=/;`;
      showToast("Login successful!", "success");
      router.push("/home");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAuthSuccess = (token: string) => {
    document.cookie = `token=${token}; path=/;`;
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 p-5">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#333] mb-2">Welcome Back</h1>
          <p className="text-[#666] text-base">Sign in to your Unity Social account</p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setAuthMode('traditional')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMode === 'traditional'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Email & Password
          </button>
          <button
            onClick={() => setAuthMode('wallet')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMode === 'wallet'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            MetaMask
          </button>
        </div>

        {authMode === 'traditional' ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 font-semibold text-[#555]">Email Address</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-400" placeholder="Enter your email" disabled={loading} />
            </div>
            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 font-semibold text-[#555]">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-400" placeholder="Enter your password" disabled={loading} />
            </div>
            <button type="submit" className="w-full py-3 px-6 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-indigo-500 text-white hover:bg-indigo-600" disabled={loading}>{loading ? "Signing In..." : "Sign In"}</button>
          </form>
        ) : (
          <MetaMaskLogin
            onSuccess={handleWalletAuthSuccess}
            mode="login"
          />
        )}

        <div className="text-center mt-5">
          <p className="text-[#667eea] font-semibold">
            Don't have an account?{' '}
            <Link href="/register" className="hover:underline">Create one here</Link>
          </p>
        </div>
        <div className="text-center mt-2">
          <Link href="/" className="text-[#667eea] font-semibold hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
} 