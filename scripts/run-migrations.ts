import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  try {
    console.log('开始运行迁移...');

    // 读取迁移 2
    const migration2 = fs.readFileSync(
      path.join(__dirname, '../drizzle/0002_powerful_sally_floyd.sql'),
      'utf-8'
    );

    // 读取迁移 3
    const migration3 = fs.readFileSync(
      path.join(__dirname, '../drizzle/0003_mushy_ultimo.sql'),
      'utf-8'
    );

    // 执行迁移 2
    console.log('执行迁移 2...');
    const statements2 = migration2.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);
    for (const statement of statements2) {
      await db.execute(sql.raw(statement));
    }
    console.log('✓ 迁移 2 完成');

    // 执行迁移 3
    console.log('执行迁移 3...');
    const statements3 = migration3.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);
    for (const statement of statements3) {
      await db.execute(sql.raw(statement));
    }
    console.log('✓ 迁移 3 完成');

    console.log('所有迁移执行完成！');
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

runMigrations();
