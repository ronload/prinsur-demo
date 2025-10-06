# 資料庫加密遷移指南

**專案名稱**: Prinsur MVP
**文件日期**: 2025-10-02
**加密標準**:

- 密碼: Argon2id
- 搜尋雜湊: HMAC-SHA256
- Session Token: SHA-256
- 敏感資料: AES-256-GCM

---

## 📋 執行摘要

根據加密標準，需要調整 **5 個表格**，共 **18 個欄位變更**：

| 表格                         | 變更類型             | 影響欄位數 | 優先級 |
| ---------------------------- | -------------------- | ---------- | ------ |
| `users`                      | 密碼 + 電話加密      | 6 個欄位   | 🔴 高  |
| `user_sessions`              | Token 雜湊           | 1 個欄位   | 🟡 中  |
| `customer_medical_histories` | 醫療資訊加密         | 6 個欄位   | 🔴 高  |
| `agent_profiles`             | 地址加密（可選）     | 4 個欄位   | 🟢 低  |
| `customer_profiles`          | 健康資訊加密（可選） | 8 個欄位   | 🟢 低  |

---

## 🔴 必須調整的表格

### 1. `users` 表格 - 密碼與電話加密

#### 📍 位置: Line 13-27

#### ❌ 當前結構

```dbml
Table users {
    id                   int          [pk, increment]
    email                varchar      [not null, unique]
    password_hash        varchar(60)  [not null]          // ❌ 太短，不支援 Argon2id
    password_attempts    int          [default: 0]
    locked_until         timestamptz
    last_password_change timestamptz
    name                 varchar      [not null]
    phone                varchar      [unique]             // ❌ 明文儲存
    role                 user_role    [not null, default: `user`]
    created_at           timestamptz  [not null, default: `now()`]
    updated_at           timestamptz  [not null, default: `now()`]
    deleted_at           timestamptz
    deleted_by           int
}
```

#### ✅ 調整後結構

```dbml
Table users [headercolor: #3498db] {
    id                   int          [pk, increment, note: 'GENERATED ALWAYS AS IDENTITY']
    email                varchar      [not null, unique]

    // 🔐 密碼 - Argon2id
    password_hash        varchar(255) [not null, note: 'Argon2id hash (~97 chars)']
    password_algorithm   varchar(20)  [not null, default: 'argon2id', note: 'Hash algorithm version']
    password_attempts    int          [default: 0]
    locked_until         timestamptz
    last_password_change timestamptz

    name                 varchar      [not null]

    // 🔐 電話號碼 - AES-256-GCM + HMAC-SHA256
    phone_encrypted      bytea        [note: 'AES-256-GCM encrypted phone number']
    phone_iv             bytea        [note: 'Initialization Vector (16 bytes)']
    phone_auth_tag       bytea        [note: 'Authentication Tag (16 bytes)']
    phone_key_id         varchar(50)  [note: 'Encryption key version ID']
    phone_hash           varchar(64)  [unique, note: 'HMAC-SHA256 for search/lookup']

    role                 user_role    [not null, default: `user`]
    created_at           timestamptz  [not null, default: `now()`]
    updated_at           timestamptz  [not null, default: `now()`]
    deleted_at           timestamptz
    deleted_by           int
}
```

#### 📝 變更清單

1. ✅ `password_hash`: `varchar(60)` → `varchar(255)`（支援 Argon2id）
2. ✅ 新增 `password_algorithm varchar(20)`（追蹤雜湊演算法版本）
3. ❌ 移除 `phone varchar`
4. ✅ 新增 `phone_encrypted bytea`（AES-256-GCM 密文）
5. ✅ 新增 `phone_iv bytea`（初始化向量）
6. ✅ 新增 `phone_auth_tag bytea`（認證標籤）
7. ✅ 新增 `phone_key_id varchar(50)`（金鑰版本）
8. ✅ 新增 `phone_hash varchar(64)`（HMAC-SHA256 搜尋雜湊）

#### ⚠️ 遷移注意事項

- 舊的 `phone` 欄位需要透過資料遷移腳本加密後轉移
- `phone_hash` 需要建立 UNIQUE INDEX
- `password_hash` 需要重新雜湊（無法從 bcrypt 轉換到 Argon2id，建議強制用戶重設密碼）

---

### 2. `user_sessions` 表格 - Session Token 雜湊

#### 📍 位置: Line 46-62

#### ❌ 當前結構

```dbml
Table user_sessions {
    id                 int         [pk, increment]
    user_id            int         [not null]
    session_token_hash varchar(64) [not null, unique]   // ✅ 已經是 SHA-256 長度
    expires_at         timestamptz [not null]
    ip_address         inet
    user_agent         text
    is_active          boolean     [default: true]
    created_at         timestamptz [default: `now()`]
    last_seen_at       timestamptz [default: `now()`]
    terminated_at      timestamptz
}
```

#### ✅ 調整後結構

```dbml
Table user_sessions [headercolor: #3498db] {
    id                 int         [pk, increment, note: 'GENERATED ALWAYS AS IDENTITY']
    user_id            int         [not null]

    // 🔐 Session Token - SHA-256
    session_token_hash varchar(64) [not null, unique, note: 'SHA-256 hash of session token']

    expires_at         timestamptz [not null]
    ip_address         inet
    user_agent         text
    is_active          boolean     [default: true]
    created_at         timestamptz [default: `now()`]
    last_seen_at       timestamptz [default: `now()`]
    terminated_at      timestamptz

    Indexes {
        expires_at
        (user_id, is_active)
    }
}
Ref: user_sessions.user_id > users.id [delete: cascade]
```

#### 📝 變更清單

1. ✅ `session_token_hash` 保持 `varchar(64)`（符合 SHA-256）
2. ✅ 新增註釋說明使用 SHA-256

#### ⚠️ 遷移注意事項

- 不需要資料遷移（已經符合標準）
- 確保應用層使用 SHA-256 而非其他雜湊演算法

---

### 3. `customer_medical_histories` 表格 - 醫療資訊加密 🔴 最重要

#### 📍 位置: Line 108-118

#### ❌ 當前結構

```dbml
Table customer_medical_histories {
    id              int  [pk, increment]
    user_id         int  [not null]
    medical_history text                              // ❌ 明文儲存
    Indexes {
        user_id
        medical_history                               // ❌ 不應該對敏感資料建立索引
        (user_id, medical_history) [unique]
    }
}
```

#### ✅ 調整後結構

```dbml
Table customer_medical_histories [headercolor: #3498db] {
    id              int  [pk, increment, note: 'GENERATED ALWAYS AS IDENTITY']
    user_id         int  [not null]

    // 🔐 醫療資訊 - AES-256-GCM
    medical_history_encrypted bytea       [note: 'AES-256-GCM encrypted medical history']
    medical_history_iv        bytea       [note: 'Initialization Vector']
    medical_history_auth_tag  bytea       [note: 'Authentication Tag']
    encryption_key_id         varchar(50) [not null, note: 'Encryption key version']

    // 🔍 可搜尋雜湊 - HMAC-SHA256
    condition_hash   varchar(64) [not null, note: 'HMAC-SHA256(user_id:condition) for search']

    created_at       timestamptz [default: `now()`]

    Indexes {
        user_id
        condition_hash                                // ✅ 用雜湊做索引，不暴露明文
        (user_id, condition_hash) [unique]
    }
}
Ref: customer_medical_histories.user_id > customer_profiles.user_id
```

#### 📝 變更清單

1. ❌ 移除 `medical_history text`
2. ✅ 新增 `medical_history_encrypted bytea`（AES-256-GCM 密文）
3. ✅ 新增 `medical_history_iv bytea`（初始化向量）
4. ✅ 新增 `medical_history_auth_tag bytea`（認證標籤）
5. ✅ 新增 `encryption_key_id varchar(50)`（金鑰版本）
6. ✅ 新增 `condition_hash varchar(64)`（HMAC-SHA256 搜尋雜湊）
7. ✅ 新增 `created_at timestamptz`（審計需求）
8. ❌ 移除 `medical_history` 索引
9. ✅ 新增 `condition_hash` 索引

#### ⚠️ 遷移注意事項

- **必須進行資料遷移**：所有現有醫療記錄需要加密
- `condition_hash` 計算方式：`HMAC-SHA256(user_id + ":" + medical_history)`
- 刪除舊的明文索引
- **法規要求**：符合 GDPR、個資法、醫療資訊保護法

---

## 🟢 可選調整的表格

### 4. `agent_profiles` 表格 - 地址加密（可選）

#### 📍 位置: Line 120-137

#### ❌ 當前結構

```dbml
Table agent_profiles {
    user_id            int         [pk]
    license_number     varchar     [unique, not null]
    company_id         int
    position           varchar
    address            varchar                          // ⚠️ 明文儲存
    bio                text
    created_at         timestamptz [default: `now()`]
    created_by         int         [not null]
    updated_at         timestamptz [default: `now()`]
    updated_by         int         [not null]
    deleted_at         timestamptz
    deleted_by         int
}
```

#### ✅ 調整後結構（如果要加密）

```dbml
Table agent_profiles [headercolor: #3498db] {
    user_id            int         [pk]
    license_number     varchar     [unique, not null]
    company_id         int
    position           varchar

    // 🔐 地址 - AES-256-GCM（可選）
    address_encrypted  bytea       [note: 'AES-256-GCM encrypted address']
    address_iv         bytea       [note: 'Initialization Vector']
    address_auth_tag   bytea       [note: 'Authentication Tag']
    address_key_id     varchar(50) [note: 'Encryption key version']

    bio                text
    created_at         timestamptz [default: `now()`]
    created_by         int         [not null]
    updated_at         timestamptz [default: `now()`]
    updated_by         int         [not null]
    deleted_at         timestamptz
    deleted_by         int

    Indexes {
        company_id
    }
}
Ref: agent_profiles.user_id - users.id [delete: cascade]
```

#### 📝 變更清單（如果加密）

1. ❌ 移除 `address varchar`
2. ✅ 新增 `address_encrypted bytea`
3. ✅ 新增 `address_iv bytea`
4. ✅ 新增 `address_auth_tag bytea`
5. ✅ 新增 `address_key_id varchar(50)`

#### 💡 建議

- **MVP 階段可以不加密**（地址用於地圖顯示、地區搜尋）
- 如果只儲存「縣市」level 資料，不需要加密
- 如果儲存完整門牌地址，建議加密

---

### 5. `customer_profiles` 表格 - 健康資訊加密（可選）

#### 📍 位置: Line 91-106

#### ❌ 當前結構

```dbml
Table customer_profiles {
    user_id          int           [pk]
    age              int
    gender           gender
    weight_kg        numeric(5, 2)                     // ⚠️ 健康資訊
    height_cm        numeric(5, 2)                     // ⚠️ 健康資訊
    location_city    varchar
    occupation_level varchar
    created_at       timestamptz   [default: `now()`]
    created_by       int           [not null]
    updated_at       timestamptz   [default: `now()`]
    updated_by       int           [not null]
    deleted_at       timestamptz
    deleted_by       int
}
```

#### ✅ 調整後結構（如果要加密）

```dbml
Table customer_profiles [headercolor: #3498db] {
    user_id          int           [pk]
    age              int
    gender           gender

    // 🔐 體重 - AES-256-GCM（可選）
    weight_encrypted bytea         [note: 'AES-256-GCM encrypted weight']
    weight_iv        bytea         [note: 'Initialization Vector']
    weight_auth_tag  bytea         [note: 'Authentication Tag']

    // 🔐 身高 - AES-256-GCM（可選）
    height_encrypted bytea         [note: 'AES-256-GCM encrypted height']
    height_iv        bytea         [note: 'Initialization Vector']
    height_auth_tag  bytea         [note: 'Authentication Tag']

    health_key_id    varchar(50)   [note: 'Shared encryption key version for health data']

    location_city    varchar
    occupation_level varchar
    created_at       timestamptz   [default: `now()`]
    created_by       int           [not null]
    updated_at       timestamptz   [default: `now()`]
    updated_by       int           [not null]
    deleted_at       timestamptz
    deleted_by       int
}
Ref: customer_profiles.user_id - users.id [delete: cascade]
```

#### 📝 變更清單（如果加密）

1. ❌ 移除 `weight_kg numeric(5, 2)`
2. ❌ 移除 `height_cm numeric(5, 2)`
3. ✅ 新增 `weight_encrypted bytea`
4. ✅ 新增 `weight_iv bytea`
5. ✅ 新增 `weight_auth_tag bytea`
6. ✅ 新增 `height_encrypted bytea`
7. ✅ 新增 `height_iv bytea`
8. ✅ 新增 `height_auth_tag bytea`
9. ✅ 新增 `health_key_id varchar(50)`（共用金鑰版本）

#### 💡 建議

- **MVP 階段可以不加密**（體重身高不是最高敏感等級）
- 如果要符合 HIPAA 或嚴格的醫療法規，建議加密
- 如果只用於 BMI 計算和統計，不需加密

---

## 🔧 其他需要修正的問題

### 6. `agent_recommendation_params` - 缺少主鍵

#### 📍 位置: Line 163-169

#### ❌ 當前結構

```dbml
Table agent_recommendation_params {
    user_id      int           [not null]              // ❌ 沒有標記為主鍵
    rating_score numeric(2, 1)
    rating_count int           [default: 0]
    view_count   int           [default: 0]
}
```

#### ✅ 調整後結構

```dbml
Table agent_recommendation_params {
    user_id      int           [pk, note: 'Primary key, one-to-one with agent_profiles']
    rating_score numeric(2, 1)
    rating_count int           [default: 0]
    view_count   int           [default: 0]
}
Ref: agent_recommendation_params.user_id > agent_profiles.user_id
```

---

### 7. `insurance_recommendation_params` - 缺少主鍵

#### 📍 位置: Line 313-320

#### ❌ 當前結構

```dbml
Table insurance_recommendation_params {
    insurance_id   int           [not null]            // ❌ 沒有標記為主鍵
    rating_score   numeric(2, 1) [not null, note: '1.0-5.0']
    rating_count   int           [default: 0]
    view_count     int           [default: 0]
    matching_count int           [default: 0]
}
```

#### ✅ 調整後結構

```dbml
Table insurance_recommendation_params [headercolor: #f39c12] {
    insurance_id   int           [pk, note: 'Primary key, one-to-one with insurances']
    rating_score   numeric(2, 1) [not null, note: '1.0-5.0']
    rating_count   int           [default: 0]
    view_count     int           [default: 0]
    matching_count int           [default: 0]
}
Ref: insurance_recommendation_params.insurance_id - insurances.id
```

---

### 8. `claims` - 欄位命名不一致

#### 📍 位置: Line 374-388

#### ❌ 當前結構

```dbml
Table claims {
    id                   int            [pk, increment]
    policy_enrollment_id int            [not null]
    status               claim_status
    message              text
    amount               numeric(12, 2)
    submit_date          timestamptz
    create_at            timestamptz     [default: `now()`]    // ❌ 應為 created_at
    create_by            int             [not null]            // ❌ 應為 created_by
    updated_at           timestamptz     [default: `now()`]
    updated_by           int             [not null]
    deleted_at           timestamptz
    deleted_by           int
}
```

#### ✅ 調整後結構

```dbml
Table claims [headercolor: #127859] {
    id                   int            [pk, increment, note: 'GENERATED ALWAYS AS IDENTITY']
    policy_enrollment_id int            [not null]
    status               claim_status
    message              text
    amount               numeric(12, 2)
    submit_date          timestamptz
    created_at           timestamptz    [default: `now()`]     // ✅ 修正拼寫
    created_by           int            [not null]             // ✅ 修正拼寫
    updated_at           timestamptz    [default: `now()`]
    updated_by           int            [not null]
    deleted_at           timestamptz
    deleted_by           int
}
Ref: claims.policy_enrollment_id - policy_enrollments.id
```

---

### 9. `policy_enrollments` - 外鍵 CASCADE 風險

#### 📍 位置: Line 340-342

#### ❌ 當前結構

```dbml
Ref: policy_enrollments.customer_id > customer_profiles.user_id [delete: cascade]
Ref: policy_enrollments.agent_id > agent_profiles.user_id [delete: cascade]
Ref: policy_enrollments.insurance_id > insurances.id [delete: cascade]
```

#### ✅ 調整後結構

```dbml
Ref: policy_enrollments.customer_id > customer_profiles.user_id [delete: restrict]
Ref: policy_enrollments.agent_id > agent_profiles.user_id [delete: restrict]
Ref: policy_enrollments.insurance_id > insurances.id [delete: restrict]
```

#### ⚠️ 原因

- 保單記錄依法需保留 7 年
- 使用 `restrict` 防止誤刪保單
- 客戶/業務員離職不應該刪除保單記錄

---

### 10. `agent_supported_languages` - 缺少唯一約束

#### 📍 位置: Line 178-183

#### ❌ 當前結構

```dbml
Table agent_supported_languages {
    id                 int      [pk, increment]
    user_id            int      [not null]
    supported_language language [not null]
    // ❌ 沒有唯一約束，可能重複新增同一語言
}
```

#### ✅ 調整後結構

```dbml
Table agent_supported_languages [headercolor: #3498db] {
    id                 int      [pk, increment, note: 'GENERATED ALWAYS AS IDENTITY']
    user_id            int      [not null]
    supported_language language [not null]
    Indexes {
        user_id
        (user_id, supported_language) [unique]    // ✅ 防止重複
    }
}
Ref: agent_supported_languages.user_id > agent_profiles.user_id
```

---

## 📊 優先級與實施順序

### Phase 1 - 立即實施（安全必須）🔴

1. ✅ `users.password_hash` 長度調整 (`varchar(60)` → `varchar(255)`)
2. ✅ `users` 電話號碼加密 (新增 5 個欄位)
3. ✅ `customer_medical_histories` 醫療資訊加密 (新增 5 個欄位)

### Phase 2 - 短期規劃（資料完整性）🟡

4. ✅ `agent_recommendation_params` 加主鍵
5. ✅ `insurance_recommendation_params` 加主鍵
6. ✅ `claims` 欄位命名修正
7. ✅ `policy_enrollments` 外鍵改為 `restrict`
8. ✅ `agent_supported_languages` 加唯一約束

### Phase 3 - 依需求決定（可選加密）🟢

9. ⚠️ `agent_profiles.address` 加密（視需求）
10. ⚠️ `customer_profiles` 體重身高加密（視需求）

---

## 🔑 金鑰管理

### 環境變數配置

```bash
# .env
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef  # 32 bytes (64 hex chars) for AES-256
ENCRYPTION_KEY_ID=key-2025-01
SEARCH_SALT=your-hmac-salt-here  # HMAC-SHA256 salt
```

### 金鑰產生

```bash
# 產生 AES-256 金鑰 (32 bytes)
openssl rand -hex 32

# 產生 HMAC salt
openssl rand -hex 32
```

---

## 📝 資料遷移腳本範例

### 遷移現有電話號碼

```typescript
import { cryptoService } from "@/lib/crypto/encryption-service";

async function migratePhoneNumbers() {
  // 1. 取得所有有電話號碼的使用者
  const users = await db.query(
    "SELECT id, phone FROM users WHERE phone IS NOT NULL",
  );

  for (const user of users.rows) {
    // 2. 加密電話號碼
    const encrypted = cryptoService.encryptSensitiveData(user.phone);
    const phoneHash = cryptoService.hashForSearch(user.phone);

    // 3. 更新資料庫
    await db.query(
      `
      UPDATE users
      SET
        phone_encrypted = $1,
        phone_iv = $2,
        phone_auth_tag = $3,
        phone_key_id = $4,
        phone_hash = $5
      WHERE id = $6
    `,
      [
        encrypted.ciphertext,
        encrypted.iv,
        encrypted.authTag,
        encrypted.keyId,
        phoneHash,
        user.id,
      ],
    );
  }

  // 4. 確認遷移完成後，移除舊欄位
  // await db.query('ALTER TABLE users DROP COLUMN phone');
}
```

### 遷移醫療資訊

```typescript
async function migrateMedicalHistories() {
  const records = await db.query(
    "SELECT id, user_id, medical_history FROM customer_medical_histories WHERE medical_history IS NOT NULL",
  );

  for (const record of records.rows) {
    // 1. 加密醫療資訊
    const encrypted = cryptoService.encryptSensitiveData(
      record.medical_history,
    );

    // 2. 產生搜尋雜湊
    const conditionHash = cryptoService.hashForSearch(
      `${record.user_id}:${record.medical_history}`,
    );

    // 3. 更新資料庫
    await db.query(
      `
      UPDATE customer_medical_histories
      SET
        medical_history_encrypted = $1,
        medical_history_iv = $2,
        medical_history_auth_tag = $3,
        encryption_key_id = $4,
        condition_hash = $5
      WHERE id = $6
    `,
      [
        encrypted.ciphertext,
        encrypted.iv,
        encrypted.authTag,
        encrypted.keyId,
        conditionHash,
        record.id,
      ],
    );
  }

  // 移除舊欄位和索引
  // await db.query('DROP INDEX IF EXISTS idx_customer_medical_histories_medical_history');
  // await db.query('ALTER TABLE customer_medical_histories DROP COLUMN medical_history');
}
```

---

## ✅ 檢查清單

### 資料庫調整

- [ ] `users` 表格調整（密碼 + 電話）
- [ ] `user_sessions` 註釋更新
- [ ] `customer_medical_histories` 表格調整
- [ ] `agent_recommendation_params` 加主鍵
- [ ] `insurance_recommendation_params` 加主鍵
- [ ] `claims` 欄位命名修正
- [ ] `policy_enrollments` 外鍵改為 restrict
- [ ] `agent_supported_languages` 加唯一約束

### 應用層實作

- [ ] 實作 `CryptoService` 類別
- [ ] 密碼雜湊改用 Argon2id
- [ ] Session token 雜湊改用 SHA-256
- [ ] 電話號碼加密/解密邏輯
- [ ] 醫療資訊加密/解密邏輯
- [ ] 搜尋雜湊改用 HMAC-SHA256

### 資料遷移

- [ ] 電話號碼加密遷移腳本
- [ ] 醫療資訊加密遷移腳本
- [ ] 驗證遷移結果
- [ ] 備份原始資料

### 安全配置

- [ ] 金鑰管理系統設定
- [ ] 環境變數配置
- [ ] 金鑰輪換機制

---

## 📚 參考文件

- [Argon2 規格](https://github.com/P-H-C/phc-winner-argon2)
- [AES-GCM 加密模式](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [HMAC-SHA256 規格](https://datatracker.ietf.org/doc/html/rfc2104)
- [PostgreSQL 加密函數](https://www.postgresql.org/docs/current/pgcrypto.html)
