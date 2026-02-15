import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ip, country } = body;

    // 至少需要提供一个字段
    if (!ip && !country) {
      return NextResponse.json(
        { error: "At least one of ip or country is required" },
        { status: 400 }
      );
    }

    // 构建更新数据
    const updateData: { ip?: string; country?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (ip) {
      updateData.ip = ip;
    }

    if (country) {
      updateData.country = country;
    }

    // 更新用户位置信息
    const [updatedUser] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ip: updatedUser.ip,
        country: updatedUser.country,
        updatedAt: updatedUser.updatedAt,
      }
    });
  } catch (error) {
    console.error("Failed to report user location:", error);
    return NextResponse.json(
      { error: "Failed to report user location" },
      { status: 500 }
    );
  }
}
