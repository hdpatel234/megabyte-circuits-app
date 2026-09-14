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

export const MOCK_JOBS: Job[] = [
  { id: 'm4802', tool: 'M4802', status: 'Traveler', film: false, orderNumber: '10482', client: 'Apex Controls', department: 'Production', priority: 'High', orderDate: '12 Sep 2026', dueDate: 'Today', assignedTo: 'Jignesh', maskColor: 'Green', layers: 4, quantity: 120, lastUpdate: '11:24 AM' },
  { id: 'm4805', tool: 'M4805', status: 'Outside Drill', film: false, orderNumber: '10485', client: 'Northstar Devices', department: 'Drilling', priority: 'Urgent', orderDate: '12 Sep 2026', dueDate: 'Today', assignedTo: 'Harshil', maskColor: 'Green', layers: 6, quantity: 80, lastUpdate: '12:10 PM' },
  { id: 'm4714', tool: 'M4714', status: 'Traveler', film: true, orderNumber: '10414', client: 'Vertex Mobility', department: 'Production', priority: 'Normal', orderDate: '11 Sep 2026', dueDate: '15 Sep 2026', assignedTo: 'Jignesh', maskColor: 'White', layers: 2, quantity: 60, lastUpdate: '1:44 PM' },
  { id: 'm1477-11', tool: 'M1477-11', status: 'Traveler', film: false, orderNumber: '10377', client: 'Brightline Labs', department: 'Production', priority: 'Normal', orderDate: '11 Sep 2026', dueDate: '16 Sep 2026', assignedTo: 'Jignesh', maskColor: 'Green', layers: 4, quantity: 100, lastUpdate: '2:03 PM' },
  { id: 'm1550-22', tool: 'M1550-22', status: 'Final QC', film: false, orderNumber: '10350', client: 'Orbit Systems', department: 'Quality', priority: 'High', orderDate: '10 Sep 2026', dueDate: '16 Sep 2026', assignedTo: 'Jignesh', maskColor: 'Black', layers: 8, quantity: 48, lastUpdate: '2:14 PM' },
  { id: 'm1551-13', tool: 'M1551-13', status: 'Etching', film: true, orderNumber: '10351', client: 'Orbit Systems', department: 'Etching', priority: 'Normal', orderDate: '10 Sep 2026', dueDate: '17 Sep 2026', assignedTo: 'Mehul', maskColor: 'Green', layers: 4, quantity: 72, lastUpdate: '2:14 PM' },
  { id: 'm1552-13', tool: 'M1552-13', status: 'Ready to Ship', film: false, orderNumber: '10352', client: 'Orbit Systems', department: 'Dispatch', priority: 'High', orderDate: '09 Sep 2026', dueDate: 'Today', assignedTo: 'Jignesh', maskColor: 'Green', layers: 4, quantity: 72, lastUpdate: '2:14 PM' },
  { id: 'm3380-7', tool: 'M3380-7', status: 'HAL/Tin', film: false, orderNumber: '10380', client: 'Solace Energy', department: 'Surface Finish', priority: 'Normal', orderDate: '08 Sep 2026', dueDate: '18 Sep 2026', assignedTo: 'Mehul', maskColor: 'Red', layers: 6, quantity: 36, lastUpdate: '2:30 PM' },
  { id: 'm2463-1', tool: 'M2463-1', status: 'Ready to Ship', film: false, orderNumber: '10463', client: 'Apex Controls', department: 'Dispatch', priority: 'Normal', orderDate: '07 Sep 2026', dueDate: '19 Sep 2026', assignedTo: 'Jignesh', maskColor: 'Green', layers: 2, quantity: 150, lastUpdate: '3:02 PM' },
  { id: 'm4330-2', tool: 'M4330-2', status: 'Etching', film: false, orderNumber: '10430', client: 'Lumen Works', department: 'Etching', priority: 'Normal', orderDate: '06 Sep 2026', dueDate: '19 Sep 2026', assignedTo: 'Harshil', maskColor: 'Green', layers: 4, quantity: 90, lastUpdate: '3:18 PM' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'res-10k', sku: 'RES-10K', name: '10K Resistor', category: 'Passive', supplier: 'Vishay', quantity: 250, threshold: 50, maxStock: 500, unitPrice: 0.08, location: 'Rack A-04', lastUpdated: '12 Sep 2026' },
  { id: 'cap-100uf', sku: 'CAP-100UF', name: '100uF Electrolytic Capacitor', category: 'Passive', supplier: 'Nichicon', quantity: 38, threshold: 50, maxStock: 200, unitPrice: 0.42, location: 'Rack A-08', lastUpdated: '12 Sep 2026' },
  { id: 'ic-atmega', sku: 'IC-ATMEGA', name: 'ATmega328P-AU', category: 'IC', supplier: 'Microchip', quantity: 0, threshold: 20, maxStock: 100, unitPrice: 4.8, location: 'Rack B-02', lastUpdated: '11 Sep 2026' },
  { id: 'led-green', sku: 'LED-GREEN', name: '3mm Green LED', category: 'Optoelectronics', supplier: 'Kingbright', quantity: 820, threshold: 100, maxStock: 1000, unitPrice: 0.06, location: 'Rack C-01', lastUpdated: '10 Sep 2026' },
  { id: 'conn-2pin', sku: 'CONN-2PIN', name: '2-Pin Terminal Block', category: 'Connector', supplier: 'Phoenix Contact', quantity: 116, threshold: 30, maxStock: 250, unitPrice: 0.75, location: 'Rack C-07', lastUpdated: '10 Sep 2026' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'assignment', title: 'New job assigned', detail: 'M4802 is ready for your Traveler stage.', time: '12 min ago', unread: true },
  { id: 'n2', type: 'overdue', title: 'Job due today', detail: 'M4805 needs attention before dispatch.', time: '1 hr ago', unread: true },
  { id: 'n3', type: 'inventory', title: 'Low inventory', detail: 'CAP-100UF is below its threshold.', time: '3 hrs ago', unread: true },
  { id: 'n4', type: 'status', title: 'Status changed', detail: 'M1550-22 moved to Final QC.', time: 'Yesterday', unread: false },
  { id: 'n5', type: 'announcement', title: 'Shift handover', detail: 'Remember to complete your department handover before 6 PM.', time: 'Yesterday', unread: false },
];