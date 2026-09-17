export interface FarmerUser {
  id: string;
  name: string;
  phone: string;
  state: string;
  district: string;
  primaryCrop: string;
  farmSizeAcres: number;
  avatarUrl: string;
  isGuest?: boolean;
  joinedDate?: string;
}

export const DEMO_FARMER_ACCOUNTS: FarmerUser[] = [
  {
    id: 'FARMER-KA-01',
    name: 'Ramesh Patil',
    phone: '+91 98450 88210',
    state: 'Karnataka',
    district: 'Dharwad, Karnataka',
    primaryCrop: 'Tomato & Cotton',
    farmSizeAcres: 4.5,
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'Kharif 2024',
  },
  {
    id: 'FARMER-AP-02',
    name: 'Srinivasa Rao',
    phone: '+91 94401 77319',
    state: 'Andhra Pradesh',
    district: 'Guntur, Andhra Pradesh',
    primaryCrop: 'Chilli & Paddy (Rice)',
    farmSizeAcres: 6.0,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'Rabi 2023',
  },
  {
    id: 'FARMER-MH-03',
    name: 'Devendra Singh',
    phone: '+91 98220 44321',
    state: 'Maharashtra',
    district: 'Nashik, Maharashtra',
    primaryCrop: 'Soybean & Onion',
    farmSizeAcres: 8.0,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'Zaid 2024',
  },
];
