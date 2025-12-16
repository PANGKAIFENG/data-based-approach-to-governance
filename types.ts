export enum TaskStatus {
  Processing = '进行中',
  Completed = '已完成',
  Pending = '待处理',
  Transmitted = '已回传',
}

export interface Task {
  id: string;
  name: string;
  uploader: string;
  uploadDate: string;
  totalRows: number;
  aiProgress: number; // 0-100
  manualProgress: number; // 0-100
  status: TaskStatus;
  source?: 'excel' | 'style_library' | 'fabric_library';
  aiStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ProductAttribute {
  id: string;
  sku: string;
  imageUrl: string;
  material: string;
  color: string;
  style: string;
  season: string;
  category: string;
  collarType: string;
  isConfirmed: boolean;
}

export interface GeneratedStyle {
  id: string;
  name: string;
  description: string;
  material: string;
  elements: string;
  colorTheme: string;
  imageUrl: string; // Base64 or URL
  selected: boolean;
}

export interface AIFieldConfig {
  id: string;
  name: string;
}