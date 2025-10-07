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

// Interface cho winding machine option
export interface WindingMachineOption {
  value: string;
  name: string;
}

// Danh sách máy quấn dây hạ (Lower Coil Winding Machine)
export const WINDING_MACHINE_HA_OPTIONS: WindingMachineOption[] = [
  { value: 'QD13', name: 'QD13' },
  { value: 'QD14', name: 'QD14' },
  { value: 'QD33', name: 'QD33' },
  { value: 'QD65', name: 'QD65' },
  { value: 'QD82', name: 'QD82' },
  { value: 'QD89', name: 'QD89' },
  { value: 'QD92', name: 'QD92' },
  { value: 'QD93', name: 'QD93' },
  { value: 'QD94', name: 'QD94' }
];

// Danh sách máy quấn dây cao (Upper Coil Winding Machine)
export const WINDING_MACHINE_CAO_OPTIONS: WindingMachineOption[] = [
  { value: 'QD01', name: 'QD01' },
  { value: 'QD02', name: 'QD02' },
  { value: 'QD03', name: 'QD03' },
  { value: 'QD04', name: 'QD04' },
  { value: 'QD05', name: 'QD05' },
  { value: 'QD06', name: 'QD06' },
  { value: 'QD07', name: 'QD07' },
  { value: 'QD08', name: 'QD08' },
  { value: 'QD09', name: 'QD09' },
  { value: 'QD10', name: 'QD10' },
  { value: 'QD68', name: 'QD68' },
  { value: 'QD76', name: 'QD76' },
  { value: 'QD80', name: 'QD80' },
  { value: 'QD85', name: 'QD85' },
  { value: 'QD86', name: 'QD86' },
  { value: 'QD87', name: 'QD87' },
  { value: 'QD88', name: 'QD88' },
  { value: 'QD90', name: 'QD90' },
  { value: 'QD91', name: 'QD91' },
  { value: 'QD92', name: 'QD92' },
  { value: 'QD93', name: 'QD93' },
  { value: 'QD94', name: 'QD94' }
];

// Danh sách máy quấn dây để sử dụng trong dropdown (deprecated - use specific lists above)
export const WINDING_MACHINE_OPTIONS: WindingMachineOption[] = [
  { value: 'QD01', name: 'QD01' },
  { value: 'QD02', name: 'QD02' },
  { value: 'QD03', name: 'QD03' },
  { value: 'QD04', name: 'QD04' },
  { value: 'QD05', name: 'QD05' },
  { value: 'QD06', name: 'QD06' },
  { value: 'QD07', name: 'QD07' },
  { value: 'QD08', name: 'QD08' },
  { value: 'QD09', name: 'QD09' },
  { value: 'QD10', name: 'QD10' },
  { value: 'QD68', name: 'QD68' },
  { value: 'QD76', name: 'QD76' },
  { value: 'QD80', name: 'QD80' },
  { value: 'QD85', name: 'QD85' },
  { value: 'QD86', name: 'QD86' },
  { value: 'QD87', name: 'QD87' },
  { value: 'QD88', name: 'QD88' },
  { value: 'QD90', name: 'QD90' },
  { value: 'QD91', name: 'QD91' },
  { value: 'QD92', name: 'QD92' },
  { value: 'QD93', name: 'QD93' },
  { value: 'QD94', name: 'QD94' }
];