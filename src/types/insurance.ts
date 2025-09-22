export type InsuranceType =
  | "life"
  | "health"
  | "accident"
  | "travel"
  | "vehicle"
  | "property";

export interface PremiumCalculation {
  baseMonthly: number;
  baseAnnually: number;
  formula: {
    description: string;
    factors: {
      age?: { multiplier: number; range?: { min: number; max: number } };
      bmi?: { multiplier: number; range?: { min: number; max: number } };
      gender?: { male: number; female: number };
      medicalConditions?: { [condition: string]: number };
    };
  };
  requiredFields: (
    | "age"
    | "weight"
    | "height"
    | "gender"
    | "medicalConditions"
  )[];
}

export interface InsuranceProduct {
  id: string;
  name: string;
  company: string;
  type: InsuranceType;
  premium: {
    monthly: number;
    annually: number;
  };
  premiumCalculation: PremiumCalculation;
  coverage: {
    amount: number;
    description: string[];
  };
  rating: number;
  reviewCount: number;
  features: string[];
  ageRange: {
    min: number;
    max: number;
  };
  terms: string;
  launchDate: string;
  logo?: string;
}

export interface InsuranceFilter {
  type?: InsuranceType;
  age?: number;
  gender?: "male" | "female";
  minPremium?: number;
  maxPremium?: number;
  company?: string;
  coverage?: number;
}

export interface Agent {
  id: string;
  name: string;
  company: string;
  specialties: InsuranceType[];
  rating: number;
  reviewCount: number;
  location: {
    city: string;
    district: string;
  };
  serviceAreas: string[];
  avatar?: string;
  languages: string[];
  position?: string;
  contactInfo: {
    phone: string;
    email: string;
  };
}
