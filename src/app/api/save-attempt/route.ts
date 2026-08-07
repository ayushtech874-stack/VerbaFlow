import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      userId,
      topicId,
      topicText,
      genre,
      transcript,
      durationSec,
      isReattempt = false,
      currentReattemptCount = 0
    } = await req.json();

    const words = (transcript || "").split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const minutes = durationSec > 0 ? durationSec / 60 : 1;
    const wordsPerMinute = Math.round(wordCount / minutes);

    const fillerMatches = (transcript || "").match(/\b(um|uh|ah|like|you know)\b/gi) || [];
    const fillerCount = fillerMatches.length;

    // Calculate structured evaluation metrics
    const clarity = Math.min(10, Math.max(5, 10 - Math.floor(fillerCount / 2)));
    const confidence = Math.min(10, Math.max(4, wordsPerMinute >= 90 && wordsPerMinute <= 150 ? 9 : 6));
    const grammar = Math.min(10, Math.max(6, 9 - (transcript && !/[.!?]$/.test(transcript) ? 1 : 0)));
    const depth = Math.min(10, Math.max(4, Math.floor(wordCount / 15)));
    const structure = Math.min(10, Math.max(5, wordCount > 30 ? 8 : 6));

    const score = Math.round(((clarity + confidence + grammar + depth + structure) / 5) * 10);
    const feedbackText = `Speech evaluated with ${wordsPerMinute} WPM and ${clarity}/10 clarity rating. ${
      fillerCount > 0 ? `${fillerCount} filler words detected.` : "Excellent vocal fluency."
    }`;

    const historyRecord = {
      topicId: topicId || "custom_topic",
      topicText: topicText || "Impromptu Speech",
      genre: genre || "General",
      attemptedAt: new Date().toISOString(),
      score,
      clarity,
      confidence,
      grammar,
      depth,
      structure,
      wordsPerMinute,
      transcript: transcript || "No speech recorded.",
      feedback: feedbackText,
      reattemptCount: isReattempt ? currentReattemptCount + 1 : 0
    };

    return NextResponse.json({
      success: true,
      historyItem: historyRecord
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process and save speech attempt" }, { status: 500 });
  }
}
