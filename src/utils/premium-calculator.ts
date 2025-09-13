import { InsuranceProduct, PremiumCalculation } from "@/types/insurance";

export interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  gender?: "male" | "female";
  medicalConditions?: string[];
}

export interface PremiumEstimate {
  canCalculate: boolean;
  monthlyPremium?: number;
  annualPremium?: number;
  formulaDisplay: string;
  missingFields: string[];
  factors?: {
    age?: number;
    bmi?: number;
    medicalConditions?: number;
    total?: number;
  };
}

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function calculatePremiumEstimate(
  product: InsuranceProduct,
  userProfile: UserProfile,
  locale: "zh-TW" | "en" = "zh-TW"
): PremiumEstimate {
  const { premiumCalculation } = product;
  const { requiredFields, formula, baseMonthly, baseAnnually } = premiumCalculation;

  // Check which required fields are missing
  const missingFields = requiredFields.filter(field => {
    switch (field) {
      case 'age':
        return !userProfile.age || userProfile.age <= 0;
      case 'weight':
        return !userProfile.weight || userProfile.weight <= 0;
      case 'height':
        return !userProfile.height || userProfile.height <= 0;
      case 'gender':
        return !userProfile.gender;
      case 'medicalConditions':
        return !userProfile.medicalConditions || userProfile.medicalConditions.length === 0;
      default:
        return false;
    }
  });

  // If we have enough data to calculate, do the calculation
  const canCalculate = missingFields.length === 0;

  if (!canCalculate) {
    return {
      canCalculate: false,
      formulaDisplay: formula.description,
      missingFields: missingFields.map(field => {
        const fieldNames = {
          age: locale === "en" ? "Age" : "年齡",
          weight: locale === "en" ? "Weight" : "體重",
          height: locale === "en" ? "Height" : "身高",
          gender: locale === "en" ? "Gender" : "性別",
          medicalConditions: locale === "en" ? "Medical History" : "病史"
        };
        return fieldNames[field as keyof typeof fieldNames] || field;
      })
    };
  }

  // Calculate premium with available factors
  let totalMultiplier = 1;
  const factors: any = {};

  // Age factor
  if (formula.factors.age && userProfile.age) {
    const ageConfig = formula.factors.age;
    const ageInRange = Math.max(
      ageConfig.range?.min || 0,
      Math.min(ageConfig.range?.max || 100, userProfile.age)
    );
    const ageFactor = 1 + (ageInRange - (ageConfig.range?.min || 20)) * ageConfig.multiplier;
    factors.age = ageFactor;
    totalMultiplier *= ageFactor;
  }

  // BMI factor
  if (formula.factors.bmi && userProfile.weight && userProfile.height) {
    const bmi = calculateBMI(userProfile.weight, userProfile.height);
    const bmiConfig = formula.factors.bmi;
    const bmiInRange = Math.max(
      bmiConfig.range?.min || 18.5,
      Math.min(bmiConfig.range?.max || 35, bmi)
    );
    const bmiFactor = 1 + (bmiInRange - 22) * bmiConfig.multiplier; // 22 is ideal BMI
    factors.bmi = bmiFactor;
    totalMultiplier *= bmiFactor;
  }

  // Gender factor
  if (formula.factors.gender && userProfile.gender) {
    const genderFactor = formula.factors.gender[userProfile.gender];
    if (genderFactor) {
      totalMultiplier *= genderFactor;
    }
  }

  // Medical conditions factor
  if (formula.factors.medicalConditions && userProfile.medicalConditions) {
    let medicalMultiplier = 1;
    userProfile.medicalConditions.forEach(condition => {
      const conditionMultiplier = formula.factors.medicalConditions?.[condition];
      if (conditionMultiplier && conditionMultiplier > medicalMultiplier) {
        medicalMultiplier = conditionMultiplier; // Use the highest risk factor
      }
    });
    factors.medicalConditions = medicalMultiplier;
    totalMultiplier *= medicalMultiplier;
  }

  factors.total = totalMultiplier;

  const calculatedMonthly = Math.round(baseMonthly * totalMultiplier);
  const calculatedAnnually = Math.round(baseAnnually * totalMultiplier);

  return {
    canCalculate: true,
    monthlyPremium: calculatedMonthly,
    annualPremium: calculatedAnnually,
    formulaDisplay: formula.description,
    missingFields: [],
    factors
  };
}

export function formatCurrency(amount: number, locale: "zh-TW" | "en" = "zh-TW"): string {
  if (locale === "en") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getPremiumDisplayStatus(
  product: InsuranceProduct,
  userProfile: UserProfile,
  isLoggedIn: boolean,
  locale: "zh-TW" | "en" = "zh-TW"
): {
  type: "not_logged_in" | "missing_data" | "calculated";
  content: string;
  estimate?: PremiumEstimate;
} {
  // User not logged in - show formula
  if (!isLoggedIn) {
    return {
      type: "not_logged_in",
      content: product.premiumCalculation.formula.description,
    };
  }

  // User logged in - try to calculate
  const estimate = calculatePremiumEstimate(product, userProfile, locale);

  if (!estimate.canCalculate) {
    return {
      type: "missing_data",
      content: estimate.formulaDisplay,
      estimate
    };
  }

  return {
    type: "calculated",
    content: `${formatCurrency(estimate.monthlyPremium!, locale)} ${locale === "en" ? "/ month" : "/ 月"}`,
    estimate
  };
}