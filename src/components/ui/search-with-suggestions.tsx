"use client";

import * as React from "react";
import { Search, History, Building2, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "history" | "category" | "company";
  icon: React.ReactNode;
}

interface SearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  className?: string;
  locale?: string;
  variant?: "default" | "homepage";
}

// 保險分類建議
const insuranceCategories = {
  "zh-TW": [
    "壽險", "意外險", "醫療險", "癌症險", "重大疾病險",
    "失能險", "旅平險", "汽車險", "機車險", "住宅險",
    "儲蓄險", "投資型保險", "年金險", "長照險"
  ],
  "en": [
    "Life Insurance", "Accident Insurance", "Medical Insurance",
    "Cancer Insurance", "Critical Illness", "Disability Insurance",
    "Travel Insurance", "Auto Insurance", "Motorcycle Insurance",
    "Home Insurance", "Savings Insurance", "Investment Insurance",
    "Annuity Insurance", "Long-term Care"
  ]
};

// 保險公司建議
const insuranceCompanies = [
  "國泰人壽", "富邦人壽", "新光人壽", "南山人壽", "中國人壽",
  "台灣人壽", "全球人壽", "遠雄人壽", "宏泰人壽", "三商美邦",
  "安聯人壽", "保德信人壽", "中華郵政", "第一金人壽", "元大人壽"
];

export function SearchWithSuggestions({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  locale = "zh-TW",
  variant = "default"
}: SearchWithSuggestionsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);

  // 載入搜尋歷史
  React.useEffect(() => {
    const history = localStorage.getItem("search_history");
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error("Error loading search history:", error);
      }
    }
  }, []);

  // 保存搜尋到歷史紀錄
  const saveToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const newHistory = [
      searchTerm.trim(),
      ...searchHistory.filter(item => item !== searchTerm.trim())
    ].slice(0, 10); // 最多保存 10 個歷史紀錄

    setSearchHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  // 清除特定歷史紀錄
  const removeFromHistory = (searchTerm: string) => {
    const newHistory = searchHistory.filter(item => item !== searchTerm);
    setSearchHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  // 生成建議列表
  const generateSuggestions = (): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    const searchTerm = value.toLowerCase().trim();

    // 如果有輸入內容，進行智能匹配
    if (searchTerm) {
      // 1. 匹配歷史搜尋紀錄
      const matchedHistory = searchHistory.filter(item =>
        item.toLowerCase().includes(searchTerm)
      );

      // 2. 匹配保險分類
      const categories = insuranceCategories[locale as keyof typeof insuranceCategories] || insuranceCategories["zh-TW"];
      const matchedCategories = categories.filter(category =>
        category.toLowerCase().includes(searchTerm)
      );

      // 3. 匹配保險公司
      const matchedCompanies = insuranceCompanies.filter(company =>
        company.toLowerCase().includes(searchTerm)
      );

      // 按優先級添加建議：歷史 > 分類 > 公司
      matchedHistory.slice(0, 3).forEach(item => {
        suggestions.push({
          id: `history-${item}`,
          text: item,
          type: "history",
          icon: <History className="h-4 w-4" />
        });
      });

      matchedCategories.slice(0, 6 - suggestions.length).forEach(category => {
        suggestions.push({
          id: `category-${category}`,
          text: category,
          type: "category",
          icon: <Tag className="h-4 w-4" />
        });
      });

      matchedCompanies.slice(0, 6 - suggestions.length).forEach(company => {
        suggestions.push({
          id: `company-${company}`,
          text: company,
          type: "company",
          icon: <Building2 className="h-4 w-4" />
        });
      });

    } else {
      // 沒有輸入時，顯示歷史紀錄和熱門建議
      // 添加歷史搜尋紀錄（最多 6 個）
      searchHistory.slice(0, 6).forEach(item => {
        suggestions.push({
          id: `history-${item}`,
          text: item,
          type: "history",
          icon: <History className="h-4 w-4" />
        });
      });

      // 如果歷史紀錄不足 6 個，用分類和公司填充
      const remainingSlots = 6 - suggestions.length;
      if (remainingSlots > 0) {
        // 隨機選擇保險分類
        const categories = insuranceCategories[locale as keyof typeof insuranceCategories] || insuranceCategories["zh-TW"];
        const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);

        const categoryCount = Math.min(remainingSlots, Math.ceil(remainingSlots * 0.6));
        for (let i = 0; i < categoryCount; i++) {
          suggestions.push({
            id: `category-${shuffledCategories[i]}`,
            text: shuffledCategories[i],
            type: "category",
            icon: <Tag className="h-4 w-4" />
          });
        }

        // 剩餘用公司名稱填充
        const companyCount = 6 - suggestions.length;
        if (companyCount > 0) {
          const shuffledCompanies = [...insuranceCompanies].sort(() => Math.random() - 0.5);
          for (let i = 0; i < companyCount; i++) {
            suggestions.push({
              id: `company-${shuffledCompanies[i]}`,
              text: shuffledCompanies[i],
              type: "company",
              icon: <Building2 className="h-4 w-4" />
            });
          }
        }
      }
    }

    return suggestions.slice(0, 6); // 確保最多 6 個
  };

  const suggestions = generateSuggestions();

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setIsOpen(false);
    onSubmit(suggestion.text);
    saveToHistory(suggestion.text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      saveToHistory(value);
      setIsOpen(false);
    }
  };

  const inputClasses = variant === "homepage"
    ? cn(
        "h-14 pl-12 pr-4 text-base sm:text-lg border-2 placeholder:text-sm sm:placeholder:text-base bg-white/5 backdrop-blur-md dark:backdrop-blur-md border-gray-300 dark:border-white/10",
        // 完全禁用所有outline和ring效果
        "outline-none focus:outline-none focus-visible:outline-none",
        "ring-0 focus:ring-0 focus-visible:ring-0 active:ring-0",
        "ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0 active:ring-offset-0",
        // 禁用浏览器默认的focus样式
        "[&:focus]:outline-none [&:focus-visible]:outline-none [&:active]:outline-none",
        (isOpen && suggestions.length > 0) ? "rounded-t-[1.8rem] rounded-b-none" : "rounded-full"
      )
    : cn(
        "h-14 pl-12 pr-4 text-base sm:text-lg border-2 rounded-full placeholder:text-sm sm:placeholder:text-base bg-white/5 backdrop-blur-md dark:backdrop-blur-md border-gray-300 dark:border-white/10",
        // 完全禁用所有outline和ring效果
        "outline-none focus:outline-none focus-visible:outline-none",
        "ring-0 focus:ring-0 focus-visible:ring-0 active:ring-0",
        "ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0 active:ring-offset-0",
        "[&:focus]:outline-none [&:focus-visible]:outline-none [&:active]:outline-none"
      );

  const dropdownClasses = variant === "homepage"
    ? "absolute top-full left-0 right-0 bg-white/5 backdrop-blur-md dark:backdrop-blur-md border-2 border-t-0 border-gray-300 dark:border-white/10 rounded-b-[1.8rem] shadow-lg z-50 max-h-80 overflow-y-auto"
    : "absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto";

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <Search className="absolute left-4 top-[18px] h-5 w-5 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
          }}
          onBlur={() => {
            // 延遲關閉，讓點擊事件有時間執行
            setTimeout(() => {
              setIsOpen(false);
            }, 150);
          }}
          className={inputClasses}
        />
      </form>

      {/* dropdown只在有建议时显示 */}
      {isOpen && suggestions.length > 0 && (
        <div
          data-dropdown-content
          className={dropdownClasses}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={cn(
                "flex items-center justify-between px-4 py-3 cursor-pointer group",
                variant === "homepage"
                  ? "hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
                  : "hover:bg-muted",
                // 添加底部邊框，除了最後一個項目
                variant === "homepage" && index < suggestions.length - 1
                  ? "border-b border-white/10 dark:border-white/5"
                  : ""
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-muted-foreground">
                  {suggestion.icon}
                </div>
                <span className="text-sm">{suggestion.text}</span>
                {suggestion.type === "history" && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {locale === "en" ? "Recent" : "最近"}
                  </span>
                )}
              </div>
              {suggestion.type === "history" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(suggestion.text);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}