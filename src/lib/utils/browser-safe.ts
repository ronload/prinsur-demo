/**
 * 浏览器环境安全检测工具
 * 解决 SSR/客户端不匹配导致的 null 错误
 */

// 检查是否在浏览器环境中
export const isBrowser = typeof window !== "undefined";

// 安全获取 navigator 信息
export const getSafeUserAgent = (): string | undefined => {
  try {
    return isBrowser && navigator?.userAgent ? navigator.userAgent : undefined;
  } catch (error) {
    console.warn("Failed to get user agent:", error);
    return undefined;
  }
};

// 安全访问 localStorage
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return isBrowser ? localStorage.getItem(key) : null;
    } catch (error) {
      console.warn(`Failed to get localStorage item "${key}":`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (isBrowser) {
        localStorage.setItem(key, value);
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Failed to set localStorage item "${key}":`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (isBrowser) {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Failed to remove localStorage item "${key}":`, error);
      return false;
    }
  },
};

// 安全解析 JSON
export const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return fallback;
  }
};

// 安全解析 JSON (可能返回 null)
export const safeJsonParseNullable = <T>(value: string | null): T | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return null;
  }
};

// 延迟执行，确保在客户端环境中运行
export const runOnClient = (callback: () => void, delay = 0): void => {
  if (isBrowser) {
    setTimeout(callback, delay);
  }
};
