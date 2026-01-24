import { NextRequest, NextResponse } from "next/server";
import { getAllUserCredits } from "@/server/credit/query";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCredits = await getAllUserCredits(userId);

    const credits = userCredits.map((c) => ({
      id: c.id,
      type: c.type,
      amount: c.amount,
      consumed: c.consumed,
      remaining: c.amount - c.consumed,
      issuedAt: c.createdAt.toISOString(),
      expiresAt: c.expiresAt?.toISOString() || null,
    }));

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("Failed to fetch credit records:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit records" },
      { status: 500 }
    );
  }
}

