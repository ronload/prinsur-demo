import { InsuranceProduct, Agent } from "@/types/insurance";
import { mockAgents } from "@/data/mock-insurance";

interface RecommendationCriteria {
  product: InsuranceProduct;
  userLocation?: {
    city: string;
    district: string;
  };
}

/**
 * 根据保险产品、专业领域和地理位置推荐最适合的业务员
 */
export function getRecommendedAgents(
  criteria: RecommendationCriteria,
  maxResults: number = 3
): Agent[] {
  const { product, userLocation } = criteria;

  // 过滤符合条件的业务员
  const eligibleAgents = mockAgents.filter((agent) => {
    // 1. 公司匹配 - 必须是同家保险公司的业务员
    if (agent.company !== product.company) {
      return false;
    }

    // 2. 专业领域匹配 - 业务员的专业领域需要包含产品类型
    if (!agent.specialties.includes(product.type)) {
      return false;
    }

    return true;
  });

  // 计算每个业务员的推荐分数
  const scoredAgents = eligibleAgents.map((agent) => {
    let score = 0;

    // 1. 专业匹配度 (40%)
    const specialtyMatchCount = agent.specialties.filter((specialty) =>
      [product.type].includes(specialty)
    ).length;
    score += (specialtyMatchCount / agent.specialties.length) * 40;

    // 2. 评分权重 (30%)
    score += (agent.rating / 5) * 30;

    // 3. 地理位置匹配度 (20%)
    if (userLocation) {
      // 检查是否在同一城市
      if (agent.location.city === userLocation.city) {
        score += 15;
        // 检查是否在同一区域
        if (agent.location.district === userLocation.district) {
          score += 5;
        }
      }
      // 检查服务区域
      else if (agent.serviceAreas.includes(userLocation.city)) {
        score += 10;
      }
    } else {
      // 没有用户位置信息时，给服务区域广的业务员加分
      score += agent.serviceAreas.length * 2;
    }

    // 4. 评论数量和经验 (10%)
    score += Math.min(agent.reviewCount / 50, 10); // 最多10分

    return {
      agent,
      score,
    };
  });

  // 按分数排序并返回前N个
  return scoredAgents
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ agent }) => agent);
}

/**
 * 为推荐的业务员生成推荐理由
 */
export function getRecommendationReason(
  agent: Agent,
  product: InsuranceProduct,
  locale: string = "zh-TW"
): string {
  const reasons: string[] = [];

  // 专业匹配
  if (agent.specialties.includes(product.type)) {
    const productTypeNames = {
      life: locale === "en" ? "life insurance" : "壽險",
      health: locale === "en" ? "health insurance" : "醫療險",
      accident: locale === "en" ? "accident insurance" : "意外險",
      travel: locale === "en" ? "travel insurance" : "旅遊險",
      vehicle: locale === "en" ? "vehicle insurance" : "車險",
      property: locale === "en" ? "property insurance" : "財產險",
    };

    const typeName = productTypeNames[product.type as keyof typeof productTypeNames];
    if (locale === "en") {
      reasons.push(`Specializes in ${typeName}`);
    } else {
      reasons.push(`專精${typeName}規劃`);
    }
  }

  // 高评分
  if (agent.rating >= 4.5) {
    if (locale === "en") {
      reasons.push(`Highly rated (${agent.rating}/5.0)`);
    } else {
      reasons.push(`高客戶評價 (${agent.rating}/5.0)`);
    }
  }

  // 丰富经验
  if (agent.reviewCount >= 100) {
    if (locale === "en") {
      reasons.push(`Experienced with ${agent.reviewCount}+ client reviews`);
    } else {
      reasons.push(`豐富經驗，超過${agent.reviewCount}位客戶評價`);
    }
  }

  // 同公司优势
  if (locale === "en") {
    reasons.push(`${agent.company} certified agent`);
  } else {
    reasons.push(`${agent.company}認證業務員`);
  }

  return reasons.join(locale === "en" ? " • " : " • ");
}

/**
 * 检查业务员是否可以服务指定区域
 */
export function canServeLocation(
  agent: Agent,
  location: { city: string; district: string }
): boolean {
  // 检查是否在代理人的所在城市
  if (agent.location.city === location.city) {
    return true;
  }

  // 检查是否在服务区域内
  return agent.serviceAreas.includes(location.city);
}