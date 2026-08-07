import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lastActiveDate, currentStreak = 0 } = await req.json();

    const today = new Date().toISOString().split("T")[0];

    if (!lastActiveDate) {
      return NextResponse.json({
        streakCount: 1,
        lastActiveDate: today,
        updated: true
      });
    }

    const lastDate = new Date(lastActiveDate);
    const currentDate = new Date(today);

    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Practiced consecutive day
      return NextResponse.json({
        streakCount: currentStreak + 1,
        lastActiveDate: today,
        updated: true
      });
    } else if (diffDays === 0) {
      // Already practiced today
      return NextResponse.json({
        streakCount: currentStreak,
        lastActiveDate: today,
        updated: false
      });
    } else {
      // Missed a day -> reset streak to 1
      return NextResponse.json({
        streakCount: 1,
        lastActiveDate: today,
        reset: true,
        updated: true
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update streak algorithm" }, { status: 500 });
  }
}
