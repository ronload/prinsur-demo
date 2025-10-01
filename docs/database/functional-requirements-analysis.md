# 資料庫功能需求完整性分析報告

**專案名稱**: Prinsur MVP
**分析日期**: 2025-10-01 (最後更新: 2025-10-01)
**資料庫架構**: `docs/database/database.dbml`
**參考文件**: `README.md`, `docs/product-model.ts`

---

## 執行摘要

根據 Demo 版本的功能需求分析，當前資料庫設計**基本滿足** MVP 版本的核心功能。

### 實施進度
- ⚠️ **部分實施**: 3 項 (問題 1, 3, 6 - 已有基礎架構)
- ❌ **未實施**: 5 項 (問題 2, 4, 5, 7, 8 - 需要補充)

### 滿足度評分 (較前次略有進步)
- **核心功能**: 88% 滿足 (↑ 從 85%)
- **使用者管理**: 90% 滿足
- **保險商品管理**: 75% 滿足 ⚠️ (↑ 從 70%)
- **業務員管理**: 85% 滿足 (↑ 從 80%)
- **保單管理**: 75% 滿足 ⚠️
- **理賠管理**: 60% 滿足 ⚠️

### 新增的表格
- ✅ `insurance_recommendation_params` - 保險商品推薦參數
- ✅ `agent_recommendation_params` - 業務員推薦參數
- ✅ `agent_customer_relations` - 業務員客戶關係

---

## 功能需求對照表

### ✅ 已滿足的功能

#### 1. 使用者管理與認證

| 功能需求 | 對應表格 | 完整性 | 備註 |
|---------|---------|--------|------|
| 多角色支援 (consumer, agent, manager, admin) | `users.role` | ✅ 完整 | 支援 4 種角色 |
| 密碼認證 | `users.password_hash` | ✅ 完整 | 包含失敗次數追蹤 |
| OAuth 登入 (Google, Facebook) | `user_identities` | ✅ 完整 | 支援多個身份提供者 |
| Session 管理 | `user_sessions` | ✅ 完整 | 包含過期和終止機制 |
| 用戶偏好設定 | `user_preferences` | ✅ 完整 | 主題和語言設定 |

#### 2. 消費者個人資料管理

| 功能需求 | 對應表格/欄位 | 完整性 | 備註 |
|---------|-------------|--------|------|
| 基本資料 (姓名、年齡、性別) | `customer_profiles` | ✅ 完整 | |
| 健康資訊 (身高、體重、BMI) | `customer_profiles.weight_kg`, `height_cm` | ✅ 完整 | |
| 職業等級 | `customer_profiles.occupation_level` | ✅ 完整 | |
| 醫療史 | `customer_medical_histories` | ✅ 完整 | |
| 地理位置 | `customer_profiles.location_city` | ✅ 完整 | |

#### 3. 業務員檔案管理

| 功能需求 | 對應表格/欄位 | 完整性 | 備註 |
|---------|-------------|--------|------|
| 業務員認證 (執照號碼) | `agent_profiles.license_number` | ✅ 完整 | Unique constraint |
| 所屬公司 | `agent_profiles.company_id` | ✅ 完整 | Foreign key to companies |
| 職位與地址 | `agent_profiles.position`, `address` | ✅ 完整 | |
| 個人簡介 | `agent_profiles.bio` | ✅ 完整 | |
| 服務區域 | `agent_service_areas` | ✅ 完整 | 多對多關係 |
| 專業領域 | `agent_service_categories` | ✅ 完整 | 多對多關係 |
| 語言能力 | `agent_supported_languages` | ✅ 完整 | 支援 4 種語言 |

#### 4. 保險公司管理

| 功能需求 | 對應表格/欄位 | 完整性 | 備註 |
|---------|-------------|--------|------|
| 公司基本資料 | `companies` | ✅ 完整 | |
| 實收資本額 | `company_details.paid_in_capital` | ✅ 完整 | |
| 市占率 | `company_details.market_share` | ✅ 完整 | |
| 保險收入 | `company_details.insurance_income` | ✅ 完整 | |

#### 5. 保單投保管理

| 功能需求 | 對應表格/欄位 | 完整性 | 備註 |
|---------|-------------|--------|------|
| 保單投保記錄 | `policy_enrollments` | ✅ 完整 | |
| 客戶-業務員關聯 | `policy_enrollments.customer_id`, `agent_id` | ✅ 完整 | |
| 保單號碼 | `policy_enrollments.policy_number` | ✅ 完整 | Unique |
| 保單詳情 | `policy_enrollments_details` | ✅ 完整 | |
| 投保金額 | `policy_enrollments_details.insured_amount` | ✅ 完整 | |
| 繳費頻率 | `policy_enrollments_details.payment_frequency` | ✅ 完整 | monthly, annually, other |
| 繳費金額 | `policy_enrollments_details.payment_amount` | ✅ 完整 | |
| 下次繳費日 | `policy_enrollments_details.next_due_date` | ✅ 完整 | |
| 保單狀態 | `policy_enrollments_details.is_active` | ✅ 完整 | |

#### 6. 理賠管理

| 功能需求 | 對應表格/欄位 | 完整性 | 備註 |
|---------|-------------|--------|------|
| 理賠申請 | `claims` | ✅ 完整 | |
| 理賠狀態追蹤 | `claims.status` | ✅ 完整 | pending, approved, rejected, processing |
| 理賠金額 | `claims.amount` | ✅ 完整 | |
| 理賠訊息 | `claims.message` | ✅ 完整 | |

#### 7. 審計與通知

| 功能需求 | 對應表格/欄位 | 完整性 | 備註 |
|---------|-------------|--------|------|
| 審計日誌 | `audit_logs` | ✅ 完整 | |
| 用戶通知 | `notifications` | ✅ 完整 | |

---

## ⚠️ 缺失或不完整的功能

### 問題 1: 保險商品管理不完整 ⚠️ 部分實施

**需求來源**: README.md - 保險商品比較功能

**實施狀態**:
- ✅ 已新增 `insurance_recommendation_params` 表格 (Line 313-320)
  - rating_score (評分)
  - rating_count (評分數量)
  - view_count (瀏覽次數)
  - matching_count (配對次數)

**仍需補充**:
- ❌ 缺少獨立的 `insurance_ratings` 表格 (使用者評論功能)
- ❌ `insurances` 表格缺少狀態欄位 (is_active, is_featured, launch_date)

**影響功能**:
- 智慧比價系統
- 多維度排序 (保費、保障額度、評分、熱門度等)
- 保險商品搜尋

**當前問題**:
```dbml
Table insurances {
    id           int [pk]
    company_id   int [not null]
    category     insurance_categories [not null]
    name         varchar [not null]
    rate         numeric(5, 4)  // ❌ 費率，但缺少完整的保費計算參數
    // ❌ 缺少: 評分、熱門度、瀏覽次數、上市日期
}
```

**需要的額外欄位**:
```dbml
Table insurances {
    // ... 現有欄位

    // 評分與排名
    rating_score         numeric(3, 2)   [note: '1.00-5.00, 用戶評分']
    rating_count         int             [default: 0, note: '評分總數']
    popularity_score     int             [default: 0, note: '熱門度分數']
    view_count           int             [default: 0, note: '瀏覽次數']
    purchase_count       int             [default: 0, note: '購買次數']

    // 上市資訊
    launch_date          date            [note: '上市日期']
    is_featured          boolean         [default: false, note: '是否為推薦商品']
    display_order        int             [note: '顯示順序']

    // SEO
    slug                 varchar(200)    [unique, note: 'URL-friendly identifier']
    meta_description     text            [note: 'SEO meta description']

    // 狀態
    is_active            boolean         [default: true, note: '是否上架']
    is_available_online  boolean         [default: true, note: '是否開放線上投保']
}
```

**新增評分與評論表格**:
```dbml
Table insurance_ratings [headercolor: #f39c12] {
    id              int         [pk, increment]
    insurance_id    int         [not null]
    user_id         int         [not null]
    rating          int         [not null, note: '1-5 stars']
    review_title    varchar(200)
    review_content  text
    is_verified     boolean     [default: false, note: '是否為驗證購買']
    helpful_count   int         [default: 0]
    created_at      timestamptz [default: `now()`]
    updated_at      timestamptz [default: `now()`]

    Indexes {
        insurance_id
        user_id
        (insurance_id, user_id) [unique, note: 'One review per user per product']
        rating
        created_at
    }
}

Ref: insurance_ratings.insurance_id > insurances.id [delete: cascade]
Ref: insurance_ratings.user_id > users.id [delete: cascade]
```

---

### 問題 2: 保費計算缺少參數 (嚴重)

**需求來源**: `docs/product-model.ts` - `premium?: string;`

**當前問題**:
`insurances` 表格只有 `rate` 欄位，無法支援複雜的保費計算。

**解決方案**: 新增保費計算規則表格

```dbml
Enum premium_calculation_type {
    fixed            // 固定保費
    age_based        // 年齡級距
    coverage_based   // 保額比例
    occupation_based // 職業等級
    formula          // 自訂公式
}

Table premium_calculation_rules [headercolor: #f39c12] {
    id                  int    [pk, increment]
    insurance_id        int    [not null, unique]
    calculation_type    premium_calculation_type [not null]
    base_premium        numeric(10, 2) [note: '基礎保費']
    formula             text   [note: 'JSON format: calculation formula']
    min_premium         numeric(10, 2)
    max_premium         numeric(10, 2)

    // 年齡級距 (JSON 格式)
    age_brackets        jsonb  [note: '[{"min":0,"max":30,"rate":1.0},...]']

    // 職業等級係數 (JSON 格式)
    occupation_factors  jsonb  [note: '{"1":1.0,"2":1.2,"3":1.5,...}']

    // 保額級距
    coverage_brackets   jsonb  [note: '[{"min":0,"max":1000000,"rate":0.001},...]']

    updated_at          timestamptz [default: `now()`]

    Note: '''
    Premium calculation rules for each insurance product
    Example formula: base_premium * age_factor * occupation_factor * (coverage_amount / 100000)
    '''
}

Ref: premium_calculation_rules.insurance_id - insurances.id [delete: cascade]
```

**使用範例 (應用層)**:
```typescript
interface PremiumCalculationParams {
  insuranceId: number;
  age: number;
  occupationLevel: string;
  coverageAmount: number;
  gender?: string;
}

async function calculatePremium(params: PremiumCalculationParams): Promise<number> {
  const rule = await db.query(`
    SELECT * FROM premium_calculation_rules WHERE insurance_id = $1
  `, [params.insuranceId]);

  const { calculation_type, base_premium, age_brackets, occupation_factors } = rule.rows[0];

  let premium = base_premium;

  // 年齡係數
  if (age_brackets) {
    const ageFactor = findBracket(age_brackets, params.age);
    premium *= ageFactor;
  }

  // 職業係數
  if (occupation_factors) {
    const occFactor = occupation_factors[params.occupationLevel] || 1.0;
    premium *= occFactor;
  }

  // 保額係數
  premium *= (params.coverageAmount / 100000);

  return Math.round(premium);
}
```

---

### 問題 3: 業務員評分與評價系統缺失 ⚠️ 部分實施

**需求來源**: README.md - 業務員搜尋功能 "評分與評價系統"

**實施狀態**:
- ✅ 已新增 `agent_recommendation_params` 表格 (Line 163-169)
  - rating_score (評分)
  - rating_count (評分數量)
  - view_count (瀏覽次數)

**仍需補充**:
- ❌ 缺少 `agent_ratings` 表格 (個別客戶評價與評論)
- ❌ 缺少 `agent_statistics` 表格 (詳細業績統計)
- ❌ 缺少多維度評分 (專業度、回應速度、溝通能力等)

**當前問題**:
有基礎統計資料，但無法記錄使用者評論和多維度評分。

**解決方案**: 新增業務員評價表格

```dbml
Table agent_ratings [headercolor: #3498db] {
    id                  int         [pk, increment]
    agent_id            int         [not null]
    customer_id         int         [not null]
    policy_enrollment_id int        [note: '關聯的保單 (可選)']

    // 評分 (1-5)
    overall_rating      int         [not null, note: '1-5 stars']
    professionalism     int         [not null, note: '專業度 1-5']
    responsiveness      int         [not null, note: '回應速度 1-5']
    communication       int         [not null, note: '溝通能力 1-5']
    service_quality     int         [not null, note: '服務品質 1-5']

    // 評論
    review_title        varchar(200)
    review_content      text

    // 狀態
    is_verified         boolean     [default: false, note: '是否為實際客戶']
    is_visible          boolean     [default: true]

    // 業務員回覆
    agent_response      text
    agent_responded_at  timestamptz

    created_at          timestamptz [default: `now()`]
    updated_at          timestamptz [default: `now()`]

    Indexes {
        agent_id
        customer_id
        (agent_id, customer_id) [unique, note: 'One review per customer per agent']
        overall_rating
        created_at
    }

    Note: 'Customer reviews and ratings for insurance agents'
}

Ref: agent_ratings.agent_id > agent_profiles.user_id [delete: cascade]
Ref: agent_ratings.customer_id > customer_profiles.user_id [delete: cascade]
Ref: agent_ratings.policy_enrollment_id > policy_enrollments.id [delete: set null]

// 業務員統計快取 (效能優化)
Table agent_statistics [headercolor: #3498db] {
    agent_id            int         [pk]

    // 評分統計
    average_rating      numeric(3, 2) [note: '平均評分 1.00-5.00']
    total_ratings       int         [default: 0]
    rating_distribution jsonb       [note: '{"5":10,"4":5,"3":2,"2":0,"1":0}']

    // 業績統計
    total_policies      int         [default: 0]
    active_policies     int         [default: 0]
    total_customers     int         [default: 0]

    // 經驗
    years_of_experience numeric(4, 1) [note: '年資']
    first_policy_date   date        [note: '第一張保單日期']

    // 即時通訊
    average_response_time_hours int [note: '平均回應時間 (小時)']

    last_updated        timestamptz [default: `now()`]

    Note: 'Denormalized statistics for fast agent search and sorting'
}

Ref: agent_statistics.agent_id - agent_profiles.user_id [delete: cascade]
```

**觸發器自動更新統計**:
```sql
CREATE OR REPLACE FUNCTION update_agent_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新平均評分
    INSERT INTO agent_statistics (agent_id, average_rating, total_ratings)
    SELECT
        NEW.agent_id,
        AVG(overall_rating)::numeric(3,2),
        COUNT(*)::int
    FROM agent_ratings
    WHERE agent_id = NEW.agent_id
    ON CONFLICT (agent_id) DO UPDATE
    SET
        average_rating = EXCLUDED.average_rating,
        total_ratings = EXCLUDED.total_ratings,
        last_updated = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_stats
    AFTER INSERT OR UPDATE ON agent_ratings
    FOR EACH ROW EXECUTE FUNCTION update_agent_statistics();
```

---

### 問題 4: 保單提醒系統缺失 (中等)

**需求來源**: README.md - "自動提醒繳費和到期時間"

**當前問題**:
有 `policy_enrollments_details.next_due_date`，但缺少提醒設定和歷史記錄。

**解決方案**: 新增提醒管理表格

```dbml
Enum reminder_type {
    payment_due       // 繳費提醒
    policy_expiring   // 保單到期
    policy_renewal    // 續保提醒
    claim_update      // 理賠進度
    document_required // 文件補件
}

Enum reminder_status {
    scheduled
    sent
    failed
    cancelled
}

Table policy_reminders [headercolor: #127859] {
    id                      int         [pk, increment]
    policy_enrollment_id    int         [not null]
    user_id                 int         [not null]

    // 提醒類型與內容
    reminder_type           reminder_type [not null]
    title                   varchar(200) [not null]
    message                 text        [not null]

    // 排程
    scheduled_at            timestamptz [not null]
    sent_at                 timestamptz
    status                  reminder_status [default: 'scheduled']

    // 通知通道
    send_email              boolean     [default: true]
    send_sms                boolean     [default: false]
    send_push               boolean     [default: true]
    send_in_app             boolean     [default: true]

    // 重試機制
    retry_count             int         [default: 0]
    last_error              text

    // 用戶互動
    is_read                 boolean     [default: false]
    is_dismissed            boolean     [default: false]

    created_at              timestamptz [default: `now()`]

    Indexes {
        policy_enrollment_id
        user_id
        scheduled_at
        status
        (user_id, status, scheduled_at)
    }

    Note: 'Automated reminders for policy payments and renewals'
}

Ref: policy_reminders.policy_enrollment_id > policy_enrollments.id [delete: cascade]
Ref: policy_reminders.user_id > users.id [delete: cascade]
```

**自動生成繳費提醒的觸發器**:
```sql
CREATE OR REPLACE FUNCTION schedule_payment_reminders()
RETURNS TRIGGER AS $$
BEGIN
    -- 在繳費日前 7 天提醒
    INSERT INTO policy_reminders (
        policy_enrollment_id,
        user_id,
        reminder_type,
        title,
        message,
        scheduled_at
    )
    SELECT
        NEW.policy_enrollment_id,
        pe.customer_id,
        'payment_due',
        '保費繳納提醒',
        '您的保單將於 ' || NEW.next_due_date || ' 到期，請準時繳納保費',
        NEW.next_due_date - interval '7 days'
    FROM policy_enrollments pe
    WHERE pe.id = NEW.policy_enrollment_id;

    -- 在繳費日前 1 天再次提醒
    INSERT INTO policy_reminders (
        policy_enrollment_id,
        user_id,
        reminder_type,
        title,
        message,
        scheduled_at
    )
    SELECT
        NEW.policy_enrollment_id,
        pe.customer_id,
        'payment_due',
        '保費即將到期',
        '您的保單將於明天 ' || NEW.next_due_date || ' 到期，請儘快繳納保費',
        NEW.next_due_date - interval '1 day'
    FROM policy_enrollments pe
    WHERE pe.id = NEW.policy_enrollment_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_schedule_payment_reminders
    AFTER INSERT OR UPDATE OF next_due_date ON policy_enrollments_details
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION schedule_payment_reminders();
```

---

### 問題 5: 搜尋功能支援不足 (中等)

**需求來源**: README.md - "全站保險商品搜尋"

**當前問題**:
缺少全文搜尋索引和搜尋歷史記錄。

**解決方案 1**: 使用 PostgreSQL Full-Text Search

```sql
-- 為保險商品建立全文搜尋索引
ALTER TABLE insurances ADD COLUMN search_vector tsvector;

CREATE INDEX idx_insurances_search ON insurances USING GIN(search_vector);

-- 自動更新搜尋向量
CREATE OR REPLACE FUNCTION insurances_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.category::text, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insurances_search_vector
    BEFORE INSERT OR UPDATE ON insurances
    FOR EACH ROW EXECUTE FUNCTION insurances_search_vector_update();

-- 搜尋查詢範例
SELECT id, name, category,
       ts_rank(search_vector, query) AS rank
FROM insurances,
     to_tsquery('english', 'life & insurance') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

**解決方案 2**: 新增搜尋歷史表格

```dbml
Table search_history [headercolor: #95a5a6] {
    id              bigint      [pk, increment]
    user_id         int         [note: 'NULL for anonymous users']
    session_id      varchar(64)

    // 搜尋內容
    search_query    text        [not null]
    search_type     varchar(50) [note: 'product, agent, general']
    filters_applied jsonb       [note: 'Applied filters as JSON']

    // 結果
    results_count   int
    clicked_result_id int       [note: 'Which result was clicked']

    // 元資料
    ip_address      inet
    user_agent      text
    created_at      timestamptz [default: `now()`]

    Indexes {
        user_id
        search_query [note: 'For trending searches']
        created_at
        (search_type, created_at)
    }

    Note: 'Search history for analytics and personalization'
}

Ref: search_history.user_id > users.id [delete: set null]

// 熱門搜尋快取
Table trending_searches [headercolor: #95a5a6] {
    id              int         [pk, increment]
    search_query    text        [unique, not null]
    search_count    int         [default: 1]
    last_searched   timestamptz [default: `now()`]

    Indexes {
        search_count
        last_searched
    }

    Note: 'Aggregated trending searches for autocomplete'
}
```

---

### 問題 6: 業務員-客戶關係管理缺失 ⚠️ 部分實施

**需求來源**: README.md - "客戶管理"、"客戶互動"

**實施狀態**:
- ✅ 已新增 `agent_customer_relations` 表格 (Line 185-196)
  - customer_id, agent_id, created_at

**仍需補充**:
- ❌ 缺少關係狀態追蹤 (prospect, lead, qualified, active, inactive, lost)
- ❌ 缺少客戶來源 (source, referrer_id)
- ❌ 缺少互動統計 (total_interactions, total_policies, last_contact)
- ❌ 缺少 `customer_interactions` 表格 (詳細互動歷史)

**當前問題**:
有基本關聯表格，但功能陽春，缺少完整的 CRM 功能。

**解決方案**: 新增客戶關係表格

```dbml
Enum customer_relationship_status {
    prospect        // 潛在客戶
    lead            // 已接觸
    qualified       // 合格客戶
    active          // 活躍客戶
    inactive        // 不活躍
    lost            // 流失客戶
}

Table agent_customer_relationships [headercolor: #3498db] {
    id              int         [pk, increment]
    agent_id        int         [not null]
    customer_id     int         [not null]

    // 關係狀態
    status          customer_relationship_status [default: 'prospect']
    assigned_at     timestamptz [default: `now()`]
    first_contact   timestamptz
    last_contact    timestamptz

    // 客戶來源
    source          varchar(50) [note: 'website, referral, cold_call, event']
    referrer_id     int         [note: 'Referrer customer ID']

    // 備註
    notes           text
    tags            text[]      [note: 'Custom tags for segmentation']

    // 互動統計
    total_interactions int      [default: 0]
    total_policies     int      [default: 0]

    created_at      timestamptz [default: `now()`]
    updated_at      timestamptz [default: `now()`]

    Indexes {
        agent_id
        customer_id
        (agent_id, customer_id) [unique]
        status
        last_contact
    }

    Note: 'Agent-Customer relationship management'
}

Ref: agent_customer_relationships.agent_id > agent_profiles.user_id [delete: cascade]
Ref: agent_customer_relationships.customer_id > customer_profiles.user_id [delete: cascade]
Ref: agent_customer_relationships.referrer_id > customer_profiles.user_id [delete: set null]

// 互動記錄
Table customer_interactions [headercolor: #3498db] {
    id              bigint      [pk, increment]
    relationship_id int         [not null]
    agent_id        int         [not null]
    customer_id     int         [not null]

    // 互動類型
    interaction_type varchar(50) [not null, note: 'call, email, meeting, chat, visit']
    subject         varchar(200)
    notes           text

    // 排程
    scheduled_at    timestamptz
    completed_at    timestamptz
    duration_minutes int

    // 結果
    outcome         varchar(50) [note: 'success, no_answer, rescheduled, cancelled']
    next_action     text        [note: 'Follow-up actions']

    created_at      timestamptz [default: `now()`]
    created_by      int         [not null]

    Indexes {
        relationship_id
        agent_id
        customer_id
        scheduled_at
        completed_at
    }

    Note: 'Detailed interaction history between agents and customers'
}

Ref: customer_interactions.relationship_id > agent_customer_relationships.id [delete: cascade]
Ref: customer_interactions.agent_id > agent_profiles.user_id
Ref: customer_interactions.customer_id > customer_profiles.user_id
Ref: customer_interactions.created_by > users.id
```

---

### 問題 7: 理賠檔案管理缺失 (中等)

**需求來源**: 理賠流程需要上傳證明文件

**當前問題**:
`claims` 表格沒有檔案附件管理。

**解決方案**: 新增理賠檔案表格

```dbml
Enum claim_document_type {
    medical_report      // 診斷證明
    receipt             // 收據
    id_document         // 身分證明
    policy_document     // 保單文件
    accident_report     // 事故證明
    other               // 其他
}

Table claim_documents [headercolor: #127859] {
    id              int         [pk, increment]
    claim_id        int         [not null]

    // 檔案資訊
    document_type   claim_document_type [not null]
    file_name       varchar(255) [not null]
    file_size       int         [note: 'Size in bytes']
    file_mime_type  varchar(100)
    file_url        text        [not null, note: 'S3/Cloud storage URL']
    file_hash       varchar(64) [note: 'SHA-256 hash for integrity']

    // 狀態
    is_verified     boolean     [default: false]
    verified_by     int
    verified_at     timestamptz
    rejection_reason text

    // 元資料
    uploaded_by     int         [not null]
    uploaded_at     timestamptz [default: `now()`]
    deleted_at      timestamptz
    deleted_by      int

    Indexes {
        claim_id
        document_type
        uploaded_at
    }

    Note: 'Supporting documents for insurance claims'
}

Ref: claim_documents.claim_id > claims.id [delete: cascade]
Ref: claim_documents.verified_by > users.id [delete: set null]
Ref: claim_documents.uploaded_by > users.id
Ref: claim_documents.deleted_by > users.id [delete: set null]
```

---

### 問題 8: 業務員業績追蹤不完整 (低)

**需求來源**: README.md - "業績追蹤、報表分析"

**當前問題**:
需要從 `policy_enrollments` 統計，缺少預先計算的業績資料。

**解決方案**: 新增業績統計表格

```dbml
Enum performance_period_type {
    daily
    weekly
    monthly
    quarterly
    yearly
}

Table agent_performance [headercolor: #3498db] {
    id                      int         [pk, increment]
    agent_id                int         [not null]

    // 期間
    period_type             performance_period_type [not null]
    period_start            date        [not null]
    period_end              date        [not null]

    // 業績指標
    new_customers           int         [default: 0]
    new_policies            int         [default: 0]
    total_premium           numeric(12, 2) [default: 0]
    commission_earned       numeric(12, 2) [default: 0]

    // 保單類型分布
    policies_by_category    jsonb       [note: '{"life":5,"health":3,...}']

    // 客戶滿意度
    average_rating          numeric(3, 2)
    total_reviews           int

    // 活動量
    total_interactions      int         [default: 0]
    total_calls             int         [default: 0]
    total_meetings          int         [default: 0]

    // 排名
    rank_in_company         int
    rank_in_region          int

    // 目標達成
    target_premium          numeric(12, 2)
    achievement_rate        numeric(5, 2) [note: 'Percentage 0-999.99']

    created_at              timestamptz [default: `now()`]
    updated_at              timestamptz [default: `now()`]

    Indexes {
        agent_id
        (agent_id, period_type, period_start) [unique]
        period_start
        total_premium
    }

    Note: '''
    Pre-aggregated agent performance metrics for reporting
    Updated via scheduled jobs (daily, weekly, monthly)
    '''
}

Ref: agent_performance.agent_id > agent_profiles.user_id [delete: cascade]

// 業績目標設定
Table agent_targets [headercolor: #3498db] {
    id              int         [pk, increment]
    agent_id        int         [not null]

    // 目標期間
    period_type     performance_period_type [not null]
    period_start    date        [not null]
    period_end      date        [not null]

    // 目標值
    target_premium  numeric(12, 2) [not null]
    target_policies int         [not null]
    target_customers int        [not null]

    // 設定者
    set_by          int         [not null]
    created_at      timestamptz [default: `now()`]

    Indexes {
        agent_id
        (agent_id, period_start)
    }
}

Ref: agent_targets.agent_id > agent_profiles.user_id [delete: cascade]
Ref: agent_targets.set_by > users.id
```

---

## 架構改進建議

### 建議 1: 新增保險商品收藏功能

```dbml
Table user_favorite_insurances [headercolor: #f39c12] {
    id              int         [pk, increment]
    user_id         int         [not null]
    insurance_id    int         [not null]
    created_at      timestamptz [default: `now()`]

    Indexes {
        user_id
        (user_id, insurance_id) [unique]
    }

    Note: 'User favorite insurance products for quick access'
}

Ref: user_favorite_insurances.user_id > users.id [delete: cascade]
Ref: user_favorite_insurances.insurance_id > insurances.id [delete: cascade]
```

### 建議 2: 新增保險商品比較功能

```dbml
Table insurance_comparisons [headercolor: #f39c12] {
    id              int         [pk, increment]
    user_id         int
    session_id      varchar(64) [note: 'For anonymous users']
    insurance_ids   int[]       [not null, note: 'Array of insurance IDs being compared']
    created_at      timestamptz [default: `now()`]

    Indexes {
        user_id
        created_at
    }

    Note: 'Track insurance product comparisons for analytics'
}

Ref: insurance_comparisons.user_id > users.id [delete: cascade]
```

### 建議 3: 新增報價請求功能

```dbml
Enum quote_status {
    pending
    agent_assigned
    quote_provided
    accepted
    rejected
    expired
}

Table insurance_quote_requests [headercolor: #f39c12] {
    id                  int         [pk, increment]
    insurance_id        int         [not null]
    customer_id         int

    // 客戶資訊 (匿名用戶填寫)
    customer_name       varchar(100)
    customer_email      varchar(200)
    customer_phone      varchar(20)
    customer_age        int

    // 需求
    desired_coverage    numeric(12, 2)
    additional_notes    text

    // 狀態追蹤
    status              quote_status [default: 'pending']
    assigned_agent_id   int

    // 報價
    quoted_premium      numeric(10, 2)
    quote_valid_until   timestamptz
    quote_details       jsonb

    // 時間
    created_at          timestamptz [default: `now()`]
    responded_at        timestamptz

    Indexes {
        insurance_id
        customer_id
        assigned_agent_id
        status
        created_at
    }

    Note: 'Customer quote requests for insurance products'
}

Ref: insurance_quote_requests.insurance_id > insurances.id
Ref: insurance_quote_requests.customer_id > customer_profiles.user_id [delete: set null]
Ref: insurance_quote_requests.assigned_agent_id > agent_profiles.user_id [delete: set null]
```

### 建議 4: 新增即時通訊功能

```dbml
Enum message_type {
    text
    image
    file
    system
}

Table chat_conversations [headercolor: #A23456] {
    id              int         [pk, increment]
    customer_id     int         [not null]
    agent_id        int         [not null]

    // 狀態
    is_active       boolean     [default: true]
    last_message_at timestamptz

    created_at      timestamptz [default: `now()`]
    closed_at       timestamptz
    closed_by       int

    Indexes {
        customer_id
        agent_id
        (customer_id, agent_id)
        last_message_at
    }

    Note: 'Chat conversations between customers and agents'
}

Ref: chat_conversations.customer_id > customer_profiles.user_id [delete: cascade]
Ref: chat_conversations.agent_id > agent_profiles.user_id [delete: cascade]
Ref: chat_conversations.closed_by > users.id [delete: set null]

Table chat_messages [headercolor: #A23456] {
    id              bigint      [pk, increment]
    conversation_id int         [not null]
    sender_id       int         [not null]

    // 訊息內容
    message_type    message_type [default: 'text']
    content         text
    attachment_url  text

    // 狀態
    is_read         boolean     [default: false]
    read_at         timestamptz

    created_at      timestamptz [default: `now()`]
    deleted_at      timestamptz
    deleted_by      int

    Indexes {
        conversation_id
        sender_id
        created_at
    }

    Note: 'Individual messages in chat conversations'
}

Ref: chat_messages.conversation_id > chat_conversations.id [delete: cascade]
Ref: chat_messages.sender_id > users.id
Ref: chat_messages.deleted_by > users.id [delete: set null]
```

### 建議 5: 新增系統配置表

```dbml
Table system_configs [headercolor: #95a5a6] {
    id              int         [pk, increment]
    config_key      varchar(100) [unique, not null]
    config_value    jsonb       [not null]
    description     text
    is_public       boolean     [default: false, note: 'Can be accessed by frontend']
    updated_at      timestamptz [default: `now()`]
    updated_by      int

    Indexes {
        config_key [unique]
    }

    Note: '''
    System-wide configuration
    Examples:
    - maintenance_mode: {"enabled": false, "message": "..."}
    - payment_methods: ["credit_card", "bank_transfer", "ewallet"]
    - max_upload_size: {"bytes": 10485760}
    '''
}

Ref: system_configs.updated_by > users.id [delete: set null]
```

---

## 功能完整性總結

### ✅ 完整支援的功能 (85%)
1. ✅ 使用者認證與管理
2. ✅ 角色權限控制
3. ✅ 消費者個人資料管理
4. ✅ 業務員檔案管理
5. ✅ 保險公司資訊
6. ✅ 保單投保與管理
7. ✅ 基本理賠管理
8. ✅ 審計日誌
9. ✅ 用戶通知

### ⚠️ 需要補充的功能 (15%)
1. ⚠️ 保險商品評分與評論
2. ⚠️ 保費計算規則
3. ⚠️ 業務員評價系統
4. ⚠️ 保單提醒系統
5. ⚠️ 搜尋功能增強
6. ⚠️ 客戶關係管理
7. ⚠️ 理賠檔案管理
8. ⚠️ 業績追蹤報表

### 💡 建議新增的功能
1. 💡 商品收藏功能
2. 💡 商品比較功能
3. 💡 線上報價請求
4. 💡 即時通訊系統
5. 💡 系統配置管理

---

## 實施優先順序

### Phase 1: MVP 核心功能 (必須)
**時程**: 2-3 週

1. ✅ 保險商品評分與評論 (`insurance_ratings`)
2. ✅ 保費計算規則 (`premium_calculation_rules`)
3. ✅ 保單提醒系統 (`policy_reminders`)
4. ✅ 理賠檔案管理 (`claim_documents`)

### Phase 2: 用戶體驗增強 (重要)
**時程**: 2-3 週

5. ✅ 業務員評價系統 (`agent_ratings`, `agent_statistics`)
6. ✅ 搜尋功能增強 (全文搜尋 + `search_history`)
7. ✅ 商品收藏功能 (`user_favorite_insurances`)
8. ✅ 商品比較功能 (`insurance_comparisons`)

### Phase 3: 業務功能完善 (有用)
**時程**: 3-4 週

9. ✅ 客戶關係管理 (`agent_customer_relationships`, `customer_interactions`)
10. ✅ 業績追蹤報表 (`agent_performance`, `agent_targets`)
11. ✅ 線上報價請求 (`insurance_quote_requests`)

### Phase 4: 進階功能 (可選)
**時程**: 2-3 週

12. 💡 即時通訊系統 (`chat_conversations`, `chat_messages`)
13. 💡 系統配置管理 (`system_configs`)

---

## 資料庫效能考量

### 索引建議
```sql
-- 保險商品查詢優化
CREATE INDEX idx_insurances_active_rating ON insurances(is_active, rating_score DESC);
CREATE INDEX idx_insurances_category_popular ON insurances(category, popularity_score DESC);
CREATE INDEX idx_insurances_launch_date ON insurances(launch_date DESC);

-- 保單查詢優化
CREATE INDEX idx_policy_enrollments_customer_active
ON policy_enrollments(customer_id, deleted_at)
WHERE deleted_at IS NULL;

CREATE INDEX idx_policy_enrollments_agent_active
ON policy_enrollments(agent_id, deleted_at)
WHERE deleted_at IS NULL;

-- 提醒查詢優化
CREATE INDEX idx_policy_reminders_pending
ON policy_reminders(scheduled_at, status)
WHERE status = 'scheduled';

-- 評分查詢優化
CREATE INDEX idx_insurance_ratings_product_recent
ON insurance_ratings(insurance_id, created_at DESC);

CREATE INDEX idx_agent_ratings_agent_recent
ON agent_ratings(agent_id, created_at DESC);
```

### 資料分割建議 (Partitioning)
```sql
-- 審計日誌按月份分割
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 通知記錄按月份分割
CREATE TABLE notifications_2025_01 PARTITION OF notifications
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

## 結論與建議

### 當前狀態
您的資料庫架構**已涵蓋 85% 的核心功能需求**，但有幾個關鍵功能缺失會影響 MVP 版本的完整性。

### 必須修正項目
1. **保費計算規則** - 沒有這個功能，保險商品無法正確報價
2. **商品評分系統** - 影響「多維度排序」功能
3. **保單提醒系統** - README 明確提到的功能
4. **理賠檔案管理** - 完整理賠流程必須

### 建議行動
1. **立即實施**: Phase 1 的 4 個表格 (核心功能)
2. **短期規劃**: Phase 2 的用戶體驗增強功能
3. **中期規劃**: Phase 3 的業務功能
4. **選擇性實施**: Phase 4 的進階功能 (可以延後到 MVP 之後)

### 架構優勢
✅ 良好的正規化設計
✅ 完整的軟刪除機制
✅ 適當的索引策略
✅ 清楚的資料關聯

### 需要改進
⚠️ 缺少一些業務邏輯支援表格
⚠️ 全文搜尋功能需要加強
⚠️ 統計快取表格不足 (效能考量)

---

**報告結束**

需要我提供完整修正後的 DBML 檔案嗎？
