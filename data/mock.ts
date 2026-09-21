export type JobStatus =
  | 'Ready to Ship'
  | 'Traveler'
  | 'Move'
  | 'Etching'
  | 'HAL/Tin'
  | 'DH Exposer'
  | 'Outside Drill'
  | 'VGroove'
  | 'Etch QC'
  | 'Rout Done'
  | 'Silk'
  | 'Final QC'
  | 'Masking Exposer'
  | 'FPT'
  | 'Rout'
  | 'Drilling'
  | 'Developing';

export const JOB_STATUSES: JobStatus[] = [
  'Ready to Ship',
  'Traveler',
  'Move',
  'Etching',
  'HAL/Tin',
  'DH Exposer',
  'Outside Drill',
  'VGroove',
  'Etch QC',
  'Rout Done',
  'Silk',
  'Final QC',
  'Masking Exposer',
  'FPT',
  'Rout',
  'Drilling',
  'Developing',
];

export type MaskColor = 'Green' | 'White' | 'Black' | 'Red';

export type Job = {
  id: string;
  tool: string;
  status: JobStatus;
  film: boolean;
  orderNumber: string;
  client: string;
  department: string;
  priority: 'Normal' | 'High' | 'Urgent';
  orderDate: string;
  dueDate: string;
  assignedTo: string;
  maskColor: MaskColor;
  layers: number;
  quantity: number;
  launchQty?: number;
  finalQty?: number;
  failedQty?: number;
  pendingQty?: number;
  lastUpdate: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  supplier: string;
  quantity: number;
  threshold: number;
  maxStock: number;
  unitPrice: number;
  location: string;
  lastUpdated: string;
};

export type Notification = {
  id: string;
  type: 'assignment' | 'overdue' | 'status' | 'inventory' | 'announcement';
  title: string;
  detail: string;
  time: string;
  unread: boolean;
};

export const MOCK_JOBS: Job[] = [];

export const MOCK_INVENTORY: InventoryItem[] = [];

export const MOCK_NOTIFICATIONS: Notification[] = [];