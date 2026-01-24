import { NextRequest, NextResponse } from "next/server";
import { getAvailableCredit, getAllUserCredits } from "@/server/credit/query";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCredits = await getAllUserCredits(userId);
    const totalRemaining = await getAvailableCredit(userId);
    const totalConsumed = userCredits.reduce((sum, c) => sum + c.consumed, 0);

    const now = new Date();
    const activeCreditsCount = userCredits.filter((c) => {
      const isNotExpired = c.expiresAt === null || c.expiresAt >= now;
      const hasRemaining = c.amount - c.consumed > 0;
      return isNotExpired && hasRemaining;
    }).length;

    return NextResponse.json({
      totalRemaining,
      totalConsumed,
      activeCreditsCount,
    });
  } catch (error) {
    console.error("Failed to fetch credit stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit stats" },
      { status: 500 }
    );
  }
}

