import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { team, teamMember, user } from "@/lib/db/schema";
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

    // 查询用户完整信息（包含 currentTeamId）
    const [userData] = await db
      .select({
        currentTeamId: user.currentTeamId,
      })
      .from(user)
      .where(eq(user.id, session.user.id));

    // 查询用户所属的所有团队
    const userTeams = await db
      .select({
        id: team.id,
        name: team.name,
        type: team.type,
        role: teamMember.role,
        memberCount: team.memberCount,
      })
      .from(teamMember)
      .innerJoin(
        team,
        eq(teamMember.teamId, team.id)
      )
      .where(eq(teamMember.userId, session.user.id));

    // 查询当前团队信息
    let currentTeam = null;
    if (userData?.currentTeamId) {
      const [currentTeamData] = await db
        .select({
          id: team.id,
          name: team.name,
          type: team.type,
          role: teamMember.role,
          memberCount: team.memberCount,
        })
        .from(team)
        .innerJoin(
          teamMember,
          eq(teamMember.teamId, team.id)
        )
        .where(
          and(
            eq(team.id, userData.currentTeamId),
            eq(teamMember.userId, session.user.id)
          )
        );

      currentTeam = currentTeamData || null;
    }

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      image: session.user.image,
      currentTeamId: userData?.currentTeamId || null,
      currentTeam,
      teams: userTeams,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      { error: "获取用户信息失败" },
      { status: 500 }
    );
  }
}
