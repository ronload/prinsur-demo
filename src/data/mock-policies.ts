import { Policy, PolicyReminder, Claim } from "@/types/policy";

export const mockPolicies: Policy[] = [
  {
    id: "1",
    policyNumber: "TL2024001234",
    name: "安心人壽保險",
    company: "台灣人壽",
    type: "life",
    status: "active",
    premium: {
      amount: 2500,
      frequency: "monthly",
      nextDueDate: "2024-10-15",
    },
    coverage: {
      amount: 1000000,
      startDate: "2023-01-15",
      endDate: "2033-01-15",
    },
    agent: {
      name: "王小明",
      phone: "0912-345-678",
      email: "wang.xiaoming@taiwanlife.com",
    },
  },
  {
    id: "2",
    policyNumber: "CL2024005678",
    name: "健康醫療保險",
    company: "國泰人壽",
    type: "health",
    status: "active",
    premium: {
      amount: 1800,
      frequency: "monthly",
      nextDueDate: "2024-09-20",
    },
    coverage: {
      amount: 500000,
      startDate: "2023-05-20",
      endDate: "2028-05-20",
    },
    agent: {
      name: "陳美華",
      phone: "0923-456-789",
      email: "chen.meihua@cathaylife.com",
    },
  },
  {
    id: "3",
    policyNumber: "FB2024009876",
    name: "意外傷害保險",
    company: "富邦人壽",
    type: "accident",
    status: "active",
    premium: {
      amount: 800,
      frequency: "yearly",
      nextDueDate: "2025-03-10",
    },
    coverage: {
      amount: 2000000,
      startDate: "2023-03-10",
      endDate: "2026-03-10",
    },
    agent: {
      name: "李志強",
      phone: "0934-567-890",
      email: "li.zhiqiang@fubon.com",
    },
  },
  {
    id: "4",
    policyNumber: "MT2023012345",
    name: "汽車保險",
    company: "明台產險",
    type: "vehicle",
    status: "expired",
    premium: {
      amount: 40000,
      frequency: "yearly",
      nextDueDate: "2024-08-01",
    },
    coverage: {
      amount: 5000000,
      startDate: "2023-08-01",
      endDate: "2024-08-01",
    },
  },
];

export const mockReminders: PolicyReminder[] = [
  {
    id: "1",
    policyId: "2",
    type: "premium_due",
    title: "繳費提醒",
    message: "您的健康醫療保險將於 9/20 到期繳費，請及時繳納保費",
    dueDate: "2024-09-20",
    isRead: false,
  },
  {
    id: "2",
    policyId: "4",
    type: "expiry_warning",
    title: "保單到期提醒",
    message: "您的汽車保險已於 8/1 到期，請聯絡業務員辦理續保",
    dueDate: "2024-08-01",
    isRead: false,
  },
  {
    id: "3",
    policyId: "1",
    type: "rate_change",
    title: "費率調整通知",
    message: "因應市場變化，您的安心人壽保險費率將於下個保險年度調整",
    dueDate: "2024-12-31",
    isRead: true,
  },
];

export const mockClaims: Claim[] = [
  {
    id: "1",
    policyId: "2",
    claimNumber: "CLM2024001",
    type: "住院醫療",
    amount: 25000,
    status: "approved",
    submitDate: "2024-07-15",
    description: "因急性盲腸炎住院治療",
  },
  {
    id: "2",
    policyId: "3",
    claimNumber: "CLM2024002",
    type: "意外傷害",
    amount: 15000,
    status: "processing",
    submitDate: "2024-08-20",
    description: "運動時意外骨折",
  },
];
