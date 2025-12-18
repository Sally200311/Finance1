
import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '餐飲飲食', icon: '🍔', type: 'EXPENSE' },
  { id: 'cat-2', name: '交通運輸', icon: '🚗', type: 'EXPENSE' },
  { id: 'cat-3', name: '休閒娛樂', icon: '🎬', type: 'EXPENSE' },
  { id: 'cat-4', name: '居家生活', icon: '🏠', type: 'EXPENSE' },
  { id: 'cat-5', name: '醫療健康', icon: '💊', type: 'EXPENSE' },
  { id: 'cat-6', name: '薪資收入', icon: '💰', type: 'INCOME' },
  { id: 'cat-7', name: '投資理財', icon: '📈', type: 'INCOME' },
  { id: 'cat-8', name: '其他收入', icon: '🎁', type: 'INCOME' },
];

export const APP_NAME = "SmartFinance AI";
