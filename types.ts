
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  note: string;
  date: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
}
