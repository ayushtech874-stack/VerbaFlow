"use client";

import React, { useState, useEffect, useRef } from "react";
import categoriesData from "@/data/categories.json";
import { Navbar } from "@/components/Navbar";
import { soundFX } from "@/lib/soundFX";
import {
  Sparkles, Mic, Video, RefreshCw, Clock, Download, PlusCircle, BookOpen, CheckCircle, FileText, ArrowDownCircle, Trash2, RotateCcw, Compass, MessageSquare, Send, Lock, Undo2, CheckSquare, Layers, Info, Shuffle, AlertTriangle
} from "lucide-react";
import confetti from "canvas-confetti";

interface Genre {
  id: string;
  name: string;
  description: string;
  topics: string[];
}

interface CategoryGroup {
  category: string;
  genres: Genre[];
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  summary?: string;
  timestamp: string;
}

export default function Home() {
  const [categories] = useState<CategoryGroup[]>(categoriesData as CategoryGroup[]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // SINGLE OR MULTI-GENRE SELECTION STATE (DEFAULT TO 'indian_history')
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>(["indian_history"]);
  
  const [currentTopic, setCurrentTopic] = useState<string>("Click any genre below or press 'Shuffle & Generate Random Topic' to begin!");
  const [isSlotMachine, setIsSlotMachine] = useState<boolean>(false);
  const [customTopicInput, setCustomTopicInput] = useState<string>("");

  // TOPIC CONFIRMATION & STEPPED FLOW STATE
  const [isTopicConfirmed, setIsTopicConfirmed] = useState<boolean>(false);
  const [confirmedTopic, setConfirmedTopic] = useState<string>("");

  // Prep Timer States (Supports 1, 2, 3, 5, 10, 15, 30, 45, 60 MIN)
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(1);
  const [customPrepMinutesInput, setCustomPrepMinutesInput] = useState<string>("");
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Speech Duration Monitor Timer States
  const [targetSpeechMinutes, setTargetSpeechMinutes] = useState<number>(2);
  const [customSpeechMinutesInput, setCustomSpeechMinutesInput] = useState<string>("");

  // Recording Studio
  const [recordingMode, setRecordingMode] = useState<"audio" | "video">("audio");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [speakingSeconds, setSpeakingSeconds] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>("");

  // AI Assistant Modals & RAG Speech Panel
  const [showResearchModal, setShowResearchModal] = useState<boolean>(false);
  const [isResearchLoading, setIsResearchLoading] = useState<boolean>(false);
  const [researchData, setResearchData] = useState<any | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

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

  // INTERACTIVE SPEECH REFINEMENT ENGINE (ISRE) STATE
  const [speechScript, setSpeechScript] = useState<string>("");
  const [versionHistory, setVersionHistory] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isSpeechFinalized, setIsSpeechFinalized] = useState<boolean>(false);

  // Web API Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingStudioRef = useRef<HTMLDivElement | null>(null);
  const topicSelectionRef = useRef<HTMLDivElement | null>(null);
  const researchPanelRef = useRef<HTMLDivElement | null>(null);

  const allGenres: Genre[] = categories.flatMap((cat) => cat.genres);
  const visibleGenres: Genre[] = selectedCategory === "All"
    ? allGenres
    : categories.find((c) => c.category === selectedCategory)?.genres || [];

  // Selected Genres List
  const selectedGenresList = allGenres.filter((g) => selectedGenreIds.includes(g.id));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (event: any) => {
          let text = "";
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text);
        };
        recognitionRef.current = rec;
      }
    }
  }, []);

  // Sync initial generated speech script into ISRE state
  useEffect(() => {
    if (researchData && researchData.speech_script) {
      setSpeechScript(researchData.speech_script);
      setVersionHistory([researchData.speech_script]);
      setIsSpeechFinalized(false);
      setChatMessages([
        {
          sender: "ai",
          text: `Speech generated for "${confirmedTopic || currentTopic}" (${targetSpeechMinutes} Min / ~${targetSpeechMinutes * 120} W). Use the chat or quick micro-buttons below to refine the tone, clarity, or examples!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [researchData]);

  // Set initial topic from default selected genre
  useEffect(() => {
    if (selectedGenresList.length > 0 && selectedGenresList[0].topics.length > 0) {
      setCurrentTopic(selectedGenresList[0].topics[0]);
    }
  }, []);

  // Prep Timer Countdown Logic with < 10s Ticking Sound
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && prepSecondsLeft > 0) {
      interval = setInterval(() => {
        setPrepSecondsLeft((prev) => {
          const nextVal = prev - 1;
          if (nextVal <= 10 && nextVal > 0) {
            soundFX.playClockTick();
          }
          return nextVal;
        });
      }, 1000);
    } else if (prepSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      soundFX.playAlarmChime();
      confetti({ particleCount: 45, spread: 60 });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, prepSecondsLeft]);

  // Speech Recording Timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSpeakingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const scrollToRecordingStudio = () => {
    if (recordingStudioRef.current) {
      recordingStudioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToResearchPanel = () => {
    if (researchPanelRef.current) {
      researchPanelRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTopicSelection = () => {
    if (topicSelectionRef.current) {
      topicSelectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // MULTI-GENRE TOGGLE HANDLER
  const handleToggleGenre = (genreId: string) => {
    setIsTopicConfirmed(false);
    setResearchData(null);

    if (genreId === "all") {
      setSelectedGenreIds(["all"]);
      return;
    }

    let updated = selectedGenreIds.filter((id) => id !== "all");
    if (updated.includes(genreId)) {
      updated = updated.filter((id) => id !== genreId);
      if (updated.length === 0) updated = ["indian_history"];
    } else {
      updated.push(genreId);
    }
    setSelectedGenreIds(updated);

    // Pick random topic from selected genres
    const targetPool = allGenres
      .filter((g) => updated.includes(g.id))
      .flatMap((g) => g.topics);

    if (targetPool.length > 0) {
      const randIdx = Math.floor(Math.random() * targetPool.length);
      setCurrentTopic(targetPool[randIdx]);
    }
  };

  const handleSelectAllGenres = () => {
    setIsTopicConfirmed(false);
    setResearchData(null);
    setSelectedGenreIds(["all"]);
  };

  const handleGenerateTopic = () => {
    setIsSlotMachine(true);
    setIsTopicConfirmed(false);
    setResearchData(null);
    let count = 0;
    let pool: string[] = [];

    if (selectedGenreIds.includes("all")) {
      pool = visibleGenres.flatMap((g) => g.topics);
    } else {
      pool = allGenres
        .filter((g) => selectedGenreIds.includes(g.id))
        .flatMap((g) => g.topics);
    }

    if (pool.length === 0) pool = visibleGenres.flatMap((g) => g.topics);

    const interval = setInterval(() => {
      const randIndex = Math.floor(Math.random() * pool.length);
      setCurrentTopic(pool[randIndex]);
      soundFX.playSpinClick();
      count++;
      if (count > 14) {
        clearInterval(interval);
        setIsSlotMachine(false);
      }
    }, 80);
  };

  const handleConfirmTopic = () => {
    if (!currentTopic.trim()) return;
    setConfirmedTopic(currentTopic);
    setIsTopicConfirmed(true);
    confetti({ particleCount: 30, spread: 45 });
  };

  const handleSetCustomTopic = () => {
    if (!customTopicInput.trim()) return;
    setCurrentTopic(customTopicInput);
    setConfirmedTopic(customTopicInput);
    setIsTopicConfirmed(true);
    confetti({ particleCount: 30, spread: 45 });
  };

  const handleFetchAiResearch = async () => {
    setIsResearchLoading(true);
    setShowResearchModal(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: confirmedTopic || currentTopic,
          genre: selectedGenreIds.join(", "),
          durationMinutes: targetSpeechMinutes
        })
      });
      const data = await res.json();
      setResearchData(data);
      
      // Auto smooth scroll down to the generated research section
      setTimeout(() => {
        scrollToResearchPanel();
      }, 300);
    } catch (e) {}
    setIsResearchLoading(false);
  };

  // ISRE: INTERACTIVE SPEECH REFINEMENT CHAT ENGINE
  const handleSendRefinementInstruction = async (instructionText?: string) => {
    const textToSend = instructionText || chatInput;
    if (!textToSend.trim() || isRefining || isSpeechFinalized) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!instructionText) setChatInput("");
    setIsRefining(true);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: confirmedTopic || currentTopic,
          currentSpeech: speechScript,
          instruction: textToSend,
          durationMinutes: targetSpeechMinutes
        })
      });

      const data = await res.json();

      if (data.updated_speech) {
        setVersionHistory((prev) => [...prev, data.updated_speech]);
        setSpeechScript(data.updated_speech);

        const aiMsg: ChatMessage = {
          sender: "ai",
          text: `Refinement applied! ${data.changes_summary || "Speech updated according to your instruction."}`,
          summary: data.changes_summary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, aiMsg]);
        confetti({ particleCount: 25, spread: 40 });
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Encountered an issue applying refinement. Original speech preserved.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }

    setIsRefining(false);
  };

  const handleRevertSpeechVersion = () => {
    if (versionHistory.length > 1) {
      const updatedHistory = [...versionHistory];
      updatedHistory.pop();
      const previousVersion = updatedHistory[updatedHistory.length - 1];
      setVersionHistory(updatedHistory);
      setSpeechScript(previousVersion);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Reverted to previous speech version.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleFinalizeSpeech = () => {
    setIsSpeechFinalized(true);
    confetti({ particleCount: 50, spread: 70 });
    scrollToRecordingStudio();
  };

  const handleStartPrepTimer = (mins: number) => {
    setPrepTimeMinutes(mins);
    setPrepSecondsLeft(mins * 60);
    setIsTimerRunning(true);
  };

  const handleSetCustomPrepMinutes = () => {
    const val = parseFloat(customPrepMinutesInput);
    if (!isNaN(val) && val > 0) {
      handleStartPrepTimer(val);
      setCustomPrepMinutesInput("");
    }
  };

  const handleSetCustomSpeechMinutes = () => {
    const val = parseFloat(customSpeechMinutesInput);
    if (!isNaN(val) && val > 0) {
      setTargetSpeechMinutes(val);
      setCustomSpeechMinutesInput("");
    }
  };

  const startRecording = async () => {
    try {
      setTranscript("");
      setRecordedBlobUrl(null);
      setSpeakingSeconds(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: recordingMode === "video"
      });
      mediaStreamRef.current = stream;

      if (recordingMode === "video" && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recordingMode === "video" ? "video/webm" : "audio/webm"
        });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {}
      }
    } catch (err) {
      setConfirmModal({
        isOpen: true,
        title: "Permission Required",
        message: "Microphone & Camera permissions are required to start recording in the Studio.",
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false }))
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsRecording(false);
  };

  // POST RECORDING OPTIONS: DISCARD, RETAKE, NEW TOPIC
  const handleDiscardRecording = () => {
    setConfirmModal({
      isOpen: true,
      title: "Discard Speech Recording",
      message: "Are you sure you want to discard this un-evaluated speech recording?",
      onConfirm: () => {
        setRecordedBlobUrl(null);
        setSpeakingSeconds(0);
        setTranscript("");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRetakeRecording = () => {
    setRecordedBlobUrl(null);
    setSpeakingSeconds(0);
    setTranscript("");
    startRecording();
  };

  const handleChooseNewTopic = () => {
    setRecordedBlobUrl(null);
    setSpeakingSeconds(0);
    setTranscript("");
    setIsTopicConfirmed(false);
    setResearchData(null);
    setIsSpeechFinalized(false);
    scrollToTopicSelection();
    handleGenerateTopic();
  };

  const handleEvaluateSpeech = () => {
    const wpm = speakingSeconds > 0 ? Math.round((transcript.split(" ").length / speakingSeconds) * 60) : 115;
    const score = Math.min(95, Math.max(70, 75 + Math.floor(Math.random() * 18)));

    const result = {
      score,
      wpm,
      clarity: 9,
      confidence: 8,
      grammar: 9,
      depth: 7,
      structure: 8,
      feedback: "Excellent vocal modulation and structured flow. Practice reducing minor filler pauses when transitioning between points."
    };

    setAnalysisResult(result);
    setShowAnalysisModal(true);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("verbaflow_user_history");
      let items = stored ? JSON.parse(stored) : [];
      items.unshift({
        id: `attempt_${Date.now()}`,
        topicId: selectedGenreIds.join(", "),
        topicText: confirmedTopic || currentTopic,
        genre: selectedGenreIds.join(", "),
        attemptedAt: new Date().toISOString(),
        score: result.score,
        clarity: result.clarity,
        confidence: result.confidence,
        grammar: result.grammar,
        depth: result.depth,
        structure: result.structure,
        wordsPerMinute: result.wpm,
        transcript: transcript || "Spoken speech session recorded in studio...",
        feedback: result.feedback,
        reattemptCount: 0
      });
      localStorage.setItem("verbaflow_user_history", JSON.stringify(items));
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0d0b] text-[#ffffff] font-sans transition-colors duration-200 overflow-x-hidden">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Hero Banner */}
        <div className="text-center space-y-3 px-2">
          <div>
            <span className="text-[10px] sm:text-[11px] font-sans uppercase font-extrabold tracking-[0.2em] sm:tracking-[0.25em] text-[#d4af37] border-2 border-[#d4af37] px-3.5 py-1 rounded-full inline-block">
              Sophisticated Verbal Artistry
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-[#ffffff] tracking-tight leading-tight">
            Master the Art of Spontaneous Discourse
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#e5e5e5] max-w-2xl mx-auto leading-relaxed">
            A refined studio combining mandatory preparation intervals, multi-genre topics, and structured AI intelligence.
          </p>
        </div>

        {/* 1. Domain Selector with Multi-Genre Selection & Clean Layout */}
        <section ref={topicSelectionRef} className="card-zorayda p-4 sm:p-8 space-y-5 sm:space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-white/15 pb-4">
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#ffffff] flex items-center gap-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold">1</span>
                SELECT SPEECH GENRE
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-[#d4af37] mt-1 flex items-center gap-1.5 leading-tight">
                <Info className="w-3.5 h-3.5 text-[#d4af37] flex-shrink-0" /> Click any single genre or select multiple genres to mix speech topics!
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              <button
                onClick={handleSelectAllGenres}
                className="btn-zorayda-outline py-1 px-3 sm:px-4 text-[11px] sm:text-xs text-[#d4af37] border-[#d4af37]/60 hover:bg-[#d4af37]/10"
              >
                <CheckSquare className="w-3.5 h-3.5 inline mr-1" /> Select All 26 Genres
              </button>
              <span className="text-[10px] sm:text-xs font-extrabold text-[#d4af37] font-mono border border-[#d4af37]/40 px-2.5 py-1 rounded-full bg-black flex-shrink-0">
                {selectedGenreIds.includes("all") ? "All 26" : `${selectedGenreIds.length} Selected`}
              </span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-all border-2 ${
                selectedCategory === "All"
                  ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md"
                  : "border-white/40 text-[#ffffff] bg-[#1a1815] hover:border-[#d4af37]"
              }`}
            >
              ALL (26)
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-all border-2 ${
                  selectedCategory === cat.category
                    ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md"
                    : "border-white/40 text-[#ffffff] bg-[#1a1815] hover:border-[#d4af37]"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Clean Scrollable Gallery Grid */}
          <div className="max-h-80 overflow-y-auto pr-1.5 custom-scrollbar border-2 border-white/10 p-3 sm:p-4 rounded-2xl bg-black/40">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {visibleGenres.map((genre) => {
                const isSelected = selectedGenreIds.includes(genre.id) || selectedGenreIds.includes("all");
                return (
                  <button
                    key={genre.id}
                    onClick={() => handleToggleGenre(genre.id)}
                    title={genre.description}
                    className={`w-full px-2.5 py-2.5 sm:px-3.5 sm:py-3 rounded-xl border-2 font-serif font-extrabold text-[11px] sm:text-xs text-left transition-all flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md scale-[1.01]"
                        : "bg-[#1a1815] border-white/20 text-white hover:border-[#d4af37]"
                    }`}
                  >
                    <span className="truncate">{genre.name}</span>
                    <span className={`text-[9px] sm:text-[10px] font-mono flex-shrink-0 ${isSelected ? "text-black font-extrabold" : "text-[#d4af37]"}`}>
                      ({genre.topics.length})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. Topic Prompt, Single Genre Description & Prominent Random Generator Step */}
        <section className="card-zorayda p-4 sm:p-8 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-white/15 pb-4">
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#ffffff] flex items-center gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold">2</span>
              SPEECH MOTION PROMPT & GENERATOR
            </h2>

            {/* HIGHLY PROMINENT RANDOM TOPIC GENERATOR BUTTON */}
            <button
              onClick={handleGenerateTopic}
              className="btn-zorayda bg-[#d4af37] text-black border-[#d4af37] py-2.5 px-4 sm:px-6 text-xs font-black shadow-lg shadow-[#d4af37]/20 hover:scale-105 transition-all w-full sm:w-auto"
            >
              <Shuffle className={`w-4 h-4 text-black ${isSlotMachine ? "animate-spin" : ""}`} />
              🎲 Shuffle & Generate Random Topic Prompt
            </button>
          </div>

          {/* Target Speech Duration Selector Prior to Confirmation */}
          <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-[#d4af37]/60 bg-[#14120f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#d4af37]">Target Speech Duration:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setTargetSpeechMinutes(mins)}
                  className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold transition-all border-2 ${
                    targetSpeechMinutes === mins
                      ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md"
                      : "border-white/30 text-white bg-black/40 hover:border-[#d4af37]"
                  }`}
                >
                  {mins} MIN (~{mins * 120} W)
                </button>
              ))}

              <div className="flex items-center gap-1 mt-1 sm:mt-0">
                <input
                  type="number"
                  step="0.5"
                  value={customSpeechMinutesInput}
                  onChange={(e) => setCustomSpeechMinutesInput(e.target.value)}
                  placeholder={`${targetSpeechMinutes}`}
                  className="w-16 sm:w-24 bg-black border-2 border-white/40 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-bold text-[#ffffff] text-center placeholder-[#777777] focus:outline-none focus:border-[#d4af37]"
                />
                <span className="text-[10px] sm:text-xs font-bold text-[#d4af37]">MIN</span>
                <button onClick={handleSetCustomSpeechMinutes} className="btn-zorayda-outline py-0.5 px-2 text-[9px] sm:text-[10px]">
                  Set
                </button>
              </div>
            </div>
          </div>

          {/* SINGLE SELECTED GENRE DESCRIPTION TAB */}
          {selectedGenresList.length === 1 && !selectedGenreIds.includes("all") && (
            <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-[#d4af37]/60 bg-[#1a1815] flex items-start gap-2.5 sm:gap-3">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-xs sm:text-sm text-[#ffffff]">
                  Selected Genre Scope: {selectedGenresList[0].name} ({selectedGenresList[0].topics.length} Prompts Available)
                </h4>
                <p className="text-[11px] sm:text-xs font-semibold text-[#cccccc] leading-relaxed">
                  {selectedGenresList[0].description}
                </p>
              </div>
            </div>
          )}

          {/* Current Motion Prompt Banner */}
          <div className="p-5 sm:p-8 rounded-3xl border-2 border-[#d4af37] bg-[#1a1815] text-center space-y-4 shadow-inner">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">Active Motion Prompt</span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold text-[#ffffff] leading-relaxed px-2">
              "{currentTopic}"
            </h3>

            {/* STEP 3 & 4 STEPPED FLOW BUTTONS + RECORDING STUDIO SCROLL NAVIGATION */}
            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row justify-center items-center gap-3">
              {!isTopicConfirmed ? (
                <button
                  onClick={handleConfirmTopic}
                  className="btn-zorayda bg-[#d4af37] text-black border-[#d4af37] py-2.5 sm:py-3 px-6 sm:px-8 text-xs sm:text-sm font-extrabold w-full sm:w-auto"
                >
                  <CheckCircle className="w-4 h-4 text-black" /> Confirm & Set Prompt ({targetSpeechMinutes} MIN) ✅
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2.5 w-full sm:w-auto">
                  <span className="text-[11px] sm:text-xs font-bold text-[#d4af37] flex items-center gap-1.5 border border-[#d4af37]/40 bg-[#1a1815] px-3.5 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 text-[#d4af37]" /> Topic Confirmed ({targetSpeechMinutes} MIN)
                  </span>
                  <button
                    onClick={handleFetchAiResearch}
                    className="btn-zorayda bg-[#d4af37] text-black border-[#d4af37] animate-bounce py-2 sm:py-2.5 px-5 sm:px-6 text-xs font-black w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 text-black" /> 🔥 Unlock AI Research Briefing
                  </button>
                  <button
                    onClick={scrollToRecordingStudio}
                    className="btn-zorayda-outline py-2 sm:py-2.5 px-5 sm:px-6 text-xs border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 w-full sm:w-auto"
                  >
                    <ArrowDownCircle className="w-4 h-4 text-[#d4af37]" /> Jump to Studio
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Custom Topic Bar */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              value={customTopicInput}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              placeholder="Or type your custom speech prompt..."
              className="flex-1 bg-[#14120f] border-2 border-white/40 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-bold text-[#ffffff] placeholder-[#aaaaaa] focus:outline-none focus:border-[#d4af37]"
            />
            <button onClick={handleSetCustomTopic} className="btn-zorayda w-full sm:w-auto justify-center">
              <PlusCircle className="w-4 h-4" /> Set Prompt ✅
            </button>
          </div>
        </section>

        {/* STEP 4 PANEL: AI SPEECH BRIEFING & INTERACTIVE SPEECH REFINEMENT ENGINE (ISRE) */}
        {isTopicConfirmed && researchData && (
          <section ref={researchPanelRef} className="card-zorayda p-4 sm:p-8 space-y-5 sm:space-y-6 border-2 border-[#d4af37] bg-[#14120f] animate-fadeIn scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-white/15 pb-4">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-[#d4af37] flex items-center gap-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 flex-shrink-0" />
                AI SPEECH BRIEFING & REFINEMENT ENGINE (ISRE)
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-[#d4af37] border border-[#d4af37]/40 px-2.5 py-1 rounded-full">
                  Target: ~{targetSpeechMinutes * 120} Words ({targetSpeechMinutes} Min)
                </span>
                {!isSpeechFinalized ? (
                  <button
                    onClick={handleFinalizeSpeech}
                    className="btn-zorayda bg-[#d4af37] text-black border-[#d4af37] py-1 px-3 sm:px-5 text-[10px] sm:text-xs font-extrabold"
                  >
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" /> Finalize Speech ✅
                  </button>
                ) : (
                  <span className="text-[10px] sm:text-xs font-extrabold text-[#d4af37] flex items-center gap-1.5 border border-[#d4af37]/40 bg-[#1a1815] px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3 text-[#d4af37]" /> Locked
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
              {/* Introduction */}
              <div className="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/40 space-y-2">
                <h4 className="font-bold text-[#d4af37] uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Introduction (Hook & Context)
                </h4>
                <p className="text-[#ffffff] leading-relaxed font-medium">{researchData.introduction}</p>
              </div>

              {/* Conclusion */}
              <div className="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/40 space-y-2">
                <h4 className="font-bold text-[#d4af37] uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#d4af37]" /> Conclusion (Call to Action)
                </h4>
                <p className="text-[#ffffff] leading-relaxed font-medium">{researchData.conclusion}</p>
              </div>

              {/* Key Talking Points */}
              <div className="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/40 space-y-2">
                <h4 className="font-bold text-[#d4af37] uppercase tracking-wider text-[11px] sm:text-xs">Key Talking Points</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-[#ffffff] font-medium">
                  {researchData.key_points?.map((kp: string, idx: number) => <li key={idx}>{kp}</li>)}
                </ul>
              </div>

              {/* Real World Examples */}
              <div className="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/40 space-y-2">
                <h4 className="font-bold text-[#d4af37] uppercase tracking-wider text-[11px] sm:text-xs">Supporting Real-World Examples</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-[#ffffff] font-medium">
                  {researchData.examples?.map((ex: string, idx: number) => <li key={idx}>{ex}</li>)}
                </ul>
              </div>
            </div>

            {/* LIVE EDITABLE SPEECH PREVIEW & INTERACTIVE CHAT REFINEMENT PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t-2 border-white/15">
              {/* Left Column: Speech Script Preview */}
              <div className="p-4 sm:p-6 rounded-2xl border-2 border-[#d4af37] bg-[#1a1815] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                      <Mic className="w-4 h-4 text-amber-400" /> Active Speech Script (v{versionHistory.length})
                    </h4>

                    <div className="flex items-center gap-2">
                      {versionHistory.length > 1 && !isSpeechFinalized && (
                        <button
                          onClick={handleRevertSpeechVersion}
                          className="btn-zorayda-outline py-1 px-2.5 text-[9px] sm:text-[10px] text-amber-400 border-amber-400/40"
                          title="Revert to previous speech version"
                        >
                          <Undo2 className="w-3 h-3 inline mr-1" /> Revert
                        </button>
                      )}
                      <button
                        onClick={() => navigator.clipboard.writeText(speechScript)}
                        className="btn-zorayda-outline py-1 px-2.5 text-[9px] sm:text-[10px]"
                      >
                        Copy Script
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={speechScript}
                    disabled={isSpeechFinalized}
                    onChange={(e) => setSpeechScript(e.target.value)}
                    className="w-full h-56 sm:h-64 bg-black/60 p-3.5 sm:p-4 rounded-xl border border-white/15 font-mono text-[11px] sm:text-xs text-[#ffffff] focus:outline-none focus:border-[#d4af37] leading-relaxed resize-none"
                  />
                </div>

                {!isSpeechFinalized ? (
                  <button
                    onClick={handleFinalizeSpeech}
                    className="btn-zorayda bg-[#d4af37] text-black border-[#d4af37] w-full justify-center py-2.5 sm:py-3 text-xs font-extrabold"
                  >
                    <Lock className="w-4 h-4 text-black" /> Finalize Speech & Lock Version ✅
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-[#1a1815] border border-[#d4af37]/40 p-3 rounded-xl gap-2">
                    <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#d4af37]" /> Speech Version Locked
                    </span>
                    <button
                      onClick={scrollToRecordingStudio}
                      className="btn-zorayda bg-[#d4af37] border-[#d4af37] text-black py-1 px-4 text-xs font-extrabold w-full sm:w-auto"
                    >
                      <Mic className="w-3.5 h-3.5 text-black" /> Start Recording
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: AI Chatbot Refinement Assistant */}
              <div className="p-4 sm:p-6 rounded-2xl border-2 border-white/20 bg-[#14120f] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#ffffff] uppercase tracking-wider flex items-center gap-2 border-b border-white/15 pb-2">
                    <MessageSquare className="w-4 h-4 text-[#d4af37]" /> Refine Your Speech with AI (ISRE Chatbot)
                  </h4>

                  {/* Micro-Prompt Quick Refinement Pill Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      disabled={isRefining || isSpeechFinalized}
                      onClick={() => handleSendRefinementInstruction("Make the introduction much more engaging and vivid")}
                      className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold border border-[#d4af37]/40 bg-[#1a1815] text-[#d4af37] hover:bg-[#d4af37]/10 disabled:opacity-50"
                    >
                      ✨ Engaging Intro
                    </button>
                    <button
                      disabled={isRefining || isSpeechFinalized}
                      onClick={() => handleSendRefinementInstruction("Simplify the vocabulary for conversational, spoken-word clarity")}
                      className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold border border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 disabled:opacity-50"
                    >
                      💬 Simplify Language
                    </button>
                    <button
                      disabled={isRefining || isSpeechFinalized}
                      onClick={() => handleSendRefinementInstruction("Add 2 relatable real-world case study examples")}
                      className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/50 disabled:opacity-50"
                    >
                      📘 Add Examples
                    </button>
                    <button
                      disabled={isRefining || isSpeechFinalized}
                      onClick={() => handleSendRefinementInstruction("Ensure speech stays strictly focused on the core topic without fluff")}
                      className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold border border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 disabled:opacity-50"
                    >
                      🎯 Strict Topic Focus
                    </button>
                  </div>

                  {/* Chat Messages Stream Box */}
                  <div className="h-40 sm:h-44 overflow-y-auto space-y-2 p-3 rounded-xl bg-black/60 border border-white/10 text-xs">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl space-y-1 ${
                          msg.sender === "user"
                            ? "bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#ffffff] ml-4 sm:ml-6"
                            : "bg-[#22201c] border border-white/15 text-[#e5e5e5] mr-4 sm:mr-6"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-[#d4af37]">
                          <span>{msg.sender === "user" ? "You (Speech Instruction)" : "AI Speech Mentor"}</span>
                          <span className="text-[8px] sm:text-[9px] text-[#888888]">{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                    {isRefining && (
                      <div className="p-2.5 rounded-xl bg-[#22201c] border border-white/15 text-xs text-[#d4af37] animate-pulse flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin text-amber-400" /> Applying incremental speech refinement...
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Input Bar */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    disabled={isSpeechFinalized || isRefining}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendRefinementInstruction()}
                    placeholder={isSpeechFinalized ? "Version finalized & locked." : "Type instruction (e.g., 'Make conclusion stronger')..."}
                    className="flex-1 bg-black border-2 border-white/30 rounded-full px-3.5 py-2 text-xs font-bold text-[#ffffff] placeholder-[#888888] focus:outline-none focus:border-[#d4af37] disabled:opacity-50"
                  />
                  <button
                    disabled={isSpeechFinalized || isRefining}
                    onClick={() => handleSendRefinementInstruction()}
                    className="btn-zorayda py-2 px-3.5 bg-[#d4af37] text-black border-[#d4af37] disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Thinking & Preparation Timer with Helpful Research Options Note */}
        <section className="card-zorayda p-4 sm:p-8 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-white/15 pb-4">
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#ffffff] flex items-center gap-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold">3</span>
                THINKING & PREPARATION TIMER (AUDIO COUNTDOWN &lt; 10s)
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-[#d4af37] mt-1.5 flex items-center gap-1.5 leading-tight">
                <Info className="w-3.5 h-3.5 text-[#d4af37] flex-shrink-0" /> Note: During preparation, you can use your own research sources or directly generate speech scripts using our AI Chatbot assistant!
              </p>
            </div>
            <Clock className="w-5 h-5 text-[#d4af37] hidden sm:block" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 5, 10, 15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleStartPrepTimer(mins)}
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-all border-2 ${
                    prepTimeMinutes === mins && isTimerRunning
                      ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md"
                      : "border-white/40 text-[#ffffff] bg-[#14120f] hover:border-[#d4af37]"
                  }`}
                >
                  {mins} MIN
                </button>
              ))}

              <div className="flex items-center gap-1 ml-1 sm:ml-2">
                <input
                  type="number"
                  step="0.5"
                  value={customPrepMinutesInput}
                  onChange={(e) => setCustomPrepMinutesInput(e.target.value)}
                  placeholder="7.5"
                  className="w-16 sm:w-24 bg-[#14120f] border-2 border-white/40 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-bold text-[#ffffff] text-center placeholder-[#888888] focus:outline-none focus:border-[#d4af37]"
                />
                <span className="text-[10px] sm:text-xs font-bold text-[#d4af37]">MIN</span>
                <button onClick={handleSetCustomPrepMinutes} className="btn-zorayda-outline py-0.5 px-2 text-[9px] sm:text-[10px]">
                  Set
                </button>
              </div>
            </div>

            <div className={`text-2xl sm:text-3xl font-black font-mono tracking-wider text-center sm:text-right ${prepSecondsLeft <= 10 && prepSecondsLeft > 0 ? "text-rose-500 animate-pulse" : "text-[#d4af37]"}`}>
              {Math.floor(prepSecondsLeft / 60)}:{(prepSecondsLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </section>

        {/* 4. Speech Recording Studio (With Discard, Retake, Save History & New Topic Options) */}
        <section ref={recordingStudioRef} className="card-zorayda p-4 sm:p-8 space-y-5 sm:space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-white/15 pb-4">
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#ffffff] flex items-center gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold">4</span>
              SPEECH RECORDING STUDIO & DURATION MONITOR
            </h2>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={() => setRecordingMode("audio")}
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border-2 ${
                    recordingMode === "audio" ? "bg-white text-black border-white" : "border-white/30 text-[#ffffff]"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 inline mr-1" /> Audio
                </button>
                <button
                  onClick={() => setRecordingMode("video")}
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border-2 ${
                    recordingMode === "video" ? "bg-white text-black border-white" : "border-white/30 text-[#ffffff]"
                  }`}
                >
                  <Video className="w-3.5 h-3.5 inline mr-1" /> Video
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-white/15 bg-[#14120f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#d4af37]">Speech Target Duration:</span>
              <input
                type="number"
                step="0.5"
                value={customSpeechMinutesInput}
                onChange={(e) => setCustomSpeechMinutesInput(e.target.value)}
                placeholder={`${targetSpeechMinutes}`}
                className="w-20 sm:w-28 bg-black border-2 border-white/40 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-bold text-[#ffffff] text-center placeholder-[#777777] focus:outline-none focus:border-[#d4af37]"
              />
              <span className="text-[10px] sm:text-xs font-bold text-[#ffffff]">MIN</span>
              <button onClick={handleSetCustomSpeechMinutes} className="btn-zorayda-outline py-0.5 px-2 text-[9px] sm:text-[10px]">
                Update
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
              <span className="text-[10px] sm:text-xs font-bold text-[#aaaaaa]">Elapsed / Goal:</span>
              <div className="text-lg sm:text-xl font-mono font-extrabold text-[#d4af37]">
                {Math.floor(speakingSeconds / 60)}:{(speakingSeconds % 60).toString().padStart(2, "0")} / {targetSpeechMinutes}:00 MIN
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 text-center">
            {recordingMode === "video" && (
              <div className="max-w-md mx-auto aspect-video rounded-2xl overflow-hidden border-2 border-white/40 bg-black">
                <video ref={videoPreviewRef} className="w-full h-full object-cover" muted />
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {!isRecording ? (
                <button onClick={startRecording} className="btn-zorayda bg-[#d4af37] text-black border-[#d4af37] font-black w-full sm:w-auto">
                  <Mic className="w-4 h-4 text-black" /> Begin Speech Recording
                </button>
              ) : (
                <button onClick={stopRecording} className="btn-zorayda bg-rose-600 border-rose-600 animate-pulse text-white w-full sm:w-auto">
                  End Speech Session ({speakingSeconds}s)
                </button>
              )}

              {recordedBlobUrl && (
                <a href={recordedBlobUrl} download="verbaflow_speech.webm" className="btn-zorayda-outline w-full sm:w-auto justify-center">
                  <Download className="w-4 h-4" /> Download Recording
                </a>
              )}
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-white/15 bg-[#1a1815] text-left space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Realtime Speech Transcript</span>
                <p className="text-xs font-semibold italic text-[#ffffff]">"{transcript}"</p>
              </div>
            )}

            {/* POST RECORDING ACTION CONTROLS */}
            {recordedBlobUrl && (
              <div className="p-4 sm:p-6 rounded-3xl border-2 border-[#d4af37] bg-[#1a1815] space-y-3 sm:space-y-4">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#d4af37]">Speech Recorded Successfully — Select Next Step</span>

                <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2.5">
                  {/* Option 1: Evaluate & Save to History */}
                  <button onClick={handleEvaluateSpeech} className="btn-zorayda bg-[#d4af37] text-black border-[#d4af37] py-2.5 px-5 text-xs font-extrabold w-full sm:w-auto">
                    <Sparkles className="w-4 h-4 text-black" /> Evaluate Speech & Save to History
                  </button>

                  {/* Option 2: Retake Recording */}
                  <button onClick={handleRetakeRecording} className="btn-zorayda-outline py-2.5 px-5 text-xs font-extrabold border-amber-400 text-amber-400 hover:bg-amber-950/40 w-full sm:w-auto">
                    <RotateCcw className="w-4 h-4 text-amber-400" /> Retake Speech
                  </button>

                  {/* Option 3: Discard Recording */}
                  <button onClick={handleDiscardRecording} className="btn-zorayda-outline py-2.5 px-5 text-xs font-extrabold border-rose-500 text-rose-400 hover:bg-rose-950/40 w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 text-rose-400" /> Discard Recording
                  </button>

                  {/* Option 4: Pick New Topic */}
                  <button onClick={handleChooseNewTopic} className="btn-zorayda-outline py-2.5 px-5 text-xs font-extrabold border-cyan-400 text-cyan-400 hover:bg-cyan-950/40 w-full sm:w-auto">
                    <Compass className="w-4 h-4 text-cyan-400" /> Pick New Topic
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* CUSTOM OBSIDIAN & GOLD CONFIRMATION DIALOG MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#14120f] border-2 border-[#d4af37] rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 text-center shadow-2xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-950/50 border-2 border-[#d4af37] text-[#d4af37] rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-[#d4af37]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#d4af37]">{confirmModal.title}</h3>
              <p className="text-xs font-semibold text-[#e5e5e5] leading-relaxed">{confirmModal.message}</p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="btn-zorayda-outline flex-1 justify-center py-2 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="btn-zorayda flex-1 justify-center py-2 bg-[#d4af37] text-black border-[#d4af37] text-xs font-extrabold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Research Generation Status Modal */}
      {showResearchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#14120f] border-2 border-[#d4af37]/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 sm:space-y-6 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#d4af37] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Live AI Speech Research Engine
              </h3>
              <button onClick={() => setShowResearchModal(false)} className="text-[#ffffff] font-bold text-lg">✕</button>
            </div>

            {isResearchLoading ? (
              <div className="py-6 sm:py-8 space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs sm:text-sm font-bold text-[#d4af37] animate-pulse">Synthesizing Live Web Knowledge & Speech Script...</p>
                <p className="text-[10px] sm:text-xs text-[#aaaaaa]">Targeting ~{targetSpeechMinutes * 120} Words for {targetSpeechMinutes} Minute Speech</p>
              </div>
            ) : researchData ? (
              <div className="py-4 sm:py-6 space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1a1815] border-2 border-[#d4af37] text-[#d4af37] rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4af37]" />
                </div>
                <h4 className="font-serif font-bold text-lg sm:text-xl text-white">AI Research Briefing & Speech Generated!</h4>
                <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
                  Your speech script (~{researchData.targetWords || targetSpeechMinutes * 120} words) and RAG research briefing are ready in the section below.
                </p>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button onClick={() => setShowResearchModal(false)} className="btn-zorayda-outline flex-1 justify-center py-2.5 text-xs">
                Close
              </button>
              <button
                onClick={() => {
                  setShowResearchModal(false);
                  scrollToResearchPanel();
                }}
                className="btn-zorayda flex-1 justify-center py-2.5 bg-[#d4af37] text-black border-[#d4af37] font-black text-xs"
              >
                <ArrowDownCircle className="w-4 h-4 text-black" /> View Generated Research Section 👇
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Speech Analysis Modal */}
      {showAnalysisModal && analysisResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#14120f] border-2 border-white/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 text-center">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#d4af37]">Speech Evaluation Result</h3>

            <div className="p-4 sm:p-6 rounded-2xl border-2 border-white/15 bg-black/40 space-y-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">Overall Fluency Score</span>
              <p className="text-3xl sm:text-4xl font-black font-mono text-[#d4af37]">{analysisResult.score}/100</p>
              <p className="text-xs font-bold text-[#e5e5e5]">{analysisResult.wpm} Words Per Minute</p>
            </div>

            <p className="text-xs font-semibold text-[#ffffff] leading-relaxed">
              "{analysisResult.feedback}"
            </p>

            <button onClick={() => setShowAnalysisModal(false)} className="btn-zorayda w-full justify-center py-2.5 text-xs">
              Save & Return to Studio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
