import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { organization, organizationMember } from "@/lib/db/schema";
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

    // 查询用户所属的所有组织
    const userOrganizations = await db
      .select({
        id: organization.id,
        name: organization.name,
        role: organizationMember.role,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${organizationMember} om
          WHERE om."organizationId" = ${organization.id}
        )`,
      })
      .from(organizationMember)
      .innerJoin(
        organization,
        eq(organizationMember.organizationId, organization.id)
      )
      .where(eq(organizationMember.userId, session.user.id));

    return NextResponse.json(userOrganizations);
  } catch (error) {
    console.error("Failed to fetch user organizations:", error);
    return NextResponse.json(
      { error: "获取组织信息失败" },
      { status: 500 }
    );
  }
}
