"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sparkles, Clock, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DebateTurn {
  speaker: "user" | "ai";
  text: string;
}

export default function DebatePage() {
  const [topic] = useState<string>("Is Artificial Intelligence a Threat to Human Creativity?");
  const [rounds, setRounds] = useState<DebateTurn[]>([
    {
      speaker: "ai",
      text: "Welcome to AI Debate Arena preview! I will argue FOR the stance that AI limits genuine human artistic expression. Present your opening argument when ready!"
    }
  ]);
  const [userSpeech, setUserSpeech] = useState<string>("");

  const handleSendArgument = () => {
    if (!userSpeech.trim()) return;

    const updatedRounds: DebateTurn[] = [...rounds, { speaker: "user", text: userSpeech }];
    setRounds(updatedRounds);
    setUserSpeech("");

    setTimeout(() => {
      setRounds((prev) => [
        ...prev,
        {
          speaker: "ai",
          text: `Interesting point! However, while you argue that AI acts merely as an efficiency tool, algorithms can now generate hyper-realistic art in seconds, reducing the economic value of human craft. How do you address the devaluation of artisan labor?`
        }
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0e0d0b] text-[#ffffff] font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8 relative">
        {/* PROMINENT COMING SOON BANNER */}
        <div className="bg-[#1a1815] border-2 border-[#d4af37] p-6 rounded-3xl text-center space-y-3 shadow-2xl animate-pulse">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#d4af37] bg-black px-4 py-1.5 rounded-full border border-[#d4af37]/60 inline-flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> 🚀 FEATURE COMING SOON
          </span>
          <h2 className="text-3xl font-serif font-black text-white">Full AI Debate Arena (Under Active Construction)</h2>
          <p className="text-xs font-semibold text-[#e5e5e5] max-w-xl mx-auto leading-relaxed">
            We are engineering a multi-turn, real-time voice-interactive rebuttal engine. Below is a preview of the debate motion interface!
          </p>
          <div className="pt-2">
            <Link href="/" className="btn-zorayda bg-[#d4af37] text-black border-[#d4af37] py-2 px-6 text-xs font-extrabold">
              <ArrowLeft className="w-4 h-4 text-black" /> Return to Speech Studio
            </Link>
          </div>
        </div>

        <div className="text-center space-y-2 opacity-80">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#d4af37] border-2 border-[#d4af37] px-4 py-1 rounded-full">
            Preview Arena Mode
          </span>
          <h2 className="text-4xl font-serif font-bold text-white">AI Debate Arena</h2>
          <p className="text-sm font-medium text-[#e5e5e5]">Interactive argument & counterpoint practice vs AI Opponent</p>
        </div>

        {/* Motion Banner */}
        <div className="card-zorayda p-8 text-center space-y-2 opacity-80">
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#d4af37]">Debate Motion</span>
          <h3 className="text-2xl font-serif font-bold text-white">"{topic}"</h3>
        </div>

        {/* Argument History */}
        <div className="card-zorayda p-8 min-h-[320px] max-h-[420px] overflow-y-auto space-y-4 opacity-80">
          {rounds.map((round, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl max-w-xl text-xs space-y-1 ${
                round.speaker === "ai"
                  ? "debate-ai-bubble mr-auto"
                  : "bg-white/10 text-white ml-auto border-2 border-white/30"
              }`}
            >
              <span className="font-bold text-[10px] uppercase tracking-wider block text-[#d4af37]">
                {round.speaker === "ai" ? "AI Opponent" : "You (Debater)"}
              </span>
              <p className="font-semibold leading-relaxed text-white">{round.text}</p>
            </div>
          ))}
        </div>

        {/* Practice Input Bar */}
        <div className="flex gap-2 opacity-80">
          <input
            type="text"
            value={userSpeech}
            onChange={(e) => setUserSpeech(e.target.value)}
            placeholder="Type your debate argument or rebuttal..."
            className="flex-1 bg-[#181614] border-2 border-white/40 rounded-full px-6 py-3 text-xs font-bold text-white placeholder-[#aaaaaa] focus:outline-none focus:border-[#d4af37]"
          />
          <button onClick={handleSendArgument} className="btn-zorayda bg-[#d4af37] text-black border-[#d4af37]">
            Submit Rebuttal
          </button>
        </div>
      </main>
    </div>
  );
}
