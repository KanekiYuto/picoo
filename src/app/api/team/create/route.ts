import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { team, teamMember } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { name, description, image } = body;

    // 验证必填字段
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "Team name cannot exceed 50 characters" },
        { status: 400 }
      );
    }

    // 开始事务：创建团队并添加创建者为 owner
    const result = await db.transaction(async (tx) => {
      // 创建团队（ID 由数据库自动生成 UUID）
      const [newTeam] = await tx.insert(team).values({
        name: name.trim(),
        description: description?.trim() || null,
        image: image || null,
        ownerId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: team.id });

      // 添加创建者为团队 owner
      await tx.insert(teamMember).values({
        teamId: newTeam.id,
        userId: session.user.id,
        role: "owner",
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return newTeam;
    });

    console.log("Team created successfully:", result.id);

    return NextResponse.json(
      {
        id: result.id,
        name: name.trim(),
        description: description?.trim() || null,
        image: image || null,
        ownerId: session.user.id,
        message: "Team created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
