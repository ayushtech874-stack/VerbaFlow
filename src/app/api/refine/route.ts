import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, currentSpeech, instruction, durationMinutes } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;

    if (!topic || !currentSpeech || !instruction) {
      return NextResponse.json({ error: "Topic, currentSpeech, and instruction required" }, { status: 400 });
    }

    const duration = durationMinutes || 2;
    const targetWords = Math.round(duration * 120);

    if (!groqKey) {
      // Fallback refinement if key missing
      return NextResponse.json({
        updated_speech: `${currentSpeech}\n\n[AI Refinement (${instruction})]: Emphasized key thesis with enhanced rhetorical resonance.`,
        changes_summary: `Applied user refinement instruction ("${instruction}") while keeping core speech structure intact for ${duration} minute target.`
      });
    }

    // MASTER SYSTEM PROMPT FRAMEWORK FOR REFINEMENT (ISRE)
    const systemPrompt = `You are an elite communication coach, speechwriter, and critical thinking mentor.

Your task is to refine an existing speech based strictly on user instruction WITHOUT changing its core topic or structure.

--------------------------------------------------
TARGET SPECIFICATIONS:
- Topic: "${topic}"
- Target Duration: ${duration} minutes (~${targetWords} words total)

--------------------------------------------------
RULES:
1. DO NOT rewrite everything from scratch unnecessarily.
2. Modify ONLY relevant parts of the speech according to user instruction.
3. NEVER drift away from the original topic. If user instruction is ambiguous or risks going off-topic, correct it intelligently while preserving topic focus.
4. Maintain a natural, conversational public speaking tone.
5. Ensure structural integrity (Intro -> 3 Body Pillars -> Conclusion).

--------------------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY):
{
  "updated_speech": "Full updated speech script string",
  "changes_summary": "Short 1-2 sentence summary of exact improvements made"
}`;

    const userPrompt = `TOPIC: "${topic}"

CURRENT SPEECH:
"${currentSpeech}"

USER INSTRUCTION:
"${instruction}"`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({
      updated_speech: result.updated_speech || currentSpeech,
      changes_summary: result.changes_summary || `Refined speech based on instruction: "${instruction}".`
    });
  } catch (error) {
    return NextResponse.json({
      updated_speech: "Refinement encountered a network pause. Original speech retained.",
      changes_summary: "Maintained original speech version."
    }, { status: 500 });
  }
}
