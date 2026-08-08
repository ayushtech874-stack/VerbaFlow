"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { UserCheck, LogOut, Mail, CheckCircle2, ShieldCheck, Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState<string>("");
  const [demoLoggedInUser, setDemoLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            prompt: "select_account",
          },
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/profile` : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google auth error:", err);
      setAuthError(err.message || "Failed to connect to Google OAuth.");
      // Fallback for local demo preview if Supabase provider credentials aren't configured yet
      setDemoLoggedInUser("ayushtech874@gmail.com");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSignIn = async () => {
    if (!emailInput.trim()) return alert("Please enter a valid Gmail address!");
    setDemoLoggedInUser(emailInput.trim());
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDemoLoggedInUser(null);
  };

  const activeEmail = user ? user.email : demoLoggedInUser;
  const username = activeEmail ? (user?.user_metadata?.full_name || activeEmail.split('@')[0]) : null;

  return (
    <div className="min-h-screen bg-[#f5f2eb] dark:bg-[#0e0d0b] text-[#000000] dark:text-[#ffffff] font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-sans uppercase font-bold tracking-[0.25em] text-[#b8860b] dark:text-[#d4af37] border-2 border-[#b8860b] dark:border-[#d4af37] px-4 py-1 rounded-full">
            Account Management
          </span>
          <h2 className="text-4xl font-serif font-bold">User Profile</h2>
        </div>

        {/* User Account Details Card */}
        <div className="card-zorayda p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#b8860b] dark:border-[#d4af37] flex items-center justify-center font-serif text-2xl font-bold text-[#b8860b] dark:text-[#d4af37] bg-[#f8f5ee] dark:bg-[#1a1815]">
                {username ? username.substring(0, 1).toUpperCase() : "?"}
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#000000] dark:text-[#ffffff]">
                  {username ? `Hi, ${username}!` : "No User Logged In"}
                </h3>
                <p className="text-xs font-semibold text-[#222222] dark:text-[#e5e5e5] flex items-center gap-1.5 mt-1">
                  {activeEmail ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Logged in as <strong>{activeEmail}</strong></span>
                    </>
                  ) : (
                    "Guest Mode — Sign in to synchronize your speech data"
                  )}
                </p>
              </div>
            </div>

            {activeEmail ? (
              <button
                onClick={handleSignOut}
                className="px-6 py-2.5 rounded-full border-2 border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out ({username})
              </button>
            ) : null}
          </div>

          {/* Account Metrics Overview */}
          {activeEmail && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/15 dark:border-white/15">
              <div className="p-4 rounded-2xl border border-black/15 dark:border-white/15 text-center">
                <span className="text-xs font-bold text-[#b8860b] dark:text-[#d4af37] uppercase tracking-wider block mb-1">
                  Daily Streak
                </span>
                <span className="text-2xl font-black font-mono text-[#000000] dark:text-[#ffffff] flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500" /> 1 Day
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-black/15 dark:border-white/15 text-center">
                <span className="text-xs font-bold text-[#b8860b] dark:text-[#d4af37] uppercase tracking-wider block mb-1">
                  Account Status
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-1">
                  <ShieldCheck className="w-4 h-4" /> Active & Synced
                </span>
              </div>
            </div>
          )}

          {/* Sign In Options when NOT logged in */}
          {!activeEmail && (
            <div className="space-y-4 pt-4 border-t border-black/15 dark:border-white/15 max-w-md mx-auto text-center">
              {authError && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold text-left">
                  ⚠️ <strong>Supabase Provider Note:</strong> {authError}
                  <div className="mt-1 text-[11px] opacity-90">
                    Falling back to Active Demo Session. Enable <strong>Google Provider</strong> in Supabase Dashboard → Auth → Providers.
                  </div>
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-neutral-200 active:scale-[0.99] font-bold text-xs tracking-widest uppercase py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 shadow-md transition-all border border-black/10 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-black" />
                <span>{loading ? "CONNECTING..." : "SIGN IN WITH GOOGLE ACCOUNT"}</span>
              </button>

              <div className="flex items-center gap-3 my-2 text-xs font-bold text-[#444444] dark:text-[#aaaaaa]">
                <div className="flex-1 h-[1px] bg-black/20 dark:bg-white/20"></div>
                <span>OR GMAIL LINK</span>
                <div className="flex-1 h-[1px] bg-black/20 dark:bg-white/20"></div>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your Gmail address..."
                  className="flex-1 bg-white dark:bg-[#14120f] border-2 border-black dark:border-white/40 rounded-full px-5 py-2.5 text-xs font-bold text-[#000000] dark:text-[#ffffff] focus:outline-none focus:border-[#b8860b]"
                />
                <button onClick={handleMagicLinkSignIn} className="btn-zorayda-outline">
                  <Mail className="w-4 h-4" /> Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
