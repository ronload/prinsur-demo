# Prinsur 企業級路由架構設計文檔

## 目錄
1. [架構概述](#架構概述)
2. [分層路由結構](#分層路由結構)
3. [安全驗證架構](#安全驗證架構)
4. [RBAC 權限控制系統](#rbac-權限控制系統)
5. [服務端佈局保護](#服務端佈局保護)
6. [錯誤處理系統](#錯誤處理系統)
7. [動態權限路由](#動態權限路由)
8. [國際化路由優化](#國際化路由優化)
9. [監控和日誌系統](#監控和日誌系統)
10. [實施計劃](#實施計劃)

## 架構概述

本文檔定義了 Prinsur 保險平台的企業級路由架構，旨在提供：
- **安全性**: 多層驗證，無法繞過的服務端權限控制
- **可維護性**: 清晰的職責分離和模組化設計
- **可擴展性**: 易於添加新角色和權限
- **企業合規**: 完整的審計跟蹤和監控
- **用戶體驗**: 流暢的導航和適當的錯誤處理

## 分層路由結構

### 路由層級設計

```
/                          ← 公開入口 (Landing)
├── /auth/                 ← 認證模組
│   ├── /login
│   ├── /register
│   └── /verify
├── /public/               ← 公開內容
│   ├── /products          ← 產品展示
│   ├── /agents            ← 業務員目錄
│   └── /about
├── /app/                  ← 認證後應用區域
│   ├── /dashboard         ← 角色化儀表板
│   ├── /policies          ← 保單管理
│   ├── /claims            ← 理賠管理
│   ├── /profile           ← 個人資料
│   └── /settings          ← 應用設定
├── /workspace/            ← 專業工作區域 (Agent 專用)
│   ├── /clients           ← 客戶管理
│   ├── /sales             ← 銷售管理(待移除)
│   ├── /commissions       ← 佣金管理(待移除)
│   └── /reports           ← 業務報表(待移除)
└── /admin/                ← 管理員區域
    ├── /users             ← 用戶管理
    ├── /products          ← 產品管理
    ├── /analytics         ← 數據分析
    └── /system            ← 系統設定
```

### 路由設計原則

1. **分層隔離**: 不同權限層級完全分離
2. **語義化命名**: 路由名稱直接反映功能
3. **RESTful 設計**: 遵循 REST API 設計原則
4. **國際化友好**: 支援多語言路由

## 安全驗證架構

### 多層安全中間件

```typescript
// src/middleware.ts - 企業級中間件
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 國際化處理
  const locale = getLocaleFromRequest(request);

  // 2. 安全路由檢查
  const securityCheck = await performSecurityCheck(request);
  if (!securityCheck.passed) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  // 3. 角色權限驗證
  const accessControl = await checkRouteAccess(pathname, request);
  if (!accessControl.allowed) {
    return NextResponse.redirect(new URL(accessControl.redirectTo, request.url));
  }

  // 4. 企業級日誌記錄
  await logRouteAccess(request, { locale, securityCheck, accessControl });

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
```

### 安全檢查層級

1. **第一層 - 基礎驗證**
   - JWT Token 驗證
   - Session 有效性檢查
   - Rate Limiting

2. **第二層 - 權限驗證**
   - 角色權限檢查
   - 路由存取權限
   - 功能權限驗證

3. **第三層 - 業務邏輯驗證**
   - 數據存取權限
   - 業務規則檢查
   - 審計記錄

## RBAC 權限控制系統

### 權限定義

```typescript
// src/lib/rbac/permissions.ts
export const PERMISSIONS = {
  // 基礎權限
  'app:access': ['consumer', 'agent', 'manager', 'admin'],
  'profile:read': ['consumer', 'agent', 'manager', 'admin'],
  'profile:write': ['consumer', 'agent', 'manager', 'admin'],

  // 消費者權限
  'policies:read_own': ['consumer', 'agent', 'manager', 'admin'],
  'claims:create': ['consumer', 'agent', 'manager', 'admin'],
  'claims:read_own': ['consumer', 'agent', 'manager', 'admin'],

  // 代理商權限
  'workspace:access': ['agent', 'manager', 'admin'],
  'clients:manage': ['agent', 'manager', 'admin'],
  'sales:view': ['agent', 'manager', 'admin'],
  'commissions:view_own': ['agent', 'manager', 'admin'],

  // 管理權限
  'admin:access': ['admin'],
  'users:manage': ['admin'],
  'system:configure': ['admin'],
  'analytics:view_all': ['manager', 'admin'],
} as const;
```

### 路由權限映射

```typescript
// src/lib/rbac/route-guards.ts
export const ROUTE_PERMISSIONS = {
  '/app/*': ['app:access'],
  '/workspace/*': ['workspace:access'],
  '/admin/*': ['admin:access'],
  '/app/policies': ['policies:read_own'],
  '/workspace/clients': ['clients:manage'],
} as const;
```

### 角色層級

1. **Consumer (消費者)**
   - 查看自己的保單和理賠
   - 管理個人資料
   - 提交理賠申請

2. **Agent (代理商)**
   - 所有消費者權限
   - 管理客戶關係
   - 查看銷售報表和佣金

3. **Manager (經理)**
   - 所有代理商權限
   - 查看團隊績效
   - 管理代理商

4. **Admin (管理員)**
   - 系統完整存取權限
   - 用戶管理
   - 系統配置

## 服務端佈局保護

### 應用區域佈局

```typescript
// src/app/[locale]/app/layout.tsx - 應用區域佈局
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { checkPermission } from '@/lib/rbac';

export default async function AppLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession();

  // 認證檢查
  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  // 權限檢查
  if (!checkPermission(session.user, 'app:access')) {
    redirect(`/${locale}/unauthorized`);
  }

  return (
    <div className="app-layout">
      <AppNavigation user={session.user} />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
}
```

### 工作區域佈局

```typescript
// src/app/[locale]/workspace/layout.tsx - 工作區域佈局
export default async function WorkspaceLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession();

  // 認證檢查
  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  // 工作區權限檢查
  if (!checkPermission(session.user, 'workspace:access')) {
    redirect(`/${locale}/app/dashboard`);
  }

  return (
    <div className="workspace-layout">
      <WorkspaceNavigation user={session.user} />
      <main className="workspace-content">
        {children}
      </main>
    </div>
  );
}
```

## 錯誤處理系統

### 全域錯誤處理

```typescript
// src/app/[locale]/error.tsx
'use client';

import { useEffect } from 'react';
import { logError } from '@/lib/monitoring';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError({
      error: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }, [error]);

  return (
    <div className="error-boundary">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 404 頁面

```typescript
// src/app/[locale]/not-found.tsx
export default function NotFound() {
  return (
    <div className="not-found-page">
      <h2>Page Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
```

### 未授權頁面

```typescript
// src/app/[locale]/unauthorized/page.tsx
export default function Unauthorized() {
  return (
    <div className="unauthorized-page">
      <h2>Access Denied</h2>
      <p>You don't have permission to access this resource</p>
    </div>
  );
}
```

## 動態權限路由

### 動態儀表板

```typescript
// src/app/[locale]/app/dashboard/page.tsx - 動態儀表板
import { getServerSession } from '@/lib/auth';
import { getDashboardConfig } from '@/lib/dashboard-config';
import ConsumerDashboard from '@/components/dashboards/consumer';
import AgentDashboard from '@/components/dashboards/agent';
import ManagerDashboard from '@/components/dashboards/manager';

export default async function Dashboard() {
  const session = await getServerSession();
  const config = await getDashboardConfig(session.user);

  const DashboardComponent = {
    consumer: ConsumerDashboard,
    agent: AgentDashboard,
    manager: ManagerDashboard,
    admin: ManagerDashboard, // 管理員使用管理者視圖
  }[session.user.role];

  return <DashboardComponent user={session.user} config={config} />;
}
```

### 條件式導航

```typescript
// src/components/navigation/app-navigation.tsx
export function AppNavigation({ user }: { user: User }) {
  const navigation = generateNavigationForRole(user.role);

  return (
    <nav className="app-navigation">
      {navigation.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          permissions={item.permissions}
          user={user}
        />
      ))}
    </nav>
  );
}
```

## 國際化路由優化

### 企業級路由配置

```typescript
// src/lib/i18n/routing.ts
import { createNavigation } from 'next-intl/navigation';

export const locales = ['zh-TW', 'en'] as const;
export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales });

// 企業級路由配置
export const ENTERPRISE_ROUTES = {
  // 公開路由
  public: {
    home: '/',
    products: '/public/products',
    agents: '/public/agents',
  },

  // 認證路由
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verify: '/auth/verify',
  },

  // 應用路由
  app: {
    dashboard: '/app/dashboard',
    policies: '/app/policies',
    claims: '/app/claims',
    profile: '/app/profile',
  },

  // 工作區路由
  workspace: {
    clients: '/workspace/clients',
    sales: '/workspace/sales',
    commissions: '/workspace/commissions',
  },

  // 管理路由
  admin: {
    users: '/admin/users',
    products: '/admin/products',
    analytics: '/admin/analytics',
  },
} as const;
```

### 語言檢測和重定向

```typescript
// src/lib/i18n/locale-detection.ts
export function getLocaleFromRequest(request: NextRequest): string {
  // 1. URL 路徑檢查
  const pathLocale = request.nextUrl.pathname.split('/')[1];
  if (locales.includes(pathLocale as any)) {
    return pathLocale;
  }

  // 2. Cookie 檢查
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // 3. Accept-Language 標頭檢查
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = negotiateLanguage(acceptLanguage, locales);
    if (preferredLocale) return preferredLocale;
  }

  // 4. 預設語言
  return 'zh-TW';
}
```

## 監控和日誌系統

### 路由存取分析

```typescript
// src/lib/monitoring/route-analytics.ts
export class RouteAnalytics {
  static async logAccess(request: NextRequest, context: {
    user?: User;
    route: string;
    permissions: string[];
    duration: number;
  }) {
    await fetch('/api/analytics/route-access', {
      method: 'POST',
      body: JSON.stringify({
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: request.ip,
      }),
    });
  }

  static async logError(error: RouteError) {
    // 發送到企業級監控服務 (如 DataDog, New Relic)
    await fetch('/api/analytics/error', {
      method: 'POST',
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        route: error.route,
        user: error.user,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  static async logPerformance(metrics: RoutePerformanceMetrics) {
    // 性能指標記錄
    await fetch('/api/analytics/performance', {
      method: 'POST',
      body: JSON.stringify(metrics),
    });
  }
}
```

### 審計日誌

```typescript
// src/lib/audit/audit-logger.ts
export class AuditLogger {
  static async logUserAction(action: UserAction) {
    await fetch('/api/audit/user-action', {
      method: 'POST',
      body: JSON.stringify({
        userId: action.userId,
        action: action.type,
        resource: action.resource,
        details: action.details,
        ip: action.ip,
        userAgent: action.userAgent,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  static async logSecurityEvent(event: SecurityEvent) {
    // 安全事件記錄 (登入失敗、權限拒絕等)
    await fetch('/api/audit/security-event', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }
}
```

## 實施計劃

### 階段一：核心架構設計 (週 1-2)

1. **重構路由結構**
   - 創建新的分層路由目錄結構
   - 實施基礎中間件架構

2. **實施 RBAC 系統**
   - 定義權限和角色映射
   - 實作權限檢查函數

3. **加強安全中間件**
   - 多層驗證邏輯
   - 權限檢查整合

### 階段二：頁面遷移和優化 (週 3-4)

4. **遷移現有頁面**
   - 將現有 consumer/agent 頁面重組
   - 更新內部連結和導航

5. **動態儀表板實現**
   - 基於角色的統一儀表板
   - 條件式組件渲染

6. **錯誤處理系統**
   - 全域錯誤邊界
   - 專業化錯誤頁面

### 階段三：安全和監控 (週 5-6)

7. **服務端佈局保護**
   - 每層級的認證檢查
   - 權限驗證整合

8. **國際化優化**
   - 改進語言檢測邏輯
   - 路由重定向優化

9. **監控和分析**
   - 路由存取日誌
   - 性能指標追蹤
   - 審計記錄系統

### 預期成果

- **安全性提升**: 無法繞過的服務端權限控制
- **架構清晰**: 分層路由，職責明確分離
- **易於維護**: RBAC 系統支援快速角色擴展
- **企業合規**: 完整的審計跟蹤和監控系統
- **用戶體驗**: 流暢導航和適當錯誤處理

### 性能指標

- 路由響應時間 < 100ms
- 認證檢查延遲 < 50ms
- 錯誤率 < 0.1%
- 可用性 > 99.9%

### 安全指標

- 零客戶端權限繞過漏洞
- 100% 路由存取記錄
- 即時安全事件告警
- 定期安全審計通過

---

## 附錄

### 相關文件
- [API 設計文檔](./api-design.md)
- [資料庫架構文檔](./database-erd.md)
- [安全規範文檔](./security-guidelines.md)

### 技術依賴
- Next.js 15+ (App Router)
- next-intl (國際化)
- TypeScript (類型安全)
- 企業級監控服務 (DataDog/New Relic)

### 維護指南
- 定期檢查權限配置
- 監控路由性能指標
- 審計日誌分析
- 安全漏洞掃描