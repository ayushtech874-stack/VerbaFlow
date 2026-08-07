import { NextResponse } from "next/server";
import categoriesData from "@/data/categories.json";

export async function POST(req: Request) {
  try {
    const { userId, genre, difficulty, attemptedTopicIds = [] } = await req.json();

    // Flatten all topics matching genre / difficulty criteria
    let availableTopics: any[] = [];

    categoriesData.forEach((cat: any) => {
      cat.genres.forEach((g: any) => {
        if (!genre || genre === "all" || g.id === genre || g.name === genre) {
          g.topics.forEach((tText: string, idx: number) => {
            const topicId = `${g.id}_${idx}`;
            availableTopics.push({
              id: topicId,
              topicText: tText,
              genre: g.name,
              difficulty: difficulty || "Medium"
            });
          });
        }
      });
    });

    // STRICT RULE: Exclude already attempted topics
    const unattemptedTopics = availableTopics.filter((t) => !attemptedTopicIds.includes(t.id));

    // Handle Exhausted Topics Edge Case
    if (unattemptedTopics.length === 0) {
      return NextResponse.json({
        exhausted: true,
        message: "No new topics available. Please revisit your history to reattempt past topics!"
      });
    }

    // Pick random unattempted topic
    const randomIndex = Math.floor(Math.random() * unattemptedTopics.length);
    const selectedTopic = unattemptedTopics[randomIndex];

    return NextResponse.json({
      exhausted: false,
      topic: selectedTopic
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate non-duplicated topic" }, { status: 500 });
  }
}
