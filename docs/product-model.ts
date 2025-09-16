/* 保險公司資訊 */
export interface CompanyInfo {
  name: string;
  rate: string; // 公司評分，由以下參數評估
  "paid-in-capital": string; // 實收資本額
  "market-share": string; // 市占率
  "insurance-income": string; // 保險收入
}

/* 保障內容資訊 */
export interface ProductCoverage {
  "highest-pay": string; // 最高理賠額度
  "coverage-content": string[]; // 保障內容
}

/* 關聯檔案 */
export type RelatedFile = Record<string, string>;

/* 保險產品模型 */
export interface ProductModel {
  "main-insurance"?: string; // 主險
  name: string; // 產品名稱
  "company-info": CompanyInfo; // 保險公司資訊
  category: string; // 保險分類
  premium?: string; // 保費計算公式
  "available-age": string; // 適用年齡
  "payment-period": string; // 繳費年期
  "is-renewable-when-insured": string; // 保障期間可續保 [保證續保 | 不保證續保]
  "is-foreign-currency": string; // 是否為外幣保單
  coverage: ProductCoverage; // 保障內容資訊
  "related-files": RelatedFile[]; // 相關檔案
  tags?: string[]; // 標籤
  rate?: string[]; // 評分
}
