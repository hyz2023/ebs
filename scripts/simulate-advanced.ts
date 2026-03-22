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

// 获取当前账户状态
const account = db.prepare('SELECT * FROM account_snapshot WHERE account_id = ?').get('primary');
if (!account) {
  console.error('Account not found');
  process.exit(1);
}

console.log('当前账户状态:');
console.log(`  余额：${account.balance}`);
console.log(`  连胜：${account.streak_count}`);
console.log(`  护盾：${account.shield_stock}`);
console.log(`  最后结算：${account.last_settlement_date}`);
console.log('');

let balance = account.balance;
let streakCount = account.streak_count;
let shieldStock = account.shield_stock;
let lastSettlementDate = account.last_settlement_date;

// 模拟结算函数
function simulateSettlement(date, level, missedItems = [], consumeShield = false) {
  console.log(`\n=== ${date} ===`);
  
  // 检查是否已结算
  const existing = db.prepare(
    'SELECT * FROM ledger_events WHERE account_id = ? AND event_date = ? AND event_type = ?'
  ).get('primary', date, 'DAILY_SETTLEMENT');
  
  if (existing) {
    console.log(`⚠️  已结算，跳过`);
    return;
  }
  
  // 计算每日结算金额
  let amountDelta = 0;
  if (level === 1) {
    amountDelta = 25;
    streakCount += 1;
    console.log(`✅ 完美完成！+25, 连胜 → ${streakCount}`);
  } else if (level === 2) {
    amountDelta = 15;
    console.log(`⚠️  未完成，+15`);
    
    if (consumeShield && shieldStock > 0) {
      shieldStock -= 1;
      console.log(`🛡️  消耗护盾，连胜保留 → ${streakCount}`);
      
      // 插入护盾消耗事件
      db.prepare(`
        INSERT INTO ledger_events (account_id, event_date, event_type, amount_delta, balance_after, streak_after, shield_after, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run('primary', date, 'SHIELD_CONSUMED', 0, balance + amountDelta, streakCount, shieldStock);
    } else {
      streakCount = 0;
      console.log(`❌ 连胜中断 → 0`);
    }
  } else if (level === 3) {
    amountDelta = -50;
    streakCount = 0;
    console.log(`❌ 严重违规！-50, 连胜清零`);
  }
  
  balance += amountDelta;
  
  // 检查里程碑奖励
  if (level === 1 || (level === 2 && consumeShield)) {
    if (streakCount === 3) {
      balance += 20;
      console.log(`🎉 3 天里程碑！+20`);
      db.prepare(`
        INSERT INTO ledger_events (account_id, event_date, event_type, amount_delta, balance_after, streak_after, shield_after, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run('primary', date, 'STREAK_REWARD', 20, balance, streakCount, shieldStock);
    } else if (streakCount === 7) {
      balance += 50;
      console.log(`🎉 7 天里程碑！+50`);
      db.prepare(`
        INSERT INTO ledger_events (account_id, event_date, event_type, amount_delta, balance_after, streak_after, shield_after, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run('primary', date, 'STREAK_REWARD', 50, balance, streakCount, shieldStock);
    } else if (streakCount === 14) {
      shieldStock += 1;
      console.log(`🎉 14 天里程碑！获得护盾 🛡️`);
      db.prepare(`
        INSERT INTO ledger_events (account_id, event_date, event_type, amount_delta, balance_after, streak_after, shield_after, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run('primary', date, 'SHIELD_GRANTED', 0, balance, streakCount, shieldStock);
    } else if (streakCount === 21) {
      balance += 200;
      console.log(`🎉 21 天里程碑！+200`);
      db.prepare(`
        INSERT INTO ledger_events (account_id, event_date, event_type, amount_delta, balance_after, streak_after, shield_after, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run('primary', date, 'STREAK_REWARD', 200, balance, streakCount, shieldStock);
      streakCount = 0;
      console.log(`🔄 连胜重置 → 0`);
    }
  }
  
  // 插入每日结算事件
  db.prepare(`
    INSERT INTO ledger_events (account_id, event_date, event_type, amount_delta, balance_after, streak_after, shield_after, level, missed_items, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run('primary', date, 'DAILY_SETTLEMENT', amountDelta, balance, streakCount, shieldStock, level, JSON.stringify(missedItems));
  
  console.log(`💰 余额 → ${balance} | 🛡️ 护盾 → ${shieldStock}`);
}

// 继续从 2026-04-04 开始模拟
console.log('\n' + '='.repeat(60));
console.log('测试场景：获得多个护盾、使用和保留');
console.log('='.repeat(60));

// 第一周：完美完成，获得第 1 个护盾（14 天）
simulateSettlement('2026-04-04', 1); // 连胜 2
simulateSettlement('2026-04-05', 1); // 连胜 3，触发 3 天奖励 +20
simulateSettlement('2026-04-06', 1); // 连胜 4
simulateSettlement('2026-04-07', 1); // 连胜 5
simulateSettlement('2026-04-08', 1); // 连胜 6
simulateSettlement('2026-04-09', 1); // 连胜 7，触发 7 天奖励 +50
simulateSettlement('2026-04-10', 1); // 连胜 8
simulateSettlement('2026-04-11', 1); // 连胜 9
simulateSettlement('2026-04-12', 1); // 连胜 10
simulateSettlement('2026-04-13', 1); // 连胜 11
simulateSettlement('2026-04-14', 1); // 连胜 12
simulateSettlement('2026-04-15', 1); // 连胜 13
simulateSettlement('2026-04-16', 1); // 连胜 14，触发 14 天奖励，获得第 1 个护盾 🛡️

console.log('\n--- 现在有了第 1 个护盾 ---\n');

// 第二次：使用护盾
simulateSettlement('2026-04-17', 2, ['launch'], true); // 使用护盾，连胜保留 14
simulateSettlement('2026-04-18', 1); // 连胜 15
simulateSettlement('2026-04-19', 1); // 连胜 16
simulateSettlement('2026-04-20', 1); // 连胜 17
simulateSettlement('2026-04-21', 1); // 连胜 18
simulateSettlement('2026-04-22', 1); // 连胜 19
simulateSettlement('2026-04-23', 1); // 连胜 20
simulateSettlement('2026-04-24', 1); // 连胜 21，触发 21 天奖励 +200，连胜重置

console.log('\n--- 21 天重置，重新开始 ---\n');

// 第三次：获得第 2 个护盾
simulateSettlement('2026-04-25', 1); // 连胜 1
simulateSettlement('2026-04-26', 1); // 连胜 2
simulateSettlement('2026-04-27', 1); // 连胜 3，触发 3 天奖励 +20
simulateSettlement('2026-04-28', 1); // 连胜 4
simulateSettlement('2026-04-29', 1); // 连胜 5
simulateSettlement('2026-04-30', 1); // 连胜 6
simulateSettlement('2026-05-01', 1); // 连胜 7，触发 7 天奖励 +50
simulateSettlement('2026-05-02', 1); // 连胜 8
simulateSettlement('2026-05-03', 1); // 连胜 9
simulateSettlement('2026-05-04', 1); // 连胜 10
simulateSettlement('2026-05-05', 1); // 连胜 11
simulateSettlement('2026-05-06', 1); // 连胜 12
simulateSettlement('2026-05-07', 1); // 连胜 13
simulateSettlement('2026-05-08', 1); // 连胜 14，触发 14 天奖励，获得第 2 个护盾 🛡️

console.log('\n--- 现在有了第 2 个护盾 ---\n');

// 第四次：不使用护盾，让连胜中断
simulateSettlement('2026-05-09', 2, ['background-sound'], false); // 不使用护盾，连胜中断
simulateSettlement('2026-05-10', 1); // 重新开始连胜 1
simulateSettlement('2026-05-11', 1); // 连胜 2
simulateSettlement('2026-05-12', 1); // 连胜 3，触发 3 天奖励 +20

console.log('\n--- 使用第 2 个护盾 ---\n');

// 第五次：使用第 2 个护盾
simulateSettlement('2026-05-13', 2, ['fuel', 'environment'], true); // 使用第 2 个护盾
simulateSettlement('2026-05-14', 1); // 连胜 4
simulateSettlement('2026-05-15', 1); // 连胜 5

// 显示最终状态
const final = db.prepare('SELECT * FROM account_snapshot WHERE account_id = ?').get('primary');
console.log('\n' + '='.repeat(60));
console.log('最终账户状态:');
console.log('='.repeat(60));
console.log(`  余额：${final.balance}`);
console.log(`  连胜：${final.streak_count}`);
console.log(`  护盾：${final.shield_stock}`);
console.log(`  最后结算：${final.last_settlement_date}`);

// 显示护盾事件
console.log('\n' + '='.repeat(60));
console.log('护盾记录:');
console.log('='.repeat(60));
const shieldEvents = db.prepare(`
  SELECT event_date, event_type, shield_after
  FROM ledger_events 
  WHERE event_type IN ('SHIELD_GRANTED', 'SHIELD_CONSUMED')
  ORDER BY event_date ASC
`).all();

shieldEvents.forEach(event => {
  const action = event.event_type === 'SHIELD_GRANTED' ? '🛡️ 获得' : '💔 使用';
  console.log(`  ${event.event_date} | ${action} | 护盾库存：${event.shield_after}`);
});

// 更新账户快照为最终状态
db.exec(`
  UPDATE account_snapshot 
  SET balance = ?, streak_count = ?, shield_stock = ?, last_settlement_date = ?
  WHERE account_id = ?
`, balance, streakCount, shieldStock, '2026-05-15', 'primary');

db.close();
console.log('\n✅ 模拟完成！');
