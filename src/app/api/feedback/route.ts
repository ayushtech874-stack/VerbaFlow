import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transcript, durationSec, topic } = await req.json();

    const words = (transcript || "").split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const minutes = durationSec > 0 ? durationSec / 60 : 1;
    const wpm = Math.round(wordCount / minutes);

    const fillerRegex = /\b(um|uh|ah|like|you know|basically|actually|literally|so)\b/gi;
    const fillerMatches = (transcript || "").match(fillerRegex) || [];
    const fillerWordsCount = fillerMatches.length;

    // Structured Rubric Scores (1 - 10)
    const clarity = Math.min(10, Math.max(5, 10 - Math.floor(fillerWordsCount / 2)));
    const confidence = Math.min(10, Math.max(4, wpm >= 90 && wpm <= 150 ? 9 : 6));
    const grammar = Math.min(10, Math.max(6, 9 - (transcript && !/[.!?]$/.test(transcript) ? 1 : 0)));
    const depth = Math.min(10, Math.max(4, Math.floor(wordCount / 15)));
    const structure = Math.min(10, Math.max(5, wordCount > 30 ? 8 : 6));

    const overallScore = Math.round(((clarity + confidence + grammar + depth + structure) / 5) * 10);

    const feedback = {
      overallScore,
      wpm,
      wordCount,
      fillerWordsCount,
      rubric: {
        clarity,
        confidence,
        grammar,
        depth,
        structure,
      },
      summary: wordCount > 20 
        ? `You articulated your ideas on "${topic || 'the topic'}" with a baseline pacing of ${wpm} WPM. However, expanding with real-world statistics and reducing filler words would significantly elevate your response.`
        : "Short response detected. Aim to elaborate further on key arguments, counterpoints, and real-world examples.",
      improvements: [
        fillerWordsCount > 2 ? `Reduce filler pauses (${fillerWordsCount} detected like 'um', 'like').` : "Maintain vocal steady rhythm.",
        depth < 7 ? "Add concrete historical or real-world statistics to support your premise." : "Good elaboration.",
        "Structure speech into distinct Intro -> 3 Arguments -> Conclusion steps."
      ],
      aiCoach: {
        idealStructure: "1. Hook & Introduction (30s) -> 2. Three Supporting Pillar Arguments (2m) -> 3. Counter-argument acknowledgment (45s) -> 4. Strong Call-to-Action Conclusion (30s).",
        betterAnswerSnippet: `When speaking on "${topic || 'this prompt'}", start by defining the core thesis clearly. Follow up by citing a real-world case study, address potential trade-offs, and conclude with a memorable takeaway.`,
        keyTalkingPoints: [
          "Define the fundamental problem statement in the first 15 seconds.",
          "Provide one strong economic or societal statistic.",
          "Acknowledge opposing viewpoints before delivering your concluding recommendation."
        ]
      }
    };

    return NextResponse.json(feedback);
  } catch (error) {
    return NextResponse.json({ error: "Failed to process AI speech evaluation" }, { status: 500 });
  }
}
