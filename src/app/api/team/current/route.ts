import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { team, teamMember, user as userTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 查询用户当前团队ID
    const [userData] = await db
      .select({
        currentTeamId: userTable.currentTeamId,
      })
      .from(userTable)
      .where(eq(userTable.id, session.user.id));

    if (!userData?.currentTeamId) {
      return NextResponse.json(
        { error: "未找到当前团队" },
        { status: 404 }
      );
    }

    // 查询团队基本信息
    const [teamData] = await db
      .select({
        id: team.id,
        name: team.name,
        description: team.description,
        image: team.image,
        type: team.type,
        memberCount: team.memberCount,
        ownerId: team.ownerId,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      })
      .from(team)
      .where(eq(team.id, userData.currentTeamId));

    if (!teamData) {
      return NextResponse.json(
        { error: "团队不存在" },
        { status: 404 }
      );
    }

    // 查询团队所有成员
    const members = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
        role: teamMember.role,
        joinedAt: teamMember.joinedAt,
      })
      .from(teamMember)
      .innerJoin(
        userTable,
        eq(teamMember.userId, userTable.id)
      )
      .where(eq(teamMember.teamId, userData.currentTeamId));

    return NextResponse.json({
      id: teamData.id,
      name: teamData.name,
      description: teamData.description,
      image: teamData.image,
      type: teamData.type,
      memberCount: teamData.memberCount, // 使用实际成员数量
      ownerId: teamData.ownerId,
      members,
      createdAt: teamData.createdAt,
      updatedAt: teamData.updatedAt,
    });
  } catch (error) {
    console.error("Failed to fetch current team:", error);
    return NextResponse.json(
      { error: "获取团队信息失败" },
      { status: 500 }
    );
  }
}
