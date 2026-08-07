"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { History as HistoryIcon, Eye, RotateCcw, Sparkles, Inbox, Trash2, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import Link from "next/link";

interface HistoryRecord {
  id: string;
  topicId: string;
  topicText: string;
  genre: string;
  attemptedAt: string;
  score: number;
  clarity: number;
  confidence: number;
  grammar: number;
  depth: number;
  structure: number;
  wordsPerMinute: number;
  transcript: string;
  feedback: string;
  reattemptCount: number;
}

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<HistoryRecord | null>(null);

  // CUSTOM THEME CONFIRMATION MODAL STATE
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("verbaflow_user_history");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setHistoryItems(parsed);
        } catch (e) {}
      }
    }
    setLoading(false);
  }, []);

  const handleReattempt = (item: HistoryRecord) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("reattempt_topic", JSON.stringify({
        topicId: item.topicId,
        topicText: item.topicText,
        genre: item.genre,
        reattemptCount: item.reattemptCount + 1
      }));
      window.location.href = "/";
    }
  };

  // TRIGGER CUSTOM THEME DELETE SINGLE RECORD
  const handleDeleteRecord = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Speech Record",
      message: "Are you sure you want to delete this specific speech evaluation record?",
      onConfirm: () => {
        const updated = historyItems.filter((item) => item.id !== id);
        setHistoryItems(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem("verbaflow_user_history", JSON.stringify(updated));
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // TRIGGER CUSTOM THEME DELETE ALL RECORDS
  const handleDeleteAllRecords = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete All History Records",
      message: "⚠️ Are you sure you want to permanently delete ALL speech practice history? This action cannot be undone.",
      onConfirm: () => {
        setHistoryItems([]);
        if (typeof window !== "undefined") {
          localStorage.removeItem("verbaflow_user_history");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0e0d0b] text-[#ffffff] font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-white/15 pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-sans uppercase font-bold tracking-[0.25em] text-[#d4af37] border-2 border-[#d4af37] px-4 py-1 rounded-full">
              Speech Attempt Records
            </span>
            <h2 className="text-4xl font-serif font-bold text-white">Practice History & Analytics</h2>
            <p className="text-sm font-medium text-[#e5e5e5]">Review past speech evaluations, trigger reattempts, or manage your speech logs</p>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleDeleteAllRecords}
              className="btn-zorayda-outline py-2.5 px-5 text-xs border-rose-500 text-rose-400 hover:bg-rose-950/40 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 text-rose-400 inline mr-1.5" /> Delete All History
            </button>
          )}
        </div>

        {/* Empty State UI when user has 0 attempts */}
        {historyItems.length === 0 && !loading ? (
          <div className="card-zorayda p-12 text-center space-y-4 max-w-md mx-auto">
            <Inbox className="w-12 h-12 text-[#d4af37] mx-auto" />
            <h3 className="text-xl font-serif font-bold text-white">No Saved Practice History</h3>
            <p className="text-xs font-semibold text-[#aaaaaa] leading-relaxed">
              You haven't recorded any speaking sessions yet! Complete your first speech prompt to generate user history.
            </p>
            <Link href="/" className="btn-zorayda inline-block mt-2 bg-[#d4af37] text-black border-[#d4af37]">
              Begin First Practice
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div key={item.id} className="card-zorayda p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-white/15 hover:border-[#d4af37] transition-all">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] border border-[#d4af37] px-2.5 py-0.5 rounded-md bg-black">
                      {item.genre}
                    </span>
                    {item.reattemptCount > 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-md">
                        Reattempt #{item.reattemptCount}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white">"{item.topicText}"</h3>
                  <p className="text-xs font-semibold text-[#cccccc]">
                    Attempted on {new Date(item.attemptedAt).toLocaleDateString()} &bull; {item.wordsPerMinute} WPM
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right mr-2">
                    <span className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wider block">Fluency Score</span>
                    <span className="text-xl font-black text-[#d4af37] font-mono">{item.score}/100</span>
                  </div>

                  <button
                    onClick={() => setSelectedAnalysis(item)}
                    className="btn-zorayda-outline text-xs py-2 px-4"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Analysis
                  </button>

                  <button
                    onClick={() => handleReattempt(item)}
                    className="btn-zorayda text-xs py-2 px-4 bg-[#d4af37] text-black border-[#d4af37]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-black" /> Reattempt
                  </button>

                  <button
                    onClick={() => handleDeleteRecord(item.id)}
                    className="p-2.5 rounded-full border border-rose-500/40 text-rose-400 hover:bg-rose-950/50 transition-all"
                    title="Delete this speech record"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CUSTOM OBSIDIAN & GOLD CONFIRMATION DIALOG MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#14120f] border-2 border-[#d4af37] rounded-3xl max-w-md w-full p-6 space-y-5 text-center shadow-2xl">
            <div className="w-12 h-12 bg-rose-950/50 border-2 border-rose-500 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-[#d4af37]">{confirmModal.title}</h3>
              <p className="text-xs font-semibold text-[#e5e5e5] leading-relaxed">{confirmModal.message}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="btn-zorayda-outline flex-1 justify-center py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="btn-zorayda flex-1 justify-center py-2.5 bg-rose-600 border-rose-600 text-white text-xs font-extrabold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#14120f] border-2 border-white/30 rounded-3xl max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#d4af37] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Speech Analysis Breakdown
                </h3>
                <p className="text-xs font-semibold text-[#cccccc]">"{selectedAnalysis.topicText}"</p>
              </div>
              <button onClick={() => setSelectedAnalysis(null)} className="text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="bg-black/40 border-2 border-white/15 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
              <div className="h-[200px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { skill: "Clarity", score: selectedAnalysis.clarity * 10 },
                    { skill: "Confidence", score: selectedAnalysis.confidence * 10 },
                    { skill: "Grammar", score: selectedAnalysis.grammar * 10 },
                    { skill: "Depth", score: selectedAnalysis.depth * 10 },
                    { skill: "Structure", score: selectedAnalysis.structure * 10 }
                  ]}>
                    <PolarGrid stroke="#888888" />
                    <PolarAngleAxis dataKey="skill" stroke="#ffffff" tick={{ fill: "#ffffff", fontSize: 11, fontWeight: 800 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888888" />
                    <Radar name="Attempt Score" dataKey="score" stroke="#d4af37" fill="#d4af37" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="font-bold text-[#aaaaaa]">Overall Fluency Score:</span>
                  <span className="font-mono font-black text-[#d4af37]">{selectedAnalysis.score}/100</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="font-bold text-[#aaaaaa]">Speaking Pace:</span>
                  <span className="font-mono font-bold text-white">{selectedAnalysis.wordsPerMinute} WPM</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="font-bold text-[#aaaaaa]">Clarity & Vocal Tone:</span>
                  <span className="font-mono font-bold text-white">{selectedAnalysis.clarity}/10</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="font-bold text-[#aaaaaa]">Argumentative Depth:</span>
                  <span className="font-mono font-bold text-white">{selectedAnalysis.depth}/10</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="font-bold text-[#aaaaaa]">Speech Structure:</span>
                  <span className="font-mono font-bold text-white">{selectedAnalysis.structure}/10</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#d4af37] uppercase tracking-wider">AI Coach Feedback</h4>
              <p className="text-xs font-semibold leading-relaxed text-[#ffffff] bg-black/60 p-4 rounded-xl border border-white/15">
                "{selectedAnalysis.feedback}"
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#d4af37] uppercase tracking-wider">Recorded Speech Transcript</h4>
              <p className="text-xs font-semibold leading-relaxed text-[#e5e5e5] bg-black/60 p-4 rounded-xl border border-white/15 font-mono max-h-36 overflow-y-auto custom-scrollbar">
                "{selectedAnalysis.transcript}"
              </p>
            </div>

            <button onClick={() => setSelectedAnalysis(null)} className="btn-zorayda w-full justify-center py-3 bg-[#d4af37] text-black border-[#d4af37]">
              Close Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
