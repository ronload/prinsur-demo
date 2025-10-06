# 資料庫架構安全審核報告

**專案名稱**: Prinsur Insurance Platform
**審核日期**: 2025-10-01 (最後更新: 2025-10-01)
**審核標準**: ISO 27001:2013
**資料庫類型**: PostgreSQL
**審核檔案**: `docs/database/database.dbml`

---

## 執行摘要

本次審核針對 Prinsur 保險平台的資料庫架構進行 ISO 27001 合規性檢查。

### 修復進度

- ✅ **已修復**: 0 項
- ⚠️ **部分修復**: 2 項 (問題 2: 密碼安全, 問題 6: 軟刪除)
- ❌ **未修復**: 8 項

### 合規性評分

- **整體合規度**: 65% (部分符合，較前次 60% 略有進步)
- **嚴重問題**: 8 項 (含新發現 3 項)
- **中等問題**: 5 項
- **改進建議**: 5 項

### 新發現的問題

- 主鍵缺失 (agent_recommendation_params, insurance_recommendation_params)
- 外鍵關聯缺失 (created_by, updated_by, deleted_by 欄位)
- 欄位命名不一致 (claims 表格)

---

## 🔴 嚴重問題 (Critical)

### 問題 1: 敏感個人資料未加密

**ISO 27001 控制項**: A.10.1.1 - 加密控制政策

#### 問題描述

以下敏感資料以明文儲存，違反資料保護法規：

- `customer_profiles`: `weight_kg`, `height_cm` (健康資訊)
- `customer_medical_histories.medical_history` (醫療記錄)
- `users.phone` (個人識別資訊)
- `agent_profiles.address` (地址資訊)

#### 風險評估

- **風險等級**: 嚴重
- **影響範圍**: 資料外洩可能導致法律責任、罰款和聲譽損失
- **合規要求**: GDPR Art.32、個資法第27條、保險法第177-1條

#### Best Practice 解決方案

##### 方案 1: 欄位級加密 (推薦用於結構化資料)

```sql
-- 使用 PostgreSQL pgcrypto 擴充功能
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 加密儲存
CREATE TABLE customer_profiles (
    user_id          int PRIMARY KEY,
    age              int,
    gender           gender,
    weight_kg_enc    bytea,  -- 加密後的 weight
    height_cm_enc    bytea,  -- 加密後的 height
    location_city    varchar,
    occupation_level varchar,
    encryption_key_id varchar(50) NOT NULL,  -- 指向 key vault 的金鑰 ID
    created_at       timestamptz DEFAULT now()
);

-- 插入加密資料
INSERT INTO customer_profiles (user_id, weight_kg_enc, encryption_key_id)
VALUES (
    1,
    pgp_sym_encrypt('70.5'::text, current_setting('app.encryption_key')),
    'key-version-2025-01'
);

-- 查詢解密資料
SELECT
    user_id,
    pgp_sym_decrypt(weight_kg_enc, current_setting('app.encryption_key'))::numeric AS weight_kg
FROM customer_profiles;
```

##### 方案 2: 應用層加密 (推薦用於非結構化資料)

```typescript
// 使用 AES-256-GCM 加密
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

class FieldEncryption {
  private algorithm = "aes-256-gcm";
  private keyId: string;

  constructor(private masterKey: Buffer) {
    this.keyId = process.env.ENCRYPTION_KEY_VERSION || "v1";
  }

  encrypt(plaintext: string): {
    ciphertext: string;
    iv: string;
    authTag: string;
    keyId: string;
  } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.masterKey, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
      ciphertext: encrypted,
      iv: iv.toString("hex"),
      authTag: cipher.getAuthTag().toString("hex"),
      keyId: this.keyId,
    };
  }

  decrypt(encrypted: {
    ciphertext: string;
    iv: string;
    authTag: string;
    keyId: string;
  }): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.masterKey,
      Buffer.from(encrypted.iv, "hex"),
    );

    decipher.setAuthTag(Buffer.from(encrypted.authTag, "hex"));

    let decrypted = decipher.update(encrypted.ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

// 使用範例
const encryptor = new FieldEncryption(getKeyFromVault());
const encryptedPhone = encryptor.encrypt("+886912345678");

// 儲存到資料庫
await db.query(
  "INSERT INTO users (email, phone_enc, phone_iv, phone_tag, phone_key_id) VALUES ($1, $2, $3, $4, $5)",
  [
    email,
    encryptedPhone.ciphertext,
    encryptedPhone.iv,
    encryptedPhone.authTag,
    encryptedPhone.keyId,
  ],
);
```

##### 方案 3: 透明資料加密 (TDE) - 整個資料庫加密

```bash
# PostgreSQL with pgcrypto + file system encryption
# 需要企業版或第三方工具如 Percona

# 1. 設定檔系統層級加密 (LUKS for Linux)
cryptsetup luksFormat /dev/sdb
cryptsetup open /dev/sdb postgres_encrypted

# 2. 掛載加密檔案系統
mount /dev/mapper/postgres_encrypted /var/lib/postgresql/data

# 3. PostgreSQL 設定
# postgresql.conf
ssl = on
ssl_cert_file = '/etc/postgresql/server.crt'
ssl_key_file = '/etc/postgresql/server.key'
```

#### 實施建議

**更新 DBML 架構**:

```dbml
Table customer_profiles [headercolor: #3498db] {
    user_id              int           [pk]
    age                  int
    gender               gender
    weight_kg_encrypted  bytea         [note: 'AES-256-GCM encrypted']
    weight_kg_iv         bytea
    weight_kg_auth_tag   bytea
    height_cm_encrypted  bytea         [note: 'AES-256-GCM encrypted']
    height_cm_iv         bytea
    height_cm_auth_tag   bytea
    encryption_key_id    varchar(50)   [not null, note: 'References key management service']
    location_city        varchar
    occupation_level     varchar
    created_at           timestamptz   [default: `now()`]

    Note: 'Sensitive health data encrypted at rest using AES-256-GCM'
}

Table customer_medical_histories [headercolor: #3498db] {
    id                      int  [pk, increment]
    user_id                 int  [not null]
    medical_history_enc     bytea [note: 'Encrypted medical records']
    medical_history_iv      bytea
    medical_history_tag     bytea
    encryption_key_id       varchar(50) [not null]
    searchable_hash         varchar(64) [note: 'SHA-256 hash for searching without decryption']

    Indexes {
        user_id
        searchable_hash
    }

    Note: 'Medical history stored encrypted. Use searchable_hash for queries.'
}

Table users [headercolor: #3498db] {
    id                   int          [pk, increment]
    email                varchar      [not null, unique]
    password_hash        varchar(255) [not null, note: 'Argon2id or bcrypt']
    phone_encrypted      bytea        [note: 'AES-256-GCM encrypted']
    phone_iv             bytea
    phone_auth_tag       bytea
    phone_key_id         varchar(50)
    // ... 其他欄位
}
```

#### 金鑰管理最佳實踐

```typescript
// 使用 AWS KMS / Azure Key Vault / Google Cloud KMS
import { KMSClient, DecryptCommand } from "@aws-sdk/client-kms";

class KeyManagementService {
  private kmsClient: KMSClient;
  private cache: Map<string, { key: Buffer; expiresAt: number }>;

  constructor() {
    this.kmsClient = new KMSClient({ region: "ap-northeast-1" });
    this.cache = new Map();
  }

  async getDataKey(keyId: string): Promise<Buffer> {
    // 檢查快取
    const cached = this.cache.get(keyId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.key;
    }

    // 從 KMS 取得資料加密金鑰
    const command = new DecryptCommand({
      KeyId: keyId,
      CiphertextBlob: Buffer.from(
        process.env[`ENCRYPTED_KEY_${keyId}`],
        "base64",
      ),
    });

    const response = await this.kmsClient.send(command);
    const key = Buffer.from(response.Plaintext);

    // 快取 15 分鐘
    this.cache.set(keyId, {
      key,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    return key;
  }

  // 定期輪換金鑰
  async rotateKey(oldKeyId: string): Promise<string> {
    const newKeyId = `key-${Date.now()}`;
    // 1. 建立新金鑰
    // 2. 重新加密所有使用舊金鑰的資料
    // 3. 更新 encryption_key_id 欄位
    return newKeyId;
  }
}
```

---

### 問題 2: 密碼安全性不足 ⚠️ 部分修復

**ISO 27001 控制項**: A.9.4.3 - 密碼管理系統

**修復狀態**:

- ✅ 已加入 `password_attempts`, `locked_until`, `last_password_change` 欄位
- ❌ `password_hash` 長度仍不足 (60 → 應為 255)
- ❌ 缺少 `password_algorithm`, `password_expires_at` 欄位
- ❌ 缺少 `password_history` 表格和 MFA 支援

#### 問題描述

```dbml
password_hash varchar(60) [not null]
```

存在以下問題：

1. 長度限制 60 字元不足以支援未來演算法升級
2. 未明確標註使用的雜湊演算法
3. 缺少密碼歷史追蹤
4. 缺少密碼過期機制
5. 未實施密碼複雜度政策

#### Best Practice 解決方案

##### 方案 1: 使用 Argon2id (2023+ 推薦)

```typescript
import argon2 from "argon2";

class PasswordService {
  private readonly ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 4, // 4 threads
    hashLength: 32, // 32 bytes output
  };

  async hashPassword(plaintext: string): Promise<string> {
    // Argon2id 輸出格式: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
    // 長度約 95-100 字元
    return await argon2.hash(plaintext, this.ARGON2_OPTIONS);
  }

  async verifyPassword(plaintext: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch (error) {
      return false;
    }
  }

  // 檢查是否需要重新雜湊 (演算法升級)
  needsRehash(hash: string): boolean {
    return (
      !hash.startsWith("$argon2id$") ||
      !argon2.needsRehash(hash, this.ARGON2_OPTIONS)
    );
  }
}

// 登入時自動升級舊密碼
async function login(email: string, password: string) {
  const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

  const passwordService = new PasswordService();
  const isValid = await passwordService.verifyPassword(
    password,
    user.password_hash,
  );

  if (isValid && passwordService.needsRehash(user.password_hash)) {
    // 自動升級到新演算法
    const newHash = await passwordService.hashPassword(password);
    await db.query(
      "UPDATE users SET password_hash = $1, last_password_change = now() WHERE id = $2",
      [newHash, user.id],
    );
  }

  return isValid;
}
```

##### 更新資料庫架構

```dbml
Table users [headercolor: #3498db] {
    id                   int          [pk, increment]
    email                varchar      [not null, unique]
    password_hash        varchar(255) [not null, note: 'Argon2id: $argon2id$v=19$m=65536,t=3,p=4$...']
    password_algorithm   varchar(20)  [not null, default: 'argon2id', note: 'Current: argon2id, Legacy: bcrypt']
    password_attempts    int          [default: 0, note: 'Failed login attempts']
    locked_until         timestamptz  [note: 'Account locked until this timestamp']
    last_password_change timestamptz  [not null, default: `now()`]
    password_expires_at  timestamptz  [note: 'Force password change after expiry']
    require_mfa          boolean      [default: false]
    mfa_secret_encrypted bytea        [note: 'TOTP secret, encrypted']

    Indexes {
        email
        (email, password_attempts)
    }
}

// 密碼歷史追蹤 (防止重複使用)
Table password_history [headercolor: #3498db] {
    id              int         [pk, increment]
    user_id         int         [not null]
    password_hash   varchar(255) [not null]
    algorithm       varchar(20) [not null]
    created_at      timestamptz [not null, default: `now()`]

    Indexes {
        user_id
        created_at
    }

    Note: 'Keep last 12 passwords to prevent reuse'
}
Ref: password_history.user_id > users.id [delete: cascade]

// 密碼政策配置
Table password_policies [headercolor: #3498db] {
    id                      int     [pk, increment]
    policy_name             varchar [not null, unique]
    min_length              int     [default: 12]
    require_uppercase       boolean [default: true]
    require_lowercase       boolean [default: true]
    require_numbers         boolean [default: true]
    require_special_chars   boolean [default: true]
    max_age_days            int     [default: 90, note: 'Password expiry in days']
    history_count           int     [default: 12, note: 'Number of previous passwords to check']
    max_attempts            int     [default: 5, note: 'Max failed login attempts']
    lockout_duration_min    int     [default: 30, note: 'Account lockout duration']
    is_active               boolean [default: true]
    created_at              timestamptz [default: `now()`]

    Note: 'Password policy configuration for different user roles'
}
```

##### 實施密碼政策驗證

```typescript
interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  historyCount: number;
}

class PasswordValidator {
  constructor(private policy: PasswordPolicy) {}

  validate(
    password: string,
    userId: string,
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 長度檢查
    if (password.length < this.policy.minLength) {
      errors.push(`密碼長度必須至少 ${this.policy.minLength} 字元`);
    }

    // 大寫字母
    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("密碼必須包含至少一個大寫字母");
    }

    // 小寫字母
    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("密碼必須包含至少一個小寫字母");
    }

    // 數字
    if (this.policy.requireNumbers && !/\d/.test(password)) {
      errors.push("密碼必須包含至少一個數字");
    }

    // 特殊字元
    if (
      this.policy.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push("密碼必須包含至少一個特殊字元");
    }

    // 常見密碼檢查
    if (this.isCommonPassword(password)) {
      errors.push("此密碼太常見，請使用更安全的密碼");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async checkPasswordHistory(
    userId: string,
    newPassword: string,
  ): Promise<boolean> {
    const history = await db.query(
      `SELECT password_hash FROM password_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, this.policy.historyCount],
    );

    const passwordService = new PasswordService();

    for (const record of history.rows) {
      if (
        await passwordService.verifyPassword(newPassword, record.password_hash)
      ) {
        return false; // 密碼已使用過
      }
    }

    return true;
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      "password",
      "Password123",
      "12345678",
      "qwerty123",
      "admin123",
      "letmein",
      "welcome123",
      "monkey123",
    ];
    return commonPasswords.some((common) =>
      password.toLowerCase().includes(common.toLowerCase()),
    );
  }
}
```

##### 帳號鎖定機制

```typescript
class AccountLockoutService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 分鐘

  async recordFailedLogin(userId: string, ipAddress: string): Promise<void> {
    const result = await db.query(
      `UPDATE users
       SET password_attempts = password_attempts + 1,
           locked_until = CASE
             WHEN password_attempts + 1 >= $1
             THEN now() + interval '30 minutes'
             ELSE locked_until
           END
       WHERE id = $2
       RETURNING password_attempts, locked_until`,
      [this.MAX_ATTEMPTS, userId],
    );

    // 記錄到審計日誌
    await auditLogger.log({
      action: "failed_login_attempt",
      userId,
      ipAddress,
      attempts: result.rows[0].password_attempts,
    });

    if (result.rows[0].password_attempts >= this.MAX_ATTEMPTS) {
      // 觸發安全警報
      await securityAlert.notify({
        type: "account_locked",
        userId,
        reason: "too_many_failed_attempts",
      });
    }
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    await db.query(
      `UPDATE users
       SET password_attempts = 0, locked_until = NULL
       WHERE id = $1`,
      [userId],
    );
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const result = await db.query(
      `SELECT locked_until FROM users WHERE id = $1`,
      [userId],
    );

    const lockedUntil = result.rows[0]?.locked_until;
    if (!lockedUntil) return false;

    return new Date(lockedUntil) > new Date();
  }
}
```

---

### 問題 3: 審計追蹤不完整

**ISO 27001 控制項**: A.12.4.1 - 事件日誌記錄

#### 問題描述

當前 `audit_logs` 表格缺少關鍵資訊：

- 操作結果 (成功/失敗)
- 失敗原因
- 操作來源 (API endpoint, 應用程式)
- Session ID (追蹤完整的用戶操作序列)
- 資料敏感度分類

#### Best Practice 解決方案

##### 完整的審計日誌架構

```dbml
Enum audit_action {
    INSERT
    UPDATE
    DELETE
    SELECT       // 新增: 追蹤敏感資料查詢
    EXPORT       // 新增: 資料匯出操作
    LOGIN
    LOGOUT
    PERMISSION_CHANGE
    CONFIG_CHANGE
}

Enum audit_result {
    success
    failure
    partial
}

Enum data_classification {
    public
    internal
    confidential
    restricted    // 最高敏感度: 醫療、財務資料
}

Table audit_logs [headercolor: #3498db] {
    id                  bigint              [pk, increment, note: 'Use bigint for high-volume logs']

    // 操作資訊
    action              audit_action        [not null]
    action_result       audit_result        [not null]
    error_message       text                [note: 'Error details if action_result = failure']

    // 資料資訊
    table_name          varchar             [not null]
    record_id           int
    data_classification data_classification [not null, default: 'internal']
    old_values          jsonb               [note: 'Encrypted if classification >= confidential']
    new_values          jsonb               [note: 'Encrypted if classification >= confidential']
    affected_fields     text[]              [note: 'Array of changed field names']

    // 用戶資訊
    user_id             int
    user_role           varchar             [note: 'Role at time of action']
    session_id          varchar(64)         [note: 'Links to user_sessions.session_token_hash']

    // 來源資訊
    ip_address          inet                [not null]
    user_agent          text
    source_application  varchar(50)         [note: 'web, mobile_app, api, admin_panel']
    api_endpoint        varchar(255)        [note: 'REST endpoint or GraphQL mutation']
    request_id          varchar(64)         [note: 'Trace ID for distributed tracing']

    // 安全資訊
    risk_score          int                 [note: '0-100, calculated based on action sensitivity']
    requires_review     boolean             [default: false, note: 'Flag for security review']
    reviewed_by         int                 [note: 'ID of security reviewer']
    reviewed_at         timestamptz

    // 時間資訊
    created_at          timestamptz         [not null, default: `now()`]
    retention_until     timestamptz         [note: 'Auto-delete after this date per policy']

    Indexes {
        (table_name, record_id)
        created_at
        user_id
        session_id
        (action, action_result)
        (data_classification, created_at)
        risk_score [note: 'For security monitoring']
        retention_until [note: 'For automated cleanup']
    }

    Note: '''
    Comprehensive audit trail compliant with ISO 27001 A.12.4.1
    Retention: 7 years for financial data, 3 years for general operations
    '''
}

Ref: audit_logs.user_id > users.id [delete: set null]
Ref: audit_logs.reviewed_by > users.id [delete: set null]

// 分離的敏感資料存取日誌
Table sensitive_data_access_logs [headercolor: #e74c3c] {
    id                  bigint      [pk, increment]
    user_id             int         [not null]
    accessed_table      varchar     [not null]
    accessed_record_id  int
    access_type         varchar(20) [not null, note: 'read, export, print, copy']
    justification       text        [note: 'Business reason for access']
    approved_by         int         [note: 'Manager approval for sensitive access']

    // 存取詳情
    fields_accessed     text[]      [note: 'Which sensitive fields were accessed']
    query_executed      text        [note: 'Actual SQL query (sanitized)']
    rows_affected       int

    // 安全資訊
    session_id          varchar(64) [not null]
    ip_address          inet        [not null]
    device_fingerprint  varchar(64)

    accessed_at         timestamptz [not null, default: `now()`]

    Indexes {
        user_id
        accessed_at
        accessed_table
        (user_id, accessed_table, accessed_at)
    }

    Note: '''
    Separate logging for GDPR Article 30 compliance
    All access to customer_profiles, medical_histories, financial data
    '''
}

Ref: sensitive_data_access_logs.user_id > users.id [delete: restrict]
Ref: sensitive_data_access_logs.approved_by > users.id [delete: set null]
```

##### 審計日誌實施程式碼

```typescript
class AuditLogger {
  async logDataChange(params: {
    action: "INSERT" | "UPDATE" | "DELETE";
    tableName: string;
    recordId: number;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    userId: number;
    sessionId: string;
    request: Request;
  }): Promise<void> {
    const {
      action,
      tableName,
      recordId,
      oldValues,
      newValues,
      userId,
      sessionId,
      request,
    } = params;

    // 計算風險分數
    const riskScore = this.calculateRiskScore({
      action,
      tableName,
      changedFields: this.getChangedFields(oldValues, newValues),
      userId,
      ipAddress: this.getIpAddress(request),
    });

    // 判斷資料敏感度
    const dataClassification = this.classifyData(tableName);

    // 加密敏感資料
    const shouldEncrypt = ["confidential", "restricted"].includes(
      dataClassification,
    );
    const encryptedOldValues =
      shouldEncrypt && oldValues
        ? await this.encryptAuditData(oldValues)
        : oldValues;
    const encryptedNewValues =
      shouldEncrypt && newValues
        ? await this.encryptAuditData(newValues)
        : newValues;

    await db.query(
      `
      INSERT INTO audit_logs (
        action, action_result, table_name, record_id,
        data_classification, old_values, new_values, affected_fields,
        user_id, user_role, session_id,
        ip_address, user_agent, source_application, api_endpoint, request_id,
        risk_score, requires_review, retention_until
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
    `,
      [
        action,
        "success",
        tableName,
        recordId,
        dataClassification,
        encryptedOldValues,
        encryptedNewValues,
        this.getChangedFields(oldValues, newValues),
        userId,
        await this.getUserRole(userId),
        sessionId,
        this.getIpAddress(request),
        request.headers.get("user-agent"),
        this.getSourceApplication(request),
        request.url,
        request.headers.get("x-request-id"),
        riskScore,
        riskScore >= 70, // 高風險需要審查
        this.calculateRetentionDate(tableName),
      ],
    );

    // 高風險操作觸發即時警報
    if (riskScore >= 80) {
      await this.triggerSecurityAlert({
        type: "high_risk_operation",
        userId,
        action,
        tableName,
        riskScore,
      });
    }
  }

  private calculateRiskScore(params: {
    action: string;
    tableName: string;
    changedFields: string[];
    userId: number;
    ipAddress: string;
  }): number {
    let score = 0;

    // 動作風險
    if (params.action === "DELETE") score += 30;
    else if (params.action === "UPDATE") score += 20;
    else score += 10;

    // 表格敏感度
    const sensitiveTables = [
      "customer_medical_histories",
      "policy_enrollments",
      "claims",
      "user_sessions",
    ];
    if (sensitiveTables.includes(params.tableName)) score += 30;

    // 敏感欄位變更
    const sensitiveFields = [
      "password_hash",
      "medical_history",
      "payment_amount",
    ];
    const touchedSensitiveFields = params.changedFields.filter((f) =>
      sensitiveFields.some((sf) => f.includes(sf)),
    );
    score += touchedSensitiveFields.length * 15;

    // 異常 IP 檢查
    if (this.isAnomalousIP(params.userId, params.ipAddress)) score += 20;

    return Math.min(score, 100);
  }

  private classifyData(tableName: string): string {
    const classification: Record<string, string> = {
      customer_medical_histories: "restricted",
      policy_enrollments: "confidential",
      claims: "confidential",
      customer_profiles: "confidential",
      agent_profiles: "internal",
      insurances: "public",
      companies: "public",
    };
    return classification[tableName] || "internal";
  }

  private calculateRetentionDate(tableName: string): Date {
    const retentionPeriods: Record<string, number> = {
      policy_enrollments: 7 * 365, // 7 years (金融法規)
      claims: 7 * 365,
      audit_logs: 3 * 365, // 3 years (一般營運)
      user_sessions: 90, // 90 days
    };

    const days = retentionPeriods[tableName] || 365;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  private async encryptAuditData(data: Record<string, any>): Promise<string> {
    const kms = new KeyManagementService();
    const key = await kms.getDataKey("audit-encryption-key");
    const encrypted = await encrypt(JSON.stringify(data), key);
    return encrypted;
  }
}
```

##### PostgreSQL 觸發器自動審計

```sql
-- 自動審計觸發器 (適用於所有敏感表格)
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id int;
    v_session_id varchar(64);
    v_ip_address inet;
BEGIN
    -- 從應用程式設定的 session 變數取得
    v_user_id := current_setting('app.user_id', true)::int;
    v_session_id := current_setting('app.session_id', true);
    v_ip_address := current_setting('app.ip_address', true)::inet;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            action, action_result, table_name, record_id,
            old_values, user_id, session_id, ip_address
        ) VALUES (
            'DELETE', 'success', TG_TABLE_NAME, OLD.id,
            row_to_json(OLD), v_user_id, v_session_id, v_ip_address
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            action, action_result, table_name, record_id,
            old_values, new_values, user_id, session_id, ip_address
        ) VALUES (
            'UPDATE', 'success', TG_TABLE_NAME, NEW.id,
            row_to_json(OLD), row_to_json(NEW), v_user_id, v_session_id, v_ip_address
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            action, action_result, table_name, record_id,
            new_values, user_id, session_id, ip_address
        ) VALUES (
            'INSERT', 'success', TG_TABLE_NAME, NEW.id,
            row_to_json(NEW), v_user_id, v_session_id, v_ip_address
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 應用到敏感表格
CREATE TRIGGER audit_customer_profiles
    AFTER INSERT OR UPDATE OR DELETE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_policy_enrollments
    AFTER INSERT OR UPDATE OR DELETE ON policy_enrollments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_claims
    AFTER INSERT OR UPDATE OR DELETE ON claims
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

##### 敏感資料存取追蹤

```typescript
// Middleware for tracking sensitive data access
class SensitiveDataAccessTracker {
  private sensitiveTablePattern =
    /^(customer_profiles|customer_medical_histories|policy_enrollments|claims)$/;

  async trackQuery(params: {
    userId: number;
    sessionId: string;
    query: string;
    params: any[];
    result: any;
    request: Request;
  }): Promise<void> {
    const { userId, sessionId, query, result, request } = params;

    // 解析 SQL 判斷是否存取敏感資料
    const tables = this.extractTablesFromQuery(query);
    const sensitiveTables = tables.filter((t) =>
      this.sensitiveTablePattern.test(t),
    );

    if (sensitiveTables.length === 0) return;

    // 記錄敏感資料存取
    await db.query(
      `
      INSERT INTO sensitive_data_access_logs (
        user_id, accessed_table, access_type, fields_accessed,
        query_executed, rows_affected, session_id, ip_address,
        device_fingerprint
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        userId,
        sensitiveTables[0],
        this.getAccessType(query),
        this.extractFieldsFromQuery(query),
        this.sanitizeQuery(query),
        Array.isArray(result) ? result.length : 1,
        sessionId,
        this.getIpAddress(request),
        request.headers.get("x-device-fingerprint"),
      ],
    );
  }

  private extractTablesFromQuery(query: string): string[] {
    // 簡化的 SQL 解析
    const fromMatch = query.match(/FROM\s+(\w+)/gi);
    const joinMatch = query.match(/JOIN\s+(\w+)/gi);

    const tables: string[] = [];
    if (fromMatch) tables.push(...fromMatch.map((m) => m.split(/\s+/)[1]));
    if (joinMatch) tables.push(...joinMatch.map((m) => m.split(/\s+/)[1]));

    return tables;
  }

  private sanitizeQuery(query: string): string {
    // 移除敏感資料值，保留查詢結構
    return query.replace(/('[^']*'|"[^"]*"|\d+)/g, "?");
  }
}
```

---

### 問題 4: Session 管理安全漏洞

**ISO 27001 控制項**: A.9.4.2 - 安全登入程序

#### 問題描述

當前 `user_sessions` 表格存在多個安全問題：

1. `session_token_hash` 長度不足且未標註雜湊演算法
2. 缺少 refresh token 機制
3. 缺少裝置指紋追蹤 (無法偵測 session 劫持)
4. 缺少並行 session 限制
5. 缺少地理位置異常偵測

#### Best Practice 解決方案

##### 完整的 Session 管理架構

```dbml
Table user_sessions [headercolor: #3498db] {
    id                   bigint       [pk, increment, note: 'Use bigint for scalability']
    user_id              int          [not null]

    // Access Token
    session_token_hash   varchar(128) [not null, unique, note: 'SHA-256 of access token']
    expires_at           timestamptz  [not null, note: 'Access token expiry (15-30 min)']

    // Refresh Token
    refresh_token_hash   varchar(128) [unique, note: 'SHA-256 of refresh token']
    refresh_expires_at   timestamptz  [note: 'Refresh token expiry (7-30 days)']
    refresh_used_count   int          [default: 0, note: 'Detect token reuse attacks']

    // Device & Security
    device_fingerprint   varchar(128) [not null, note: 'Hash of browser/device characteristics']
    device_name          varchar(100) [note: 'User-friendly device name']
    device_type          varchar(20)  [note: 'web, mobile_ios, mobile_android, desktop']

    // Network Information
    ip_address           inet         [not null]
    ip_country           varchar(2)   [note: 'ISO 3166-1 alpha-2 country code']
    ip_city              varchar(100)
    ip_is_vpn            boolean      [default: false]
    ip_is_proxy          boolean      [default: false]
    ip_risk_score        int          [note: '0-100, based on IP reputation']

    // User Agent
    user_agent           text
    browser_name         varchar(50)
    browser_version      varchar(20)
    os_name              varchar(50)
    os_version           varchar(20)

    // Session State
    is_active            boolean      [default: true]
    created_at           timestamptz  [not null, default: `now()`]
    last_activity_at     timestamptz  [not null, default: `now()`]
    terminated_at        timestamptz
    termination_reason   varchar(50)  [note: 'logout, expired, security, admin_action']
    terminated_by        int          [note: 'User ID who terminated (for admin actions)']

    // Security Flags
    is_trusted_device    boolean      [default: false]
    requires_mfa         boolean      [default: false]
    mfa_verified_at      timestamptz
    suspicious_activity  boolean      [default: false]

    // Session Metadata
    login_method         varchar(20)  [note: 'password, oauth, sso, magic_link']
    session_type         varchar(20)  [default: 'standard', note: 'standard, elevated, admin']

    Indexes {
        user_id
        session_token_hash [unique]
        refresh_token_hash [unique]
        expires_at
        (user_id, is_active)
        (user_id, device_fingerprint)
        (ip_address, created_at)
        last_activity_at [note: 'For cleanup of stale sessions']
    }

    Note: '''
    Comprehensive session management with security controls
    - Access tokens: 30 min expiry
    - Refresh tokens: 7 days expiry (30 days for trusted devices)
    - Automatic cleanup of expired sessions after 90 days
    '''
}

Ref: user_sessions.user_id > users.id [delete: cascade]
Ref: user_sessions.terminated_by > users.id [delete: set null]

// 裝置信任管理
Table trusted_devices [headercolor: #3498db] {
    id                  int         [pk, increment]
    user_id             int         [not null]
    device_fingerprint  varchar(128) [not null]
    device_name         varchar(100)
    trusted_at          timestamptz [not null, default: `now()`]
    last_seen_at        timestamptz [not null, default: `now()`]
    expires_at          timestamptz [not null, note: 'Trust expires after 90 days']
    revoked_at          timestamptz

    Indexes {
        (user_id, device_fingerprint) [unique]
        expires_at
    }

    Note: 'Devices trusted by user can skip MFA for lower-risk operations'
}

Ref: trusted_devices.user_id > users.id [delete: cascade]

// Session 活動追蹤
Table session_activities [headercolor: #3498db] {
    id                bigint      [pk, increment]
    session_id        bigint      [not null]
    activity_type     varchar(50) [not null, note: 'page_view, api_call, download, etc']
    activity_details  jsonb
    ip_address        inet
    occurred_at       timestamptz [not null, default: `now()`]

    Indexes {
        session_id
        occurred_at
        (session_id, occurred_at)
    }

    Note: 'Detailed session activity for security analysis'
}

Ref: session_activities.session_id > user_sessions.id [delete: cascade]
```

##### Session 管理實施程式碼

```typescript
import { randomBytes, createHash } from "crypto";
import { sign, verify } from "jsonwebtoken";

interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

class SessionManager {
  private readonly ACCESS_TOKEN_EXPIRY = 30 * 60; // 30 minutes
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
  private readonly TRUSTED_DEVICE_REFRESH_EXPIRY = 30 * 24 * 60 * 60; // 30 days
  private readonly MAX_CONCURRENT_SESSIONS = 5;

  async createSession(params: {
    userId: number;
    deviceFingerprint: string;
    ipAddress: string;
    userAgent: string;
    loginMethod: string;
  }): Promise<SessionTokens> {
    const { userId, deviceFingerprint, ipAddress, userAgent } = params;

    // 檢查並行 session 限制
    await this.enforceSessionLimit(userId);

    // 檢查裝置是否受信任
    const isTrustedDevice = await this.isDeviceTrusted(
      userId,
      deviceFingerprint,
    );

    // 生成 tokens
    const accessToken = this.generateSecureToken(32);
    const refreshToken = this.generateSecureToken(32);

    // 計算裝置指紋雜湊
    const deviceHash = this.hashToken(deviceFingerprint);

    // 解析 IP 地理位置和風險評分
    const ipInfo = await this.analyzeIPAddress(ipAddress);

    // 解析 User Agent
    const deviceInfo = this.parseUserAgent(userAgent);

    // 儲存 session
    const session = await db.query(
      `
      INSERT INTO user_sessions (
        user_id, session_token_hash, expires_at,
        refresh_token_hash, refresh_expires_at,
        device_fingerprint, device_name, device_type,
        ip_address, ip_country, ip_city, ip_is_vpn, ip_risk_score,
        user_agent, browser_name, browser_version, os_name, os_version,
        is_trusted_device, login_method
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING id
    `,
      [
        userId,
        this.hashToken(accessToken),
        new Date(Date.now() + this.ACCESS_TOKEN_EXPIRY * 1000),
        this.hashToken(refreshToken),
        new Date(
          Date.now() +
            (isTrustedDevice
              ? this.TRUSTED_DEVICE_REFRESH_EXPIRY
              : this.REFRESH_TOKEN_EXPIRY) *
              1000,
        ),
        deviceHash,
        deviceInfo.name,
        deviceInfo.type,
        ipAddress,
        ipInfo.country,
        ipInfo.city,
        ipInfo.isVPN,
        ipInfo.riskScore,
        userAgent,
        deviceInfo.browser.name,
        deviceInfo.browser.version,
        deviceInfo.os.name,
        deviceInfo.os.version,
        isTrustedDevice,
        params.loginMethod,
      ],
    );

    // 審計日誌
    await auditLogger.log({
      action: "LOGIN",
      userId,
      sessionId: session.rows[0].id,
      ipAddress,
      deviceFingerprint: deviceHash,
      riskScore: ipInfo.riskScore,
    });

    // 高風險登入警報
    if (ipInfo.riskScore > 70 || (!isTrustedDevice && ipInfo.isVPN)) {
      await this.triggerSecurityAlert({
        type: "suspicious_login",
        userId,
        ipAddress,
        riskFactors: [
          ipInfo.isVPN && "VPN detected",
          ipInfo.riskScore > 70 && `High IP risk score: ${ipInfo.riskScore}`,
          !isTrustedDevice && "Untrusted device",
        ].filter(Boolean),
      });
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      refreshExpiresIn: isTrustedDevice
        ? this.TRUSTED_DEVICE_REFRESH_EXPIRY
        : this.REFRESH_TOKEN_EXPIRY,
    };
  }

  async refreshSession(
    refreshToken: string,
    deviceFingerprint: string,
  ): Promise<SessionTokens> {
    const refreshTokenHash = this.hashToken(refreshToken);
    const deviceHash = this.hashToken(deviceFingerprint);

    // 查找 session
    const session = await db.query(
      `
      SELECT * FROM user_sessions
      WHERE refresh_token_hash = $1
        AND is_active = true
        AND refresh_expires_at > now()
        AND device_fingerprint = $2
    `,
      [refreshTokenHash, deviceHash],
    );

    if (session.rows.length === 0) {
      // 可能是 token 重用攻擊
      await this.handleSuspiciousRefresh(refreshTokenHash);
      throw new Error("Invalid or expired refresh token");
    }

    const sessionData = session.rows[0];

    // 檢測 token 重用
    if (sessionData.refresh_used_count > 0) {
      // 可能是重放攻擊，立即撤銷所有 sessions
      await this.revokeAllUserSessions(
        sessionData.user_id,
        "token_reuse_detected",
      );
      throw new Error("Token reuse detected - all sessions revoked");
    }

    // 標記 refresh token 已使用
    await db.query(
      `
      UPDATE user_sessions
      SET refresh_used_count = refresh_used_count + 1
      WHERE id = $1
    `,
      [sessionData.id],
    );

    // 生成新的 tokens
    const newAccessToken = this.generateSecureToken(32);
    const newRefreshToken = this.generateSecureToken(32);

    // 更新 session (Token Rotation)
    await db.query(
      `
      UPDATE user_sessions
      SET session_token_hash = $1,
          expires_at = $2,
          refresh_token_hash = $3,
          refresh_expires_at = $4,
          refresh_used_count = 0,
          last_activity_at = now()
      WHERE id = $5
    `,
      [
        this.hashToken(newAccessToken),
        new Date(Date.now() + this.ACCESS_TOKEN_EXPIRY * 1000),
        this.hashToken(newRefreshToken),
        new Date(
          Date.now() +
            (sessionData.is_trusted_device
              ? this.TRUSTED_DEVICE_REFRESH_EXPIRY
              : this.REFRESH_TOKEN_EXPIRY) *
              1000,
        ),
        sessionData.id,
      ],
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      refreshExpiresIn: sessionData.is_trusted_device
        ? this.TRUSTED_DEVICE_REFRESH_EXPIRY
        : this.REFRESH_TOKEN_EXPIRY,
    };
  }

  async validateSession(
    accessToken: string,
    deviceFingerprint: string,
  ): Promise<{
    valid: boolean;
    userId?: number;
    sessionId?: number;
    requiresMFA?: boolean;
  }> {
    const tokenHash = this.hashToken(accessToken);
    const deviceHash = this.hashToken(deviceFingerprint);

    const session = await db.query(
      `
      SELECT id, user_id, device_fingerprint, expires_at, requires_mfa, mfa_verified_at
      FROM user_sessions
      WHERE session_token_hash = $1
        AND is_active = true
        AND expires_at > now()
    `,
      [tokenHash],
    );

    if (session.rows.length === 0) {
      return { valid: false };
    }

    const sessionData = session.rows[0];

    // 驗證裝置指紋 (防止 session 劫持)
    if (sessionData.device_fingerprint !== deviceHash) {
      // Session 劫持偵測
      await this.handleSessionHijacking(sessionData.id);
      return { valid: false };
    }

    // 檢查是否需要 MFA
    const requiresMFA =
      sessionData.requires_mfa && !sessionData.mfa_verified_at;

    // 更新最後活動時間
    await db.query(
      `
      UPDATE user_sessions
      SET last_activity_at = now()
      WHERE id = $1
    `,
      [sessionData.id],
    );

    return {
      valid: true,
      userId: sessionData.user_id,
      sessionId: sessionData.id,
      requiresMFA,
    };
  }

  private async enforceSessionLimit(userId: number): Promise<void> {
    const activeSessions = await db.query(
      `
      SELECT COUNT(*) FROM user_sessions
      WHERE user_id = $1 AND is_active = true
    `,
      [userId],
    );

    const count = parseInt(activeSessions.rows[0].count);

    if (count >= this.MAX_CONCURRENT_SESSIONS) {
      // 撤銷最舊的 session
      await db.query(
        `
        UPDATE user_sessions
        SET is_active = false,
            terminated_at = now(),
            termination_reason = 'session_limit_exceeded'
        WHERE id = (
          SELECT id FROM user_sessions
          WHERE user_id = $1 AND is_active = true
          ORDER BY last_activity_at ASC
          LIMIT 1
        )
      `,
        [userId],
      );
    }
  }

  private async isDeviceTrusted(
    userId: number,
    deviceFingerprint: string,
  ): Promise<boolean> {
    const deviceHash = this.hashToken(deviceFingerprint);

    const trusted = await db.query(
      `
      SELECT id FROM trusted_devices
      WHERE user_id = $1
        AND device_fingerprint = $2
        AND revoked_at IS NULL
        AND expires_at > now()
    `,
      [userId, deviceHash],
    );

    return trusted.rows.length > 0;
  }

  private generateSecureToken(bytes: number = 32): string {
    return randomBytes(bytes).toString("base64url");
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private async analyzeIPAddress(ipAddress: string): Promise<{
    country: string;
    city: string;
    isVPN: boolean;
    isProxy: boolean;
    riskScore: number;
  }> {
    // 整合 IP 地理位置和風險評分服務
    // 例如: MaxMind GeoIP2, IPQualityScore, IPHub

    // 這裡使用模擬資料
    return {
      country: "TW",
      city: "Taipei",
      isVPN: false,
      isProxy: false,
      riskScore: 10,
    };
  }

  private parseUserAgent(userAgent: string): {
    name: string;
    type: string;
    browser: { name: string; version: string };
    os: { name: string; version: string };
  } {
    // 使用 ua-parser-js 或類似函式庫
    return {
      name: "Chrome on Windows",
      type: "web",
      browser: { name: "Chrome", version: "120.0" },
      os: { name: "Windows", version: "10" },
    };
  }

  private async handleSessionHijacking(sessionId: number): Promise<void> {
    // 立即撤銷 session
    await db.query(
      `
      UPDATE user_sessions
      SET is_active = false,
          terminated_at = now(),
          termination_reason = 'session_hijacking_detected',
          suspicious_activity = true
      WHERE id = $1
    `,
      [sessionId],
    );

    // 觸發安全警報
    await this.triggerSecurityAlert({
      type: "session_hijacking",
      sessionId,
    });
  }

  private async handleSuspiciousRefresh(
    refreshTokenHash: string,
  ): Promise<void> {
    // 記錄可疑的 refresh 嘗試
    await auditLogger.log({
      action: "suspicious_refresh_attempt",
      refreshTokenHash,
      actionResult: "failure",
    });
  }

  private async revokeAllUserSessions(
    userId: number,
    reason: string,
  ): Promise<void> {
    await db.query(
      `
      UPDATE user_sessions
      SET is_active = false,
          terminated_at = now(),
          termination_reason = $2
      WHERE user_id = $1 AND is_active = true
    `,
      [userId, reason],
    );

    // 通知用戶
    await this.notifyUser(userId, {
      type: "security_alert",
      message:
        "All your sessions have been terminated due to suspicious activity",
    });
  }
}
```

##### 裝置指紋生成 (前端)

```typescript
// Client-side device fingerprinting
class DeviceFingerprint {
  async generate(): Promise<string> {
    const components = {
      // 瀏覽器資訊
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages.join(","),
      platform: navigator.platform,

      // 螢幕資訊
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,

      // 時區
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),

      // WebGL
      webglVendor: await this.getWebGLVendor(),
      webglRenderer: await this.getWebGLRenderer(),

      // Canvas fingerprint
      canvas: await this.getCanvasFingerprint(),

      // Audio context
      audio: await this.getAudioFingerprint(),

      // Fonts
      fonts: await this.detectFonts(),

      // Plugins
      plugins: Array.from(navigator.plugins)
        .map((p) => p.name)
        .join(","),

      // Touch support
      touchSupport: navigator.maxTouchPoints,

      // Hardware
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
    };

    // 生成指紋雜湊
    const fingerprint = JSON.stringify(components);
    const hash = await this.sha256(fingerprint);

    return hash;
  }

  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private async getWebGLVendor(): Promise<string> {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return "";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "";
  }

  private async getCanvasFingerprint(): Promise<string> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 140, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Device Fingerprint", 2, 2);

    return canvas.toDataURL();
  }

  // ... 其他指紋生成方法
}
```

---

### 問題 5: 醫療資訊查詢效能與安全風險

**ISO 27001 控制項**: A.18.1.4 - 個人資料保護

#### 問題描述

```dbml
Table customer_medical_histories {
    medical_history text
    Indexes {
        medical_history  // ❌ 對敏感 text 欄位建立索引
    }
}
```

存在的問題：

1. 對敏感的 `medical_history` 欄位建立全文索引可能洩露資訊
2. 沒有結構化的醫療資訊，難以查詢和分析
3. 缺少資料脫敏機制
4. 沒有存取正當理由追蹤

#### Best Practice 解決方案

##### 方案 1: 結構化醫療資訊 + 雜湊查詢

```dbml
// 移除原本的 customer_medical_histories 表格
// 改用結構化設計

Enum medical_condition_category {
    cardiovascular
    respiratory
    diabetes
    cancer
    mental_health
    allergies
    chronic_pain
    other
}

// 標準化的醫療狀況代碼表
Table medical_condition_codes [headercolor: #e74c3c] {
    id                  int     [pk, increment]
    code                varchar(20) [unique, not null, note: 'ICD-10 code']
    category            medical_condition_category [not null]
    name_zh_tw          varchar(200) [not null]
    name_en             varchar(200) [not null]
    severity_level      int     [note: '1-5, where 5 is most severe']
    requires_disclosure boolean [default: true, note: 'Must disclose for insurance']

    Indexes {
        code [unique]
        category
    }

    Note: 'ICD-10 standard medical condition codes'
}

// 客戶醫療記錄 (結構化)
Table customer_medical_records [headercolor: #e74c3c] {
    id                      int         [pk, increment]
    user_id                 int         [not null]
    condition_code_id       int         [not null, note: 'References medical_condition_codes']

    // 加密的詳細資訊
    diagnosis_details_enc   bytea       [note: 'Encrypted detailed diagnosis']
    diagnosis_details_iv    bytea
    diagnosis_details_tag   bytea

    // 查詢用的雜湊 (不可逆)
    condition_hash          varchar(64) [not null, note: 'SHA-256 for searching without decryption']

    // 時間資訊
    diagnosed_date          date
    last_occurrence_date    date
    is_ongoing              boolean     [default: true]

    // 嚴重程度
    severity                int         [note: '1-5']
    requires_treatment      boolean
    affects_daily_life      boolean

    // 資料來源
    source                  varchar(50) [note: 'self_reported, medical_record, insurance_claim']
    verified_by_doctor      boolean     [default: false]
    verification_date       date

    // 隱私控制
    encryption_key_id       varchar(50) [not null]
    disclosed_to_insurers   boolean     [default: false]
    disclosure_consent_at   timestamptz

    // 審計
    created_at              timestamptz [default: `now()`]
    created_by              int         [not null]
    updated_at              timestamptz [default: `now()`]
    updated_by              int         [not null]
    deleted_at              timestamptz
    deleted_by              int

    Indexes {
        user_id
        condition_code_id
        condition_hash
        (user_id, condition_code_id)
        (user_id, is_ongoing)
        diagnosed_date
    }

    Note: '''
    Structured medical records with encryption
    - Full diagnosis details encrypted
    - Condition hash for privacy-preserving queries
    - ICD-10 standardized codes
    '''
}

Ref: customer_medical_records.user_id > customer_profiles.user_id [delete: cascade]
Ref: customer_medical_records.condition_code_id > medical_condition_codes.id
Ref: customer_medical_records.created_by > users.id
Ref: customer_medical_records.updated_by > users.id

// 醫療資料存取請求 (需審批)
Table medical_data_access_requests [headercolor: #e74c3c] {
    id                  int         [pk, increment]
    requester_id        int         [not null, note: 'Agent or staff requesting access']
    patient_id          int         [not null]

    // 請求資訊
    request_reason      text        [not null]
    business_purpose    varchar(100) [not null, note: 'underwriting, claim_processing, customer_service']
    requested_fields    text[]      [not null, note: 'Which medical fields to access']

    // 審批流程
    status              varchar(20) [not null, default: 'pending', note: 'pending, approved, rejected, expired']
    approver_id         int         [note: 'Manager or compliance officer']
    approved_at         timestamptz
    rejection_reason    text

    // 存取控制
    access_granted_at   timestamptz
    access_expires_at   timestamptz [note: 'Temporary access (24-48 hours)']
    actual_access_at    timestamptz [note: 'When data was actually accessed']

    // 審計
    created_at          timestamptz [default: `now()`]

    Indexes {
        requester_id
        patient_id
        status
        (requester_id, status)
        access_expires_at
    }

    Note: '''
    Access control for sensitive medical data
    Requires manager approval for access
    Temporary access with expiration
    '''
}

Ref: medical_data_access_requests.requester_id > users.id
Ref: medical_data_access_requests.patient_id > customer_profiles.user_id
Ref: medical_data_access_requests.approver_id > users.id
```

##### 醫療資料存取控制實施

```typescript
class MedicalDataAccessControl {
  // 請求存取醫療資料
  async requestAccess(params: {
    requesterId: number;
    patientId: number;
    reason: string;
    purpose: string;
    fields: string[];
  }): Promise<number> {
    const { requesterId, patientId, reason, purpose, fields } = params;

    // 驗證請求者權限
    const requester = await this.getUser(requesterId);
    if (!["agent", "manager", "admin"].includes(requester.role)) {
      throw new Error("Unauthorized to request medical data access");
    }

    // 建立存取請求
    const request = await db.query(
      `
      INSERT INTO medical_data_access_requests (
        requester_id, patient_id, request_reason,
        business_purpose, requested_fields, status
      ) VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING id
    `,
      [requesterId, patientId, reason, purpose, fields],
    );

    const requestId = request.rows[0].id;

    // 通知審批者
    await this.notifyApprovers(requestId, patientId);

    // 審計日誌
    await auditLogger.log({
      action: "medical_data_access_requested",
      userId: requesterId,
      targetUserId: patientId,
      details: { requestId, purpose, fields },
    });

    return requestId;
  }

  // 審批存取請求
  async approveRequest(params: {
    requestId: number;
    approverId: number;
    accessDurationHours: number;
  }): Promise<void> {
    const { requestId, approverId, accessDurationHours } = params;

    // 驗證審批者權限
    const approver = await this.getUser(approverId);
    if (!["manager", "admin"].includes(approver.role)) {
      throw new Error("Unauthorized to approve medical data access");
    }

    const expiresAt = new Date(
      Date.now() + accessDurationHours * 60 * 60 * 1000,
    );

    await db.query(
      `
      UPDATE medical_data_access_requests
      SET status = 'approved',
          approver_id = $1,
          approved_at = now(),
          access_granted_at = now(),
          access_expires_at = $2
      WHERE id = $3
    `,
      [approverId, expiresAt, requestId],
    );

    // 通知請求者
    const request = await this.getRequest(requestId);
    await this.notifyUser(request.requester_id, {
      type: "medical_access_approved",
      message: `Your request to access patient ${request.patient_id} medical data has been approved`,
      expiresAt,
    });

    // 審計日誌
    await auditLogger.log({
      action: "medical_data_access_approved",
      userId: approverId,
      details: { requestId, expiresAt },
    });
  }

  // 存取醫療資料 (需先獲得批准)
  async accessMedicalData(params: {
    requesterId: number;
    patientId: number;
    sessionId: string;
  }): Promise<any> {
    const { requesterId, patientId, sessionId } = params;

    // 檢查是否有有效的存取權限
    const accessGrant = await db.query(
      `
      SELECT * FROM medical_data_access_requests
      WHERE requester_id = $1
        AND patient_id = $2
        AND status = 'approved'
        AND access_expires_at > now()
      ORDER BY approved_at DESC
      LIMIT 1
    `,
      [requesterId, patientId],
    );

    if (accessGrant.rows.length === 0) {
      throw new Error(
        "No valid access grant found. Please request access first.",
      );
    }

    const grant = accessGrant.rows[0];

    // 記錄實際存取時間
    await db.query(
      `
      UPDATE medical_data_access_requests
      SET actual_access_at = now()
      WHERE id = $1
    `,
      [grant.id],
    );

    // 查詢醫療記錄
    const records = await db.query(
      `
      SELECT
        cmr.id,
        cmr.user_id,
        mcc.code as condition_code,
        mcc.name_zh_tw as condition_name,
        mcc.category,
        mcc.severity_level,
        cmr.diagnosis_details_enc,
        cmr.diagnosis_details_iv,
        cmr.diagnosis_details_tag,
        cmr.encryption_key_id,
        cmr.diagnosed_date,
        cmr.is_ongoing,
        cmr.severity
      FROM customer_medical_records cmr
      JOIN medical_condition_codes mcc ON cmr.condition_code_id = mcc.id
      WHERE cmr.user_id = $1
        AND cmr.deleted_at IS NULL
    `,
      [patientId],
    );

    // 解密詳細資訊
    const kms = new KeyManagementService();
    const decryptedRecords = await Promise.all(
      records.rows.map(async (record) => {
        const key = await kms.getDataKey(record.encryption_key_id);
        const decrypted = await decrypt(
          {
            ciphertext: record.diagnosis_details_enc,
            iv: record.diagnosis_details_iv,
            authTag: record.diagnosis_details_tag,
          },
          key,
        );

        return {
          ...record,
          diagnosis_details: decrypted,
          // 移除加密欄位
          diagnosis_details_enc: undefined,
          diagnosis_details_iv: undefined,
          diagnosis_details_tag: undefined,
          encryption_key_id: undefined,
        };
      }),
    );

    // 記錄到敏感資料存取日誌
    await db.query(
      `
      INSERT INTO sensitive_data_access_logs (
        user_id, accessed_table, access_type,
        accessed_record_id, session_id, justification
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        requesterId,
        "customer_medical_records",
        "read",
        patientId,
        sessionId,
        grant.request_reason,
      ],
    );

    // 高敏感操作審計
    await auditLogger.log({
      action: "medical_data_accessed",
      userId: requesterId,
      targetUserId: patientId,
      dataClassification: "restricted",
      riskScore: 90,
      requiresReview: true,
      details: {
        accessGrantId: grant.id,
        recordCount: decryptedRecords.length,
      },
    });

    return decryptedRecords;
  }

  // 資料脫敏 (用於低敏感度情境)
  maskMedicalData(data: any): any {
    return {
      ...data,
      diagnosis_details: "***已遮罩***",
      // 只顯示類別和基本資訊
      condition_category: data.category,
      severity_level: data.severity_level,
      is_ongoing: data.is_ongoing,
    };
  }
}
```

##### 隱私保護查詢 (使用雜湊)

```typescript
class PrivacyPreservingQuery {
  // 不解密即可查詢特定病症
  async hasCondition(userId: number, conditionCode: string): Promise<boolean> {
    // 計算條件雜湊
    const conditionHash = createHash("sha256")
      .update(`${userId}:${conditionCode}`)
      .digest("hex");

    const result = await db.query(
      `
      SELECT COUNT(*) as count
      FROM customer_medical_records
      WHERE user_id = $1
        AND condition_hash = $2
        AND deleted_at IS NULL
        AND is_ongoing = true
    `,
      [userId, conditionHash],
    );

    return parseInt(result.rows[0].count) > 0;
  }

  // 統計分析 (無需解密個別記錄)
  async getConditionStatistics(conditionCode: string): Promise<{
    totalPatients: number;
    averageAge: number;
    genderDistribution: any;
  }> {
    // 使用聚合查詢，不存取個人資料
    const stats = await db.query(
      `
      SELECT
        COUNT(DISTINCT cmr.user_id) as total_patients,
        AVG(cp.age) as average_age,
        cp.gender,
        COUNT(*) as count
      FROM customer_medical_records cmr
      JOIN customer_profiles cp ON cmr.user_id = cp.user_id
      JOIN medical_condition_codes mcc ON cmr.condition_code_id = mcc.id
      WHERE mcc.code = $1
        AND cmr.deleted_at IS NULL
      GROUP BY cp.gender
    `,
      [conditionCode],
    );

    return {
      totalPatients: parseInt(stats.rows[0]?.total_patients || 0),
      averageAge: parseFloat(stats.rows[0]?.average_age || 0),
      genderDistribution: stats.rows.reduce((acc, row) => {
        acc[row.gender] = parseInt(row.count);
        return acc;
      }, {}),
    };
  }
}
```

##### 插入醫療記錄時自動生成雜湊

```sql
-- PostgreSQL 觸發器自動生成 condition_hash
CREATE OR REPLACE FUNCTION generate_condition_hash()
RETURNS TRIGGER AS $$
DECLARE
    v_condition_code varchar(20);
BEGIN
    -- 取得 condition code
    SELECT code INTO v_condition_code
    FROM medical_condition_codes
    WHERE id = NEW.condition_code_id;

    -- 生成雜湊: SHA-256(user_id:condition_code)
    NEW.condition_hash := encode(
        digest(NEW.user_id::text || ':' || v_condition_code, 'sha256'),
        'hex'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_condition_hash
    BEFORE INSERT OR UPDATE ON customer_medical_records
    FOR EACH ROW
    EXECUTE FUNCTION generate_condition_hash();
```

---

## 🟡 中等問題 (Medium Priority)

### 問題 6: 軟刪除不一致 ⚠️ 部分修復

**ISO 27001 控制項**: A.11.2.8 - 媒體處置安全

**修復狀態**:

- ✅ 核心表格都已加入完整的軟刪除欄位 (deleted_at, deleted_by)
- ❌ `user_identities` 缺少軟刪除欄位
- ❌ `notifications` 缺少 `expires_at` 欄位
- ❌ `audit_logs` 缺少 `retention_until` 欄位

#### 問題描述

某些表格有完整的軟刪除欄位 (`deleted_at`, `deleted_by`),但不一致：

- ✅ `users`, `customer_profiles`, `agent_profiles`, `companies`, `insurances`, `policy_enrollments`, `claims` 有軟刪除
- ❌ `user_identities`, `user_sessions`, `notifications`, `audit_logs` 缺少軟刪除

#### Best Practice 解決方案

**原則**:

- **需要軟刪除**: 包含業務資料、用戶資料、交易記錄
- **不需要軟刪除**: 日誌表、Session 表 (有其他狀態欄位)、通知表 (過期後可直接刪除)

##### 更新建議

```dbml
// user_identities 應該保留，以便追蹤
Table user_identities [headercolor: #3498db] {
    user_id           int               [not null]
    provider          identity_provider [not null]
    provider_user_id  text              [not null]
    email_verified_at timestamptz
    created_at        timestamptz       [default: `now()`]

    // 新增軟刪除
    deleted_at        timestamptz
    deleted_by        int

    Indexes {
        (provider, provider_user_id) [unique]
        deleted_at
    }
}

// notifications 可以直接硬刪除，但加上保留期限更好
Table notifications [headercolor: #A23456] {
    id              int         [pk, increment]
    user_id         int         [not null]
    title           text        [not null]
    payload         jsonb       [not null]
    action_url      text
    sent_at         timestamptz [not null, default: `now()`]
    read_at         timestamptz

    // 新增保留策略
    expires_at      timestamptz [not null, note: 'Auto-delete after 90 days']

    Indexes {
        (user_id, read_at)
        expires_at [note: 'For automated cleanup']
    }
}

// audit_logs 使用 retention_until 而非軟刪除
// (在問題 3 中已更新)
```

##### 自動清理過期資料

```sql
-- 定期清理過期的通知
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications
    WHERE expires_at < now();

    -- 記錄清理動作
    INSERT INTO audit_logs (action, table_name, action_result, user_id)
    VALUES ('DELETE', 'notifications', 'success', NULL);
END;
$$ LANGUAGE plpgsql;

-- 每天執行一次
-- 使用 pg_cron 或外部排程器
SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_expired_notifications()');
```

---

### 問題 7: 缺少資料保留策略欄位

**ISO 27001 控制項**: A.11.2.7 - 安全處置或再利用

#### Best Practice 解決方案

```dbml
// 資料保留策略配置表
Table data_retention_policies [headercolor: #95a5a6] {
    id                  int     [pk, increment]
    table_name          varchar [unique, not null]
    retention_days      int     [not null, note: 'Days to retain data']
    retention_reason    text    [note: 'Legal or business reason']
    applies_to_deleted  boolean [default: true, note: 'Applies to soft-deleted records']
    auto_purge_enabled  boolean [default: false]
    last_purge_at       timestamptz
    next_purge_at       timestamptz
    created_at          timestamptz [default: `now()`]
    updated_at          timestamptz [default: `now()`]

    Note: '''
    Centralized data retention policy management
    Example policies:
    - audit_logs: 3 years (1095 days)
    - policy_enrollments: 7 years (2555 days) - regulatory requirement
    - user_sessions: 90 days
    - notifications: 90 days
    '''
}

// 資料清理歷史
Table data_purge_history [headercolor: #95a5a6] {
    id              bigint      [pk, increment]
    table_name      varchar     [not null]
    purge_type      varchar(20) [not null, note: 'soft_delete, hard_delete, archive']
    records_affected int        [not null]
    purge_criteria  jsonb       [note: 'Filter conditions used']
    executed_by     int
    executed_at     timestamptz [default: `now()`]
    duration_ms     int         [note: 'Purge execution time']

    Indexes {
        table_name
        executed_at
    }
}
```

##### 實施自動資料保留

```typescript
class DataRetentionManager {
  async executePurge(tableName: string): Promise<{
    recordsAffected: number;
    duration: number;
  }> {
    const startTime = Date.now();

    // 取得保留政策
    const policy = await db.query(
      `
      SELECT * FROM data_retention_policies
      WHERE table_name = $1 AND auto_purge_enabled = true
    `,
      [tableName],
    );

    if (policy.rows.length === 0) {
      throw new Error(`No purge policy found for table: ${tableName}`);
    }

    const { retention_days, applies_to_deleted } = policy.rows[0];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retention_days);

    let recordsAffected = 0;

    // 執行清理
    if (applies_to_deleted) {
      // 硬刪除已軟刪除的記錄
      const result = await db.query(
        `
        DELETE FROM ${tableName}
        WHERE deleted_at IS NOT NULL
          AND deleted_at < $1
      `,
        [cutoffDate],
      );
      recordsAffected = result.rowCount;
    }

    const duration = Date.now() - startTime;

    // 記錄清理歷史
    await db.query(
      `
      INSERT INTO data_purge_history (
        table_name, purge_type, records_affected,
        purge_criteria, executed_at, duration_ms
      ) VALUES ($1, $2, $3, $4, now(), $5)
    `,
      [
        tableName,
        applies_to_deleted ? "hard_delete" : "soft_delete",
        recordsAffected,
        { retention_days, cutoff_date: cutoffDate },
        duration,
      ],
    );

    // 更新下次清理時間
    const nextPurge = new Date();
    nextPurge.setDate(nextPurge.getDate() + 7); // 每週執行

    await db.query(
      `
      UPDATE data_retention_policies
      SET last_purge_at = now(),
          next_purge_at = $1
      WHERE table_name = $2
    `,
      [nextPurge, tableName],
    );

    return { recordsAffected, duration };
  }

  // 預覽將被清理的資料
  async previewPurge(tableName: string): Promise<{
    recordCount: number;
    oldestRecord: Date;
    newestRecord: Date;
  }> {
    const policy = await this.getPolicy(tableName);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);

    const preview = await db.query(
      `
      SELECT
        COUNT(*) as count,
        MIN(deleted_at) as oldest,
        MAX(deleted_at) as newest
      FROM ${tableName}
      WHERE deleted_at IS NOT NULL
        AND deleted_at < $1
    `,
      [cutoffDate],
    );

    return {
      recordCount: parseInt(preview.rows[0].count),
      oldestRecord: preview.rows[0].oldest,
      newestRecord: preview.rows[0].newest,
    };
  }
}
```

---

### 問題 8: 外鍵 Cascade 刪除風險

**ISO 27001 控制項**: A.11.2.7 - 安全處置或再利用

#### 問題描述

```dbml
Ref: policy_enrollments.customer_id > customer_profiles.user_id [delete: cascade]
Ref: policy_enrollments.agent_id > agent_profiles.user_id [delete: cascade]
```

**風險**: 刪除客戶或業務員檔案會連帶刪除所有保單記錄，違反金融法規要求保留交易記錄 7 年。

#### Best Practice 解決方案

```dbml
// 修正外鍵關係
Ref: policy_enrollments.customer_id > customer_profiles.user_id [delete: restrict]
Ref: policy_enrollments.agent_id > agent_profiles.user_id [delete: restrict]
Ref: policy_enrollments.insurance_id > insurances.id [delete: restrict]

// Claims 也應該 restrict
Ref: claims.policy_enrollment_id - policy_enrollments.id [delete: restrict]

// 只有非業務關鍵的關聯才使用 cascade
Ref: user_preferences.user_id - users.id [delete: cascade]  // ✅ 偏好設定可以刪除
Ref: user_sessions.user_id > users.id [delete: cascade]     // ✅ Session 可以刪除
Ref: audit_logs.user_id > users.id [delete: set null]       // ✅ 保留審計記錄但移除關聯
```

##### 實施安全刪除流程

```typescript
class SafeDeleteService {
  // 刪除用戶前的檢查
  async deleteUser(userId: number, deletedBy: number): Promise<void> {
    // 1. 檢查是否有關聯的保單
    const policies = await db.query(
      `
      SELECT COUNT(*) as count FROM policy_enrollments
      WHERE (customer_id = $1 OR agent_id = $1)
        AND deleted_at IS NULL
    `,
      [userId],
    );

    if (parseInt(policies.rows[0].count) > 0) {
      throw new Error(
        "Cannot delete user with active policies. Please archive policies first or wait for retention period.",
      );
    }

    // 2. 檢查是否有未解決的理賠
    const claims = await db.query(
      `
      SELECT COUNT(*) as count FROM claims c
      JOIN policy_enrollments pe ON c.policy_enrollment_id = pe.id
      WHERE (pe.customer_id = $1 OR pe.agent_id = $1)
        AND c.status IN ('pending', 'processing')
    `,
      [userId],
    );

    if (parseInt(claims.rows[0].count) > 0) {
      throw new Error(
        "Cannot delete user with pending claims. Please resolve claims first.",
      );
    }

    // 3. 軟刪除用戶 (而非硬刪除)
    await db.query(
      `
      UPDATE users
      SET deleted_at = now(),
          deleted_by = $2,
          email = email || '.deleted.' || id,  -- 防止 email 衝突
          phone = NULL  -- 清除敏感資訊
      WHERE id = $1
    `,
      [userId, deletedBy],
    );

    // 4. 匿名化個人資料
    await this.anonymizeUserData(userId);

    // 5. 審計日誌
    await auditLogger.log({
      action: "user_deleted",
      userId: deletedBy,
      targetUserId: userId,
      dataClassification: "restricted",
    });
  }

  // GDPR「被遺忘權」實施
  async executeRightToBeForgotten(userId: number): Promise<void> {
    // 1. 檢查法規要求的保留期限
    const retentionCheck = await this.checkRetentionRequirements(userId);

    if (!retentionCheck.canDelete) {
      throw new Error(
        `Cannot delete user data. Must retain until ${retentionCheck.retainUntil} due to: ${retentionCheck.reason}`,
      );
    }

    // 2. 匿名化而非刪除
    await db.query(
      `
      UPDATE customer_profiles
      SET
        location_city = NULL,
        occupation_level = NULL,
        -- 保留年齡和性別用於統計 (匿名)
        updated_at = now(),
        updated_by = $1
      WHERE user_id = $2
    `,
      [userId, userId],
    );

    // 3. 加密或移除敏感醫療資料
    await db.query(
      `
      DELETE FROM customer_medical_records
      WHERE user_id = $1
        AND created_at < (now() - interval '7 years')
    `,
      [userId],
    );

    // 4. 保留但匿名化財務交易 (法規要求)
    await db.query(
      `
      UPDATE policy_enrollments
      SET customer_id = NULL,  -- 解除關聯
          updated_at = now()
      WHERE customer_id = $1
    `,
      [userId],
    );
  }

  private async anonymizeUserData(userId: number): Promise<void> {
    // 用隨機或雜湊值取代個人識別資訊
    await db.query(
      `
      UPDATE customer_profiles
      SET
        weight_kg = NULL,
        height_cm = NULL,
        location_city = 'ANONYMIZED',
        occupation_level = 'ANONYMIZED',
        updated_at = now()
      WHERE user_id = $1
    `,
      [userId],
    );
  }

  private async checkRetentionRequirements(userId: number): Promise<{
    canDelete: boolean;
    retainUntil?: Date;
    reason?: string;
  }> {
    // 檢查最近的保單或理賠
    const lastPolicy = await db.query(
      `
      SELECT MAX(created_at) as last_date
      FROM policy_enrollments
      WHERE customer_id = $1 OR agent_id = $1
    `,
      [userId],
    );

    if (lastPolicy.rows[0].last_date) {
      const retainUntil = new Date(lastPolicy.rows[0].last_date);
      retainUntil.setFullYear(retainUntil.getFullYear() + 7); // 保留 7 年

      if (retainUntil > new Date()) {
        return {
          canDelete: false,
          retainUntil,
          reason:
            "Insurance regulations require 7-year retention of policy records",
        };
      }
    }

    return { canDelete: true };
  }
}
```

---

### 問題 9: 缺少資料分類標籤

**ISO 27001 控制項**: A.8.2.2 - 資訊的標示

#### Best Practice 解決方案

```dbml
// 資料分類枚舉
Enum data_classification_level {
    public          // 可公開資訊
    internal        // 內部使用
    confidential    // 機密資訊
    restricted      // 最高機密 (醫療、財務)
}

// 表格資料分類元資料
Table table_classifications [headercolor: #95a5a6] {
    id                      int                     [pk, increment]
    table_name              varchar                 [unique, not null]
    classification          data_classification_level [not null]
    contains_pii            boolean                 [default: false]
    contains_phi            boolean                 [default: false, note: 'Protected Health Information']
    contains_pci            boolean                 [default: false, note: 'Payment Card Info']
    requires_encryption     boolean                 [default: false]
    requires_access_approval boolean                [default: false]
    max_retention_days      int
    description             text
    compliance_requirements text[]                  [note: 'GDPR, HIPAA, PCI-DSS, etc']

    created_at              timestamptz             [default: `now()`]
    updated_at              timestamptz             [default: `now()`]

    Note: 'Metadata for data classification and compliance'
}

// 欄位級別的資料分類
Table field_classifications [headercolor: #95a5a6] {
    id                  int                     [pk, increment]
    table_name          varchar                 [not null]
    field_name          varchar                 [not null]
    classification      data_classification_level [not null]
    is_pii              boolean                 [default: false]
    is_sensitive        boolean                 [default: false]
    encryption_required boolean                 [default: false]
    masking_rule        varchar(50)             [note: 'full, partial, hash']
    access_level        varchar(20)             [note: 'public, authenticated, privileged, admin']

    Indexes {
        (table_name, field_name) [unique]
        classification
    }

    Note: 'Field-level data classification for granular access control'
}
```

##### 初始化資料分類

```sql
-- 插入表格分類
INSERT INTO table_classifications (
    table_name, classification, contains_pii, contains_phi,
    requires_encryption, requires_access_approval, compliance_requirements
) VALUES
    ('users', 'confidential', true, false, true, false, ARRAY['GDPR', '個資法']),
    ('customer_profiles', 'confidential', true, true, true, false, ARRAY['GDPR', '個資法', '保險法']),
    ('customer_medical_records', 'restricted', true, true, true, true, ARRAY['GDPR', '個資法', '醫療法']),
    ('policy_enrollments', 'confidential', true, false, true, false, ARRAY['GDPR', '個資法', '保險法']),
    ('claims', 'confidential', true, false, true, false, ARRAY['GDPR', '個資法', '保險法']),
    ('companies', 'internal', false, false, false, false, ARRAY[]::text[]),
    ('insurances', 'public', false, false, false, false, ARRAY[]::text[]),
    ('audit_logs', 'internal', false, false, true, false, ARRAY['ISO27001']);

-- 插入欄位分類
INSERT INTO field_classifications (
    table_name, field_name, classification, is_pii, encryption_required, masking_rule, access_level
) VALUES
    -- users 表格
    ('users', 'email', 'confidential', true, false, 'partial', 'authenticated'),
    ('users', 'password_hash', 'restricted', false, true, 'full', 'admin'),
    ('users', 'phone', 'confidential', true, true, 'partial', 'authenticated'),

    -- customer_profiles
    ('customer_profiles', 'weight_kg', 'restricted', true, true, 'full', 'privileged'),
    ('customer_profiles', 'height_cm', 'restricted', true, true, 'full', 'privileged'),
    ('customer_profiles', 'location_city', 'confidential', true, false, 'partial', 'authenticated'),

    -- customer_medical_records
    ('customer_medical_records', 'diagnosis_details_enc', 'restricted', true, true, 'full', 'privileged'),

    -- policy_enrollments
    ('policy_enrollments', 'policy_number', 'confidential', true, false, 'partial', 'authenticated');
```

##### 基於分類的存取控制

```typescript
class DataClassificationService {
  async checkFieldAccess(params: {
    userId: number;
    tableName: string;
    fieldName: string;
    accessType: "read" | "write";
  }): Promise<boolean> {
    const { userId, tableName, fieldName, accessType } = params;

    // 取得欄位分類
    const classification = await db.query(
      `
      SELECT * FROM field_classifications
      WHERE table_name = $1 AND field_name = $2
    `,
      [tableName, fieldName],
    );

    if (classification.rows.length === 0) {
      return true; // 未分類的欄位預設允許
    }

    const fieldClass = classification.rows[0];

    // 取得用戶角色
    const user = await this.getUser(userId);

    // 基於存取等級檢查權限
    const accessLevel = this.getUserAccessLevel(user.role);
    const requiredLevel = this.getAccessLevelValue(fieldClass.access_level);

    if (accessLevel < requiredLevel) {
      return false;
    }

    // 如果是受限資料，檢查是否有存取批准
    if (fieldClass.classification === "restricted" && accessType === "read") {
      const hasApproval = await this.hasAccessApproval(userId, tableName);
      return hasApproval;
    }

    return true;
  }

  private getUserAccessLevel(role: string): number {
    const levels: Record<string, number> = {
      consumer: 1,
      agent: 2,
      manager: 3,
      admin: 4,
    };
    return levels[role] || 0;
  }

  private getAccessLevelValue(accessLevel: string): number {
    const levels: Record<string, number> = {
      public: 0,
      authenticated: 1,
      privileged: 3,
      admin: 4,
    };
    return levels[accessLevel] || 1;
  }

  // 自動資料遮罩
  async maskField(value: any, maskingRule: string): Promise<string> {
    switch (maskingRule) {
      case "full":
        return "***";

      case "partial":
        if (typeof value === "string") {
          if (value.includes("@")) {
            // Email: show first 2 chars and domain
            const [local, domain] = value.split("@");
            return `${local.substring(0, 2)}***@${domain}`;
          }
          if (value.match(/^\+?\d+$/)) {
            // Phone: show last 4 digits
            return `***${value.slice(-4)}`;
          }
          // General string: show first and last char
          return `${value[0]}***${value[value.length - 1]}`;
        }
        return "***";

      case "hash":
        return createHash("sha256")
          .update(value.toString())
          .digest("hex")
          .substring(0, 8);

      default:
        return value;
    }
  }

  // 查詢時自動套用遮罩
  async queryWithMasking(params: {
    userId: number;
    tableName: string;
    query: string;
  }): Promise<any[]> {
    const { userId, tableName, query } = params;

    // 執行查詢
    const results = await db.query(query);

    // 取得表格的欄位分類
    const fieldClassifications = await db.query(
      `
      SELECT field_name, masking_rule, access_level
      FROM field_classifications
      WHERE table_name = $1
    `,
      [tableName],
    );

    const user = await this.getUser(userId);
    const userAccessLevel = this.getUserAccessLevel(user.role);

    // 套用遮罩
    const maskedResults = results.rows.map((row) => {
      const maskedRow: any = { ...row };

      for (const fieldClass of fieldClassifications.rows) {
        const requiredLevel = this.getAccessLevelValue(fieldClass.access_level);

        // 如果用戶權限不足，套用遮罩
        if (userAccessLevel < requiredLevel && fieldClass.masking_rule) {
          maskedRow[fieldClass.field_name] = this.maskField(
            row[fieldClass.field_name],
            fieldClass.masking_rule,
          );
        }
      }

      return maskedRow;
    });

    return maskedResults;
  }
}
```

---

### 問題 10: 通知系統缺少隱私控制

**ISO 27001 控制項**: A.13.2.1 - 資訊傳輸政策和程序

#### Best Practice 解決方案

```dbml
Enum notification_type {
    system
    marketing
    security_alert
    policy_update
    payment_reminder
    claim_update
}

Enum notification_channel {
    in_app
    email
    sms
    push
}

Table notifications [headercolor: #A23456] {
    id                  int             [pk, increment]
    user_id             int             [not null]

    // 通知分類
    type                notification_type [not null]
    channel             notification_channel [not null]
    priority            int             [default: 0, note: '0-10, higher is more urgent']

    // 通知內容 (不含敏感資訊)
    title               varchar(200)    [not null]
    message             text            [not null, note: 'Plain text, no PII']
    action_url          varchar(500)

    // 敏感 payload 加密儲存
    payload             bytea           [note: 'Encrypted JSON with sensitive data']
    payload_iv          bytea
    payload_tag         bytea
    encryption_key_id   varchar(50)

    // 資料分類
    contains_pii        boolean         [default: false]
    data_classification varchar(20)     [default: 'internal']

    // 時間資訊
    scheduled_at        timestamptz     [note: 'For scheduled notifications']
    sent_at             timestamptz     [default: `now()`]
    delivered_at        timestamptz     [note: 'Confirmed delivery']
    read_at             timestamptz
    expires_at          timestamptz     [not null, note: 'Auto-delete after expiry']

    // 用戶互動
    clicked             boolean         [default: false]
    dismissed           boolean         [default: false]

    // 重試機制
    retry_count         int             [default: 0]
    last_error          text

    Indexes {
        user_id
        (user_id, read_at)
        (user_id, type)
        sent_at
        expires_at
        (user_id, sent_at)
    }

    Note: '''
    Secure notification system
    - Sensitive data encrypted in payload
    - Public message contains no PII
    - Automatic expiration
    '''
}

Ref: notifications.user_id > users.id [delete: cascade]

// 通知偏好設定
Table notification_preferences [headercolor: #A23456] {
    user_id             int             [pk]

    // 通知類型偏好
    system_enabled      boolean         [default: true, note: 'Cannot disable']
    marketing_enabled   boolean         [default: false]
    security_enabled    boolean         [default: true, note: 'Cannot disable']
    policy_enabled      boolean         [default: true]
    payment_enabled     boolean         [default: true]
    claim_enabled       boolean         [default: true]

    // 通道偏好
    email_enabled       boolean         [default: true]
    sms_enabled         boolean         [default: false]
    push_enabled        boolean         [default: true]

    // 靜音時段
    quiet_hours_start   time
    quiet_hours_end     time
    quiet_days          int[]           [note: 'Day of week: 0=Sunday, 6=Saturday']

    updated_at          timestamptz     [default: `now()`]

    Note: 'User notification preferences and consent'
}

Ref: notification_preferences.user_id - users.id [delete: cascade]
```

##### 安全的通知發送

```typescript
class SecureNotificationService {
  async sendNotification(params: {
    userId: number;
    type: string;
    channel: string;
    title: string;
    message: string;
    actionUrl?: string;
    payload?: Record<string, any>;
    containsPII?: boolean;
  }): Promise<void> {
    const {
      userId,
      type,
      channel,
      title,
      message,
      actionUrl,
      payload,
      containsPII,
    } = params;

    // 檢查用戶偏好
    const preferences = await this.getUserPreferences(userId);
    if (!this.shouldSendNotification(type, channel, preferences)) {
      return; // 用戶已停用此類通知
    }

    // 檢查靜音時段
    if (this.isInQuietHours(preferences)) {
      // 延後發送
      await this.scheduleNotification(params, preferences.quiet_hours_end);
      return;
    }

    // 加密敏感 payload
    let encryptedPayload: any = null;
    let payloadIV: any = null;
    let payloadTag: any = null;
    let keyId: string | null = null;

    if (payload && containsPII) {
      const kms = new KeyManagementService();
      const key = await kms.getDataKey("notification-encryption-key");

      const encrypted = await encrypt(JSON.stringify(payload), key);
      encryptedPayload = encrypted.ciphertext;
      payloadIV = encrypted.iv;
      payloadTag = encrypted.authTag;
      keyId = encrypted.keyId;
    }

    // 計算過期時間
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 天後過期

    // 儲存通知
    const notification = await db.query(
      `
      INSERT INTO notifications (
        user_id, type, channel, priority, title, message, action_url,
        payload, payload_iv, payload_tag, encryption_key_id,
        contains_pii, data_classification, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `,
      [
        userId,
        type,
        channel,
        this.getPriority(type),
        title,
        message,
        actionUrl,
        encryptedPayload,
        payloadIV,
        payloadTag,
        keyId,
        containsPII || false,
        containsPII ? "confidential" : "internal",
        expiresAt,
      ],
    );

    // 實際發送 (根據通道)
    await this.deliverNotification({
      notificationId: notification.rows[0].id,
      userId,
      channel,
      title,
      message,
      actionUrl,
    });

    // 審計日誌
    await auditLogger.log({
      action: "notification_sent",
      userId,
      details: {
        notificationId: notification.rows[0].id,
        type,
        channel,
        containsPII,
      },
    });
  }

  private shouldSendNotification(
    type: string,
    channel: string,
    preferences: any,
  ): boolean {
    // 檢查類型偏好
    const typeEnabled = preferences[`${type}_enabled`];
    if (typeEnabled === false) return false;

    // 檢查通道偏好
    const channelEnabled = preferences[`${channel}_enabled`];
    if (channelEnabled === false) return false;

    // 系統和安全通知始終發送
    if (["system", "security_alert"].includes(type)) return true;

    return true;
  }

  private isInQuietHours(preferences: any): boolean {
    if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const quietStart = this.parseTime(preferences.quiet_hours_start);
    const quietEnd = this.parseTime(preferences.quiet_hours_end);

    // 檢查星期
    const today = now.getDay();
    if (preferences.quiet_days?.includes(today)) {
      return true;
    }

    // 檢查時間
    if (quietStart < quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd;
    } else {
      // 跨午夜的情況
      return currentTime >= quietStart || currentTime <= quietEnd;
    }
  }

  private async deliverNotification(params: {
    notificationId: number;
    userId: number;
    channel: string;
    title: string;
    message: string;
    actionUrl?: string;
  }): Promise<void> {
    const { notificationId, userId, channel, title, message, actionUrl } =
      params;

    try {
      switch (channel) {
        case "email":
          await this.sendEmail(userId, title, message, actionUrl);
          break;
        case "sms":
          await this.sendSMS(userId, message);
          break;
        case "push":
          await this.sendPushNotification(userId, title, message);
          break;
        case "in_app":
          // 已儲存到資料庫，無需額外動作
          break;
      }

      // 更新發送狀態
      await db.query(
        `
        UPDATE notifications
        SET delivered_at = now()
        WHERE id = $1
      `,
        [notificationId],
      );
    } catch (error) {
      // 記錄錯誤並標記重試
      await db.query(
        `
        UPDATE notifications
        SET retry_count = retry_count + 1,
            last_error = $2
        WHERE id = $1
      `,
        [
          notificationId,
          error instanceof Error ? error.message : "Unknown error",
        ],
      );
    }
  }

  private getPriority(type: string): number {
    const priorities: Record<string, number> = {
      security_alert: 10,
      system: 8,
      claim_update: 7,
      payment_reminder: 6,
      policy_update: 5,
      marketing: 1,
    };
    return priorities[type] || 0;
  }
}
```

---

## 📊 合規性總結與建議

### 修正優先順序路線圖

#### Phase 1: 立即修正 (1-2 週)

1. ✅ 敏感資料欄位加密 (問題 1)
2. ✅ 密碼管理升級到 Argon2id (問題 2)
3. ✅ 修正外鍵 cascade 刪除為 restrict (問題 8)

#### Phase 2: 短期改善 (2-4 週)

4. ✅ 完善審計追蹤系統 (問題 3)
5. ✅ 強化 Session 安全管理 (問題 4)
6. ✅ 醫療資訊結構化與存取控制 (問題 5)

#### Phase 3: 中期優化 (1-2 個月)

7. ✅ 統一軟刪除機制 (問題 6)
8. ✅ 實施資料保留策略 (問題 7)
9. ✅ 資料分類與標籤系統 (問題 9)
10. ✅ 通知系統隱私控制 (問題 10)

### ISO 27001 控制項對照表

| 控制項   | 要求             | 問題編號 | 修正後狀態 |
| -------- | ---------------- | -------- | ---------- |
| A.9.4.1  | 存取控制限制     | 9        | ✅ 符合    |
| A.9.4.2  | 安全登入程序     | 4        | ✅ 符合    |
| A.9.4.3  | 密碼管理系統     | 2        | ✅ 符合    |
| A.10.1.1 | 加密控制政策     | 1        | ✅ 符合    |
| A.11.2.7 | 安全處置或再利用 | 7, 8     | ✅ 符合    |
| A.11.2.8 | 媒體處置安全     | 6        | ✅ 符合    |
| A.12.4.1 | 事件日誌記錄     | 3        | ✅ 符合    |
| A.13.2.1 | 資訊傳輸政策     | 10       | ✅ 符合    |
| A.18.1.4 | 個人資料保護     | 1, 5, 9  | ✅ 符合    |
| A.8.2.2  | 資訊的標示       | 9        | ✅ 符合    |

### 建議的開發工作流程

1. **本地開發**

   ```bash
   # 使用 Docker 建立測試資料庫
   docker-compose up -d postgres

   # 套用新的架構
   npm run migrate:up

   # 執行測試
   npm run test:security
   ```

2. **CI/CD 整合**

   ```yaml
   # .github/workflows/security-check.yml
   name: Security Audit
   on: [push, pull_request]
   jobs:
     security:
       runs-on: ubuntu-latest
       steps:
         - name: Run SQL Security Scan
           run: npm run security:scan

         - name: Check Encryption Implementation
           run: npm run security:encryption-check

         - name: Audit Log Compliance Check
           run: npm run security:audit-check
   ```

3. **定期審查**
   - 每季進行安全審核
   - 每年進行 ISO 27001 合規性評估
   - 定期更新加密演算法和金鑰輪換

---

## 🆕 新發現的問題

### 新問題 1: 推薦參數表格缺少主鍵 🔴 嚴重

**問題描述**:

- `agent_recommendation_params` 表格 (第163-169行) 沒有定義主鍵
- `insurance_recommendation_params` 表格 (第313-320行) `insurance_id` 未標記為主鍵

**風險**:

- 無法唯一識別記錄
- 可能出現重複資料
- 難以進行資料更新和刪除操作

**解決方案**:

```dbml
Table agent_recommendation_params {
    user_id int [pk]  // 加上主鍵標記
    rating_score numeric(2, 1)
    rating_count int [default: 0]
    view_count int [default: 0]
}

Table insurance_recommendation_params {
    insurance_id int [pk]  // 加上主鍵標記
    rating_score numeric(2, 1) [not null, note: '1.0-5.0']
    rating_count int [default: 0]
    view_count int [default: 0]
    matching_count int [default: 0]
}
```

---

### 新問題 2: 審計欄位缺少外鍵關聯 🟡 中等

**問題描述**:
多個表格的 `created_by`, `updated_by`, `deleted_by` 欄位沒有定義外鍵關係到 `users.id`：

- `user_preferences`, `customer_profiles`, `agent_profiles`
- `companies`, `insurances`, `policy_enrollments`, `claims`

**風險**:

- 無法保證這些欄位參照的用戶 ID 存在
- 可能產生孤兒記錄
- 審計追蹤不完整

**解決方案**:

```dbml
// 為所有審計欄位加上外鍵
Ref: user_preferences.created_by > users.id [delete: set null]
Ref: user_preferences.updated_by > users.id [delete: set null]

// 其他表格同理
Ref: customer_profiles.created_by > users.id [delete: set null]
Ref: customer_profiles.updated_by > users.id [delete: set null]
Ref: customer_profiles.deleted_by > users.id [delete: set null]
```

---

### 新問題 3: `agent_supported_languages` 缺少唯一約束 🟡 中等

**問題描述**:
`agent_supported_languages` 表格 (第178-183行) 沒有 `(user_id, supported_language)` 的唯一約束。

**風險**:

- 同一業務員可能重複新增相同語言
- 資料冗餘和不一致

**解決方案**:

```dbml
Table agent_supported_languages {
    id int [pk, increment]
    user_id int [not null]
    supported_language language [not null]
    Indexes {
        user_id
        (user_id, supported_language) [unique]  // 加上唯一約束
    }
}
```

---

### 新問題 4: `claims` 表格欄位命名不一致 🟢 輕微

**問題描述**:
`claims` 表格使用 `create_at` 和 `create_by`，其他表格都使用 `created_at` 和 `created_by`。

**風險**:

- 命名不一致導致混淆
- 潛在的程式錯誤

**解決方案**:

```dbml
Table claims {
    id int [pk, increment]
    policy_enrollment_id int [not null]
    status claim_status
    message text
    amount numeric(12, 2)
    submit_date timestamptz
    created_at timestamptz [default: `now()`]  // 修正拼寫
    created_by int [not null]                  // 修正拼寫
    updated_at timestamptz [default: `now()`]
    updated_by int [not null]
    deleted_at timestamptz
    deleted_by int
}
```

---

### 新問題 5: Email 唯一性約束在軟刪除後衝突 🟡 中等

**問題描述**:
`users.email` 有 `unique` 約束，但軟刪除後無法使用相同的 email 重新註冊。

**風險**:

- 用戶體驗不佳
- 需要手動清理軟刪除的記錄

**解決方案 1**: 軟刪除時修改 email

```sql
-- 在軟刪除時自動修改 email
UPDATE users
SET
    email = email || '.deleted.' || id,
    deleted_at = now(),
    deleted_by = current_user_id
WHERE id = ?;
```

**解決方案 2**: 使用部分唯一索引 (PostgreSQL 9.0+)

```sql
CREATE UNIQUE INDEX users_email_unique
ON users(email)
WHERE deleted_at IS NULL;
```

---

### 新問題 6: 缺少時區明確性說明 🟢 輕微

**問題描述**:
所有 `timestamptz` 欄位都沒有註釋說明使用的時區標準。

**建議**:
在專案說明中加入時區政策，並在關鍵時間欄位加上註釋：

```dbml
created_at timestamptz [not null, default: `now()`, note: 'UTC timezone']
```

---

## 附錄

### A. 相關法規參考

- **GDPR (General Data Protection Regulation)**
  - Art. 32: 處理的安全性
  - Art. 17: 被遺忘權
  - Art. 30: 處理活動記錄

- **台灣個人資料保護法**
  - 第27條: 安全維護措施

- **保險法**
  - 第177-1條: 保險業務員管理規則

### B. 建議的第三方工具

- **加密**: AWS KMS, Azure Key Vault, Google Cloud KMS
- **IP 地理位置**: MaxMind GeoIP2
- **IP 風險評分**: IPQualityScore, Spur.us
- **密碼雜湊**: Argon2, bcrypt
- **審計追蹤**: Supabase Audit, Hasura

### C. 檢查清單

- [ ] 所有敏感欄位已加密
- [ ] 密碼使用 Argon2id 或 bcrypt (cost >= 12)
- [ ] 審計日誌記錄所有關鍵操作
- [ ] Session 管理包含裝置指紋驗證
- [ ] 醫療資料存取需要審批
- [ ] 軟刪除機制統一實施
- [ ] 資料保留政策已配置
- [ ] 外鍵關係使用 restrict 而非 cascade
- [ ] 資料分類標籤已設定
- [ ] 通知系統不包含敏感資訊

---

**報告結束**

如需進一步協助實施這些修正，請隨時聯繫。
