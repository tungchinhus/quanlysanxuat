export class Constant {
  // Add constants as needed
  static readonly API_BASE_URL = 'https://localhost:7190';
}

// Enum cho danh sách nhà sản xuất
export enum Manufacturer {
  bsHN = 'BS-HN',
  henan = 'HENAN', 
  vn = 'VN',
  kct = 'KCT'
}

// Interface cho manufacturer option
export interface ManufacturerOption {
  value: string;
  name: string;
}

// Danh sách nhà sản xuất để sử dụng trong dropdown
export const MANUFACTURER_OPTIONS: ManufacturerOption[] = [
  { value: Manufacturer.bsHN, name: 'BS-HN' },
  { value: Manufacturer.henan, name: 'HENAN' },
  { value: Manufacturer.vn, name: 'VN' }, 
  { value: Manufacturer.kct, name: 'KCT' }
];