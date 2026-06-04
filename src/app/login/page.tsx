"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sparkles, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await login(username, password);
      
      if (data.token) {
        localStorage.setItem("bufflab_token", data.token);
        localStorage.setItem("bufflab_user", JSON.stringify(data.user));
        router.push("/");
      }
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || "Username atau password salah");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 font-sans relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-brand-ambient/50 border border-zinc-100 p-8 sm:p-10 relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-3 mb-10">
          <div className="relative w-40 h-20 mb-2">
            <Image 
              src="/logo.png" 
              alt="Bufflab Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <p className="text-[11px] text-zinc-400 font-bold tracking-widest uppercase">
              Secure POS Login
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center animate-slide-up">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-400">
                  <Mail size={18} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-brand-secondary hover:border-zinc-300 text-sm rounded-xl pl-11 pr-4 py-3.5 text-brand-primary outline-none transition-colors font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-brand-secondary hover:border-zinc-300 text-sm rounded-xl pl-11 pr-4 py-3.5 text-brand-primary outline-none transition-colors font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span className="text-sm uppercase tracking-wider">Masuk</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Protected Area • Bufflab System v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
