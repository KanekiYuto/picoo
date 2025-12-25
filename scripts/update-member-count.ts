import { db } from '../src/lib/db';
import { team, teamMember } from '../src/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

async function updateMemberCounts() {
  try {
    // 获取所有团队
    const teams = await db.select({ id: team.id }).from(team);

    console.log(`Found ${teams.length} teams to update`);

    for (const t of teams) {
      // 计算每个团队的成员数量
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(teamMember)
        .where(eq(teamMember.teamId, t.id));

      const memberCount = Number(result.count);

      // 更新团队的 memberCount 字段
      await db
        .update(team)
        .set({ memberCount })
        .where(eq(team.id, t.id));

      console.log(`Updated team ${t.id}: ${memberCount} members`);
    }

    console.log('Successfully updated all teams memberCount');
  } catch (error) {
    console.error('Failed to update member counts:', error);
    process.exit(1);
  }

  process.exit(0);
}

updateMemberCounts();
