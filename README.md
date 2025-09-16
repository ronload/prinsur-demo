# Prinsur - 智慧保險媒合平台

![alt text](public/screenshots/homepage-dark.png)

一個透明、高效且以使用者為中心的保險生態系統，透過線上比價、線下媒合 (O2O) 的模式，打破資訊不對稱，建立透明的保險決策環境。

## 特色功能

- **智慧比價** - 透明的保險商品比價，讓您輕鬆找到最適合的保險方案
- **精準媒合** - 根據地理位置和需求，精準媒合合適的保險業務專員
- **保單管理** - 完整的保單管理系統，自動提醒繳費和到期時間
- **多語言支援** - 支援繁體中文與英文雙語切換
- **響應式設計** - 完美適配桌面端與移動端設備

## 技術架構

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **UI組件**: Shadcn/ui
- **國際化**: next-intl
- **圖示**: Lucide React + React Icons
- **主題**: 支援明暗主題切換

## 專案結構

```
src/
├── app/
│   ├── [locale]/                 # 多語言路由
│   │   ├── page.tsx              # 首頁
│   │   ├── insurance/            # 保險商品頁面
│   │   ├── agents/               # 業務員頁面
│   │   ├── policies/             # 我的保單頁面
│   │   └── dashboard/            # 儀表板頁面
│   └── globals.css               # 全域樣式
├── components/
│   ├── layout/                   # 佈局組件
│   │   ├── header.tsx            # 頁首
│   │   └── footer.tsx            # 頁尾
│   ├── providers/                # Context Providers
│   └── ui/                       # UI 組件庫
├── data/
│   └── mock-insurance.ts         # 模擬資料
├── i18n/
│   └── config.ts                 # 國際化配置
├── lib/
│   └── utils.ts                  # 工具函數
├── types/
│   └── insurance.ts              # TypeScript 類型定義
└── messages/
    ├── en.json                   # 英文翻譯
    └── zh-TW.json                # 繁體中文翻譯
```

## 快速開始

### 環境需求

- Node.js 18.0 或更高版本
- npm 或 yarn

### 安裝與運行

1. **克隆專案**

```bash
git clone [repository-url]
cd prinsur-demo
```

2. **安裝依賴**

```bash
npm install
```

3. **啟動開發伺服器**

```bash
npm run dev
```

4. **瀏覽網站**
   開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 可用指令

```bash
npm run dev          # 啟動開發伺服器
npm run build        # 建構生產版本
npm run start        # 啟動生產伺服器
npm run lint         # 執行 ESLint 檢查
```

## 頁面功能

### 首頁 (/)

- Hero 區塊展示品牌價值主張
- 核心功能介紹
- 響應式網格背景特效

### 保險商品 (/insurance)

- 120+ 保險商品資料
- 進階搜尋與篩選功能
- 商品比較與詳情查看
- 支援按保險類型、年齡、保費範圍篩選

### 業務員 (/agents)

- 60+ 業務員資料
- 地區與專長篩選
- 評分與評價系統
- 聯絡資訊與預約功能

### 我的保單 (/policies)

- 個人保單管理
- 保費提醒功能
- 保單狀態追蹤

### 儀表板 (/dashboard)

- 個人化儀表板
- 數據統計與分析
- 快速操作面板

## 國際化

專案支援以下語言：

- 繁體中文 (`zh-TW`) - 預設語言
- 英文 (`en`)

語言檔案位於 `messages/` 目錄，使用 JSON 格式管理翻譯內容。

## 設計系統

### 主題色彩

- 支援明暗主題自動切換
- 基於系統偏好設定
- 使用 CSS 變數管理顏色

### 響應式斷點

- `sm`: 640px 以上
- `md`: 768px 以上
- `lg`: 1024px 以上
- `xl`: 1280px 以上
- `2xl`: 1536px 以上

### 字體

- 主要字體：Inter (Google Fonts)
- 中文字體：系統預設字體堆疊

## 模擬資料

專案包含豐富的模擬資料：

- **保險商品**: 120 筆，涵蓋壽險、醫療險、意外險、旅遊險、車險、財產險
- **保險公司**: 18 家主要保險公司
- **業務員**: 60 位，分布全台各地區
- **評分系統**: 3.5-5.0 星評分機制

## 開發工具

- **代碼規範**: ESLint + Prettier
- **類型檢查**: TypeScript
- **樣式管理**: Tailwind CSS
- **組件開發**: Shadcn/ui 組件系統

## 效能優化

- **圖片優化**: Next.js Image 組件
- **字體優化**: Google Fonts 預載
- **代碼分割**: 動態導入與路由級分割
- **快取策略**: 適當的快取頭設定

## 部署

專案可部署到以下平台：

- Vercel (推薦)
- Netlify
- 任何支援 Node.js 的雲端平台

## 授權

本專案僅供展示用途。

## 貢獻

歡迎提交 Issues 和 Pull Requests 來改善專案。

---

**Made in Taiwan**
