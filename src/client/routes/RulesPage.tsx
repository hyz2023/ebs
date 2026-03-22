export function RulesPage() {
  return (
    <section className="page-card">
      <h1>规则说明</h1>
      <p className="summary">精英住校生系统 — 完整规则与奖励机制</p>

      {/* 第一部分：活动周期 */}
      <div className="placeholder-block">
        <h2>📅 活动周期</h2>
        <div className="rule-card">
          <p className="rule-highlight">2026-03-21 至 2026-07-31</p>
          <p>初始余额：<strong>100.00</strong></p>
        </div>
      </div>

      {/* 第二部分：每日结算 */}
      <div className="placeholder-block">
        <h2>🎯 每日结算</h2>
        <p>每天完成 4 项日常任务后提交结算，系统根据完成情况计算等级和奖励。</p>
        
        <div className="rule-card rule-card--level1">
          <div className="rule-card__header">
            <span className="rule-card__icon">✅</span>
            <h3>等级 1 — 完美完成</h3>
          </div>
          <p className="rule-card__condition"><strong>条件：</strong>四项全部完成</p>
          <p className="rule-card__reward"><strong>奖励：</strong>+25 积分，连胜 +1</p>
        </div>

        <div className="rule-card rule-card--level2">
          <div className="rule-card__header">
            <span className="rule-card__icon">⚠️</span>
            <h3>等级 2 — 未完成</h3>
          </div>
          <p className="rule-card__condition"><strong>条件：</strong>至少一项未完成，无严重违规</p>
          <p className="rule-card__reward"><strong>奖励：</strong>+15 积分</p>
          <p className="rule-card__note">
            <strong>护盾机制：</strong>如果有护盾，可选择消耗 1 个护盾保住连胜。
          </p>
        </div>

        <div className="rule-card rule-card--level3">
          <div className="rule-card__header">
            <span className="rule-card__icon">❌</span>
            <h3>等级 3 — 严重违规</h3>
          </div>
          <p className="rule-card__condition"><strong>条件：</strong>启用「严重违规/熔断」</p>
          <p className="rule-card__reward"><strong>惩罚：</strong>-50 积分，连胜清零</p>
        </div>
      </div>

      {/* 第三部分：新手保护期 */}
      <div className="placeholder-block">
        <h2>🛡️ 新手保护期</h2>
        <div className="rule-card rule-card--novice">
          <p className="rule-highlight">2026-03-21 至 2026-03-23</p>
          <p>保护期内，<strong>等级 2 的奖励提升至 +25 积分</strong>（与等级 1 相同）。</p>
          <p>这意味着只要不触发严重违规，每天都能获得 +25 积分。</p>
        </div>
      </div>

      {/* 第四部分：连胜奖励 */}
      <div className="placeholder-block">
        <h2>🔥 连胜奖励</h2>
        <p>连续达成等级 1 可解锁额外奖励：</p>
        
        <div className="milestone-grid">
          <div className="milestone-card">
            <div className="milestone-card__amount">+20</div>
            <div className="milestone-card__label">3 天连胜</div>
          </div>
          <div className="milestone-card">
            <div className="milestone-card__amount">+50</div>
            <div className="milestone-card__label">7 天连胜</div>
          </div>
          <div className="milestone-card">
            <div className="milestone-card__amount">🛡️</div>
            <div className="milestone-card__label">14 天连胜 — 获得护盾</div>
          </div>
          <div className="milestone-card">
            <div className="milestone-card__amount">+200</div>
            <div className="milestone-card__label">21 天连胜</div>
          </div>
        </div>
        <p className="rule-note">21 天连胜奖励后，连胜计数重置为 0。</p>
      </div>

      {/* 第五部分：日常任务清单 */}
      <div className="placeholder-block">
        <h2>📋 每日任务清单</h2>
        <div className="checklist-static">
          <div className="checklist-item">
            <span className="checklist-item__icon">🌅</span>
            <div>
              <strong>静音起/收航</strong>
              <p className="checklist-item__hint">出门进门情绪稳定</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="checklist-item__icon">🔇</span>
            <div>
              <strong>背景音过滤</strong>
              <p className="checklist-item__hint">不回怼、不翻白眼</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="checklist-item__icon">🍽️</span>
            <div>
              <strong>燃料与领地</strong>
              <p className="checklist-item__hint">正常进食 + 整理书包衣物</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="checklist-item__icon">🌿</span>
            <div>
              <strong>环境友好</strong>
              <p className="checklist-item__hint">无摔门砸物尖叫</p>
            </div>
          </div>
        </div>
      </div>

      {/* 第六部分：外部奖惩 */}
      <div className="placeholder-block">
        <h2>🎖️ 外部奖惩</h2>
        <div className="rule-card">
          <p>学校或校外的奖励和惩罚会作为独立事件记录在流水中。</p>
          <p>外部奖惩<strong>不会修改</strong>历史每日结算记录。</p>
        </div>
      </div>

      {/* 第七部分：最终结算 */}
      <div className="placeholder-block">
        <h2>💰 最终结算</h2>
        <div className="rule-card rule-card--final">
          <p className="rule-highlight">2026-07-31</p>
          <p>活动结束时，系统会执行最终结算：</p>
          <p className="rule-formula">
            <strong>最终余额 = 当前余额 + (护盾数量 × 30)</strong>
          </p>
          <p>护盾可以按每个 30 积分折算成最终余额。</p>
        </div>
      </div>
    </section>
  );
}
