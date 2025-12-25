import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';
import * as schema from './db/schema';
import { nanoid } from 'nanoid';

// 导入 fetch 配置以解决 Google OAuth 超时问题
import './fetch-config';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 天
    updateAge: 60 * 60 * 24, // 每天更新一次
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 分钟缓存
    },
  },
  plugins: [
    nextCookies(),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // 创建团队
            const teamId = nanoid();
            await db.insert(schema.team).values({
              id: teamId,
              name: `${user.name}'s personal`,
              ownerId: user.id,
            });

            // 将用户添加为团队成员（owner角色）
            await db.insert(schema.teamMember).values({
              id: nanoid(),
              teamId: teamId,
              userId: user.id,
              role: 'owner',
            } as any);

            console.log('Team created for user:', user.id);
          } catch (error) {
            console.error('Failed to create team for user:', error);
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
