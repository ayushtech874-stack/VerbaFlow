import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { customTopic } = await req.json();

    if (!customTopic) {
      return NextResponse.json({ error: "Custom topic prompt is required" }, { status: 400 });
    }

    const breakdown = {
      topic: customTopic,
      difficulty: customTopic.length > 30 ? "Hard" : customTopic.length > 15 ? "Medium" : "Easy",
      tags: ["Custom Practice", "AI Breakdown", "Impromptu Speech"],
      structure: {
        introduction: `Hook the audience by stating why "${customTopic}" matters in today's global landscape. Define key terms clearly.`,
        keyArguments: [
          `Pillar 1: Economic & Strategic Impact - How "${customTopic}" drives growth or disruption.`,
          `Pillar 2: Societal & Human Dimension - The direct influence on individuals and daily habits.`,
          `Pillar 3: Technological & Future Trajectory - Where this topic is headed over the next decade.`
        ],
        counterArgument: `Acknowledge opposing views: Critics argue potential risks, costs, or ethical trade-offs associated with ${customTopic}.`,
        realWorldExample: `Reference a recent real-world case study or historical event (e.g., industry policy changes, corporate decisions, or global movements).`,
        conclusion: `Summarize your main arguments in 2 sentences and leave the audience with a thought-provoking final recommendation.`
      }
    };

    return NextResponse.json(breakdown);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate custom topic breakdown" }, { status: 500 });
  }
}
