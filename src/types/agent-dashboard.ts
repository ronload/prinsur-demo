export type CustomerStatus =
  | 'new'
  | 'contacted'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'closed'
  | 'lost';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  location: {
    city: string;
    district: string;
  };
  interestedProducts: string[];
  status: CustomerStatus;
  assignedDate: string;
  lastContact: string;
  notes: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export type AppointmentType =
  | 'initial_consultation'
  | 'product_presentation'
  | 'contract_signing'
  | 'service_visit';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  type: AppointmentType;
  location: string;
  status: AppointmentStatus;
  notes?: string;
  productDiscussion?: string[];
}

export interface AgentPerformance {
  totalCustomers: number;
  activeCustomers: number;
  closedDeals: number;
  revenue: number;
  conversionRate: number;
  averageDealSize: number;
  monthlyTarget: number;
  monthlyAchievement: number;
}

export interface Deal {
  id: string;
  customerId: string;
  customerName: string;
  productName: string;
  premium: number;
  commission: number;
  status: 'pending' | 'approved' | 'cancelled';
  signedDate: string;
  effectiveDate: string;
}
