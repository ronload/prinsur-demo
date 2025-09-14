import { Agent, InsuranceProduct } from "@/types/insurance";

// Taiwan area adjacency map for location-based sorting
// Areas closer to each other get higher priority scores
const AREA_ADJACENCY: Record<string, Record<string, number>> = {
  taipei: {
    taipei: 5,
    "new-taipei": 4,
    keelung: 3,
    taoyuan: 3,
    hsinchu: 2,
    "hsinchu-city": 2,
    yilan: 2,
  },
  "new-taipei": {
    "new-taipei": 5,
    taipei: 4,
    taoyuan: 3,
    keelung: 3,
    yilan: 2,
    hsinchu: 2,
  },
  taoyuan: {
    taoyuan: 5,
    taipei: 3,
    "new-taipei": 3,
    hsinchu: 4,
    "hsinchu-city": 4,
    miaoli: 3,
  },
  taichung: {
    taichung: 5,
    changhua: 4,
    nantou: 4,
    miaoli: 3,
    yunlin: 3,
    hsinchu: 2,
  },
  tainan: {
    tainan: 5,
    kaohsiung: 4,
    chiayi: 4,
    "chiayi-city": 4,
    yunlin: 3,
    pingtung: 3,
  },
  kaohsiung: {
    kaohsiung: 5,
    tainan: 4,
    pingtung: 4,
    chiayi: 3,
    "chiayi-city": 3,
  },
  keelung: {
    keelung: 5,
    taipei: 3,
    "new-taipei": 3,
    yilan: 2,
  },
  "hsinchu-city": {
    "hsinchu-city": 5,
    hsinchu: 4,
    taoyuan: 4,
    miaoli: 3,
    taipei: 2,
  },
  "chiayi-city": {
    "chiayi-city": 5,
    chiayi: 4,
    tainan: 4,
    yunlin: 3,
    kaohsiung: 3,
  },
  hsinchu: {
    hsinchu: 5,
    "hsinchu-city": 4,
    miaoli: 4,
    taoyuan: 4,
    taichung: 2,
  },
  miaoli: {
    miaoli: 5,
    hsinchu: 4,
    "hsinchu-city": 3,
    taichung: 3,
    changhua: 2,
  },
  changhua: {
    changhua: 5,
    taichung: 4,
    yunlin: 4,
    nantou: 3,
    miaoli: 2,
  },
  nantou: {
    nantou: 5,
    taichung: 4,
    changhua: 3,
    yunlin: 2,
    chiayi: 2,
  },
  yunlin: {
    yunlin: 5,
    changhua: 4,
    chiayi: 4,
    "chiayi-city": 3,
    tainan: 3,
    taichung: 3,
  },
  chiayi: {
    chiayi: 5,
    "chiayi-city": 4,
    yunlin: 4,
    tainan: 4,
    nantou: 2,
  },
  pingtung: {
    pingtung: 5,
    kaohsiung: 4,
    tainan: 3,
    taitung: 2,
  },
  yilan: {
    yilan: 5,
    taipei: 2,
    "new-taipei": 2,
    keelung: 2,
    hualien: 3,
  },
  hualien: {
    hualien: 5,
    taitung: 4,
    yilan: 3,
    nantou: 2,
  },
  taitung: {
    taitung: 5,
    hualien: 4,
    pingtung: 2,
  },
};

/**
 * Calculate location score between user location and agent service areas
 */
export function calculateLocationScore(
  userLocation: string,
  agentServiceAreas: string[],
): number {
  if (!userLocation || agentServiceAreas.length === 0) return 0;

  let maxScore = 0;

  // Check each service area of the agent
  for (const serviceArea of agentServiceAreas) {
    // Exact match gets highest score
    if (serviceArea === userLocation) {
      return 5;
    }

    // Check adjacency score
    const adjacencyMap = AREA_ADJACENCY[userLocation];
    if (adjacencyMap && adjacencyMap[serviceArea]) {
      maxScore = Math.max(maxScore, adjacencyMap[serviceArea]);
    }
  }

  return maxScore;
}

/**
 * Sort agents by location proximity to user
 */
export function sortAgentsByLocation(
  agents: Agent[],
  userLocation: string,
): Agent[] {
  if (!userLocation) return agents;

  return [...agents].sort((a, b) => {
    const scoreA = calculateLocationScore(userLocation, a.serviceAreas);
    const scoreB = calculateLocationScore(userLocation, b.serviceAreas);

    // Primary sort: location score (higher is better)
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // Secondary sort: rating (higher is better)
    if (a.rating !== b.rating) {
      return b.rating - a.rating;
    }

    // Tertiary sort: experience (higher is better)
    return b.experience - a.experience;
  });
}

interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  medicalConditions?: string[];
  occupationLevel?: string;
}

/**
 * Calculate BMI from weight and height
 */
function calculateBMI(weight: number, height: number): number {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Calculate product recommendation score based on user profile
 */
export function calculateProductRecommendationScore(
  product: InsuranceProduct,
  userProfile: UserProfile,
): number {
  let score = 0;
  const maxScore = 100;

  // Base score from product rating (0-25 points)
  score += (product.rating / 5) * 25;

  if (
    !userProfile.age &&
    !userProfile.weight &&
    !userProfile.height &&
    !userProfile.gender
  ) {
    return score; // Only rating-based if no profile data
  }

  // Age compatibility (0-20 points)
  if (userProfile.age && product.ageRange) {
    if (
      userProfile.age >= product.ageRange.min &&
      userProfile.age <= product.ageRange.max
    ) {
      score += 20;
    } else {
      // Penalty for age outside range
      const ageDistance = Math.min(
        Math.abs(userProfile.age - product.ageRange.min),
        Math.abs(userProfile.age - product.ageRange.max),
      );
      score += Math.max(0, 20 - ageDistance * 2);
    }
  }

  // Health risk assessment (0-25 points)
  if (
    userProfile.medicalConditions &&
    userProfile.medicalConditions.length > 0
  ) {
    // Higher medical conditions = prefer health/medical insurance
    if (product.type === "health" || product.type === "accident") {
      score += 25 - userProfile.medicalConditions.length * 3; // Max 25, min 10 for health products
    } else {
      score += Math.max(5, 15 - userProfile.medicalConditions.length * 2); // Lower score for other products
    }
  } else {
    // No medical conditions = slight preference for investment/life products
    if (product.type === "life") {
      score += 20;
    } else if (product.type === "health") {
      score += 15; // Still good but less priority
    } else {
      score += 18;
    }
  }

  // BMI-based recommendations (0-15 points)
  if (userProfile.weight && userProfile.height) {
    const bmi = calculateBMI(userProfile.weight, userProfile.height);

    if (bmi < 18.5 || bmi > 30) {
      // Underweight or obese - prioritize health insurance
      if (product.type === "health" || product.type === "accident") {
        score += 15;
      } else {
        score += 8;
      }
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      // Normal weight - balanced approach
      score += 12;
    } else {
      // Overweight - moderate health focus
      if (product.type === "health") {
        score += 13;
      } else {
        score += 10;
      }
    }
  }

  // Gender-based adjustments (0-10 points)
  if (userProfile.gender) {
    if (userProfile.gender === "female" && product.type === "health") {
      score += 8; // Women generally more health-conscious
    } else if (userProfile.gender === "male" && product.type === "accident") {
      score += 8; // Men statistically higher accident risk
    } else {
      score += 5; // Base gender consideration
    }
  }

  // Occupation level risk assessment (0-5 points)
  if (userProfile.occupationLevel) {
    const riskLevel = parseInt(
      userProfile.occupationLevel.replace("level", ""),
    );

    if (riskLevel >= 4) {
      // High-risk occupation - prioritize accident insurance
      if (product.type === "accident") {
        score += 5;
      } else if (product.type === "health") {
        score += 3;
      } else {
        score += 1;
      }
    } else if (riskLevel <= 2) {
      // Low-risk occupation - balanced approach, slight life insurance preference
      if (product.type === "life") {
        score += 4;
      } else {
        score += 3;
      }
    } else {
      // Medium risk
      score += 3;
    }
  }

  return Math.min(score, maxScore);
}

/**
 * Sort insurance products by recommendation score for user
 */
export function sortProductsByRecommendation(
  products: InsuranceProduct[],
  userProfile: UserProfile,
): InsuranceProduct[] {
  return [...products].sort((a, b) => {
    const scoreA = calculateProductRecommendationScore(a, userProfile);
    const scoreB = calculateProductRecommendationScore(b, userProfile);

    // Primary sort: recommendation score (higher is better)
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // Secondary sort: rating (higher is better)
    if (a.rating !== b.rating) {
      return b.rating - a.rating;
    }

    // Tertiary sort: review count (higher is better)
    return b.reviewCount - a.reviewCount;
  });
}
