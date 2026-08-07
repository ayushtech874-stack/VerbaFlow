"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { BarChart3, Info, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [radarData, setRadarData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [hasHistory, setHasHistory] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("verbaflow_user_history");
      if (stored) {
        try {
          const items = JSON.parse(stored);
          if (Array.isArray(items) && items.length > 0) {
            setHasHistory(true);

            const totalClarity = items.reduce((acc: number, cur: any) => acc + (cur.clarity || 8), 0) / items.length;
            const totalConfidence = items.reduce((acc: number, cur: any) => acc + (cur.confidence || 7), 0) / items.length;
            const totalGrammar = items.reduce((acc: number, cur: any) => acc + (cur.grammar || 8), 0) / items.length;
            const totalDepth = items.reduce((acc: number, cur: any) => acc + (cur.depth || 6), 0) / items.length;
            const totalStructure = items.reduce((acc: number, cur: any) => acc + (cur.structure || 7), 0) / items.length;

            setRadarData([
              { skill: "Clarity", score: Math.round(totalClarity * 10) },
              { skill: "Confidence", score: Math.round(totalConfidence * 10) },
              { skill: "Grammar", score: Math.round(totalGrammar * 10) },
              { skill: "Depth", score: Math.round(totalDepth * 10) },
              { skill: "Structure", score: Math.round(totalStructure * 10) },
            ]);

            const trends = items.slice(-6).map((item: any, idx: number) => ({
              session: `Speech #${idx + 1}`,
              wpm: item.wordsPerMinute || 110,
              score: item.score || 80
            }));
            setTrendData(trends);
          }
        } catch (e) {}
      }
    }
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f2eb] dark:bg-[#0e0d0b] text-[#000000] dark:text-[#ffffff] font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-sans uppercase font-bold tracking-[0.25em] text-[#b8860b] dark:text-[#d4af37] border-2 border-[#b8860b] dark:border-[#d4af37] px-4 py-1 rounded-full">
            Macro Skill Trajectory
          </span>
          <h2 className="text-4xl font-serif font-bold">Aggregate Speech Analytics</h2>
          <p className="text-sm font-medium text-[#222222] dark:text-[#e5e5e5]">Overall competency averages and WPM trajectory across your speech sessions</p>
        </div>

        {/* Informational Purpose Banner */}
        <div className="card-zorayda p-6 border-l-4 border-l-[#b8860b] dark:border-l-[#d4af37] flex items-start gap-4">
          <Info className="w-6 h-6 text-[#b8860b] dark:text-[#d4af37] flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#000000] dark:text-[#ffffff]">
              What is the Purpose of Analytics vs History?
            </h4>
            <p className="font-medium text-[#333333] dark:text-[#cccccc] leading-relaxed">
              While your <strong>History & Profile tabs</strong> store your chronological speech logs, transcripts, and topic reattempts, this <strong>Analytics Dashboard</strong> aggregates your performance across all sessions to reveal your overall <strong>macro strengths and weaknesses</strong> (e.g. average Clarity vs Depth) and tracks your WPM fluency trajectory over time!
            </p>
          </div>
        </div>

        {!hasHistory && !loading ? (
          <div className="card-zorayda p-12 text-center space-y-4 max-w-md mx-auto">
            <BarChart3 className="w-12 h-12 text-[#b8860b] dark:text-[#d4af37] mx-auto" />
            <h3 className="text-xl font-serif font-bold text-[#000000] dark:text-[#ffffff]">No Analytics Available Yet</h3>
            <p className="text-xs font-semibold text-[#444444] dark:text-[#aaaaaa] leading-relaxed">
              Complete your first speaking practice session to generate your real 5-dimension radar averages and WPM trajectory line chart!
            </p>
            <Link href="/" className="btn-zorayda inline-block mt-2">
              Begin Practice Session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-zorayda p-6">
              <h3 className="font-serif text-base font-bold text-[#b8860b] dark:text-[#d4af37] mb-4">Average 5-Dimension Competency</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#666666" />
                    <PolarAngleAxis dataKey="skill" stroke="#000000" tick={{ fill: "#000000", fontSize: 12, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666666" />
                    <Radar name="User Competency" dataKey="score" stroke="#b8860b" fill="#b8860b" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-zorayda p-6">
              <h3 className="font-serif text-base font-bold text-[#b8860b] dark:text-[#d4af37] mb-4">Fluency Trajectory (Score & WPM)</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="session" stroke="#000000" />
                    <YAxis stroke="#000000" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#000000", color: "#000000" }} />
                    <Line type="monotone" dataKey="score" stroke="#b8860b" strokeWidth={3} />
                    <Line type="monotone" dataKey="wpm" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
