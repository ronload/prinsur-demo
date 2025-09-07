import { InsuranceType } from './insurance';

export type PolicyStatus = 'active' | 'expired' | 'pending' | 'cancelled';

export interface PolicyDocument {
  id: string;
  name: string;
  type: 'contract' | 'receipt' | 'certificate' | 'claim';
  url: string;
  uploadDate: string;
}

export interface Claim {
  id: string;
  policyId: string;
  claimNumber: string;
  type: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submitDate: string;
  description: string;
  documents?: PolicyDocument[];
}

export interface Policy {
  id: string;
  policyNumber: string;
  name: string;
  company: string;
  type: InsuranceType;
  status: PolicyStatus;
  premium: {
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    nextDueDate: string;
  };
  coverage: {
    amount: number;
    startDate: string;
    endDate: string;
  };
  agent?: {
    name: string;
    phone: string;
    email: string;
  };
  documents?: PolicyDocument[];
  claims?: Claim[];
}

export interface PolicyReminder {
  id: string;
  policyId: string;
  type: 'premium_due' | 'expiry_warning' | 'document_required' | 'rate_change';
  title: string;
  message: string;
  dueDate: string;
  isRead: boolean;
}
