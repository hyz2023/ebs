#!/usr/bin/env node

import Database from 'better-sqlite3';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const dbPath = resolve(process.env.EBS_DB_PATH ?? 'ebs.sqlite');

if (!existsSync(dbPath)) {
  console.error(`Database file not found: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);

console.log('🔍 检查当前状态...');

// 检查 3 月 27 日和 28 日的记录
const mar27 = db.prepare(
  `SELECT * FROM ledger_events WHERE event_date = '2026-03-27' ORDER BY id`
).all();

const mar28 = db.prepare(
  `SELECT * FROM ledger_events WHERE event_date = '2026-03-28' ORDER BY id`
).all();

console.log(`3 月 27 日记录数：${mar27.length}`);
console.log(`3 月 28 日记录数：${mar28.length}`);

// 获取 3 月 26 日后的账户状态
const beforeMar27 = db.prepare(
  `SELECT balance, streak_count, shield_stock FROM account_snapshot WHERE account_id = 'primary'`
).get() as { balance: number; streak_count: number; shield_stock: number };

console.log(`\n当前账户状态:`);
console.log(`  余额：${beforeMar27.balance}`);
console.log(`  连胜：${beforeMar27.streak_count}`);
console.log(`  护盾：${beforeMar27.shield_stock}`);

// 删除 3 月 28 日的错误记录
console.log('\n🗑️  删除 3 月 28 日的错误记录...');
db.exec(`DELETE FROM ledger_events WHERE event_date = '2026-03-28'`);

// 恢复 3 月 26 日后的状态（回滚到 3 月 26 日结算后）
// 3 月 26 日：余额 270，连胜 6
db.exec(`
  UPDATE account_snapshot 
  SET balance = 270.0,
      streak_count = 6,
      shield_stock = 0,
      last_settlement_date = '2026-03-26'
  WHERE account_id = 'primary'
`);

console.log('✅ 已回滚到 3 月 26 日状态');

// 重新结算 3 月 27 日（7 连胜）
console.log('\n📅 结算 3 月 27 日（7 连胜）...');
db.prepare(`
  INSERT INTO ledger_events (
    account_id, event_date, event_type, amount_delta, balance_after,
    streak_after, shield_after, level, missed_items, note
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'primary', '2026-03-27', 'DAILY_SETTLEMENT',
  25.0,  // 基础分
  295.0, // 270 + 25
  7,     // 6 + 1 = 7 连胜
  0,
  1,     // level 1
  '[]',
  '补结算 - 恢复记录'
);

// 7 连胜奖励
db.prepare(`
  INSERT INTO ledger_events (
    account_id, event_date, event_type, amount_delta, balance_after,
    streak_after, shield_after, level, missed_items, note
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'primary', '2026-03-27', 'STREAK_REWARD',
  50.0,  // 7 连胜奖励
  345.0, // 295 + 50
  7,
  0,
  null,
  null,
  '7 连胜奖励'
);

console.log('  ✅ 3 月 27 日结算完成：+25 基础分 +50 连胜奖励 = +75 分');
console.log('     余额：270 → 345，连胜：6 → 7');

// 重新结算 3 月 28 日（8 连胜）
console.log('\n📅 结算 3 月 28 日（8 连胜）...');
db.prepare(`
  INSERT INTO ledger_events (
    account_id, event_date, event_type, amount_delta, balance_after,
    streak_after, shield_after, level, missed_items, note
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'primary', '2026-03-28', 'DAILY_SETTLEMENT',
  25.0,  // 基础分
  370.0, // 345 + 25
  8,     // 7 + 1 = 8 连胜
  0,
  1,     // level 1
  '[]',
  '补结算 - 恢复记录'
);

console.log('  ✅ 3 月 28 日结算完成：+25 基础分');
console.log('     余额：345 → 370，连胜：7 → 8');

// 更新账户快照
db.exec(`
  UPDATE account_snapshot 
  SET balance = 370.0,
      streak_count = 8,
      shield_stock = 0,
      last_settlement_date = '2026-03-28'
  WHERE account_id = 'primary'
`);

console.log('\n✅ 恢复完成！');
console.log('\n最终状态:');
console.log('  余额：370 分');
console.log('  连胜：8 天');
console.log('  护盾：0');
console.log('\n记录详情:');

const final27 = db.prepare(
  `SELECT event_type, amount_delta, balance_after, streak_after FROM ledger_events WHERE event_date = '2026-03-27' ORDER BY id`
).all();

const final28 = db.prepare(
  `SELECT event_type, amount_delta, balance_after, streak_after FROM ledger_events WHERE event_date = '2026-03-28' ORDER BY id`
).all();

console.log('\n3 月 27 日:');
final27.forEach((row: any) => {
  console.log(`  ${row.event_type}: ${row.amount_delta > 0 ? '+' : ''}${row.amount_delta}分，余额${row.balance_after}，连胜${row.streak_after}`);
});

console.log('\n3 月 28 日:');
final28.forEach((row: any) => {
  console.log(`  ${row.event_type}: ${row.amount_delta > 0 ? '+' : ''}${row.amount_delta}分，余额${row.balance_after}，连胜${row.streak_after}`);
});

db.close();
