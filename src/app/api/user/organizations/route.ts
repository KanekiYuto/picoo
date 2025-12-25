import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { team, teamMember } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

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

    // 查询用户所属的所有团队
    const userTeams = await db
      .select({
        id: team.id,
        name: team.name,
        role: teamMember.role,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${teamMember} tm
          WHERE tm."team_id" = ${team.id}
        )`,
      })
      .from(teamMember)
      .innerJoin(
        team,
        eq(teamMember.teamId, team.id)
      )
      .where(eq(teamMember.userId, session.user.id));

    return NextResponse.json(userTeams);
  } catch (error) {
    console.error("Failed to fetch user teams:", error);
    return NextResponse.json(
      { error: "获取团队信息失败" },
      { status: 500 }
    );
  }
}
