export type InsuranceType =
  | 'life'
  | 'health'
  | 'accident'
  | 'travel'
  | 'vehicle'
  | 'property';

export interface InsuranceProduct {
  id: string;
  name: string;
  company: string;
  type: InsuranceType;
  premium: {
    monthly: number;
    annually: number;
  };
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
  logo?: string;
}

export interface InsuranceFilter {
  type?: InsuranceType;
  age?: number;
  gender?: 'male' | 'female';
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
  avatar?: string;
  experience: number;
  languages: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
}
