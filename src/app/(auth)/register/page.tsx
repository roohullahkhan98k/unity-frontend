"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../hooks/useToast";
import MetaMaskLogin from "../../components/MetaMaskLogin";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
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
      showToast('Please connect your wallet to create your account', 'success');
    }
  }, [searchParams, showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      document.cookie = `token=${data.token}; path=/;`;
      showToast("Registration successful!", "success");
      router.push("/home");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAuthSuccess = (token: string) => {
    document.cookie = `token=${token}; path=/;`;
    router.push("/home");
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 p-5">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#333] mb-2">Join Unity Social</h1>
          <p className="text-[#666] text-base">Create your account to get started</p>
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
              <label htmlFor="username" className="block mb-2 font-semibold text-[#555]">Username</label>
              <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-400" placeholder="Choose a username" disabled={loading} />
            </div>
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 font-semibold text-[#555]">Email Address</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-400" placeholder="Enter your email" disabled={loading} />
            </div>
            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 font-semibold text-[#555]">Password</label>
              <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-400" placeholder="Create a password" disabled={loading} />
              {formData.password && (
                <div className="mt-2 text-sm">
                  Password strength: <span className={
                    passwordStrength === 'weak' ? 'text-red-600 font-bold' :
                    passwordStrength === 'medium' ? 'text-yellow-600 font-bold' :
                    passwordStrength === 'strong' ? 'text-green-600 font-bold' : ''
                  }>{passwordStrength}</span>
                </div>
              )}
            </div>
            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block mb-2 font-semibold text-[#555]">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-indigo-400" placeholder="Confirm your password" disabled={loading} />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="mt-2 text-sm text-red-600">Passwords do not match</div>
              )}
            </div>
            <button type="submit" className="w-full py-3 px-6 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-indigo-500 text-white hover:bg-indigo-600" disabled={loading}>{loading ? "Creating Account..." : "Create Account"}</button>
          </form>
        ) : (
          <MetaMaskLogin
            onSuccess={handleWalletAuthSuccess}
            mode="signup"
          />
        )}

        <div className="text-center mt-5">
          <p className="text-[#667eea] font-semibold">
            Already have an account?{' '}
            <Link href="/login" className="hover:underline">Sign in here</Link>
          </p>
        </div>
        <div className="text-center mt-2">
          <Link href="/" className="text-[#667eea] font-semibold hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 p-5">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    </div>}>
      <RegisterForm />
    </Suspense>
  );
} 