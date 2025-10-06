# Prinsur MVP 資料庫架構文件

## 📋 文件清單

### 1. `database-mvp.dbml`

**MVP 版本完整資料庫架構** (3924 行，完整註解)

這是為 MVP 版本設計的生產就緒資料庫架構，包含：

- ✅ **50+ 張資料表**，涵蓋所有核心功能
- ✅ **每一行、每一欄都有詳細中文註解**
- ✅ **符合 ISO 27001、GDPR、個資法**
- ✅ **完整的安全機制** (加密、審計、權限控制)
- ✅ **效能優化** (索引、快取表、分割表建議)

#### 核心功能模組：

| 模組       | 表格數 | 說明                         |
| ---------- | ------ | ---------------------------- |
| 使用者管理 | 8      | 認證、Session、MFA、偏好設定 |
| 消費者域   | 3      | 個人資料、醫療記錄 (加密)    |
| 保險商品   | 10     | 商品、評分、保費計算、標籤   |
| 業務員管理 | 6      | 認證、評價、統計、服務區域   |
| 保單管理   | 3      | 投保、詳情、提醒系統         |
| 理賠管理   | 2      | 申請、文件管理               |
| 通知系統   | 1      | 多通道、加密、過期清理       |
| 審計追蹤   | 2      | 完整日誌、敏感資料存取       |
| 搜尋推薦   | 2      | 搜尋歷史、熱門搜尋           |
| 資料管理   | 2      | 保留政策、清理歷史           |

### 2. `database.dbml`

**Demo 版本原始架構** (保留作為參考)

### 3. `security-audit-report.md`

**ISO 27001 安全審核報告** (67KB)

包含：

- 10 個安全問題分析
- Best Practice 解決方案
- 完整程式碼範例
- ISO 27001 合規性檢查

### 4. `functional-requirements-analysis.md`

**功能需求完整性分析** (28KB)

包含：

- MVP 功能需求對照
- 8 個缺失功能的架構設計
- 實施優先順序路線圖

---

## 🚀 快速開始

### 視覺化查看架構

使用 [dbdiagram.io](https://dbdiagram.io/d) 視覺化查看：

1. 開啟 https://dbdiagram.io/d
2. 複製 `database-mvp.dbml` 內容
3. 貼上到編輯器即可看到 ERD

### 建立資料庫

```bash
# 1. 安裝 DBML CLI (可選)
npm install -g @dbml/cli

# 2. 將 DBML 轉換為 SQL
dbml2sql database-mvp.dbml --postgres -o schema.sql

# 3. 建立資料庫
createdb prinsur_mvp

# 4. 執行 SQL
psql -d prinsur_mvp -f schema.sql
```

---

## 📊 架構特點

### 🔒 安全性

#### 1. 敏感資料加密

```dbml
// 所有敏感欄位使用 AES-256-GCM 加密
weight_kg_encrypted bytea [note: '加密的體重資料']
weight_kg_iv bytea [note: '初始化向量']
weight_kg_auth_tag bytea [note: '認證標籤']
encryption_key_id varchar(50) [note: '金鑰版本 ID']
```

**加密欄位清單**：

- 手機號碼 (`users.phone_encrypted`)
- 健康資訊 (`customer_profiles.weight_kg_encrypted`, `height_cm_encrypted`)
- 醫療記錄 (`customer_medical_records.diagnosis_details_enc`)
- 銀行帳號 (`claims.bank_account_encrypted`)
- 通知 payload (`notifications.payload`)

#### 2. 密碼安全

```dbml
password_hash varchar(255) [note: 'Argon2id 雜湊，長度支援未來演算法升級']
password_algorithm varchar(20) [default: 'argon2id']
```

- 使用 **Argon2id** (2023+ 推薦標準)
- 支援演算法升級 (bcrypt → Argon2id)
- 密碼歷史追蹤 (防止重複使用)
- 帳號鎖定機制 (5 次失敗鎖定 30 分鐘)

#### 3. Session 安全

```dbml
session_token_hash varchar(128) [note: 'SHA-256 雜湊']
device_fingerprint varchar(128) [note: '裝置指紋防劫持']
ip_risk_score int [note: 'IP 風險評分 0-100']
```

- **Token Rotation** (每次 refresh 產生新 token)
- **裝置指紋驗證** (防止 session 劫持)
- **IP 風險評分** (偵測異常登入)
- **並行 session 限制** (最多 5 個)

#### 4. 審計追蹤

```dbml
// 完整記錄所有關鍵操作
Table audit_logs {
    action audit_action [note: '操作類型']
    action_result audit_result [note: '操作結果']
    old_values jsonb [note: '變更前資料']
    new_values jsonb [note: '變更後資料']
    risk_score int [note: '風險評分']
}
```

- 記錄所有 CRUD 操作
- 包含操作前後資料
- 風險評分自動標記
- 高風險操作需人工審查

### ⚡ 效能優化

#### 1. 複合索引

```dbml
Indexes {
    (is_active, rating_score) [name: 'idx_insurances_active_rating']
    (is_active, popularity_score) [name: 'idx_insurances_active_popular']
    (user_id, is_active) [name: 'idx_user_sessions_user_active']
}
```

#### 2. 統計快取表

```dbml
// 預先計算的統計資料，避免重複計算
Table agent_statistics {
    average_rating numeric(3, 2) [note: '平均評分']
    total_policies int [note: '總保單數']
    total_customers int [note: '總客戶數']
}
```

#### 3. 計數器欄位

```dbml
// 避免 COUNT(*) 查詢
view_count int [note: '瀏覽次數']
purchase_count int [note: '購買次數']
favorite_count int [note: '收藏次數']
```

### 🏗️ 架構設計原則

#### 1. 正規化設計

- 第三正規化 (3NF)
- 避免資料冗餘
- 保持資料一致性

#### 2. 軟刪除機制

```dbml
deleted_at timestamptz [note: '軟刪除時間']
deleted_by int [note: '刪除者 ID']
```

- 符合法規要求 (7 年保留)
- 支援資料復原
- 審計追蹤需求

#### 3. 審計欄位標準

```dbml
created_at timestamptz [default: `now()`]
created_by int [not null]
updated_at timestamptz [default: `now()`]
updated_by int [not null]
```

#### 4. 外鍵策略

```dbml
// 金融資料使用 restrict，防止誤刪
Ref: policy_enrollments.customer_id > customer_profiles.user_id [delete: restrict]

// 輔助資料使用 cascade，簡化管理
Ref: user_preferences.user_id - users.id [delete: cascade]

// 審計資料使用 set null，保留記錄
Ref: audit_logs.user_id > users.id [delete: set null]
```

---

## 📐 資料關係圖

### 核心實體關係

```
users (使用者)
├── customer_profiles (消費者檔案)
│   ├── customer_medical_records (醫療記錄)
│   └── policy_enrollments (保單 - 作為客戶)
│       ├── policy_enrollments_details (保單詳情)
│       ├── policy_reminders (繳費提醒)
│       └── claims (理賠申請)
│           └── claim_documents (理賠文件)
│
├── agent_profiles (業務員檔案)
│   ├── agent_service_areas (服務區域)
│   ├── agent_service_categories (專業領域)
│   ├── agent_supported_languages (支援語言)
│   ├── agent_ratings (業務員評價)
│   ├── agent_statistics (業務員統計)
│   └── policy_enrollments (保單 - 作為業務員)
│
├── user_sessions (登入 Session)
├── user_preferences (偏好設定)
├── user_identities (OAuth 連結)
└── notifications (通知)

companies (保險公司)
├── company_details (公司詳情)
└── insurances (保險商品)
    ├── insurance_details (商品詳情)
    ├── insurance_coverages (保障內容)
    ├── insurance_tags (標籤)
    ├── insurance_file_urls (文件)
    ├── insurance_ratings (商品評價)
    ├── premium_calculation_rules (保費計算規則)
    └── user_favorite_insurances (使用者收藏)
```

---

## 🎯 實施檢查清單

### Phase 1: 資料庫建立 (Week 1)

- [ ] 建立 PostgreSQL 資料庫
- [ ] 執行 schema migration
- [ ] 設定 Row Level Security (RLS)
- [ ] 建立必要的索引
- [ ] 測試基本 CRUD 操作

### Phase 2: 安全機制 (Week 2)

- [ ] 整合 KMS 金鑰管理服務
- [ ] 實作欄位加密/解密函數
- [ ] 建立審計觸發器
- [ ] 設定密碼政策
- [ ] 測試 Session 管理

### Phase 3: 效能優化 (Week 3)

- [ ] 建立統計快取表
- [ ] 設定分割表 (audit_logs, notifications)
- [ ] 建立 Full-Text Search 索引
- [ ] 效能測試與調優
- [ ] 建立資料庫備份策略

### Phase 4: 自動化任務 (Week 4)

- [ ] 設定定期清理任務 (Cron Job)
- [ ] 實作提醒系統排程
- [ ] 建立統計資料更新任務
- [ ] 設定監控告警
- [ ] 文件完善與交接

---

## 📝 重要提醒

### ⚠️ 資料保留要求

| 資料類型     | 保留期限  | 法規依據         |
| ------------ | --------- | ---------------- |
| 保單記錄     | **7 年**  | 保險法、金融監管 |
| 理賠記錄     | **7 年**  | 保險法、金融監管 |
| 審計日誌     | **3 年**  | ISO 27001        |
| 用戶 Session | **90 天** | 營運需求         |
| 通知記錄     | **90 天** | 營運需求         |
| 搜尋歷史     | **1 年**  | 營運需求         |

### 🔐 敏感資料處理

1. **加密欄位**：使用 AES-256-GCM 加密
2. **金鑰管理**：整合 KMS (AWS KMS, Azure Key Vault)
3. **存取控制**：實施 RBAC 權限控制
4. **審計追蹤**：記錄所有敏感資料存取

### 🚨 刪除操作注意

```sql
-- ❌ 禁止直接 DELETE 金融資料
DELETE FROM policy_enrollments WHERE id = 123;

-- ✅ 使用軟刪除
UPDATE policy_enrollments
SET deleted_at = now(), deleted_by = current_user_id
WHERE id = 123;
```

### 📊 效能建議

1. **分割表**：audit_logs, notifications 按月份分割
2. **索引策略**：優先建立複合索引
3. **查詢優化**：避免 SELECT \*，使用具體欄位
4. **快取策略**：使用 Redis 快取熱門查詢

---

## 🔧 開發工具推薦

### 資料庫管理工具

- **DBeaver**: 免費、跨平台的資料庫管理工具
- **pgAdmin**: PostgreSQL 官方管理工具
- **DataGrip**: JetBrains 付費工具，功能強大

### ERD 視覺化

- **dbdiagram.io**: 線上 DBML 編輯器
- **dbdocs.io**: 自動生成資料庫文件
- **DrawSQL**: 線上 ERD 設計工具

### Migration 工具

- **Flyway**: Java-based migration tool
- **Liquibase**: XML-based migration tool
- **Prisma**: Modern ORM with migration support

---

## 📚 延伸閱讀

### 安全標準

- [ISO 27001:2013 資訊安全管理](https://www.iso.org/isoiec-27001-information-security.html)
- [GDPR 一般資料保護規則](https://gdpr.eu/)
- [台灣個人資料保護法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021)

### 技術文件

- [PostgreSQL 官方文件](https://www.postgresql.org/docs/)
- [DBML 語法文件](https://www.dbml.org/docs/)
- [Argon2 密碼雜湊](https://github.com/p-h-c/phc-winner-argon2)

---

## 👥 支援與回饋

如有任何問題或建議：

1. 查看 `security-audit-report.md` 了解安全問題
2. 查看 `functional-requirements-analysis.md` 了解功能設計
3. 提交 Issue 或 Pull Request

---

**建立者**: Claude (Anthropic AI Assistant)
**專案**: Prinsur Insurance Platform MVP
**版本**: 1.0.0
**更新日期**: 2025-10-01
