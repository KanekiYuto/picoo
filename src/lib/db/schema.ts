import { pgTable, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';

// 用户表
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  currentTeamId: uuid('current_team_id'), // 当前选中的团队ID
  country: text('country'), // 国家代码，如 CN, US
  ipAddress: text('ip_address'), // 注册时的 IP 地址
  utmSource: text('utm_source'), // UTM 来源
  utmMedium: text('utm_medium'), // UTM 媒介
  utmCampaign: text('utm_campaign'), // UTM 活动
  utmTerm: text('utm_term'), // UTM 关键词
  utmContent: text('utm_content'), // UTM 内容
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 团队表
export const team = pgTable('team', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  type: text('type').notNull().default('free'),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 团队成员表
export const teamMember = pgTable('team_member', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => team.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // owner, admin, member
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 文件资源表
export const fileResource = pgTable('file_resource', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => team.id, { onDelete: 'set null' }),
  key: text('key').notNull().unique(),
  url: text('url').notNull(),
  fileName: text('file_name').notNull(),
  contentType: text('content_type'),
  fileType: text('file_type'),
  size: integer('size').notNull(),
  prefix: text('prefix'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 重新导出 better-auth 表
export * from './auth-schema';
